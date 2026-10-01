const axios = require('axios')
const { ATTRIBUTES, PROGRAMS, PublicSummaryError, parsePublicYear, resolveScope } = require('./publicSummary')
const { PROJECT_SECTORS } = require('./publicAggregates')

const DELIVERY_PROGRAMS = {
    aap: 'ArLnAxhykoz',
    igf: 'dYNmYGtArrK',
    expenditure: 'WHILilRZRhT',
}

const IGF_ATTRIBUTES = {
    year: 'pWkYqcKukAY',
    source: 'jcFWiKH0Kud',
    budgeted: 'xSAif899MME',
    collected: 'nlZbT98zSio',
}

const IGF_SOURCES = ['Property Rates', 'Rent', 'Fees', 'Fines', 'Licenses', 'Permits', 'Road Toll/block', 'Market Tolls', 'Other IGF']

const EXPENDITURE = {
    year: 'Ik7fouv4KOA',
    capexStage: 'BRJ5cnjnoaq',
    igfReleased: 'ZLUExo9LVUu',
}

const AAP_YEAR_ATTRIBUTE = 'pWkYqcKukAY'
const SECTOR_ATTRIBUTE = 'k921oNWPSd4'
const IMPLEMENTATION_STATUS = 'tE3QKB203nh'
const COMPLETED_STATUSES = ['Completed', 'Completed and in-use']
const MAX_SERIES_YEARS = 10
const ORG_UNIT_CHUNK = 150

const toNumber = (value) => {
    if (value === undefined || value === null || value === '') return null
    const number = Number(value)
    return Number.isFinite(number) && number >= 0 ? number : null
}

const roundMoney = (value) => Math.round(value * 100) / 100

const attributeValue = (entity, attributeId) => (
    entity.attributes?.find((attribute) => attribute.attribute === attributeId)?.value
)

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
    await Promise.all(Array.from({ length: Math.min(Math.max(concurrency, 1), items.length) }, worker))
    return results
}

const createCachedLoader = (ttlMs, loader) => {
    const cache = new Map()
    const pending = new Map()
    const refresh = (key) => {
        if (pending.has(key)) return pending.get(key)
        const request = loader(key)
            .then((value) => {
                cache.set(key, { createdAt: Date.now(), value })
                return value
            })
            .finally(() => pending.delete(key))
        pending.set(key, request)
        return request
    }
    return (key) => {
        const cached = cache.get(key)
        if (cached && Date.now() - cached.createdAt < ttlMs) return Promise.resolve(cached.value)
        if (cached) {
            refresh(key).catch(() => {})
            return Promise.resolve(cached.value)
        }
        return refresh(key)
    }
}

const emptyMetrics = () => ({
    projects: 0,
    programmes: 0,
    meetings: 0,
    aapActivities: 0,
    completedProjects: 0,
    igfCollected: 0,
    igfBudgeted: 0,
    igfReleased: 0,
    igfRecords: 0,
    igfReleasedRecords: 0,
    igfAssemblies: new Set(),
    igfReleasedAssemblies: new Set(),
    sectors: new Map(),
    igfSources: new Map(),
})

const addMetrics = (target, source) => {
    ;['projects', 'programmes', 'meetings', 'aapActivities', 'completedProjects', 'igfCollected', 'igfBudgeted', 'igfReleased', 'igfRecords', 'igfReleasedRecords']
        .forEach((key) => { target[key] += source[key] })
    source.igfAssemblies.forEach((item) => target.igfAssemblies.add(item))
    source.igfReleasedAssemblies.forEach((item) => target.igfReleasedAssemblies.add(item))
    source.sectors.forEach((value, label) => {
        const current = target.sectors.get(label) || { projects: 0, programmes: 0 }
        target.sectors.set(label, { projects: current.projects + value.projects, programmes: current.programmes + value.programmes })
    })
    source.igfSources.forEach((value, label) => {
        const current = target.igfSources.get(label) || { collected: 0, budgeted: 0, records: 0 }
        target.igfSources.set(label, {
            collected: current.collected + value.collected,
            budgeted: current.budgeted + value.budgeted,
            records: current.records + value.records,
        })
    })
    return target
}

const SECTOR_LABELS = new Map(PROJECT_SECTORS.map(({ code, label }) => [code, label]))

const serializeSector = (label, value = { projects: 0, programmes: 0 }) => ({
    label,
    projects: value.projects,
    programmes: value.programmes,
    total: value.projects + value.programmes,
})

const serializeSource = (label, value = { collected: 0, budgeted: 0, records: 0 }) => ({
    label,
    collected: roundMoney(value.collected),
    budgeted: roundMoney(value.budgeted),
    records: value.records,
})

