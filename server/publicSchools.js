const axios = require('axios')
const { parsePublicYear, resolveScope } = require('./publicSummary')
const { createCachedLoader, createPagedLoader, createUnitResolver } = require('./publicDelivery')

const SCHOOL_PROGRAM = 'g27TeeehRQC'
const STAGES = { profile: 'z6mWkIfypaw', feeding: 'aZJXKk3l5Jv' }

const SCHOOL_ATTRIBUTES = {
    type: 'RYU3GpNzokp',
    faithBased: 'PX7m8i2KVgT',
    level: 'anVTuGti6SK',
    girlsChangingRooms: 'YBC49GnEfdi',
}

const SCHOOL_TYPES = ['Public', 'Private', 'Public Private Partnership (PPP)']
const SCHOOL_LEVELS = ['Primary', 'Secondary', 'Tertiary/University', 'TVET', 'Nursing College']
const SCHOOL_CATEGORIES = [
    ['creche', 'Creche', 'HkovKF0eqVg'],
    ['kg', 'Kindergarten', 'kz1eZdE9hm3'],
    ['primary', 'Primary', 'kNHdPyj6ed3'],
    ['jhs', 'Junior High (JHS)', 'ZljvuDqsPJJ'],
    ['shs', 'Senior High (SHS)', 'qORPfeTsPeX'],
    ['tertiary', 'Tertiary', 'x0oK399l4RA'],
    ['tvet', 'TVET / Vocational', 'tsn8ekA92aR'],
]

const PROFILE_ELEMENTS = {
    feeding: 'PchURnKOaX1',
    furniture: 'TZWlfk8TM7n',
    ict: 'yq4Rt38EyTi',
    library: 'OlBBMFSCaud',
    toilet: 'NLFmA25boNu',
    water: 'JrAtSHckaq4',
    underTrees: 'ose3mxJSrVe',
    assemblySupport: 'grca3WiAWvb',
    classrooms: 'fJ6TQxhML5j',
    teachers: 'UTgjYsclOLW',
    male: 'W7cDb7KYNXq',
    female: 'Fzivg13nELP',
    pwd: 'oHugObuqlih',
    scholarships: 'a2ygggAK1Ik',
}

const FACILITIES = [
    ['toilet', 'Functional toilet facility'],
    ['water', 'Functional water facility'],
    ['furniture', 'Adequate furniture'],
    ['library', 'Library'],
    ['ict', 'ICT lab'],
    ['underTrees', 'Classes held under trees'],
    ['assemblySupport', 'Supported by the District Assembly'],
]

const FEEDING_ELEMENTS = { boys: 'jMGqg7AZ4FP', girls: 'CL5bvBCWxa5' }

const LIMITS = { classrooms: 500, teachers: 2000, pupils: 20000, feeding: 10000 }

const validDate = (value) => (typeof value === 'string' && /^(19|20)\d{2}-\d{2}-\d{2}/.test(value) ? value.slice(0, 10) : null)

const countValue = (value, limit) => {
    if (value === undefined || value === null || value === '') return null
    const number = Number(value)
    return Number.isInteger(number) && number >= 0 && number <= limit ? number : null
}

const booleanValue = (value) => (value === 'true' ? true : value === 'false' ? false : null)

const emptySchoolMetrics = () => ({
    schools: 0,
    types: new Map(),
    levels: new Map(),
    categories: new Map(),
    faithBased: 0,
    girlsChangingRooms: 0,
    profiled: 0,
    facilities: new Map(FACILITIES.map(([key]) => [key, { yes: 0, answered: 0 }])),
    feedingEnrolled: 0,
    feedingAnswered: 0,
    feedingReports: 0,
    feedingBoys: 0,
    feedingGirls: 0,
    male: 0,
    female: 0,
    pwd: 0,
    enrolmentReports: 0,
    teachers: 0,
    classrooms: 0,
    scholarships: 0,
})

