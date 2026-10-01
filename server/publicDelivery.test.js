const test = require('node:test')
const assert = require('node:assert/strict')
const { createDeliveryLoader } = require('./publicDelivery')
const { createSchoolProfileLoader } = require('./publicSchools')

const geographyContext = {
    publicGeography: {
        regions: [{ name: 'Ashanti', slug: 'ashanti' }],
        districts: [{ name: 'Kumasi Metropolitan', slug: 'kumasi', regionSlug: 'ashanti' }],
    },
    privateIndex: {
        regionOrgUnitIds: ['private-region'],
        regionsBySlug: new Map([['ashanti', { orgUnitId: 'private-region', districtOrgUnitIds: ['private-district'] }]]),
        districtsByRoute: new Map([['ashanti/kumasi', { orgUnitId: 'private-district' }]]),
    },
}

const attrs = (values) => Object.entries(values).map(([attribute, value]) => ({ attribute, value }))

const fakeClient = (routes, calls = []) => ({
    create: () => ({
        get: async (path, { params }) => {
            const query = params instanceof URLSearchParams ? params : new URLSearchParams(params)
            calls.push({ path, query: query.toString() })
            const key = `${path}|${query.get('program') || ''}|${query.get('programStage') || ''}`
            const instances = routes[key] || []
            if (query.get('pageSize') === '1') return { data: { total: instances.length, instances: instances.slice(0, 1) } }
            return { data: { total: instances.length, instances } }
        },
    }),
})

test('delivery summary aggregates IGF, AAP, completion and sectors by district without private identifiers', async () => {
    const calls = []
    const routes = {
        '/tracker/trackedEntities|g3wMUKEMmH3|': [
            { trackedEntity: 'p1', orgUnit: 'private-district', attributes: attrs({ wtf3BR2YO8w: 'Project', k921oNWPSd4: 'Health', wca7mlI2exE: 'Secret clinic' }) },
            { trackedEntity: 'p2', orgUnit: 'private-district', attributes: attrs({ wtf3BR2YO8w: 'Programme', k921oNWPSd4: 'Health' }) },
            { trackedEntity: 'p3', orgUnit: 'private-region', attributes: attrs({ wtf3BR2YO8w: 'Project' }) },
        ],
        '/tracker/trackedEntities|Ch38jUWJpUR|': [{ trackedEntity: 'm1', orgUnit: 'private-district' }],
        '/tracker/trackedEntities|ArLnAxhykoz|': [{ trackedEntity: 'a1', orgUnit: 'private-district' }, { trackedEntity: 'a2', orgUnit: 'private-district' }],
        '/tracker/trackedEntities|dYNmYGtArrK|': [
            { trackedEntity: 'i1', orgUnit: 'private-district', attributes: attrs({ nlZbT98zSio: '1000.5', xSAif899MME: '2000', jcFWiKH0Kud: 'Fees' }) },
            { trackedEntity: 'i2', orgUnit: 'private-district', attributes: attrs({ nlZbT98zSio: '-5', jcFWiKH0Kud: 'Rent' }) },
        ],
        '/tracker/trackedEntities|WHILilRZRhT|': [
            { trackedEntity: 'e1', orgUnit: 'private-district', enrollments: [{ events: [{ programStage: 'BRJ5cnjnoaq', dataValues: [{ dataElement: 'ZLUExo9LVUu', value: '250' }] }] }] },
            { trackedEntity: 'e2', orgUnit: 'private-district', enrollments: [{ events: [{ programStage: 'BRJ5cnjnoaq', dataValues: [] }] }] },
        ],
        '/tracker/events|g3wMUKEMmH3|': [
            { trackedEntity: 'p1', orgUnit: 'private-district' },
            { trackedEntity: 'p1', orgUnit: 'private-district' },
        ],
    }
    const loader = createDeliveryLoader({
        baseURL: 'https://private.example/api', username: 'user', password: 'secret',
        loadGeographyContext: async () => geographyContext,
        httpClient: fakeClient(routes, calls),
        currentYear: () => 2026,
    })

    const national = await loader.getSummary({ year: 2025 })
    assert.equal(national.metrics.projects, 2)
    assert.equal(national.metrics.programmes, 1)
    assert.equal(national.metrics.meetings, 1)
    assert.equal(national.metrics.aapActivities, 2)
    assert.equal(national.metrics.completedProjects, 1)
    assert.equal(national.metrics.igf.collected, 1000.5)
    assert.equal(national.metrics.igf.records, 2)
    assert.equal(national.metrics.igf.released, 250)
    assert.equal(national.metrics.igf.releasedAssemblies, 1)
    assert.deepEqual(national.metrics.sectors.find((item) => item.label === 'Health'), { label: 'Health', projects: 1, programmes: 1, total: 2 })
    assert.equal(national.metrics.sectors.find((item) => item.label === 'Not recorded').total, 1)
    assert.equal(national.children[0].slug, 'ashanti')

    const region = await loader.getSummary({ year: 2025, regionSlug: 'ashanti' })
    assert.equal(region.children[0].metrics.projectsProgrammesTotal, 2)
    const district = await loader.getSummary({ year: 2025, regionSlug: 'ashanti', districtSlug: 'kumasi' })
    assert.equal(district.metrics.aapActivities, 2)

    const serialized = JSON.stringify([national, region, district])
    assert.equal(serialized.includes('private-'), false)
    assert.equal(serialized.includes('Secret clinic'), false)
    assert.equal(calls.filter((call) => call.path === '/tracker/events').every((call) => call.query.includes('tE3QKB203nh%3Ain%3ACompleted%3BCompleted+and+in-use')), true)
    await assert.rejects(loader.getSummary({ year: 2025, regionSlug: 'nowhere' }), { statusCode: 404 })
})

