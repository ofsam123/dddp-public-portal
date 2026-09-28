const test = require('node:test')
const assert = require('node:assert/strict')
const {
    createAvailableYearsLoader,
    createDddpSummaryAdapter,
    createRegionalSummaryLoader,
    parsePublicYear,
    resolveScope,
} = require('./publicSummary')

const geographyContext = {
    publicGeography: {
        regions: [{ id: 'region-ashanti', name: 'Ashanti', slug: 'ashanti', districtCount: 1 }],
        districts: [{
            id: 'district-ashanti-kumasi-metropolitan',
            name: 'Kumasi Metropolitan',
            slug: 'kumasi-metropolitan',
            regionSlug: 'ashanti',
        }],
    },
    privateIndex: {
        regionOrgUnitIds: ['private-region'],
        regionsBySlug: new Map([['ashanti', { orgUnitId: 'private-region', districtOrgUnitIds: ['private-district'] }]]),
        districtsByRoute: new Map([['ashanti/kumasi-metropolitan', { orgUnitId: 'private-district' }]]),
    },
}

test('validates public years and geography routes', () => {
    assert.equal(parsePublicYear('2024', 2026), 2024)
    assert.throws(() => parsePublicYear('not-a-year', 2026), { statusCode: 400 })
    assert.throws(() => resolveScope(geographyContext, { regionSlug: 'missing' }), { statusCode: 404 })
})

test('returns only aggregate KPI values using verified filters and district scope', async () => {
    const calls = []
    const totals = [7, 2, 0]
    const httpClient = {
        create: (config) => {
            assert.equal(config.auth.username, 'server-user')
            return {
                get: async (path, { params }) => {
                    calls.push({ path, params: params.toString() })
                    return { data: { total: totals[calls.length - 1] } }
                },
            }
        },
    }
    const loadSummary = createDddpSummaryAdapter({
        baseURL: 'https://private.example/api',
        username: 'server-user',
        password: 'server-password',
        loadGeographyContext: async () => geographyContext,
        httpClient,
    })

    const result = await loadSummary({
        year: 2024,
        regionSlug: 'ashanti',
        districtSlug: 'kumasi-metropolitan',
    })

    assert.deepEqual(result.geography, {
        level: 'district',
        slug: 'kumasi-metropolitan',
        name: 'Kumasi Metropolitan',
        regionSlug: 'ashanti',
    })
    assert.deepEqual(result.kpis, {
        projects: 7,
        programmes: 2,
        projectsProgrammesTotal: 9,
        meetings: 0,
    })
    assert.equal(calls.length, 3)
    assert.equal(calls.every((call) => call.path === '/tracker/trackedEntities'), true)
    assert.equal(calls.every((call) => call.params.includes('orgUnit=private-district')), true)
    assert.equal(calls.every((call) => call.params.includes('ouMode=SELECTED')), true)
    assert.match(calls[0].params, /wtf3BR2YO8w%3Aeq%3AProject/)
    assert.match(calls[0].params, /JgjD9cTUbhm%3Ale%3A2024-12-31/)
    assert.match(calls[0].params, /T7LiYCQ3LAm%3Age%3A2024-01-01/)
    assert.match(calls[2].params, /Ub0V9Z06aBc%3Asw%3A2024/)
    assert.equal(JSON.stringify(result).includes('private-'), false)
    assert.deepEqual(Object.keys(result.kpis).sort(), [
        'meetings',
        'programmes',
        'projects',
        'projectsProgrammesTotal',
    ])
})

test('builds a sanitized regional summary response with bounded concurrency', async () => {
    let activeRequests = 0
    let peakRequests = 0
    const requestedSlugs = []
    const context = {
        ...geographyContext,
        publicGeography: {
            ...geographyContext.publicGeography,
            regions: [
                { name: 'Ashanti', slug: 'ashanti' },
                { name: 'Central', slug: 'central' },
                { name: 'Eastern', slug: 'eastern' },
            ],
        },
    }
    const loadRegionalSummaries = createRegionalSummaryLoader({
        loadGeographyContext: async () => context,
        concurrency: 2,
        loadSummary: async ({ year, regionSlug }) => {
            activeRequests += 1
            peakRequests = Math.max(peakRequests, activeRequests)
            requestedSlugs.push(regionSlug)
            await new Promise((resolve) => setTimeout(resolve, 2))
            activeRequests -= 1
            return {
                geography: regionSlug
                    ? { level: 'region', slug: regionSlug, name: regionSlug }
                    : { level: 'national', slug: 'ghana', name: 'Ghana' },
                period: { year },
                kpis: { projects: 2, programmes: 1, projectsProgrammesTotal: 3, meetings: 4 },
                meta: { source: 'DDDP', retrievedAt: '2026-08-13T00:00:00.000Z' },
            }
        },
    })

    const result = await loadRegionalSummaries({ year: 2026 })

    assert.deepEqual(requestedSlugs.filter(Boolean).sort(), ['ashanti', 'central', 'eastern'])
    assert.equal(peakRequests, 2)
    assert.equal(result.period.year, 2026)
    assert.deepEqual(result.national, {
        slug: 'ghana',
        name: 'Ghana',
        kpis: { projects: 2, programmes: 1, projectsProgrammesTotal: 3, meetings: 4 },
    })
    assert.equal(result.regions.length, 3)
    assert.equal(result.meta.source, 'DDDP')
    assert.equal(JSON.stringify(result).includes('private-'), false)
    assert.deepEqual(Object.keys(result.regions[0]).sort(), ['kpis', 'name', 'slug'])
})

test('discovers only years represented by approved public tracker dates', async () => {
    const calls = []
    const loadAvailableYears = createAvailableYearsLoader({
        baseURL: 'https://private.example/api',
        username: 'server-user',
        password: 'server-password',
        currentYear: 2026,
        minYear: 2022,
        concurrency: 2,
        loadGeographyContext: async () => geographyContext,
        httpClient: {
            create: () => ({
                get: async (path, { params }) => {
                    const query = params.toString()
                    calls.push({ path, params: query })
                    const hasData = /2022|2024|2025|2026/.test(query)
                    return { data: { total: hasData ? 1 : 0 } }
                },
            }),
        },
    })

    const result = await loadAvailableYears()

    assert.deepEqual(result.years, [2022, 2024, 2025, 2026])
    assert.equal(result.latestYear, 2026)
    assert.equal(result.source, 'DDDP')
    assert.equal(calls.length, 10)
    assert.equal(calls.every((call) => call.path === '/tracker/trackedEntities'), true)
    assert.equal(calls.every((call) => call.params.includes('pageSize=1')), true)
    assert.equal(JSON.stringify(result).includes('private-'), false)
})
