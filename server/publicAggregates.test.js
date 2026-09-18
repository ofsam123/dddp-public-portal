const test = require('node:test')
const assert = require('node:assert/strict')
const {
    BREAKDOWN_ATTRIBUTES,
    DEVELOPMENT_DIMENSIONS,
    MAX_ACTIVITY_SERIES_YEARS,
    MEETING_TYPES,
    PRIMARY_FUNDING_SOURCES,
    PROJECT_SECTORS,
    buildDistribution,
    buildProjectDistribution,
    createActivitySeriesLoader,
    createDddpNationalBreakdownsAdapter,
    parseActivityRange,
} = require('./publicAggregates')

const geographyContext = {
    privateIndex: {
        regionOrgUnitIds: ['private-region-a', 'private-region-b'],
    },
}

test('builds a sorted distribution with honest shares, unclassified records, and zero categories', () => {
    const result = buildDistribution({
        total: 10,
        options: [
            { code: 'second', label: 'Beta' },
            { code: 'first', label: 'Alpha' },
            { code: 'zero', label: 'Zero' },
        ],
        countsByCode: new Map([
            ['first', 4],
            ['second', 4],
            ['zero', 0],
        ]),
    })

    assert.deepEqual(result, {
        total: 10,
        classified: 8,
        unclassified: 2,
        shareDenominator: 'allEligible',
        categories: [
            { label: 'Alpha', count: 4, share: 40 },
            { label: 'Beta', count: 4, share: 40 },
            { label: 'Zero', count: 0, share: 0 },
        ],
    })
    assert.equal(buildDistribution({
        total: 2778,
        options: [{ code: 'rare', label: 'Rare' }],
        countsByCode: new Map([['rare', 1]]),
    }).categories[0].share, 0.04)
})

test('builds project distributions against the declared eligible or classified denominator', () => {
    const result = buildProjectDistribution({
        eligibleTotal: 10,
        options: [{ code: 'Health', label: 'Health' }, { code: 'Roads', label: 'Transports' }],
        countsByCode: new Map([['Health', 6], ['Roads', 2]]),
        shareDenominator: 'classifiedProjects',
    })

    assert.deepEqual(result, {
        eligibleTotal: 10,
        classifiedTotal: 8,
        unclassifiedTotal: 2,
        shareDenominator: 'classifiedProjects',
        categories: [
            { label: 'Health', count: 6, share: 75 },
            { label: 'Transports', count: 2, share: 25 },
        ],
    })
})