test('school profile uses the latest update up to the year and drops implausible counts', async () => {
    const dv = (values) => Object.entries(values).map(([dataElement, value]) => ({ dataElement, value }))
    const routes = {
        '/tracker/trackedEntities|g27TeeehRQC|': [
            { trackedEntity: 's1', orgUnit: 'private-district', attributes: attrs({ RYU3GpNzokp: 'Public', aNfKUv5kVo7: 'Hidden School', kNHdPyj6ed3: 'true' }) },
            { trackedEntity: 's2', orgUnit: 'private-district', attributes: attrs({ RYU3GpNzokp: 'Private' }) },
        ],
        '/tracker/events|g27TeeehRQC|z6mWkIfypaw': [
            { trackedEntity: 's1', occurredAt: '2024-03-01T00:00:00', dataValues: dv({ PchURnKOaX1: 'false', W7cDb7KYNXq: '100', TfMA5e3Xf9c: 'Head Teacher' }) },
            { trackedEntity: 's1', occurredAt: '2025-03-01T00:00:00', dataValues: dv({ PchURnKOaX1: 'true', W7cDb7KYNXq: '120', Fzivg13nELP: '343434343' }) },
            { trackedEntity: 's2', occurredAt: '2027-01-01T00:00:00', dataValues: dv({ PchURnKOaX1: 'true' }) },
        ],
        '/tracker/events|g27TeeehRQC|aZJXKk3l5Jv': [
            { trackedEntity: 's1', occurredAt: '2025-05-01T00:00:00', dataValues: dv({ jMGqg7AZ4FP: '40', CL5bvBCWxa5: '35', D2lKlScVJJG: 'Caterer Name' }) },
            { trackedEntity: 's1', occurredAt: '2024-05-01T00:00:00', dataValues: dv({ jMGqg7AZ4FP: '10', CL5bvBCWxa5: '10' }) },
        ],
    }
    const loader = createSchoolProfileLoader({
        baseURL: 'https://private.example/api', username: 'user', password: 'secret',
        loadGeographyContext: async () => geographyContext,
        httpClient: fakeClient(routes),
        currentYear: () => 2026,
    })
    const result = await loader.getSummary({ year: 2025 })
    assert.equal(result.metrics.schools, 2)
    assert.equal(result.metrics.profiled, 1)
    assert.equal(result.metrics.feeding.enrolledSchools, 1)
    assert.deepEqual(result.metrics.feeding, { enrolledSchools: 1, answered: 1, reportingSchools: 1, boys: 40, girls: 35 })
    assert.equal(result.metrics.enrolment.male, 120)
    assert.equal(result.metrics.enrolment.female, 0)
    assert.equal(result.metrics.categories.find((item) => item.key === 'primary').count, 1)
    const serialized = JSON.stringify(result)
    ;['private-', 'Hidden School', 'Head Teacher', 'Caterer Name', 's1'].forEach((secret) => assert.equal(serialized.includes(secret), false))
})