const addSchool = (metrics, school) => {
    metrics.schools += 1
    if (school.type) metrics.types.set(school.type, (metrics.types.get(school.type) || 0) + 1)
    if (school.level) metrics.levels.set(school.level, (metrics.levels.get(school.level) || 0) + 1)
    school.categories.forEach((key) => metrics.categories.set(key, (metrics.categories.get(key) || 0) + 1))
    if (school.faithBased) metrics.faithBased += 1
    if (school.girlsChangingRooms) metrics.girlsChangingRooms += 1

    const { profile, feeding } = school
    if (profile) {
        metrics.profiled += 1
        FACILITIES.forEach(([key]) => {
            if (profile[key] === null) return
            const facility = metrics.facilities.get(key)
            facility.answered += 1
            if (profile[key]) facility.yes += 1
        })
        if (profile.feeding !== null) {
            metrics.feedingAnswered += 1
            if (profile.feeding) metrics.feedingEnrolled += 1
        }
        if (profile.male !== null || profile.female !== null) {
            metrics.enrolmentReports += 1
            metrics.male += profile.male || 0
            metrics.female += profile.female || 0
        }
        metrics.pwd += profile.pwd || 0
        metrics.teachers += profile.teachers || 0
        metrics.classrooms += profile.classrooms || 0
        metrics.scholarships += profile.scholarships || 0
    }
    if (feeding) {
        metrics.feedingReports += 1
        metrics.feedingBoys += feeding.boys || 0
        metrics.feedingGirls += feeding.girls || 0
    }
}

const mergeSchoolMetrics = (target, source) => {
    ;['schools', 'faithBased', 'girlsChangingRooms', 'profiled', 'feedingEnrolled', 'feedingAnswered', 'feedingReports', 'feedingBoys', 'feedingGirls', 'male', 'female', 'pwd', 'enrolmentReports', 'teachers', 'classrooms', 'scholarships']
        .forEach((key) => { target[key] += source[key] })
    ;['types', 'levels', 'categories'].forEach((key) => {
        source[key].forEach((value, label) => target[key].set(label, (target[key].get(label) || 0) + value))
    })
    source.facilities.forEach((value, key) => {
        const facility = target.facilities.get(key)
        facility.yes += value.yes
        facility.answered += value.answered
    })
    return target
}

const serializeSchoolMetrics = (metrics) => ({
    schools: metrics.schools,
    types: SCHOOL_TYPES.map((label) => ({ label, count: metrics.types.get(label) || 0 })),
    levels: SCHOOL_LEVELS.map((label) => ({ label, count: metrics.levels.get(label) || 0 })),
    categories: SCHOOL_CATEGORIES.map(([key, label]) => ({ key, label, count: metrics.categories.get(key) || 0 })),
    faithBased: metrics.faithBased,
    girlsChangingRooms: metrics.girlsChangingRooms,
    profiled: metrics.profiled,
    facilities: FACILITIES.map(([key, label]) => ({ key, label, ...metrics.facilities.get(key) })),
    feeding: {
        enrolledSchools: metrics.feedingEnrolled,
        answered: metrics.feedingAnswered,
        reportingSchools: metrics.feedingReports,
        boys: metrics.feedingBoys,
        girls: metrics.feedingGirls,
    },
    enrolment: {
        male: metrics.male,
        female: metrics.female,
        pwd: metrics.pwd,
        reportingSchools: metrics.enrolmentReports,
    },
    teachers: metrics.teachers,
    classrooms: metrics.classrooms,
    scholarships: metrics.scholarships,
})

const serializeChild = (slug, name, metrics) => ({
    slug,
    name,
    schools: metrics.schools,
    profiled: metrics.profiled,
    feedingEnrolled: metrics.feedingEnrolled,
    feedingAnswered: metrics.feedingAnswered,
    feedingReports: metrics.feedingReports,
    feedingPupils: metrics.feedingBoys + metrics.feedingGirls,
    pupils: metrics.male + metrics.female,
    teachers: metrics.teachers,
})

const latestByEntity = (events) => {
    const latest = new Map()
    events.forEach((event) => {
        const current = latest.get(event.trackedEntity)
        if (!current || event.date > current.date) latest.set(event.trackedEntity, event)
    })
    return latest
}

