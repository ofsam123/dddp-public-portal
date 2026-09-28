const test = require('node:test')
const assert = require('node:assert/strict')
const { normalizeGeography } = require('./publicGeography')
const { createDddpGeographyAdapter } = require('./publicGeography')

test('normalizes only known regions and their verified district children', () => {
    const result = normalizeGeography({
        rawRegions: [
            { id: 'private-region-1', displayName: 'Ashanti Region' },
            { id: 'private-region-2', displayName: 'Unknown Region' },
        ],
        rawDistricts: [
            { id: 'private-district-1', displayName: 'Kumasi Metropolitan' },
            { id: 'private-district-2', displayName: 'Unrelated District' },
        ],
        regionDetails: new Map([
            ['private-region-1', { children: [{ id: 'private-district-1' }] }],
            ['private-region-2', { children: [{ id: 'private-district-2' }] }],
        ]),
        retrievedAt: '2026-08-12T00:00:00.000Z',
    })

    assert.deepEqual(result, {
        regions: [{ id: 'region-ashanti', name: 'Ashanti', slug: 'ashanti', districtCount: 1 }],
        districts: [{
            id: 'district-ashanti-kumasi-metropolitan',
            name: 'Kumasi Metropolitan',
            slug: 'kumasi-metropolitan',
            regionSlug: 'ashanti',
        }],
        meta: {
            source: 'DDDP',
            retrievedAt: '2026-08-12T00:00:00.000Z',
            regionCount: 1,
            districtCount: 1,
        },
    })
    assert.equal(JSON.stringify(result).includes('private-'), false)
})

test('adapter requests only level 2, level 3, and matched region details', async () => {
    const calls = []
    const httpClient = {
        get: async (url, config) => {
            calls.push({ url, config })
            if (url.endsWith('level=2&paging=false')) {
                return { data: { organisationUnits: [{ id: 'region-private-id', displayName: 'Ashanti' }] } }
            }
            if (url.endsWith('level=3&paging=false')) {
                return { data: { organisationUnits: [{ id: 'district-private-id', displayName: 'Kumasi Metropolitan' }] } }
            }
            return { data: { children: [{ id: 'district-private-id' }] } }
        },
    }
    const loadGeography = createDddpGeographyAdapter({
        baseURL: 'https://private.example/api/',
        username: 'server-user',
        password: 'server-password',
        httpClient,
    })

    const result = await loadGeography()

    assert.deepEqual(calls.map((call) => call.url), [
        'https://private.example/api/organisationUnits?level=2&paging=false',
        'https://private.example/api/organisationUnits?level=3&paging=false',
        'https://private.example/api/organisationUnits/region-private-id',
    ])
    assert.equal(calls.every((call) => call.config.auth.username === 'server-user'), true)
    assert.equal(result.meta.regionCount, 1)
    assert.equal(result.meta.districtCount, 1)
    assert.equal(JSON.stringify(result).includes('private-id'), false)
})
