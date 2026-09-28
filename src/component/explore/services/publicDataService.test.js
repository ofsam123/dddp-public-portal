import {
    clearPublicDataCacheForTests,
    fetchPublicAvailableYears,
    fetchPublicNationalBreakdowns,
    fetchPublicRegionalSummaries,
    fetchPublicSummary,
    loadPublicNationalBreakdowns,
    loadPublicSummary,
} from './publicDataService'

const buildPayload = (geography) => ({
    geography,
    period: { year: 2026 },
    kpis: {
        projects: 7,
        programmes: 2,
        projectsProgrammesTotal: 9,
        meetings: 4,
    },
    meta: {
        source: 'DDDP',
        retrievedAt: '2026-08-13T00:00:00.000Z',
    },
})

const buildBreakdownsPayload = () => ({
    period: { year: 2026 },
    developmentDimensions: {
        total: 10,
        classified: 8,
        unclassified: 2,
        shareDenominator: 'allEligible',
        categories: [
            { label: 'Economic Development', count: 5, share: 50 },
            { label: 'Social Development', count: 3, share: 30 },
        ],
    },
    meetingTypes: {
        total: 6,
        classified: 6,
        unclassified: 0,
        shareDenominator: 'allEligible',
        categories: [
            { label: 'Management meeting', count: 4, share: 66.67 },
            { label: 'General Assembly', count: 2, share: 33.33 },
        ],
    },
    projectSectors: {
        eligibleTotal: 10,
        classifiedTotal: 8,
        unclassifiedTotal: 2,
        shareDenominator: 'classifiedProjects',
        categories: [
            { label: 'Health', count: 5, share: 62.5 },
            { label: 'Education', count: 3, share: 37.5 },
        ],
    },
    primaryFundingSources: {
        eligibleTotal: 10,
        classifiedTotal: 7,
        unclassifiedTotal: 3,
        shareDenominator: 'eligibleProjects',
        categories: [
            { label: 'World Bank', count: 5, share: 50 },
            { label: 'Other', count: 2, share: 20 },
        ],
    },
    plannedProjectActivity: { expectedStarts: 4, expectedCompletions: 6 },
    meta: { source: 'DDDP', retrievedAt: '2026-08-13T00:00:00.000Z' },
})

afterEach(() => {
    jest.restoreAllMocks()
    clearPublicDataCacheForTests()
})

test.each([
    {
        name: 'national',
        geography: { level: 'national', slug: 'ghana', name: 'Ghana' },
        regionSlug: undefined,
        expectedUrl: '/api/public/summary?year=2026',
    },
    {
        name: 'region',
        geography: { level: 'region', slug: 'ashanti', name: 'Ashanti' },
        regionSlug: 'ashanti',
        expectedUrl: '/api/public/summary?year=2026&regionSlug=ashanti',
    },
    {
        name: 'district',
        geography: {
            level: 'district',
            slug: 'amansie-central-district-assembly',
            name: 'Amansie Central District Assembly',
        },
        regionSlug: 'ashanti',
        expectedUrl: '/api/public/summary?year=2026&regionSlug=ashanti&districtSlug=amansie-central-district-assembly',
    },
])('accepts a valid $name summary from the public API', async ({ geography, regionSlug, expectedUrl }) => {
    const payload = buildPayload(geography)
    const fetchMock = jest.spyOn(global, 'fetch').mockResolvedValue({
        ok: true,
        json: async () => payload,
    })

    const result = await fetchPublicSummary({ geography, regionSlug, year: 2026 })

    expect(fetchMock).toHaveBeenCalledWith(expectedUrl, expect.objectContaining({ method: 'GET' }))
    expect(result).toEqual(payload)
})

test('accepts public regional aggregates with the national comparison total', async () => {
    const payload = {
        period: { year: 2026 },
        national: {
            slug: 'ghana',
            name: 'Ghana',
            kpis: { projects: 100, programmes: 20, projectsProgrammesTotal: 120, meetings: 80 },
        },
        regions: [{
            slug: 'ashanti',
            name: 'Ashanti',
            kpis: { projects: 25, programmes: 4, projectsProgrammesTotal: 29, meetings: 10 },
        }],
        meta: { source: 'DDDP', retrievedAt: '2026-08-13T00:00:00.000Z' },
    }
    jest.spyOn(global, 'fetch').mockResolvedValue({ ok: true, json: async () => payload })

    await expect(fetchPublicRegionalSummaries({ year: 2026 })).resolves.toEqual(payload)
})

test('accepts only a confirmed sorted available-year response', async () => {
    const payload = {
        years: [2024, 2025, 2026],
        latestYear: 2026,
        source: 'DDDP',
        retrievedAt: '2026-08-13T00:00:00.000Z',
    }
    jest.spyOn(global, 'fetch').mockResolvedValue({ ok: true, json: async () => payload })

    await expect(fetchPublicAvailableYears()).resolves.toEqual(payload)
})

test('reuses one in-flight summary request for the same geography and year', async () => {
    const geography = { level: 'region', slug: 'ashanti', name: 'Ashanti' }
    const payload = buildPayload(geography)
    const fetchMock = jest.spyOn(global, 'fetch').mockResolvedValue({
        ok: true,
        json: async () => payload,
    })

    const [first, second] = await Promise.all([
        loadPublicSummary({ geography, year: 2026 }),
        loadPublicSummary({ geography, year: 2026 }),
    ])

    expect(fetchMock).toHaveBeenCalledTimes(1)
    expect(first).toEqual(payload)
    expect(second).toEqual(payload)
})

test('accepts a reconciled national breakdown response for the requested year', async () => {
    const payload = buildBreakdownsPayload()
    const fetchMock = jest.spyOn(global, 'fetch').mockResolvedValue({
        ok: true,
        json: async () => payload,
    })

    await expect(fetchPublicNationalBreakdowns({ year: 2026 })).resolves.toEqual(payload)
    expect(fetchMock).toHaveBeenCalledWith(
        '/api/public/national-breakdowns?year=2026',
        expect.objectContaining({ method: 'GET' }),
    )
})

test('rejects a national breakdown response whose totals do not reconcile', async () => {
    const payload = buildBreakdownsPayload()
    payload.developmentDimensions.classified = 9
    jest.spyOn(global, 'fetch').mockResolvedValue({ ok: true, json: async () => payload })

    await expect(fetchPublicNationalBreakdowns({ year: 2026 })).resolves.toBeNull()
})

test('reuses one in-flight national breakdown request for the same year', async () => {
    const payload = buildBreakdownsPayload()
    const fetchMock = jest.spyOn(global, 'fetch').mockResolvedValue({
        ok: true,
        json: async () => payload,
    })

    const [first, second] = await Promise.all([
        loadPublicNationalBreakdowns({ year: 2026 }),
        loadPublicNationalBreakdowns({ year: 2026 }),
    ])

    expect(fetchMock).toHaveBeenCalledTimes(1)
    expect(first).toEqual(payload)
    expect(second).toEqual(payload)
})
