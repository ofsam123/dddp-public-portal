const axios = require('axios')
const {
    ATTRIBUTES,
    PROGRAMS,
    PublicSummaryError,
    parsePublicYear,
} = require('./publicSummary')

const BREAKDOWN_ATTRIBUTES = {
    developmentDimension: 'XlP38Ti4IDm',
    meetingType: 'kghpIZgHFsT',
    primaryFundingSource: 'FVPxJuIxIrM',
    sector: 'k921oNWPSd4',
}

const PROJECT_SECTORS = [
    ['Health', 'Health'],
    ['Agriculture', 'Agriculture'],
    ['Education', 'Education'],
    ['Communication', 'Communication'],
    ['Water', 'Water'],
    ['Sanitation', 'Sanitation'],
    ['Governance/Administration', 'Governance/Administration'],
    ['Security', 'Security'],
    ['Tourism', 'Tourism'],
    ['Roads', 'Transports'],
    ['Water and Sanitation', 'Water and Sanitation'],
    ['Roads and Transport', 'Roads and Transport'],
    ['Trade, Industry and Tourism', 'Trade, Industry and Tourism'],
    ['Others', 'Others'],
].map(([code, label]) => ({ code, label }))

const PRIMARY_FUNDING_SOURCES = [
    ['African Development Bank', 'African Development Bank'],
    ['Canadian International Development Agency (CIDA)', 'Canadian International Development Agency (CIDA)'],
    ['Coastal Development Fund', 'Coastal Development Fund'],
    ['DACF (District assemblies Common Fund)', 'DACF (District assemblies Common Fund)'],
    ['FAO', 'Food and Agricultural Organization of the UN (FAO)'],
    ['German Development Cooperation (GIZ-KfW)', 'German Development Cooperation (GIZ-KfW)'],
    ['Grant Assistance for Human Security Project (GGHSP)', 'Grant Assistance for Human Security Project (GGHSP)'],
    ['Internally Generated Fund (IGF)', 'Internally Generated Fund (IGF)'],
    ['IFPRI', 'International Food Policy Research Institute (IFPRI)'],
    ['IFAD', 'International Fund for Agricultural Development (IFAD)'],
    ['JICA', 'Japan International Corporation Agency (JICA)'],
    ['Millennium Challenge Corporation (MCC)', 'Millennium Challenge Corporation (MCC)'],
    ['Mineral Development Fund', 'Mineral Development Fund'],
    ['Ministry of Education GETFund (MoE/GETFund)', 'Ministry of Education GETFund (MoE/GETFund)'],
    ['Mp\u2019s Common Fund', 'Mp\u2019s Common Fund'],
    ['Northern Development Fund', 'Northern Development Fund'],
    ['AGRA', 'Alliance for Green Revolution in Africa (AGRA)'],
    ['European Union (EU)', 'European Union (EU)'],
    ['USAID', 'United States Agency for International Development (USAID)'],
    ['GREEN', 'GREEN'],
    ['World Bank', 'World Bank'],
    ['DACF-RFG', 'DACF-RFG'],
    ['Other', 'Other'],
    ['UNCDF', 'UNCDF'],
    ['UNICEF', 'UNICEF'],
    ['SECO', 'SECO'],
    ['Government of Canada', 'Government of Canada'],
    ['AFD', 'AFD'],
    ['Norwegian Govt', 'Norwegian Govt'],
    ['Deductions at Source', 'Deductions at Source'],
    ['RCC', 'RCC'],
].map(([code, label]) => ({ code, label }))

const DEVELOPMENT_DIMENSIONS = [
    ['Social Development (SD)', 'Social Development (SD)'],
    ['Economic Development (ED)', 'Economic Development (ED)'],
    ['Governance, Corruption And Public Accountability(GCPA)', 'Governance, Corruption And Public Accountability(GCPA)'],
    ['Environment, infrastructure and human settlement', 'Environment, infrastructure and human settlement'],
    ['Emergency Planning And Covid-19 Response', 'Emergency Planning And Covid-19 Response'],
    ['Implementation, Coordination, Monitoring And Evaluation', 'Implementation, Coordination, Monitoring And Evaluation'],
    ['Other DD', 'Other'],
].map(([code, label]) => ({ code, label }))

