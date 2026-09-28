const test = require('node:test')
const assert = require('node:assert/strict')
const {
    competitionRanks,
    computeDistrictFinal,
    computeSubIndicatorFinals,
    createCache,
    createDpatPublicService,
    createLimiter,
    finalCiFulfilled,
    finalRowScore,
    normalizeStatus,
    parseDistrictId,
    parseDpatYear,
} = require('./dpatPublic')

const ci = (no, fulfilled, tt = null, qa = null, pc = null) => ({
    no, thematicArea: `Area ${no}`, fulfilled, technicalTeamScore: tt, qualityAssuranceScore: qa, petitionCommitteeScore: pc,
})
const row = (no, maxScore, actualScore, tt = null, qa = null, pc = null) => ({
    no, thematicArea: `Area ${no}`, maxScore, actualScore, technicalTeamScore: tt, qualityAssuranceScore: qa, petitionCommitteeScore: pc,
})

const ajumakoSummary2025 = {
    complianceIndicators: [
        ci('CI.1', false, 'Not Fulfilled', 'Not Fulfilled'),
        ci('CI.2', false, 'Not Fulfilled'),
        ci('CI.3', false, 'Not Fulfilled'),
        ci('CI.4', false, 'Not Fulfilled'),
    ],
    serviceDeliveryIndicators: [
        row('SDI 1', 7, 4, '7'),
        row('SDI 2', 18, 9, '13', '10'),
        row('SDI 3', 9, 6, '6'),
        row('SDI 4', 13, 0, '9', '8'),
        row('SDI 5', 14, 8, '7', '9'),
        row('SDI 6', 6, 1, '0', '0'),
        row('Sub-total (SDIs)', 67, 28),
    ],
    performanceIndicators: [
        row('PI 1', 16, 8, '4'),
        row('PI 2', 5, 3, '3', '0'),
        row('PI 3', 9, 7, '9'),
        row('PI 4', 3, 1, '1'),
        row('Sub-total (PIs)', 33, 19),
    ],
    totals: { grandTotalMaxScore: 100, grandTotalActualScore: 47 },
}

test('final row score cascades petition, QA, technical team, then system score', () => {
    assert.equal(finalRowScore(row('SDI 1', 7, 4, '5', '6', '7')), 7)
    assert.equal(finalRowScore(row('SDI 1', 7, 4, '5', '6', '—')), 6)
    assert.equal(finalRowScore(row('SDI 1', 7, 4, '5', '', null)), 5)
    assert.equal(finalRowScore(row('SDI 1', 7, 4)), 4)
    assert.equal(finalRowScore(row('SDI 1', 7, 4, '0')), 0)
})

test('final CI status cascades reviewer decisions before the system flag', () => {
    assert.equal(finalCiFulfilled(ci('CI.1', false, 'Not Fulfilled', 'Fulfilled')), true)
    assert.equal(finalCiFulfilled(ci('CI.1', true, 'Not Fulfilled')), false)
    assert.equal(finalCiFulfilled(ci('CI.1', true)), true)
    assert.equal(finalCiFulfilled(ci('CI.1', false, 'Fulfilled', null, 'Not Fulfilled')), false)
})

test('district dDALd8WlEDf 2025 totals equal the sum of cascaded row finals', () => {
    const final = computeDistrictFinal(ajumakoSummary2025)
    assert.deepEqual(final, {
        sdiFinal: 40,
        sdiMax: 67,
        piFinal: 14,
        piMax: 33,
        grandFinal: 54,
        grandMax: 100,
        overallPercent: 54,
        ciFulfilled: 0,
    })
})

test('competition ranking is deterministic with name tie-breaks', () => {
    const items = [
        { name: 'Bekwai', value: 60 },
        { name: 'Asante Akim', value: 60 },
        { name: 'Cape Coast', value: 50 },
        { name: 'Accra', value: 70 },
    ]
    const ranks = competitionRanks(items, (item) => item.value, (item) => item.name)
    assert.deepEqual([...ranks].map(([item, rank]) => [item.name, rank]), [
        ['Accra', 1],
        ['Asante Akim', 2],
        ['Bekwai', 2],
        ['Cape Coast', 4],
    ])
})

test('validates years, district ids and statuses', () => {
    assert.equal(parseDpatYear('2025', 2026), 2025)
    assert.throws(() => parseDpatYear('20x5', 2026), { statusCode: 400 })
    assert.throws(() => parseDpatYear('2031', 2026), { statusCode: 400 })
    assert.throws(() => parseDistrictId('EipJ1KBgsce'), { statusCode: 404 })
    assert.throws(() => parseDistrictId('../release'), { statusCode: 404 })
    assert.equal(normalizeStatus('STARTED'), 'Start')
    assert.equal(normalizeStatus('completed'), 'Completed')
    assert.equal(normalizeStatus('Conpleted'), 'In progress')
    assert.equal(normalizeStatus(null), 'Not started')
})