const createSchoolProfileLoader = ({
    baseURL,
    username,
    password,
    loadGeographyContext,
    httpClient = axios,
    concurrency = 4,
    ttlMs = 6 * 60 * 60 * 1000,
    currentYear = () => new Date().getFullYear(),
}) => {
    if (!baseURL || !username || !password || !loadGeographyContext) {
        throw new Error('DDDP school profile configuration is incomplete')
    }
    const client = httpClient.create({
        baseURL: baseURL.replace(/\/+$/, ''),
        auth: { username, password },
        timeout: 120000,
        headers: { Accept: 'application/json' },
    })
    const loadPages = createPagedLoader(client, concurrency)
    const resolveUnits = createUnitResolver(client)

    const loadRegister = createCachedLoader(ttlMs, async () => {
        const geographyContext = await loadGeographyContext()
        const { regionOrgUnitIds } = geographyContext.privateIndex
        const scoped = (orgUnit, extra) => () => new URLSearchParams({ program: SCHOOL_PROGRAM, orgUnit, ouMode: 'DESCENDANTS', ...extra })
        const eventFields = 'trackedEntity,occurredAt,dataValues[dataElement,value]'
        const eventsFor = async (programStage) => {
            const perRegion = []
            for (const orgUnit of regionOrgUnitIds) {
                perRegion.push(await loadPages('/tracker/events', scoped(orgUnit, { programStage, fields: eventFields }), 1000))
            }
            return perRegion.flat()
        }
        const [entities, profileEvents, feedingEvents] = await Promise.all([
            loadPages('/tracker/trackedEntities', scoped(regionOrgUnitIds.join(';'), { fields: 'trackedEntity,orgUnit,attributes[attribute,value]' }), 1000),
            eventsFor(STAGES.profile),
            eventsFor(STAGES.feeding),
        ])
        const valueOf = (event, dataElement) => event.dataValues?.find((item) => item.dataElement === dataElement)?.value
        const attributeOf = (entity, attribute) => entity.attributes?.find((item) => item.attribute === attribute)?.value

        const profiles = profileEvents
            .map((event) => ({ event, date: validDate(event.occurredAt) }))
            .filter(({ event, date }) => event.trackedEntity && date)
            .map(({ event, date }) => ({
                trackedEntity: event.trackedEntity,
                date,
                feeding: booleanValue(valueOf(event, PROFILE_ELEMENTS.feeding)),
                furniture: booleanValue(valueOf(event, PROFILE_ELEMENTS.furniture)),
                ict: booleanValue(valueOf(event, PROFILE_ELEMENTS.ict)),
                library: booleanValue(valueOf(event, PROFILE_ELEMENTS.library)),
                toilet: booleanValue(valueOf(event, PROFILE_ELEMENTS.toilet)),
                water: booleanValue(valueOf(event, PROFILE_ELEMENTS.water)),
                underTrees: booleanValue(valueOf(event, PROFILE_ELEMENTS.underTrees)),
                assemblySupport: booleanValue(valueOf(event, PROFILE_ELEMENTS.assemblySupport)),
                classrooms: countValue(valueOf(event, PROFILE_ELEMENTS.classrooms), LIMITS.classrooms),
                teachers: countValue(valueOf(event, PROFILE_ELEMENTS.teachers), LIMITS.teachers),
                male: countValue(valueOf(event, PROFILE_ELEMENTS.male), LIMITS.pupils),
                female: countValue(valueOf(event, PROFILE_ELEMENTS.female), LIMITS.pupils),
                pwd: countValue(valueOf(event, PROFILE_ELEMENTS.pwd), LIMITS.pupils),
                scholarships: countValue(valueOf(event, PROFILE_ELEMENTS.scholarships), LIMITS.pupils),
            }))
        const feeding = feedingEvents
            .map((event) => ({ event, date: validDate(event.occurredAt) }))
            .filter(({ event, date }) => event.trackedEntity && date)
            .map(({ event, date }) => ({
                trackedEntity: event.trackedEntity,
                date,
                boys: countValue(valueOf(event, FEEDING_ELEMENTS.boys), LIMITS.feeding),
                girls: countValue(valueOf(event, FEEDING_ELEMENTS.girls), LIMITS.feeding),
            }))
        const schools = entities.map((entity) => ({
            id: entity.trackedEntity,
            orgUnit: entity.orgUnit,
            type: SCHOOL_TYPES.includes(attributeOf(entity, SCHOOL_ATTRIBUTES.type)) ? attributeOf(entity, SCHOOL_ATTRIBUTES.type) : null,
            level: SCHOOL_LEVELS.includes(attributeOf(entity, SCHOOL_ATTRIBUTES.level)) ? attributeOf(entity, SCHOOL_ATTRIBUTES.level) : null,
            faithBased: attributeOf(entity, SCHOOL_ATTRIBUTES.faithBased) === 'true',
            girlsChangingRooms: attributeOf(entity, SCHOOL_ATTRIBUTES.girlsChangingRooms) === 'true',
            categories: SCHOOL_CATEGORIES.filter(([, , attribute]) => attributeOf(entity, attribute) === 'true').map(([key]) => key),
        }))
        const locate = await resolveUnits(geographyContext, schools.map((school) => school.orgUnit))
        return {
            schools: schools
                .map((school) => ({ ...school, location: locate(school.orgUnit) }))
                .filter((school) => school.location),
            profiles,
            feeding,
            retrievedAt: new Date().toISOString(),
        }
    })

    const aggregateYear = createCachedLoader(ttlMs, async (year) => {
        const register = await loadRegister('all')
        const geographyContext = await loadGeographyContext()
        const endOfYear = `${year}-12-31`
        const profileBySchool = latestByEntity(register.profiles.filter((item) => item.date <= endOfYear))
        const feedingBySchool = latestByEntity(register.feeding.filter((item) => item.date.startsWith(String(year))))
        const districtMetrics = new Map()
        const regionMetrics = new Map(geographyContext.publicGeography.regions.map((region) => [region.slug, emptySchoolMetrics()]))
        register.schools.forEach((school) => {
            const regionTotal = regionMetrics.get(school.location.regionSlug)
            if (!regionTotal) return
            const enriched = { ...school, profile: profileBySchool.get(school.id) || null, feeding: feedingBySchool.get(school.id) || null }
            addSchool(regionTotal, enriched)
            if (school.location.districtSlug) {
                const key = `${school.location.regionSlug}/${school.location.districtSlug}`
                if (!districtMetrics.has(key)) districtMetrics.set(key, emptySchoolMetrics())
                addSchool(districtMetrics.get(key), enriched)
            }
        })
        const national = emptySchoolMetrics()
        regionMetrics.forEach((metrics) => mergeSchoolMetrics(national, metrics))
        return { national, regionMetrics, districtMetrics, retrievedAt: register.retrievedAt }
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
            children = publicGeography.regions.map((region) => serializeChild(region.slug, region.name, aggregate.regionMetrics.get(region.slug) || emptySchoolMetrics()))
        } else if (scope.geography.level === 'region') {
            metrics = aggregate.regionMetrics.get(scope.geography.slug) || emptySchoolMetrics()
            children = publicGeography.districts
                .filter((district) => district.regionSlug === scope.geography.slug)
                .map((district) => serializeChild(district.slug, district.name, aggregate.districtMetrics.get(`${district.regionSlug}/${district.slug}`) || emptySchoolMetrics()))
        } else {
            metrics = aggregate.districtMetrics.get(`${regionSlug}/${scope.geography.slug}`) || emptySchoolMetrics()
        }
        return {
            geography: scope.geography,
            period: { year },
            metrics: serializeSchoolMetrics(metrics),
            children,
            meta: {
                source: 'DDDP',
                retrievedAt: aggregate.retrievedAt,
                profileDefinition: 'latest-periodic-update-on-or-before-year-end',
                feedingDefinition: 'latest-feeding-report-within-year',
            },
        }
    }

    return { getSummary }
}

module.exports = { FACILITIES, SCHOOL_CATEGORIES, SCHOOL_LEVELS, SCHOOL_TYPES, createSchoolProfileLoader }
