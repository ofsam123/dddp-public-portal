const axios = require('axios')
const { PublicSummaryError, parsePublicYear, resolveScope } = require('./publicSummary')

const PROGRAMS = { aap: 'ArLnAxhykoz', pwdaProgrammes: 'priZFTfmNnx' }
const AAP_ATTRIBUTES = { year: 'pWkYqcKukAY', approval: 'ny0RvLrYFx3', state: 'Ni5mF1bxTcq', type: 'IZZ2dtfaCC1', sector: 'k921oNWPSd4', developmentDimension: 'XlP38Ti4IDm' }
const AAP_DISTRIBUTIONS = {
    activityTypes: ['Training & Capacity Building', 'Social Service', 'Climate Adaptation', 'Tree planting/Afforestation', 'LED Activity', 'Climate Adaptation/LED ACTIVITY', 'Supply', 'Maintenance', 'Rehabilitation', 'Renovation', 'Furnishing', 'Construction', 'Workshop', 'Interventions', 'Construction and Furnishing'],
    activityStates: ['New', 'On-going'],
    sectors: ['Health', 'Agriculture', 'Education', 'Communication', 'Water', 'Sanitation', 'Governance/Administration', 'Security', 'Tourism', 'Roads', 'Water and Sanitation', 'Roads and Transport', 'Trade, Industry and Tourism', 'Others'],
    developmentDimensions: [['Social Development (SD)', 'Social Development (SD)'], ['Economic Development (ED)', 'Economic Development (ED)'], ['Governance, Corruption And Public Accountability(GCPA)', 'Governance, Corruption And Public Accountability(GCPA)'], ['Environment, infrastructure and human settlement', 'Environment, infrastructure and human settlement'], ['Emergency Planning And Covid-19 Response', 'Emergency Planning And Covid-19 Response'], ['Implementation, Coordination, Monitoring And Evaluation', 'Implementation, Coordination, Monitoring And Evaluation'], ['Other DD', 'Other']],
    approval: ['Approved', 'Not Approved'],
}

const mapWithConcurrency = async (items, concurrency, mapper) => {
    const results = new Array(items.length)
    let nextIndex = 0
    const workers = Array.from({ length: Math.min(concurrency, items.length) }, async () => {
        while (nextIndex < items.length) {
            const index = nextIndex++
            results[index] = await mapper(items[index])
        }
    })
    await Promise.all(workers)
    return results
}

const buildDistribution = (total, definitions, counts) => {
    const categories = definitions.map((definition, index) => {
        const [code, label] = Array.isArray(definition) ? definition : [definition, definition]
        return { code, label, count: counts[index] }
    })
    const classified = categories.reduce((sum, category) => sum + category.count, 0)
    return { total, classified, unclassified: Math.max(0, total - classified), categories }
}

const createTrackerCounter = ({ baseURL, username, password, httpClient }) => {
    const client = httpClient.create({ baseURL: baseURL.replace(/\/+$/, ''), auth: { username, password }, timeout: 30000, headers: { Accept: 'application/json' } })
    return async ({ program, scope, filters }) => {
        const params = new URLSearchParams({ program, orgUnit: scope.orgUnit, ouMode: scope.ouMode, page: '1', pageSize: '1', totalPages: 'true', fields: 'trackedEntity' })
        filters.forEach((filter) => params.append('filter', filter))
        const { data } = await client.get('/tracker/trackedEntities', { params })
        if (!Number.isInteger(data?.total)) throw new Error('DDDP tracker count was unavailable')
        return data.total
    }
}

const createDddpAapSummaryAdapter = ({ baseURL, username, password, loadGeographyContext, httpClient = axios, concurrency = 6 }) => {
    if (!baseURL || !username || !password || !loadGeographyContext) throw new Error('DDDP AAP summary configuration is incomplete')
    const count = createTrackerCounter({ baseURL, username, password, httpClient })
    return async ({ year: yearInput, regionSlug, districtSlug }) => {
        const year = parsePublicYear(yearInput)
        const scope = resolveScope(await loadGeographyContext(), { regionSlug, districtSlug })
        const yearFilter = `${AAP_ATTRIBUTES.year}:eq:${year}`
        const total = await count({ program: PROGRAMS.aap, scope, filters: [yearFilter] })
        const definitions = [['activityTypes', AAP_ATTRIBUTES.type, AAP_DISTRIBUTIONS.activityTypes], ['activityStates', AAP_ATTRIBUTES.state, AAP_DISTRIBUTIONS.activityStates], ['sectors', AAP_ATTRIBUTES.sector, AAP_DISTRIBUTIONS.sectors], ['developmentDimensions', AAP_ATTRIBUTES.developmentDimension, AAP_DISTRIBUTIONS.developmentDimensions], ['approval', AAP_ATTRIBUTES.approval, AAP_DISTRIBUTIONS.approval]]
        const distributions = {}
        await mapWithConcurrency(definitions, 1, async ([key, attribute, options]) => {
            const counts = await mapWithConcurrency(options, concurrency, (definition) => count({ program: PROGRAMS.aap, scope, filters: [yearFilter, `${attribute}:eq:${Array.isArray(definition) ? definition[0] : definition}`] }))
            distributions[key] = buildDistribution(total, options, counts)
        })
        return { geography: scope.geography, period: { year }, metrics: { recordedActivities: total }, distributions, meta: { source: 'DDDP', retrievedAt: new Date().toISOString() } }
    }
}

const createDddpPwdaProgrammesSummaryAdapter = ({ loadGeographyContext }) => {
    if (!loadGeographyContext) throw new Error('DDDP PWDAs summary configuration is incomplete')
    return async ({ year: yearInput, regionSlug, districtSlug }) => {
        parsePublicYear(yearInput)
        resolveScope(await loadGeographyContext(), { regionSlug, districtSlug })
        throw new PublicSummaryError('PWDAs programme reporting-year semantics are not yet confirmed.', 503)
    }
}

module.exports = { AAP_ATTRIBUTES, AAP_DISTRIBUTIONS, PROGRAMS, buildDistribution, createDddpAapSummaryAdapter, createDddpPwdaProgrammesSummaryAdapter }