test('limiter never exceeds the configured concurrency', async () => {
    const limit = createLimiter(3)
    let active = 0
    let peak = 0
    await Promise.all(Array.from({ length: 12 }, () => limit(async () => {
        active += 1
        peak = Math.max(peak, active)
        await new Promise((resolve) => setTimeout(resolve, 5))
        active -= 1
    })))
    assert.equal(peak, 3)
})

test('cache serves stale values when a refresh fails', async () => {
    let clock = 0
    const cache = createCache({ ttlMs: 10, now: () => clock })
    assert.equal(await cache('k', async () => 'fresh'), 'fresh')
    clock = 50
    assert.equal(await cache('k', async () => { throw new Error('down') }), 'fresh')
})

test('sub-indicator finals use embedded reviewer scores, falling back to system scores', () => {
    const comments = [
        { id: 1, tableCommented: 'sdi1.0-1.1-2025', updateDate: [2026, 8, 1], dddpData: { technicalTeamScore: '1', qualityAssuranceScore: '' } },
        { id: 2, tableCommented: 'sdi1.0-1.3-2025', updateDate: [2026, 8, 1], dddpData: { technicalTeamScore: '4', qualityAssuranceScore: '3' } },
        { id: 3, tableCommented: 'c1.0-1.1-2025', updateDate: [2026, 8, 1], dddpData: { technicalTeamScore: 'Not Fulfilled', qualityAssuranceScore: 'Fulfilled' } },
    ]
    const snapshotTables = {
        generalAssemblyDecision: { scorei: 0, maxScore: 1 },
        generalAssemblyManagementActions: { scorei: 1, scoreii: 1, maxScore: 2 },
        gaSupport: { scorei: 4, maxScore: 4 },
    }
    const finals = computeSubIndicatorFinals({ comments, snapshotTables })
    const byCode = new Map(finals.map((item) => [item.code, item]))
    assert.equal(byCode.get('SDI 1.1').finalScore, 1)
    assert.equal(byCode.get('SDI 1.2').finalScore, 2)
    assert.equal(byCode.get('SDI 1.3').finalScore, 3)
    assert.equal(byCode.get('SDI 1.3').maxScore, 4)
    assert.equal(byCode.get('CI 1.1').fulfilled, true)
    assert.equal(byCode.get('CI 1.2').fulfilled, null)
})

const FORBIDDEN = [
    'technicalTeamScore', 'qualityAssuranceScore', 'petitionCommitteeScore', 'systemScore', 'actualScore',
    'scorei', 'assessment_start_DAPT', 'username', 'fullName', 'comments', 'gaps', 'secret-reviewer', 'server-password',
]

const createStubService = () => {
    const requested = []
    const districts = [
        { id: 'dDALd8WlEDf', displayName: 'Ajumako-Enyan-Essiam District Assembly', parent: { id: 'regCentral01', displayName: 'Central Region' } },
        { id: 'aaaaaaaaaa1', displayName: 'Bravo Municipal', parent: { id: 'regCentral01', displayName: 'Central Region' } },
        { id: 'bbbbbbbbbb2', displayName: 'Charlie District', parent: { id: 'regAshanti01', displayName: 'Ashanti Region' } },
        { id: 'EipJ1KBgsce', displayName: 'AO District 1', parent: { id: 'regTest00001', displayName: 'AO Region' } },
    ]
    const summaryFor = (id) => (id === 'aaaaaaaaaa1'
        ? {
            ...ajumakoSummary2025,
            complianceIndicators: ajumakoSummary2025.complianceIndicators.map((item) => ({ ...item, fulfilled: true, technicalTeamScore: null, qualityAssuranceScore: null })),
            serviceDeliveryIndicators: ajumakoSummary2025.serviceDeliveryIndicators.map((item) => ({ ...item, petitionCommitteeScore: isNaN(item.maxScore) ? null : String(item.maxScore) })),
        }
        : ajumakoSummary2025)
    const routes = {
        organisationUnits: () => ({ organisationUnits: districts }),
        'assessments/districts/dpat/2025/DPAT': () => [
            { districtId: 'dDALd8WlEDf', status: 'Completed', username: 'secret-reviewer', fullName: 'secret-reviewer' },
            { districtId: 'aaaaaaaaaa1', status: 'Closed', username: 'secret-reviewer' },
            { districtId: 'bbbbbbbbbb2', status: 'Pending', username: 'secret-reviewer' },
            { districtId: 'EipJ1KBgsce', status: 'Completed' },
        ],
        'dpat-indicator/year/2025': () => [
            { code: 'SDI 1.0 - 1.1', indicatorName: 'GA decisions implemented', maxScore: 1, createdBy: 'secret-reviewer', status: 'ACTIVE' },
            { code: 'PI 2.0 - 2.1', indicatorName: 'Rateable revenue', thematicAreas: 'REVENUE GENERATION (5)', maxScore: 5, status: 'ACTIVE' },
            { code: 'SDI 6.0 - 6.1', indicatorName: 'LED plan', thematicAreas: 'LOCAL ECONOMIC DEVELOPMENT (LED) (6)', maxScore: 2, status: 'ACTIVE' },
        ],
        'comments/tables/dDALd8WlEDf/2025/DPAT': () => [
            { id: 9, username: 'secret-reviewer', tableCommented: 'sdi1.0-1.1-2025', comments: 'internal', gaps: 'internal', dddpData: { technicalTeamScore: '1' } },
            { id: 10, username: 'secret-reviewer', tableCommented: 'sdi1.0-1.2-2025', dddpData: { technicalTeamScore: '2' } },
            { id: 11, username: 'secret-reviewer', tableCommented: 'sdi1.0-1.3-2025', dddpData: { technicalTeamScore: '4' } },
        ],
        'comments/table/dDALd8WlEDf/2025/DPAT/assessment_start_DAPT': () => [{ dddpData: { tables: {
            generalAssemblyDecision: { scorei: 0, maxScore: 1 },
            generalAssemblyManagementActions: { scorei: 0, maxScore: 2 },
            gaSupport: { scorei: 4, maxScore: 4 },
        } } }],
    }
    const httpClient = {
        create: (config) => ({
            get: async (path) => {
                assert.ok(config.auth.password === 'server-password')
                requested.push(path)
                if (path.startsWith('comments/summary/')) return { data: summaryFor(path.split('/')[2]) }
                if (routes[path]) return { data: routes[path]() }
                if (path.startsWith('assessments/districts/dpat/')) return { data: [] }
                throw Object.assign(new Error('not found'), { response: { status: 404 } })
            },
        }),
    }
    const service = createDpatPublicService({
        cms: { baseURL: 'https://cms.example/api/v1/', username: 'server-user', password: 'server-password' },
        dhis2: { baseURL: 'https://dhis2.example/api', username: 'server-user', password: 'server-password' },
        httpClient,
        currentYear: () => 2026,
    })
    return { service, requested }
}