const serializeMetrics = (metrics) => {
    const sectors = PROJECT_SECTORS.map(({ code, label }) => serializeSector(label, metrics.sectors.get(code)))
    if (metrics.sectors.has('')) sectors.push(serializeSector('Not recorded', metrics.sectors.get('')))
    const igfSources = IGF_SOURCES.map((label) => serializeSource(label, metrics.igfSources.get(label)))
    if (metrics.igfSources.has('')) igfSources.push(serializeSource('Not recorded', metrics.igfSources.get('')))

    return {
        projects: metrics.projects,
        programmes: metrics.programmes,
        projectsProgrammesTotal: metrics.projects + metrics.programmes,
        meetings: metrics.meetings,
        aapActivities: metrics.aapActivities,
        completedProjects: metrics.completedProjects,
        igf: {
            collected: roundMoney(metrics.igfCollected),
            budgeted: roundMoney(metrics.igfBudgeted),
            released: roundMoney(metrics.igfReleased),
            records: metrics.igfRecords,
            reportingAssemblies: metrics.igfAssemblies.size,
            releasedRecords: metrics.igfReleasedRecords,
            releasedAssemblies: metrics.igfReleasedAssemblies.size,
        },
        sectors,
        igfSources,
    }
}

const buildUnitIndex = (geographyContext) => {
    const index = new Map()
    geographyContext.privateIndex.regionsBySlug.forEach((region, regionSlug) => {
        index.set(region.orgUnitId, { regionSlug, districtSlug: null })
    })
    geographyContext.privateIndex.districtsByRoute.forEach((district, route) => {
        const [regionSlug, districtSlug] = route.split('/')
        index.set(district.orgUnitId, { regionSlug, districtSlug })
    })
    return index
}

const createUnitResolver = (client) => {
    const resolved = new Map()
    return async (geographyContext, orgUnitIds) => {
        const index = buildUnitIndex(geographyContext)
        const unknown = [...new Set(orgUnitIds)].filter((id) => id && !index.has(id) && !resolved.has(id))
        for (let offset = 0; offset < unknown.length; offset += ORG_UNIT_CHUNK) {
            const chunk = unknown.slice(offset, offset + ORG_UNIT_CHUNK)
            const { data } = await client.get('/organisationUnits', {
                params: { filter: `id:in:[${chunk.join(',')}]`, fields: 'id,path', paging: 'false' },
            })
            const paths = new Map((data?.organisationUnits || []).map((unit) => [unit.id, unit.path || '']))
            chunk.forEach((id) => {
                const ancestors = (paths.get(id) || '').split('/').filter(Boolean).reverse()
                resolved.set(id, ancestors.map((ancestor) => index.get(ancestor)).find(Boolean) || null)
            })
        }
        return (orgUnitId) => index.get(orgUnitId) || resolved.get(orgUnitId) || null
    }
}

const createPagedLoader = (client, concurrency) => async (path, buildParams, pageSize) => {
    const loadPage = async (page) => {
        const params = buildParams()
        params.set('page', String(page))
        params.set('pageSize', String(pageSize))
        params.set('totalPages', 'true')
        const { data } = await client.get(path, { params })
        const instances = data?.instances || data?.trackedEntities || data?.events
        if (!Array.isArray(instances)) throw new Error('DDDP records were unavailable')
        return { total: Number.isInteger(data.total) ? data.total : instances.length, instances }
    }
    const first = await loadPage(1)
    const pageCount = Math.ceil(first.total / pageSize)
    const rest = await mapWithConcurrency(
        Array.from({ length: Math.max(0, pageCount - 1) }, (_, index) => index + 2),
        concurrency,
        loadPage,
    )
    return [first, ...rest].flatMap((page) => page.instances)
}