const MEETING_TYPES = [
    ['GA', 'General Assembly'],
    ['EC', 'Executive Committee'],
    ['Sub Structure Committee', 'Sub-District Structure Committee'],
    ['Statutory Sub - Committee', 'Statutory Sub - Committee'],
    ['Management Meetings', 'Management Meeting'],
    ['PRCC', 'Public Relations and Complaints Committee(PRCC)'],
    ['Entity Tender Committee (ETC)', 'Entity Tender Committee (ETC)'],
    ['Audit Committee', 'Audit Committee'],
    ['Technical Sub-Committee', 'Technical Sub-Committee'],
    ['Spatial Planning Committee (SPC)', 'Spatial Planning Committee (SPC)'],
    ['Statutory Committee Meetings', 'Statutory Committee Meetings'],
    ['District and Municipal Planning Coordination Unit', 'District and Municipal Planning Coordination Unit'],
    ['RCC Meeting', 'RCC Meeting'],
    ['Budget Committee', 'Budget Committee'],
    ['Spatial Technical Committee (STC)', 'Spatial Technical Committee (STC)'],
    ['Town Hall Meetings', 'Town Hall Meetings'],
    ['District Health Committee meetings', 'District Health Committee meetings'],
    ['Other Meeting', 'Other'],
].map(([code, label]) => ({ code, label }))

const MAX_ACTIVITY_SERIES_YEARS = 10

const mapWithConcurrency = async (items, concurrency, mapper) => {
    const results = new Array(items.length)
    let nextIndex = 0

    const worker = async () => {
        while (nextIndex < items.length) {
            const index = nextIndex
            nextIndex += 1
            results[index] = await mapper(items[index], index)
        }
    }

    const workerCount = Math.min(Math.max(concurrency, 1), items.length)
    await Promise.all(Array.from({ length: workerCount }, worker))
    return results
}

const getShare = (count, total) => (total === 0 ? 0 : Number(((count / total) * 100).toFixed(2)))

const buildDistribution = ({ total, options, countsByCode }) => {
    const categories = options
        .map(({ code, label }) => {
            const count = countsByCode.get(code) || 0
            return { label, count, share: getShare(count, total) }
        })
        .sort((left, right) => right.count - left.count || left.label.localeCompare(right.label))
    const classified = categories.reduce((sum, category) => sum + category.count, 0)

    if (classified > total) throw new Error('DDDP breakdown counts did not reconcile')

    return {
        total,
        classified,
        unclassified: total - classified,
        shareDenominator: 'allEligible',
        categories,
    }
}

const buildProjectDistribution = ({ eligibleTotal, options, countsByCode, shareDenominator }) => {
    const classifiedTotal = options.reduce((sum, { code }) => sum + (countsByCode.get(code) || 0), 0)
    if (classifiedTotal > eligibleTotal) throw new Error('DDDP project classification counts did not reconcile')

    const denominator = shareDenominator === 'classifiedProjects' ? classifiedTotal : eligibleTotal
    const categories = options
        .map(({ code, label }) => ({
            label,
            count: countsByCode.get(code) || 0,
            share: getShare(countsByCode.get(code) || 0, denominator),
        }))
        .sort((left, right) => right.count - left.count || left.label.localeCompare(right.label))

    return {
        eligibleTotal,
        classifiedTotal,
        unclassifiedTotal: eligibleTotal - classifiedTotal,
        shareDenominator,
        categories,
    }
}