test('public responses contain only final values and never reviewer or system fields', async () => {
    const { service, requested } = createStubService()
    const years = await service.getYears()
    const scores = await service.getYearScores('2025')
    const regions = await service.getRegionScores('2025')
    const areas = await service.getThematicAreaScores('2025')
    const detail = await service.getDistrictScores('2025', 'dDALd8WlEDf')
    const pending = await service.getDistrictScores('2025', 'bbbbbbbbbb2')
    const indicators = await service.getIndicators('2025')

    assert.deepEqual(years.years, [2025])
    const serialized = JSON.stringify({ years, scores, regions, areas, detail, pending, indicators })
    FORBIDDEN.forEach((token) => assert.equal(serialized.includes(token), false, `leaked ${token}`))
    assert.ok(requested.every((path) => !path.includes('release')))

    assert.equal(scores.totalDistricts, 3)
    assert.equal(scores.assessedCount, 2)
    const ajumako = scores.districts.find((item) => item.districtId === 'dDALd8WlEDf')
    assert.equal(ajumako.sdiFinal, 40)
    assert.equal(ajumako.piFinal, 14)
    assert.equal(ajumako.finalPercent, 54)
    assert.equal(ajumako.classification, 'Good')
    assert.equal(ajumako.nationalRank, 2)
    const charlie = scores.districts.find((item) => item.districtId === 'bbbbbbbbbb2')
    assert.equal(charlie.status, 'Pending')
    assert.equal(charlie.finalPercent, null)
    assert.equal(charlie.nationalRank, null)
    assert.equal(scores.districts.some((item) => item.districtId === 'EipJ1KBgsce'), false)

    assert.deepEqual(Object.keys(pending).sort(), ['districtId', 'districtName', 'regionId', 'regionName', 'status', 'year'])
    assert.equal(regions[0].regionName, 'Central')
    assert.equal(regions[0].rank, 1)
    assert.equal(regions.find((region) => region.regionName === 'Ashanti').averagePercent, null)

    const sdi1 = detail.serviceDelivery.find((item) => item.code === 'SDI 1')
    assert.equal(sdi1.finalScore, 7)
    assert.deepEqual(sdi1.subIndicators.map((item) => [item.code, item.finalScore]), [['SDI 1.1', 1], ['SDI 1.2', 2], ['SDI 1.3', 4]])
    assert.equal(sdi1.subIndicators[0].name, 'GA decisions implemented')
    assert.deepEqual(detail.serviceDelivery.find((item) => item.code === 'SDI 2').subIndicators, [])
    assert.equal(detail.totals.grandFinal, 54)
    assert.equal(detail.performance.find((item) => item.code === 'PI 2').thematicArea, 'Revenue Generation')
    assert.equal(detail.serviceDelivery.find((item) => item.code === 'SDI 6').thematicArea, 'Local Economic Development (LED)')
    assert.equal(indicators.groups.find((group) => group.code === 'PI 2').thematicArea, 'Revenue Generation')
    assert.equal(areas.serviceDelivery[0].averageScore, 7)
})

test('rejects unpublished years and unknown districts', async () => {
    const { service } = createStubService()
    await assert.rejects(service.getYearScores('2024'), { statusCode: 404 })
    await assert.rejects(service.getDistrictScores('2025', 'zzzzzzzzzz9'), { statusCode: 404 })
})