test('aggregates canonical Development Dimension and Meeting Type options without private identifiers', async () => {
    const calls = []
    let activeRequests = 0
    let peakRequests = 0
    const developmentCounts = new Map([
        ['Social Development (SD)', 6],
        ['Economic Development (ED)', 3],
    ])
    const meetingCounts = new Map([
        ['GA', 3],
        ['Other Meeting', 1],
    ])
    const httpClient = {
        create: (config) => {
            assert.equal(config.auth.username, 'server-user')
            return {
                get: async (path, { params }) => {
                    activeRequests += 1
                    peakRequests = Math.max(peakRequests, activeRequests)
                    await new Promise((resolve) => setTimeout(resolve, 1))
                    activeRequests -= 1

                    const filters = params.getAll('filter')
                    const program = params.get('program')
                    calls.push({ path, program, filters, query: params.toString() })
                    if (params.get('fields') === 'trackedEntity,attributes[attribute,value]') {
                        return {
                            data: {
                                total: 10,
                                instances: Array.from({ length: 10 }, (_, index) => ({
                                    trackedEntity: `private-project-${index}`,
                                    attributes: [
                                        ...(index < 7 ? [{
                                            attribute: BREAKDOWN_ATTRIBUTES.sector,
                                            value: index < 5 ? 'Health' : 'Roads',
                                        }] : []),
                                        ...(index < 8 ? [{
                                            attribute: BREAKDOWN_ATTRIBUTES.primaryFundingSource,
                                            value: index < 6 ? 'World Bank' : 'Other',
                                        }] : []),
                                    ],
                                })),
                            },
                        }
                    }
                    const developmentFilter = filters.find((filter) => (
                        filter.startsWith(`${BREAKDOWN_ATTRIBUTES.developmentDimension}:eq:`)
                    ))
                    const meetingFilter = filters.find((filter) => (
                        filter.startsWith(`${BREAKDOWN_ATTRIBUTES.meetingType}:eq:`)
                    ))

                    if (developmentFilter) {
                        return { data: { total: developmentCounts.get(developmentFilter.split(':eq:')[1]) || 0 } }
                    }
                    if (meetingFilter) {
                        return { data: { total: meetingCounts.get(meetingFilter.split(':eq:')[1]) || 0 } }
                    }
                    return { data: { total: program === 'g3wMUKEMmH3' ? 10 : 5 } }
                },
            }
        },
    }
    const loadBreakdowns = createDddpNationalBreakdownsAdapter({
        baseURL: 'https://private.example/api',
        username: 'server-user',
        password: 'server-password',
        loadGeographyContext: async () => geographyContext,
        httpClient,
        concurrency: 3,
    })

    const result = await loadBreakdowns({ year: 2026 })

    assert.equal(result.period.year, 2026)
    assert.deepEqual(result.developmentDimensions.categories.slice(0, 2), [
        { label: 'Social Development (SD)', count: 6, share: 60 },
        { label: 'Economic Development (ED)', count: 3, share: 30 },
    ])
    assert.equal(result.developmentDimensions.total, 10)
    assert.equal(result.developmentDimensions.classified, 9)
    assert.equal(result.developmentDimensions.unclassified, 1)
    assert.equal(result.developmentDimensions.categories.length, DEVELOPMENT_DIMENSIONS.length)
    assert.deepEqual(result.meetingTypes.categories.slice(0, 2), [
        { label: 'General Assembly', count: 3, share: 60 },
        { label: 'Other', count: 1, share: 20 },
    ])
    assert.equal(result.meetingTypes.total, 5)
    assert.equal(result.meetingTypes.classified, 4)
    assert.equal(result.meetingTypes.unclassified, 1)
    assert.equal(result.meetingTypes.categories.length, MEETING_TYPES.length)
    assert.deepEqual(result.projectSectors.categories.slice(0, 2), [
        { label: 'Health', count: 5, share: 71.43 },
        { label: 'Transports', count: 2, share: 28.57 },
    ])
    assert.equal(result.projectSectors.eligibleTotal, 10)
    assert.equal(result.projectSectors.classifiedTotal, 7)
    assert.equal(result.projectSectors.unclassifiedTotal, 3)
    assert.deepEqual(result.primaryFundingSources.categories.slice(0, 2), [
        { label: 'World Bank', count: 6, share: 60 },
        { label: 'Other', count: 2, share: 20 },
    ])
    assert.deepEqual(result.plannedProjectActivity, { expectedStarts: 10, expectedCompletions: 10 })
    assert.equal(result.projectSectors.categories.length, PROJECT_SECTORS.length)
    assert.equal(result.primaryFundingSources.categories.length, PRIMARY_FUNDING_SOURCES.length)
    assert.equal(calls.length, 5 + DEVELOPMENT_DIMENSIONS.length + MEETING_TYPES.length)
    assert.equal(peakRequests, 3)
    assert.equal(calls.every((call) => call.path === '/tracker/trackedEntities'), true)
    const attributeCalls = calls.filter((call) => (
        call.query.includes('fields=trackedEntity%2Cattributes%5Battribute%2Cvalue%5D')
    ))
    const countCalls = calls.filter((call) => !attributeCalls.includes(call))
    assert.equal(attributeCalls.every((call) => call.query.includes('pageSize=500')), true)
    assert.equal(countCalls.every((call) => call.query.includes('pageSize=1')), true)
    assert.equal(calls.some((call) => call.filters.includes('wtf3BR2YO8w:in:Project;Programme')), true)
    assert.equal(calls.some((call) => call.filters.includes('JgjD9cTUbhm:le:2026-12-31')), true)
    assert.equal(calls.some((call) => call.filters.includes('T7LiYCQ3LAm:ge:2026-01-01')), true)
    assert.equal(calls.some((call) => call.filters.includes('Ub0V9Z06aBc:sw:2026')), true)
    assert.equal(calls.some((call) => call.filters.includes('JgjD9cTUbhm:sw:2026')), true)
    assert.equal(calls.some((call) => call.filters.includes('T7LiYCQ3LAm:sw:2026')), true)
    const serialized = JSON.stringify(result)
    assert.equal(serialized.includes('private-'), false)
    assert.equal(serialized.includes(BREAKDOWN_ATTRIBUTES.developmentDimension), false)
    assert.equal(serialized.includes(BREAKDOWN_ATTRIBUTES.meetingType), false)
    assert.equal(serialized.includes(BREAKDOWN_ATTRIBUTES.sector), false)
    assert.equal(serialized.includes(BREAKDOWN_ATTRIBUTES.primaryFundingSource), false)
})

test('validates bounded activity-series ranges', () => {
    assert.deepEqual(parseActivityRange({ from: '2022', to: '2026', currentYear: 2026 }), {
        from: 2022,
        to: 2026,
    })
    assert.throws(
        () => parseActivityRange({ from: '2026', to: '2025', currentYear: 2026 }),
        { statusCode: 400 },
    )
    assert.throws(
        () => parseActivityRange({ from: '1999', to: '2025', currentYear: 2026 }),
        { statusCode: 400 },
    )
    assert.throws(
        () => parseActivityRange({ from: '2022', to: '2027', currentYear: 2026 }),
        { statusCode: 400 },
    )
    assert.throws(
        () => parseActivityRange({
            from: '2000',
            to: String(2000 + MAX_ACTIVITY_SERIES_YEARS),
            currentYear: 2026,
        }),
        { statusCode: 400 },
    )
})

test('returns one ordered activity series and preserves genuine zero years', async () => {
    const calls = []
    let activeRequests = 0
    let peakRequests = 0
    const values = new Map([
        [2023, { projects: 5, programmes: 1, meetings: 3 }],
        [2024, { projects: 0, programmes: 0, meetings: 0 }],
        [2025, { projects: 8, programmes: 2, meetings: 7 }],
    ])
    const loadSeries = createActivitySeriesLoader({
        currentYear: 2026,
        concurrency: 2,
        loadSummary: async ({ year }) => {
            calls.push(year)
            activeRequests += 1
            peakRequests = Math.max(peakRequests, activeRequests)
            await new Promise((resolve) => setTimeout(resolve, 1))
            activeRequests -= 1
            return { kpis: values.get(year) }
        },
    })

    const result = await loadSeries({ from: 2023, to: 2025 })

    assert.deepEqual(calls.sort(), [2023, 2024, 2025])
    assert.equal(peakRequests, 2)
    assert.deepEqual(result.period, { from: 2023, to: 2025 })
    assert.deepEqual(result.series, [
        { year: 2023, projects: 5, programmes: 1, meetings: 3 },
        { year: 2024, projects: 0, programmes: 0, meetings: 0 },
        { year: 2025, projects: 8, programmes: 2, meetings: 7 },
    ])
    assert.equal(result.meta.activityDefinition, 'expected-date-overlap')
    assert.equal(result.meta.meetingDefinition, 'meeting-date-within-year')
})
