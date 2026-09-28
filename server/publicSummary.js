const axios = require('axios')

const PROGRAMS = {
    projectsProgrammes: 'g3wMUKEMmH3',
    meetings: 'Ch38jUWJpUR',
}

const ATTRIBUTES = {
    projectProgrammeType: 'wtf3BR2YO8w',
    expectedStartDate: 'JgjD9cTUbhm',
    expectedCompletionDate: 'T7LiYCQ3LAm',
    meetingDate: 'Ub0V9Z06aBc',
}

const MIN_PUBLIC_YEAR = 2000

class PublicSummaryError extends Error {
    constructor(message, statusCode) {
        super(message)
        this.name = 'PublicSummaryError'
        this.statusCode = statusCode
    }
}

const parsePublicYear = (value, currentYear = new Date().getFullYear()) => {
    const year = Number(value)
    if (!Number.isInteger(year) || year < MIN_PUBLIC_YEAR || year > currentYear) {
        throw new PublicSummaryError('A valid year is required.', 400)
    }
    return year
}

const createAvailableYearsLoader = ({
    baseURL,
    username,
    password,
    loadGeographyContext,
    httpClient = axios,
    currentYear = new Date().getFullYear(),
    minYear = MIN_PUBLIC_YEAR,
    concurrency = 4,
}) => {
    if (!baseURL || !username || !password || !loadGeographyContext) {
        throw new Error('DDDP public year configuration is incomplete')
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

    return async () => {
        const geographyContext = await loadGeographyContext()
        const orgUnit = geographyContext.privateIndex.regionOrgUnitIds.join(';')
        const candidateYears = Array.from(
            { length: Math.max(0, currentYear - minYear + 1) },
            (_, index) => minYear + index,
        )
        const availability = await mapWithConcurrency(candidateYears, concurrency, async (year) => {
            const start = `${year}-01-01`
            const end = `${year}-12-31`
            const [activities, meetings] = await Promise.all([
                countTrackedEntities({
                    program: PROGRAMS.projectsProgrammes,
                    orgUnit,
                    filters: [
                        `${ATTRIBUTES.expectedStartDate}:le:${end}`,
                        `${ATTRIBUTES.expectedCompletionDate}:ge:${start}`,
                    ],
                }),
                countTrackedEntities({
                    program: PROGRAMS.meetings,
                    orgUnit,
                    filters: [`${ATTRIBUTES.meetingDate}:sw:${year}`],
                }),
            ])
            return { year, hasData: activities > 0 || meetings > 0 }
        })
        const availableYears = availability.filter((item) => item.hasData).map((item) => item.year)
        if (availableYears.length === 0) throw new Error('No public DDDP years were available')

        return {
            years: availableYears,
            latestYear: availableYears[availableYears.length - 1],
            source: 'DDDP',
            retrievedAt: new Date().toISOString(),
        }
    }
}

const resolveScope = (geographyContext, { regionSlug, districtSlug }) => {
    const { publicGeography, privateIndex } = geographyContext

    if (!regionSlug && !districtSlug) {
        return {
            geography: { level: 'national', slug: 'ghana', name: 'Ghana' },
            orgUnit: privateIndex.regionOrgUnitIds.join(';'),
            ouMode: 'DESCENDANTS',
        }
    }

    const publicRegion = publicGeography.regions.find((region) => region.slug === regionSlug)
    const privateRegion = privateIndex.regionsBySlug.get(regionSlug)
    if (!publicRegion || !privateRegion) throw new PublicSummaryError('Geography not found.', 404)

    if (!districtSlug) {
        return {
            geography: { level: 'region', slug: publicRegion.slug, name: publicRegion.name },
            orgUnit: privateRegion.orgUnitId,
            ouMode: 'DESCENDANTS',
        }
    }

    const publicDistrict = publicGeography.districts.find((district) => (
        district.regionSlug === regionSlug && district.slug === districtSlug
    ))
    const privateDistrict = privateIndex.districtsByRoute.get(`${regionSlug}/${districtSlug}`)
    if (!publicDistrict || !privateDistrict) throw new PublicSummaryError('Geography not found.', 404)

    return {
        geography: { level: 'district', slug: publicDistrict.slug, name: publicDistrict.name, regionSlug },
        orgUnit: privateDistrict.orgUnitId,
        ouMode: 'SELECTED',
    }
}

const createDddpSummaryAdapter = ({ baseURL, username, password, loadGeographyContext, httpClient = axios }) => {
    if (!baseURL || !username || !password || !loadGeographyContext) {
        throw new Error('DDDP public summary configuration is incomplete')
    }

    const client = httpClient.create({
        baseURL: baseURL.replace(/\/+$/, ''),
        auth: { username, password },
        timeout: 30000,
        headers: { Accept: 'application/json' },
    })

    const countTrackedEntities = async ({ program, orgUnit, ouMode, filters }) => {
        const params = new URLSearchParams({
            program,
            orgUnit,
            ouMode,
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

    return async ({ year: yearInput, regionSlug, districtSlug }) => {
        const year = parsePublicYear(yearInput)
        const geographyContext = await loadGeographyContext()
        const scope = resolveScope(geographyContext, { regionSlug, districtSlug })
        const start = `${year}-01-01`
        const end = `${year}-12-31`
        const overlapFilters = [
            `${ATTRIBUTES.expectedStartDate}:le:${end}`,
            `${ATTRIBUTES.expectedCompletionDate}:ge:${start}`,
        ]

        const [projects, programmes, meetings] = await Promise.all([
            countTrackedEntities({
                program: PROGRAMS.projectsProgrammes,
                orgUnit: scope.orgUnit,
                ouMode: scope.ouMode,
                filters: [`${ATTRIBUTES.projectProgrammeType}:eq:Project`, ...overlapFilters],
            }),
            countTrackedEntities({
                program: PROGRAMS.projectsProgrammes,
                orgUnit: scope.orgUnit,
                ouMode: scope.ouMode,
                filters: [`${ATTRIBUTES.projectProgrammeType}:eq:Programme`, ...overlapFilters],
            }),
            countTrackedEntities({
                program: PROGRAMS.meetings,
                orgUnit: scope.orgUnit,
                ouMode: scope.ouMode,
                filters: [`${ATTRIBUTES.meetingDate}:sw:${year}`],
            }),
        ])

        return {
            geography: scope.geography,
            period: { year },
            kpis: {
                projects,
                programmes,
                projectsProgrammesTotal: projects + programmes,
                meetings,
            },
            meta: {
                source: 'DDDP',
                retrievedAt: new Date().toISOString(),
            },
        }
    }
}

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

const createRegionalSummaryLoader = ({ loadGeographyContext, loadSummary, concurrency = 4 }) => {
    if (!loadGeographyContext || !loadSummary) {
        throw new Error('DDDP regional summary configuration is incomplete')
    }

    return async ({ year: yearInput }) => {
        const year = parsePublicYear(yearInput)
        const geographyContext = await loadGeographyContext()
        const national = await loadSummary({ year })
        const loadedRegions = await mapWithConcurrency(
            geographyContext.publicGeography.regions,
            concurrency,
            async (region) => {
                const summary = await loadSummary({ year, regionSlug: region.slug })
                return {
                    slug: summary.geography.slug,
                    name: summary.geography.name,
                    kpis: summary.kpis,
                    retrievedAt: summary.meta.retrievedAt,
                }
            },
        )
        const retrievedTimes = loadedRegions
            .map((region) => Date.parse(region.retrievedAt))
            .concat(Date.parse(national.meta.retrievedAt))
            .filter(Number.isFinite)
        const retrievedAt = retrievedTimes.length > 0
            ? new Date(Math.min(...retrievedTimes)).toISOString()
            : new Date().toISOString()
        const regions = loadedRegions.map((region) => ({
            slug: region.slug,
            name: region.name,
            kpis: region.kpis,
        }))

        return {
            period: { year },
            national: {
                slug: national.geography.slug,
                name: national.geography.name,
                kpis: national.kpis,
            },
            regions,
            meta: {
                source: 'DDDP',
                retrievedAt,
            },
        }
    }
}

module.exports = {
    ATTRIBUTES,
    MIN_PUBLIC_YEAR,
    PROGRAMS,
    PublicSummaryError,
    createAvailableYearsLoader,
    createDddpSummaryAdapter,
    createRegionalSummaryLoader,
    parsePublicYear,
    resolveScope,
}