const createDeliveryLoader = ({
    baseURL,
    username,
    password,
    loadGeographyContext,
    httpClient = axios,
    concurrency = 4,
    ttlMs = 15 * 60 * 1000,
    currentYear = () => new Date().getFullYear(),
}) => {
    if (!baseURL || !username || !password || !loadGeographyContext) {
        throw new Error('DDDP delivery configuration is incomplete')
    }

    const client = httpClient.create({
        baseURL: baseURL.replace(/\/+$/, ''),
        auth: { username, password },
        timeout: 120000,
        headers: { Accept: 'application/json' },
    })
    const resolveUnits = createUnitResolver(client)
    const loadPages = createPagedLoader(client, concurrency)

    const scopeParams = async () => {
        const geographyContext = await loadGeographyContext()
        return { geographyContext, orgUnit: geographyContext.privateIndex.regionOrgUnitIds.join(';') }
    }

    const trackedEntities = ({ orgUnit, program, filters = [], fields, pageSize = 1000 }) => loadPages('/tracker/trackedEntities', () => {
        const params = new URLSearchParams({ program, orgUnit, ouMode: 'DESCENDANTS', fields })
        filters.forEach((filter) => params.append('filter', filter))
        return params
    }, pageSize)

    const countTrackedEntities = async ({ orgUnit, program, filters }) => {
        const params = new URLSearchParams({ program, orgUnit, ouMode: 'DESCENDANTS', page: '1', pageSize: '1', totalPages: 'true', fields: 'trackedEntity' })
        filters.forEach((filter) => params.append('filter', filter))
        const { data } = await client.get('/tracker/trackedEntities', { params })
        if (!Number.isInteger(data?.total)) throw new Error('DDDP tracker count was unavailable')
        return data.total
    }

    const loadCompletedEvents = async (regionOrgUnitIds, year) => {
        const perRegion = await mapWithConcurrency(regionOrgUnitIds, concurrency, (regionOrgUnit) => loadPages('/tracker/events', () => {
            const params = new URLSearchParams({
                program: PROGRAMS.projectsProgrammes,
                orgUnit: regionOrgUnit,
                ouMode: 'DESCENDANTS',
                occurredAfter: `${year}-01-01`,
                occurredBefore: `${year}-12-31`,
                fields: 'trackedEntity,orgUnit',
            })
            params.append('filter', `${IMPLEMENTATION_STATUS}:in:${COMPLETED_STATUSES.join(';')}`)
            return params
        }, 1000))
        return perRegion.flat()
    }

    const loadFinanceYear = createCachedLoader(ttlMs, async (year) => {
        const { geographyContext, orgUnit } = await scopeParams()
        const [igf, expenditure, completedEvents] = await Promise.all([
            trackedEntities({
                orgUnit,
                program: DELIVERY_PROGRAMS.igf,
                filters: [`${IGF_ATTRIBUTES.year}:eq:${year}`],
                fields: 'trackedEntity,orgUnit,attributes[attribute,value]',
            }),
            trackedEntities({
                orgUnit,
                program: DELIVERY_PROGRAMS.expenditure,
                filters: [`${EXPENDITURE.year}:eq:${year}`],
                fields: 'trackedEntity,orgUnit,attributes[attribute,value],enrollments[events[programStage,dataValues[dataElement,value]]]',
                pageSize: 200,
            }),
            loadCompletedEvents(geographyContext.privateIndex.regionOrgUnitIds, year),
        ])

        const completedByEntity = new Map()
        completedEvents.forEach((event) => {
            if (event.trackedEntity && !completedByEntity.has(event.trackedEntity)) completedByEntity.set(event.trackedEntity, event.orgUnit)
        })

        return {
            igf: igf.map((entity) => ({
                orgUnit: entity.orgUnit,
                collected: toNumber(attributeValue(entity, IGF_ATTRIBUTES.collected)),
                budgeted: toNumber(attributeValue(entity, IGF_ATTRIBUTES.budgeted)),
                source: attributeValue(entity, IGF_ATTRIBUTES.source) || '',
            })),
            released: expenditure.map((entity) => {
                const values = (entity.enrollments || [])
                    .flatMap((enrollment) => enrollment.events || [])
                    .filter((event) => event.programStage === EXPENDITURE.capexStage)
                    .map((event) => toNumber(event.dataValues?.find((value) => value.dataElement === EXPENDITURE.igfReleased)?.value))
                    .filter((value) => value !== null)
                return { orgUnit: entity.orgUnit, amount: values.reduce((sum, value) => sum + value, 0), reported: values.length > 0 }
            }),
            completed: [...completedByEntity.values()],
        }
    })

    const loadActivityYear = createCachedLoader(ttlMs, async (year) => {
        const { orgUnit } = await scopeParams()
        const [activities, meetings, aap] = await Promise.all([
            trackedEntities({
                orgUnit,
                program: PROGRAMS.projectsProgrammes,
                filters: [
                    `${ATTRIBUTES.projectProgrammeType}:in:Project;Programme`,
                    `${ATTRIBUTES.expectedStartDate}:le:${year}-12-31`,
                    `${ATTRIBUTES.expectedCompletionDate}:ge:${year}-01-01`,
                ],
                fields: 'trackedEntity,orgUnit,attributes[attribute,value]',
                pageSize: 2500,
            }),
            trackedEntities({
                orgUnit,
                program: PROGRAMS.meetings,
                filters: [`${ATTRIBUTES.meetingDate}:sw:${year}`],
                fields: 'trackedEntity,orgUnit',
                pageSize: 5000,
            }),
            trackedEntities({
                orgUnit,
                program: DELIVERY_PROGRAMS.aap,
                filters: [`${AAP_YEAR_ATTRIBUTE}:eq:${year}`],
                fields: 'trackedEntity,orgUnit',
                pageSize: 5000,
            }),
        ])
        return {
            activities: activities.map((entity) => ({
                orgUnit: entity.orgUnit,
                type: attributeValue(entity, ATTRIBUTES.projectProgrammeType),
                sector: SECTOR_LABELS.has(attributeValue(entity, SECTOR_ATTRIBUTE)) ? attributeValue(entity, SECTOR_ATTRIBUTE) : '',
            })),
            meetings: meetings.map((entity) => entity.orgUnit),
            aap: aap.map((entity) => entity.orgUnit),
        }
    })

    const aggregateYear = createCachedLoader(ttlMs, async (year) => {
        const [finance, activity, geographyContext] = await Promise.all([loadFinanceYear(year), loadActivityYear(year), loadGeographyContext()])
        const allUnits = [
            ...finance.igf.map((item) => item.orgUnit),
            ...finance.released.map((item) => item.orgUnit),
            ...finance.completed,
            ...activity.activities.map((item) => item.orgUnit),
            ...activity.meetings,
            ...activity.aap,
        ]
        const locate = await resolveUnits(geographyContext, allUnits)
        const buckets = new Map()
        const bucketFor = (orgUnitId) => {
            const location = locate(orgUnitId)
            if (!location) return null
            const key = `${location.regionSlug}/${location.districtSlug || ''}`
            if (!buckets.has(key)) buckets.set(key, { ...location, metrics: emptyMetrics() })
            return buckets.get(key)
        }

        activity.activities.forEach((item) => {
            const bucket = bucketFor(item.orgUnit)
            if (!bucket) return
            const typeKey = item.type === 'Programme' ? 'programmes' : 'projects'
            bucket.metrics[typeKey] += 1
            const sector = bucket.metrics.sectors.get(item.sector) || { projects: 0, programmes: 0 }
            sector[typeKey] += 1
            bucket.metrics.sectors.set(item.sector, sector)
        })
        activity.meetings.forEach((orgUnitId) => {
            const bucket = bucketFor(orgUnitId)
            if (bucket) bucket.metrics.meetings += 1
        })
        activity.aap.forEach((orgUnitId) => {
            const bucket = bucketFor(orgUnitId)
            if (bucket) bucket.metrics.aapActivities += 1
        })
        finance.completed.forEach((orgUnitId) => {
            const bucket = bucketFor(orgUnitId)
            if (bucket) bucket.metrics.completedProjects += 1
        })
        finance.igf.forEach((item) => {
            const bucket = bucketFor(item.orgUnit)
            if (!bucket) return
            bucket.metrics.igfRecords += 1
            bucket.metrics.igfAssemblies.add(`${bucket.regionSlug}/${bucket.districtSlug || ''}`)
            if (item.collected !== null) bucket.metrics.igfCollected += item.collected
            if (item.budgeted !== null) bucket.metrics.igfBudgeted += item.budgeted
            const source = IGF_SOURCES.includes(item.source) ? item.source : item.source ? 'Other IGF' : ''
            const current = bucket.metrics.igfSources.get(source) || { collected: 0, budgeted: 0, records: 0 }
            bucket.metrics.igfSources.set(source, {
                collected: current.collected + (item.collected || 0),
                budgeted: current.budgeted + (item.budgeted || 0),
                records: current.records + 1,
            })
        })
        finance.released.forEach((item) => {
            if (!item.reported) return
            const bucket = bucketFor(item.orgUnit)
            if (!bucket) return
            bucket.metrics.igfReleased += item.amount
            bucket.metrics.igfReleasedRecords += 1
            bucket.metrics.igfReleasedAssemblies.add(`${bucket.regionSlug}/${bucket.districtSlug || ''}`)
        })

        const { publicGeography } = geographyContext
        const districtMetrics = new Map()
        const regionMetrics = new Map(publicGeography.regions.map((region) => [region.slug, emptyMetrics()]))
        buckets.forEach((bucket) => {
            const regionTotal = regionMetrics.get(bucket.regionSlug)
            if (!regionTotal) return
            addMetrics(regionTotal, bucket.metrics)
            if (bucket.districtSlug) districtMetrics.set(`${bucket.regionSlug}/${bucket.districtSlug}`, bucket.metrics)
        })
        const national = emptyMetrics()
        regionMetrics.forEach((metrics) => addMetrics(national, metrics))
        return { national, regionMetrics, districtMetrics, retrievedAt: new Date().toISOString() }
    })

    const getSummary = async ({ year: yearInput, regionSlug, districtSlug }) => {
        const year = parsePublicYear(yearInput, currentYear())
        const geographyContext = await loadGeographyContext()
        const scope = resolveScope(geographyContext, { regionSlug, districtSlug })
        const aggregate = await aggregateYear(year)
        const { publicGeography } = geographyContext
        let metrics
        let children = []
        if (scope.geography.level === 'national') {
            metrics = aggregate.national
            children = publicGeography.regions.map((region) => ({
                slug: region.slug,
                name: region.name,
                metrics: serializeMetrics(aggregate.regionMetrics.get(region.slug) || emptyMetrics()),
            }))
        } else if (scope.geography.level === 'region') {
            metrics = aggregate.regionMetrics.get(scope.geography.slug) || emptyMetrics()
            children = publicGeography.districts
                .filter((district) => district.regionSlug === scope.geography.slug)
                .map((district) => ({
                    slug: district.slug,
                    name: district.name,
                    metrics: serializeMetrics(aggregate.districtMetrics.get(`${district.regionSlug}/${district.slug}`) || emptyMetrics()),
                }))
        } else {
            metrics = aggregate.districtMetrics.get(`${regionSlug}/${scope.geography.slug}`) || emptyMetrics()
        }
        return {
            geography: scope.geography,
            period: { year },
            metrics: serializeMetrics(metrics),
            children,
            meta: {
                source: 'DDDP',
                retrievedAt: aggregate.retrievedAt,
                activityDefinition: 'expected-date-overlap',
                completedDefinition: 'progress-report-in-year-marked-completed',
                igfDefinition: 'igf-tracker-year-attribute',
                igfReleasedDefinition: 'expenditure-tracker-capex-igf-released',
            },
        }
    }

    const getSeries = async ({ from: fromInput, to: toInput }) => {
        const from = parsePublicYear(fromInput, currentYear())
        const to = parsePublicYear(toInput, currentYear())
        if (from > to) throw new PublicSummaryError('The start year must not be after the end year.', 400)
        if (to - from + 1 > MAX_SERIES_YEARS) throw new PublicSummaryError(`A maximum of ${MAX_SERIES_YEARS} years may be requested.`, 400)
        const { geographyContext, orgUnit } = await scopeParams()
        const index = buildUnitIndex(geographyContext)
        const years = Array.from({ length: to - from + 1 }, (_, offset) => from + offset)
        const series = await mapWithConcurrency(years, 2, async (year) => {
            const [finance, aapActivities] = await Promise.all([
                loadFinanceYear(year),
                countTrackedEntities({ orgUnit, program: DELIVERY_PROGRAMS.aap, filters: [`${AAP_YEAR_ATTRIBUTE}:eq:${year}`] }),
            ])
            const locate = await resolveUnits(geographyContext, [
                ...finance.igf.map((item) => item.orgUnit),
                ...finance.released.map((item) => item.orgUnit),
                ...finance.completed,
            ])
            const inScope = (orgUnitId) => index.has(orgUnitId) || Boolean(locate(orgUnitId))
            const igf = finance.igf.filter((item) => inScope(item.orgUnit))
            const released = finance.released.filter((item) => item.reported && inScope(item.orgUnit))
            return {
                year,
                aapActivities,
                completedProjects: finance.completed.filter(inScope).length,
                igfCollected: roundMoney(igf.reduce((sum, item) => sum + (item.collected || 0), 0)),
                igfBudgeted: roundMoney(igf.reduce((sum, item) => sum + (item.budgeted || 0), 0)),
                igfReleased: roundMoney(released.reduce((sum, item) => sum + item.amount, 0)),
            }
        })
        return {
            period: { from, to },
            series,
            meta: { source: 'DDDP', retrievedAt: new Date().toISOString() },
        }
    }

    return { getSummary, getSeries, warm: (year) => aggregateYear(year) }
}

module.exports = {
    COMPLETED_STATUSES,
    DELIVERY_PROGRAMS,
    EXPENDITURE,
    IGF_ATTRIBUTES,
    IGF_SOURCES,
    buildUnitIndex,
    createCachedLoader,
    createDeliveryLoader,
    createPagedLoader,
    createUnitResolver,
}