const createDddpNationalBreakdownsAdapter = ({
    baseURL,
    username,
    password,
    loadGeographyContext,
    httpClient = axios,
    concurrency = 4,
}) => {
    if (!baseURL || !username || !password || !loadGeographyContext) {
        throw new Error('DDDP public breakdown configuration is incomplete')
    }

    const client = httpClient.create({
        baseURL: baseURL.replace(/\/+$/, ''),
        auth: { username, password },
        timeout: 30000,
        headers: { Accept: 'application/json' },
    })

    const countTrackedEntities = async ({ program, orgUnit, filters }) => {
        const params = new URLSearchParams({
            program,
            orgUnit,
            ouMode: 'DESCENDANTS',
            page: '1',
            pageSize: '1',
            totalPages: 'true',
            fields: 'trackedEntity',
        })
        filters.forEach((filter) => params.append('filter', filter))

        const { data } = await client.get('/tracker/trackedEntities', { params })
        if (!Number.isInteger(data?.total)) throw new Error('DDDP tracker count was unavailable')
        return data.total
    }

    const loadProjectAttributes = async ({ orgUnit, filters, pageSize = 500 }) => {
        const loadPage = async (page) => {
            const params = new URLSearchParams({
                program: PROGRAMS.projectsProgrammes,
                orgUnit,
                ouMode: 'DESCENDANTS',
                page: String(page),
                pageSize: String(pageSize),
                totalPages: 'true',
                fields: 'trackedEntity,attributes[attribute,value]',
            })
            filters.forEach((filter) => params.append('filter', filter))

            const { data } = await client.get('/tracker/trackedEntities', { params })
            if (!Number.isInteger(data?.total) || !Array.isArray(data?.instances)) {
                throw new Error('DDDP project attributes were unavailable')
            }
            return { total: data.total, instances: data.instances }
        }

        const firstPage = await loadPage(1)
        const pageCount = Math.ceil(firstPage.total / pageSize)
        const remainingPages = Array.from({ length: Math.max(0, pageCount - 1) }, (_, index) => index + 2)
        const remaining = await mapWithConcurrency(remainingPages, concurrency, loadPage)
        const instances = [firstPage, ...remaining].flatMap((page) => page.instances)
        if (instances.length !== firstPage.total) throw new Error('DDDP project attribute pages did not reconcile')

        return { total: firstPage.total, instances }
    }

    const countAttributeValues = (instances, attributeId) => {
        const counts = new Map()
        instances.forEach(({ attributes }) => {
            const value = attributes?.find((attribute) => attribute.attribute === attributeId)?.value
            if (typeof value === 'string' && value.length > 0) counts.set(value, (counts.get(value) || 0) + 1)
        })
        return counts
    }

    return async ({ year: yearInput }) => {
        const year = parsePublicYear(yearInput)
        const geographyContext = await loadGeographyContext()
        const orgUnit = geographyContext.privateIndex.regionOrgUnitIds.join(';')
        const activityFilters = [
            `${ATTRIBUTES.projectProgrammeType}:in:Project;Programme`,
            `${ATTRIBUTES.expectedStartDate}:le:${year}-12-31`,
            `${ATTRIBUTES.expectedCompletionDate}:ge:${year}-01-01`,
        ]
        const projectFilters = [
            `${ATTRIBUTES.projectProgrammeType}:eq:Project`,
            `${ATTRIBUTES.expectedStartDate}:le:${year}-12-31`,
            `${ATTRIBUTES.expectedCompletionDate}:ge:${year}-01-01`,
        ]
        const meetingFilters = [`${ATTRIBUTES.meetingDate}:sw:${year}`]
        const tasks = [
            { key: 'developmentTotal', program: PROGRAMS.projectsProgrammes, filters: activityFilters },
            { key: 'meetingTotal', program: PROGRAMS.meetings, filters: meetingFilters },
            ...DEVELOPMENT_DIMENSIONS.map((option) => ({
                key: `development:${option.code}`,
                program: PROGRAMS.projectsProgrammes,
                filters: [`${BREAKDOWN_ATTRIBUTES.developmentDimension}:eq:${option.code}`, ...activityFilters],
            })),
            ...MEETING_TYPES.map((option) => ({
                key: `meeting:${option.code}`,
                program: PROGRAMS.meetings,
                filters: [`${BREAKDOWN_ATTRIBUTES.meetingType}:eq:${option.code}`, ...meetingFilters],
            })),
            {
                key: 'expectedStarts',
                program: PROGRAMS.projectsProgrammes,
                filters: [
                    `${ATTRIBUTES.projectProgrammeType}:eq:Project`,
                    `${ATTRIBUTES.expectedStartDate}:sw:${year}`,
                ],
            },
            {
                key: 'expectedCompletions',
                program: PROGRAMS.projectsProgrammes,
                filters: [
                    `${ATTRIBUTES.projectProgrammeType}:eq:Project`,
                    `${ATTRIBUTES.expectedCompletionDate}:sw:${year}`,
                ],
            },
        ]
        const projectAttributes = await loadProjectAttributes({ orgUnit, filters: projectFilters })
        const loaded = await mapWithConcurrency(tasks, concurrency, async (task) => ({
            key: task.key,
            count: await countTrackedEntities({ program: task.program, orgUnit, filters: task.filters }),
        }))
        const counts = new Map(loaded.map(({ key, count }) => [key, count]))
        const sectorCounts = countAttributeValues(projectAttributes.instances, BREAKDOWN_ATTRIBUTES.sector)
        const fundingCounts = countAttributeValues(
            projectAttributes.instances,
            BREAKDOWN_ATTRIBUTES.primaryFundingSource,
        )

        return {
            period: { year },
            developmentDimensions: buildDistribution({
                total: counts.get('developmentTotal'),
                options: DEVELOPMENT_DIMENSIONS,
                countsByCode: new Map(DEVELOPMENT_DIMENSIONS.map(({ code }) => [code, counts.get(`development:${code}`)])),
            }),
            meetingTypes: buildDistribution({
                total: counts.get('meetingTotal'),
                options: MEETING_TYPES,
                countsByCode: new Map(MEETING_TYPES.map(({ code }) => [code, counts.get(`meeting:${code}`)])),
            }),
            projectSectors: buildProjectDistribution({
                eligibleTotal: projectAttributes.total,
                options: PROJECT_SECTORS,
                countsByCode: sectorCounts,
                shareDenominator: 'classifiedProjects',
            }),
            primaryFundingSources: buildProjectDistribution({
                eligibleTotal: projectAttributes.total,
                options: PRIMARY_FUNDING_SOURCES,
                countsByCode: fundingCounts,
                shareDenominator: 'eligibleProjects',
            }),
            plannedProjectActivity: {
                expectedStarts: counts.get('expectedStarts'),
                expectedCompletions: counts.get('expectedCompletions'),
            },
            meta: {
                source: 'DDDP',
                retrievedAt: new Date().toISOString(),
                projectEligibility: 'expected-date-overlap',
                plannedActivityDefinition: 'expected-date-within-year',
            },
        }
    }
}

