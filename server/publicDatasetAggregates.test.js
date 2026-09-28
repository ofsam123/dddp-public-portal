const test = require('node:test')
const assert = require('node:assert/strict')
const { createDddpAapSummaryAdapter, createDddpPwdaProgrammesSummaryAdapter } = require('./publicDatasetAggregates')

const geographyContext = {
    publicGeography: { regions: [{ name: 'Ashanti', slug: 'ashanti' }], districts: [{ name: 'Kumasi Metropolitan', slug: 'kumasi', regionSlug: 'ashanti' }] },
    privateIndex: { regionOrgUnitIds: ['private-region'], regionsBySlug: new Map([['ashanti', { orgUnitId: 'private-region' }]]), districtsByRoute: new Map([['ashanti/kumasi', { orgUnitId: 'private-district' }]]) },
}

test('AAP summary uses explicit Year and returns only aggregate distributions', async () => {
    const calls = []
    const loadSummary = createDddpAapSummaryAdapter({
        baseURL: 'https://private.example/api', username: 'user', password: 'secret', loadGeographyContext: async () => geographyContext,
        httpClient: { create: () => ({ get: async (path, { params }) => { calls.push(params.toString()); return { data: { total: calls.length === 1 ? 10 : 1 } } } }) },
    })
    const result = await loadSummary({ year: 2026, regionSlug: 'ashanti' })
    assert.equal(result.metrics.recordedActivities, 10)
    assert.equal(result.distributions.approval.classified, 2)
    assert.equal(result.distributions.approval.unclassified, 8)
    assert.equal(calls.every((query) => query.includes('pWkYqcKukAY%3Aeq%3A2026')), true)
    assert.equal(calls.some((query) => query.includes('JgjD9cTUbhm')), false)
    assert.equal(JSON.stringify(result).includes('private-'), false)
})

test('PWDAs adapter refuses to invent a reporting-year rule', async () => {
    const loadSummary = createDddpPwdaProgrammesSummaryAdapter({ loadGeographyContext: async () => geographyContext })
    await assert.rejects(loadSummary({ year: 2026 }), { statusCode: 503, message: 'PWDAs programme reporting-year semantics are not yet confirmed.' })
})