const parseActivityRange = ({
    from: fromInput,
    to: toInput,
    currentYear = new Date().getFullYear(),
    maxYears = MAX_ACTIVITY_SERIES_YEARS,
}) => {
    const from = parsePublicYear(fromInput, currentYear)
    const to = parsePublicYear(toInput, currentYear)

    if (from > to) throw new PublicSummaryError('The start year must not be after the end year.', 400)
    if (to - from + 1 > maxYears) {
        throw new PublicSummaryError(`A maximum of ${maxYears} years may be requested.`, 400)
    }

    return { from, to }
}

const createActivitySeriesLoader = ({
    loadSummary,
    concurrency = 4,
    currentYear = new Date().getFullYear(),
    maxYears = MAX_ACTIVITY_SERIES_YEARS,
}) => {
    if (!loadSummary) throw new Error('DDDP activity series configuration is incomplete')

    return async (input) => {
        const { from, to } = parseActivityRange({ ...input, currentYear, maxYears })
        const years = Array.from({ length: to - from + 1 }, (_, index) => from + index)
        const loaded = await mapWithConcurrency(years, concurrency, async (year) => {
            const summary = await loadSummary({ year })
            return {
                year,
                projects: summary.kpis.projects,
                programmes: summary.kpis.programmes,
                meetings: summary.kpis.meetings,
            }
        })

        return {
            period: { from, to },
            series: loaded,
            meta: {
                source: 'DDDP',
                retrievedAt: new Date().toISOString(),
                activityDefinition: 'expected-date-overlap',
                meetingDefinition: 'meeting-date-within-year',
            },
        }
    }
}

module.exports = {
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
}
