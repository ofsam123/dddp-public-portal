const axios = require('axios')

const TEST_DISTRICT_IDS = new Set(['EipJ1KBgsce', 'EmVZbr0kApz'])
const DISTRICT_ID_PATTERN = /^[A-Za-z][A-Za-z0-9]{10}$/
const MIN_DPAT_YEAR = 2018
const CI_TOTAL = 4
const PUBLISHED_STATUSES = new Set(['Completed', 'Closed'])
const STATUS_ORDER = ['Not started', 'Start', 'In progress', 'Pending', 'Reviewed', 'Completed', 'Closed']
const STATUS_ALIASES = {
    start: 'Start',
    started: 'Start',
    pending: 'Pending',
    reviewed: 'Reviewed',
    completed: 'Completed',
    closed: 'Closed',
}
const MAX_FAILED_SUMMARY_SHARE = 0.1

const CLASSIFICATION_SCALES = {
    official: {
        bands: [
            { label: 'Excellent', min: 75 },
            { label: 'Very Good', min: 60 },
            { label: 'Good', min: 40 },
            { label: 'Fair', min: 30 },
            { label: 'Poor', min: 0 },
        ],
    },
    standard: {
        bands: [
            { label: 'Excellent', min: 75 },
            { label: 'Very Good', min: 60 },
            { label: 'Good', min: 40 },
            { label: 'Fair', min: 30 },
            { label: 'Poor', min: 0 },
        ],
    },
}

const MAIN_INDICATORS = [
    { code: 'CI 1', category: 'CI', thematicArea: 'General Assembly Meetings and Approvals', maxScore: null },
    { code: 'CI 2', category: 'CI', thematicArea: 'Other Statutory Meetings / Requirements', maxScore: null },
    { code: 'CI 3', category: 'CI', thematicArea: 'Public Financial Management and Auditing', maxScore: null },
    { code: 'CI 4', category: 'CI', thematicArea: 'Transparency, Accountability & Participation', maxScore: null },
    { code: 'SDI 1', category: 'SDI', thematicArea: 'Management Coordination - Implementation of Service Delivery Decisions', maxScore: 7 },
    { code: 'SDI 2', category: 'SDI', thematicArea: 'Basic / Social Services', maxScore: 18 },
    { code: 'SDI 3', category: 'SDI', thematicArea: 'Physical and Spatial Planning Services', maxScore: 9 },
    { code: 'SDI 4', category: 'SDI', thematicArea: 'Social Protection, Gender and Nutrition', maxScore: 13 },
    { code: 'SDI 5', category: 'SDI', thematicArea: 'Environmental Health, Sanitation and Climate Action', maxScore: 14 },
    { code: 'SDI 6', category: 'SDI', thematicArea: 'Local Economic Development (LED)', maxScore: 6 },
    { code: 'PI 1', category: 'PI', thematicArea: 'Annual Action Plan Implementation', maxScore: 16 },
    { code: 'PI 2', category: 'PI', thematicArea: 'Revenue Generation', maxScore: 5 },
    { code: 'PI 3', category: 'PI', thematicArea: 'Audit Performance', maxScore: 9 },
    { code: 'PI 4', category: 'PI', thematicArea: 'Access to Social Services', maxScore: 3 },
]

const SUB_INDICATOR_TABLES = [
    ['c1.0-1.1', 'gaMeeting'], ['c1.0-1.2', 'aapBudgetApproval'], ['c1.0-1.3', 'subStructureMeeting'],
    ['c2.0-2.1', 'executiveCommitteeMember'], ['c2.0-2.2', 'subStructureCommitteeMeeting'], ['c2.0-2.3', 'managementMeeting'],
    ['c2.0-2.4', 'prccMeeting'], ['c2.0-2.5', 'entityTenderCommitteeMeeting'],
    ['c3.0-3.1', 'spcEntityTenderCommittee'], ['c3.0-3.2', 'internalAuditUnitFunctionality'], ['c3.0-3.3', 'auditCommitteeMeeting'],
    ['c4.0-4.1', 'clientServiceFunctionality'], ['c4.0-4.2', 'aapPublication'], ['c4.0-4.3', 'auditorGeneralGAMeeting'],
    ['c4.0-4.4', 'townHallMeeting'],
    ['sdi1.0-1.1', 'generalAssemblyDecision'], ['sdi1.0-1.2', 'generalAssemblyManagementActions'], ['sdi1.0-1.3', 'gaSupport'],
    ['sdi2.0-2.1', 'waterServices'], ['sdi2.0-2.2', 'electricityServices'], ['sdi2.0-2.3', 'sanitationServices'],
    ['sdi2.0-2.4', 'maintenanceInfrastructure'], ['sdi2.0-2.5', 'clientServiceCharter'], ['sdi2.0-2.6', 'transportationNetworkService'],
    ['sdi3.0-3.1', 'buildingInspectorateUnit'], ['sdi3.0-3.2', 'permitProcessingIssuance'], ['sdi3.0-3.3', 'streetNaming'],
    ['sdi4.0-4.1', 'socialProtectionServices'], ['sdi4.0-4.2', 'districtHotlineNumber'], ['sdi4.0-4.3', 'pwdService'],
    ['sdi4.0-4.4', 'deepeningGenderMainstreaming'], ['sdi4.0-4.5', 'nutritionIntervention'],
    ['sdi5.0-5.1', 'sanitationServiceProviders'], ['sdi5.0-5.2', 'dumpingSite'], ['sdi5.0-5.3', 'foodVendors'],
    ['sdi5.0-5.4', 'publicSchoolFacility'], ['sdi5.0-5.5', 'climateChangeIntervention'],
    ['sdi6.0-6.1', 'districtLEDActivityPlan'], ['sdi6.0-6.2', 'businessAndJobPromotion'],
    ['sdi6.0-6.3', 'agroProcessingFacilitySupport'], ['sdi6.0-6.4', 'businessCommunityEngagement'],
    ['pi1.0-1.1', 'aapImplementation'], ['pi1.0-1.2', 'monitoringProjectAndActivity'], ['pi1.0-1.3', 'contractManagementAndAdmins'],
    ['pi1.0-1.4', 'followUpDeduction'], ['pi1.0-1.5', 'environmentalAndSocialSafeGuard'],
    ['pi2.0-2.1', 'rateableRevenue'],
    ['pi3.0-3.1', 'auditCommitteeResponsiveness'], ['pi3.0-3.2', 'auditInfractions'],
    ['pi4.0-4.1', 'educationServiceSupport'], ['pi4.0-4.2', 'healthServiceSupport'], ['pi4.0-4.3', 'agricultureSupport'],
]

const SUB_KEY_PATTERN = /^(c|sdi|pi)(\d+)\.0-(\d+)\.(\d+)$/
const CATEGORY_BY_PREFIX = { c: 'CI', sdi: 'SDI', pi: 'PI' }

const SUB_INDICATORS = SUB_INDICATOR_TABLES.map(([key, tableKey]) => {
    const [, prefix, group, , item] = key.match(SUB_KEY_PATTERN)
    const category = CATEGORY_BY_PREFIX[prefix]
    return { key, tableKey, category, groupCode: `${category} ${group}`, code: `${category} ${group}.${item}` }
})

const CMS_READ_PATHS = [
    /^comments\/summary\/[A-Za-z0-9]{11}\/\d{4}\/DPAT$/,
    /^comments\/table\/[A-Za-z0-9]{11}\/\d{4}\/DPAT\/assessment_start_DAPT$/,
    /^comments\/tables\/[A-Za-z0-9]{11}\/\d{4}\/DPAT$/,
    /^assessments\/districts\/dpat\/\d{4}\/DPAT$/,
    /^dpat-indicator\/year\/\d{4}$/,
]
const DHIS2_READ_PATHS = [/^organisationUnits$/]

class DpatPublicError extends Error {
    constructor(message, statusCode) {
        super(message)
        this.name = 'DpatPublicError'
        this.statusCode = statusCode
    }
}

const createLimiter = (maxConcurrent) => {
    let active = 0
    const queue = []
    const next = () => {
        if (active >= maxConcurrent || queue.length === 0) return
        active += 1
        const { task, resolve, reject } = queue.shift()
        Promise.resolve()
            .then(task)
            .then(resolve, reject)
            .finally(() => {
                active -= 1
                next()
            })
    }
    return (task) => new Promise((resolve, reject) => {
        queue.push({ task, resolve, reject })
        next()
    })
}

const createReadOnlyClient = ({ name, baseURL, username, password, allowedPaths, limit, timeout, httpClient = axios }) => {
    if (!baseURL || !username || !password) throw new Error(`${name} configuration is incomplete`)
    const client = httpClient.create({
        baseURL: `${baseURL.replace(/\/+$/, '')}/`,
        auth: { username, password },
        timeout,
        headers: { Accept: 'application/json' },
    })
    return (path, params) => {
        if (!allowedPaths.some((pattern) => pattern.test(path))) {
            return Promise.reject(new Error(`${name} path is not on the read-only allow-list`))
        }
        return limit(() => client.get(path, params ? { params } : undefined)).then((response) => response.data)
    }
}

const createCache = ({ ttlMs, maxEntries = 1000, now = Date.now }) => {
    const entries = new Map()
    return (key, loader) => {
        const hit = entries.get(key)
        if (hit && 'value' in hit && now() - hit.createdAt < ttlMs) return Promise.resolve(hit.value)
        if (hit?.pending) return hit.pending

        const pending = loader().then(
            (value) => {
                entries.delete(key)
                entries.set(key, { value, createdAt: now() })
                while (entries.size > maxEntries) entries.delete(entries.keys().next().value)
                return value
            },
            (error) => {
                if (hit && 'value' in hit) {
                    entries.set(key, { value: hit.value, createdAt: hit.createdAt })
                    return hit.value
                }
                entries.delete(key)
                throw error
            },
        )
        entries.set(key, { ...hit, pending })
        return pending
    }
}

const isEntered = (value) => {
    if (value === null || value === undefined) return false
    if (typeof value === 'string') {
        const trimmed = value.trim()
        return trimmed !== '' && trimmed !== '—'
    }
    return true
}

const num = (value) => {
    if (!isEntered(value)) return null
    const parsed = Number(value)
    return Number.isFinite(parsed) ? parsed : null
}

const round1 = (value) => Math.round(value * 10) / 10

const isSubtotal = (row) => /sub-?total/i.test(String(row?.no || ''))

const mainRows = (rows) => (Array.isArray(rows) ? rows : []).filter((row) => row && !isSubtotal(row))

const parseFulfilled = (value) => {
    if (!isEntered(value)) return null
    const normalized = String(value).trim().toLowerCase()
    if (normalized === 'fulfilled') return true
    if (normalized === 'not fulfilled') return false
    return null
}

const finalRowScore = (row) => {
    for (const value of [row?.petitionCommitteeScore, row?.qualityAssuranceScore, row?.technicalTeamScore, row?.actualScore]) {
        const parsed = num(value)
        if (parsed !== null) return parsed
    }
    return 0
}

const finalCiFulfilled = (row) => {
    for (const value of [row?.petitionCommitteeScore, row?.qualityAssuranceScore, row?.technicalTeamScore]) {
        const parsed = parseFulfilled(value)
        if (parsed !== null) return parsed
    }
    return row?.fulfilled === true
}

const normalizeMainCode = (value) => {
    const match = String(value || '').match(/^\s*(CI|SDI|PI)[\s.]*(\d+)/i)
    return match ? `${match[1].toUpperCase()} ${Number(match[2])}` : null
}

const computeDistrictFinal = (summary) => {
    const sdiRows = mainRows(summary?.serviceDeliveryIndicators)
    const piRows = mainRows(summary?.performanceIndicators)
    const ciRows = mainRows(summary?.complianceIndicators)
        .filter((row) => /^CI [1-4]$/.test(normalizeMainCode(row.no) || ''))
    const sum = (rows, pick) => rows.reduce((total, row) => total + pick(row), 0)

    const sdiFinal = sum(sdiRows, finalRowScore)
    const piFinal = sum(piRows, finalRowScore)
    const sdiMax = sum(sdiRows, (row) => num(row.maxScore) || 0)
    const piMax = sum(piRows, (row) => num(row.maxScore) || 0)
    const grandFinal = sdiFinal + piFinal
    const grandMax = sdiMax + piMax

    return {
        sdiFinal,
        sdiMax,
        piFinal,
        piMax,
        grandFinal,
        grandMax,
        overallPercent: grandMax > 0 ? round1((grandFinal / grandMax) * 100) : null,
        ciFulfilled: ciRows.filter(finalCiFulfilled).length,
    }
}

const createClassifier = (scaleName = 'official') => {
    const scale = CLASSIFICATION_SCALES[scaleName] || CLASSIFICATION_SCALES.official
    return {
        bands: scale.bands.map((band) => ({ ...band })),
        classify: (percent) => {
            if (!Number.isFinite(percent)) return null
            return (scale.bands.find((band) => percent >= band.min) || scale.bands[scale.bands.length - 1]).label
        },
    }
}

const normalizeStatus = (value) => {
    if (!isEntered(value)) return 'Not started'
    return STATUS_ALIASES[String(value).trim().toLowerCase()] || 'In progress'
}

const isPublished = (status) => PUBLISHED_STATUSES.has(status)

const competitionRanks = (items, valueOf, nameOf) => {
    const sorted = [...items].sort((a, b) => (valueOf(b) - valueOf(a)) || nameOf(a).localeCompare(nameOf(b)))
    const ranks = new Map()
    let rank = 0
    sorted.forEach((item, index) => {
        if (index === 0 || valueOf(item) !== valueOf(sorted[index - 1])) rank = index + 1
        ranks.set(item, rank)
    })
    return ranks
}

const mean = (values) => (values.length ? values.reduce((total, value) => total + value, 0) / values.length : null)

const cleanRegionName = (value = '') => value.trim().replace(/\s+region$/i, '')

const dateValue = (parts) => (Array.isArray(parts)
    ? parts.slice(0, 7).reduce((total, part, index) => total + (Number(part) || 0) * (100 ** (6 - index)), 0)
    : 0)

const humanizeTableKey = (tableKey = '') => tableKey
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/^./, (letter) => letter.toUpperCase())

const normalizeCatalogueCode = (code = '') => {
    const compact = String(code).toLowerCase().replace(/\s+/g, '')
    return compact.replace(/^ci/, 'c')
}

const systemTableScore = (table) => {
    if (!table || typeof table !== 'object') return null
    const values = ['score', 'scorei', 'scoreii', 'scoreiii'].map((key) => table[key]).filter((value) => typeof value === 'number')
    return values.length ? values.reduce((total, value) => total + value, 0) : 0
}

const collectSubIndicatorReviews = (comments) => {
    const reviews = new Map()
    const rows = (Array.isArray(comments) ? comments : [])
        .filter((row) => row && typeof row.tableCommented === 'string')
        .sort((a, b) => (dateValue(a.updateDate) - dateValue(b.updateDate)) || ((a.id || 0) - (b.id || 0)))

    rows.forEach((row) => {
        const key = row.tableCommented.replace(/-\d{4}$/, '')
        if (!SUB_KEY_PATTERN.test(key)) return
        const embedded = row.dddpData && typeof row.dddpData === 'object' ? row.dddpData : {}
        const review = reviews.get(key) || {}
        ;['technicalTeamScore', 'qualityAssuranceScore', 'petitionCommitteeScore'].forEach((field) => {
            const value = isEntered(row[field]) ? row[field] : embedded[field]
            if (isEntered(value)) review[field] = value
        })
        reviews.set(key, review)
    })
    return reviews
}

const computeSubIndicatorFinals = ({ comments, snapshotTables, catalogue = new Map() }) => {
    const reviews = collectSubIndicatorReviews(comments)
    const tables = snapshotTables && typeof snapshotTables === 'object' ? snapshotTables : {}

    return SUB_INDICATORS.map((indicator) => {
        const review = reviews.get(indicator.key) || {}
        const cascade = [review.petitionCommitteeScore, review.qualityAssuranceScore, review.technicalTeamScore]
        const definition = catalogue.get(indicator.key)
        const table = tables[indicator.tableKey]
        const catalogueMax = num(definition?.maxScore)
        const snapshotMax = num(table?.maxScore)
        const base = {
            key: indicator.key,
            code: indicator.code,
            groupCode: indicator.groupCode,
            category: indicator.category,
            name: definition?.name || humanizeTableKey(indicator.tableKey),
        }

        if (indicator.category === 'CI') {
            const status = cascade.map(parseFulfilled).find((value) => value !== null)
            return { ...base, fulfilled: status === undefined ? null : status }
        }

        const reviewed = cascade.map(num).find((value) => value !== null)
        return {
            ...base,
            finalScore: reviewed !== undefined ? reviewed : systemTableScore(table),
            maxScore: catalogueMax > 0 ? catalogueMax : snapshotMax,
        }
    })
}

const groupSubIndicators = (subFinals) => subFinals.reduce((groups, item) => {
    if (!groups.has(item.groupCode)) groups.set(item.groupCode, [])
    groups.get(item.groupCode).push(item)
    return groups
}, new Map())

const reconcilesScored = (subs, mainFinal) => subs.length > 0
    && subs.every((item) => Number.isFinite(item.finalScore))
    && Math.abs(subs.reduce((total, item) => total + item.finalScore, 0) - mainFinal) < 0.001

const reconcilesCompliance = (subs, mainFulfilled) => {
    const known = subs.filter((item) => item.fulfilled !== null)
    if (known.length === 0) return false
    if (mainFulfilled) return known.every((item) => item.fulfilled)
    return known.length < subs.length || known.some((item) => !item.fulfilled)
}

const publicScoredSub = (item) => ({ code: item.code, name: item.name, finalScore: item.finalScore, maxScore: item.maxScore })
const publicComplianceSub = (item) => ({ code: item.code, name: item.name, fulfilled: item.fulfilled })

const TITLE_SMALL_WORDS = new Set(['and', 'of', 'to', 'the', 'for', 'in', 'on', 'at', 'by'])

const tidyAreaName = (value) => {
    let text = String(value || '').replace(/\s*\(\d+(\.\d+)?\)\s*$/, '').trim()
    if (text && text === text.toUpperCase()) {
        text = text
            .toLowerCase()
            .replace(/[a-z]+/g, (word, offset) => (offset > 0 && TITLE_SMALL_WORDS.has(word) ? word : word[0].toUpperCase() + word.slice(1)))
            .replace(/\bLed\b/g, 'LED')
    }
    return text
}

const buildCatalogueIndex = (rows) => {
    const indicators = new Map()
    const areas = new Map()
    ;(Array.isArray(rows) ? rows : [])
        .filter((row) => row && row.code && String(row.status || 'ACTIVE').toUpperCase() !== 'INACTIVE')
        .forEach((row) => {
            const key = normalizeCatalogueCode(row.code)
            const match = key.match(SUB_KEY_PATTERN)
            if (!match) return
            indicators.set(key, {
                name: typeof row.indicatorName === 'string' ? row.indicatorName.trim() : null,
                scoringCriteria: typeof row.scoringCriteria === 'string' ? row.scoringCriteria.trim() : null,
                maxScore: num(row.maxScore),
            })
            const groupCode = `${CATEGORY_BY_PREFIX[match[1]]} ${Number(match[2])}`
            const areaName = tidyAreaName(row.thematicAreas)
            if (areaName && !areas.has(groupCode)) areas.set(groupCode, areaName)
        })
    return { indicators, areas }
}

const EMPTY_CATALOGUE = { indicators: new Map(), areas: new Map() }

const parseDpatYear = (value, currentYear = new Date().getFullYear()) => {
    const year = Number(value)
    if (!/^\d{4}$/.test(String(value || '')) || year < MIN_DPAT_YEAR || year > currentYear + 1) {
        throw new DpatPublicError('A valid assessment year is required.', 400)
    }
    return year
}

const parseDistrictId = (value) => {
    if (!DISTRICT_ID_PATTERN.test(String(value || '')) || TEST_DISTRICT_IDS.has(value)) {
        throw new DpatPublicError('District not found.', 404)
    }
    return value
}

const createDpatPublicService = ({
    cms: cmsConfig,
    dhis2: dhis2Config,
    httpClient = axios,
    classificationScale = 'official',
    publishedYears = null,
    maxConcurrent = 20,
    now = Date.now,
    currentYear = () => new Date().getFullYear(),
    ttl = {},
}) => {
    const limit = createLimiter(maxConcurrent)
    const cms = createReadOnlyClient({
        name: 'DPAT CMS',
        ...cmsConfig,
        allowedPaths: CMS_READ_PATHS,
        limit,
        timeout: 60000,
        httpClient,
    })
    const dhis2 = createReadOnlyClient({
        name: 'DHIS2',
        ...dhis2Config,
        allowedPaths: DHIS2_READ_PATHS,
        limit,
        timeout: 30000,
        httpClient,
    })
    const classifier = createClassifier(classificationScale)

    const ttlMs = {
        geography: 24 * 60 * 60 * 1000,
        years: 6 * 60 * 60 * 1000,
        catalogue: 24 * 60 * 60 * 1000,
        scores: 30 * 60 * 1000,
        ...ttl,
    }
    const geographyCache = createCache({ ttlMs: ttlMs.geography, now })
    const yearsCache = createCache({ ttlMs: ttlMs.years, now })
    const catalogueCache = createCache({ ttlMs: ttlMs.catalogue, now })
    const statusCache = createCache({ ttlMs: ttlMs.scores, now })
    const summaryCache = createCache({ ttlMs: ttlMs.scores, maxEntries: 2000, now })
    const yearModelCache = createCache({ ttlMs: ttlMs.scores, now })
    const detailCache = createCache({ ttlMs: ttlMs.scores, maxEntries: 600, now })

    const loadGeography = () => geographyCache('geography', async () => {
        const data = await dhis2('organisationUnits', {
            level: 3,
            paging: false,
            fields: 'id,displayName,parent[id,displayName]',
        })
        const districts = (data?.organisationUnits || [])
            .filter((unit) => unit?.id && unit.displayName && unit.parent?.id && !TEST_DISTRICT_IDS.has(unit.id))
            .map((unit) => ({
                districtId: unit.id,
                districtName: unit.displayName.trim(),
                regionId: unit.parent.id,
                regionName: cleanRegionName(unit.parent.displayName || ''),
            }))
            .sort((a, b) => a.districtName.localeCompare(b.districtName))
        if (districts.length === 0) throw new Error('DHIS2 returned no districts')

        const regions = [...districts.reduce((result, district) => {
            const region = result.get(district.regionId) || { regionId: district.regionId, regionName: district.regionName, districtCount: 0 }
            region.districtCount += 1
            result.set(district.regionId, region)
            return result
        }, new Map()).values()].sort((a, b) => a.regionName.localeCompare(b.regionName))

        return {
            districts,
            regions,
            byId: new Map(districts.map((district) => [district.districtId, district])),
            retrievedAt: new Date(now()).toISOString(),
        }
    })

    const loadStatuses = (year) => statusCache(`status|${year}`, async () => {
        const rows = await cms(`assessments/districts/dpat/${year}/DPAT`)
        const statuses = new Map()
        ;(Array.isArray(rows) ? rows : []).forEach((row) => {
            if (!row?.districtId || TEST_DISTRICT_IDS.has(row.districtId)) return
            const status = normalizeStatus(row.status)
            const previous = statuses.get(row.districtId)
            if (!previous || STATUS_ORDER.indexOf(status) > STATUS_ORDER.indexOf(previous)) statuses.set(row.districtId, status)
        })
        return statuses
    })

    const loadSummary = (districtId, year) => summaryCache(`summary|${year}|${districtId}`, async () => {
        const summary = await cms(`comments/summary/${districtId}/${year}/DPAT`)
        if (!summary || typeof summary !== 'object' || !Array.isArray(summary.serviceDeliveryIndicators)) {
            throw new Error('DPAT summary response was not recognised')
        }
        return summary
    })

    const loadCatalogue = (year) => catalogueCache(`catalogue|${year}`, async () => {
        for (const candidate of [year, year + 1, year - 1]) {
            try {
                const rows = await cms(`dpat-indicator/year/${candidate}`)
                if (Array.isArray(rows) && rows.length > 0) return buildCatalogueIndex(rows)
            } catch (error) {
                if (candidate === year - 1) throw error
            }
        }
        return EMPTY_CATALOGUE
    })

    const areaNameFor = (catalogue, code, fallback) => catalogue.areas.get(code)
        || (typeof fallback === 'string' && fallback.trim())
        || MAIN_INDICATORS.find((indicator) => indicator.code === code)?.thematicArea
        || ''

    const loadYears = () => yearsCache('years', async () => {
        const geography = await loadGeography()
        const candidates = []
        for (let year = MIN_DPAT_YEAR; year <= currentYear(); year += 1) {
            if (!publishedYears || publishedYears.includes(year)) candidates.push(year)
        }
        const results = await Promise.all(candidates.map(async (year) => {
            try {
                const statuses = await loadStatuses(year)
                const published = geography.districts.filter((district) => isPublished(statuses.get(district.districtId))).length
                return published > 0 ? year : null
            } catch (error) {
                return null
            }
        }))
        const years = results.filter(Boolean).sort((a, b) => a - b)
        if (years.length === 0) throw new Error('No published DPAT years were found')
        return years
    })

    const loadYearModel = (year) => yearModelCache(`year|${year}`, async () => {
        const [geography, statuses] = await Promise.all([loadGeography(), loadStatuses(year)])
        let failed = 0
        const entries = await Promise.all(geography.districts.map(async (district) => {
            const status = statuses.get(district.districtId) || 'Not started'
            if (!isPublished(status)) return { ...district, status, summary: null, final: null }
            try {
                const summary = await loadSummary(district.districtId, year)
                const final = computeDistrictFinal(summary)
                return { ...district, status, summary, final: final.grandMax > 0 ? final : null }
            } catch (error) {
                failed += 1
                return { ...district, status, summary: null, final: null }
            }
        }))

        const publishedCount = entries.filter((entry) => isPublished(entry.status)).length
        if (publishedCount > 0 && failed / publishedCount > MAX_FAILED_SUMMARY_SHARE) {
            throw new Error(`Too many DPAT summaries failed for ${year}`)
        }

        const scored = entries.filter((entry) => entry.final)
        const byPercent = (entry) => entry.final.overallPercent
        const byName = (entry) => entry.districtName
        const nationalRanks = competitionRanks(scored, byPercent, byName)
        const regionalRanks = new Map()
        geography.regions.forEach((region) => {
            const inRegion = scored.filter((entry) => entry.regionId === region.regionId)
            competitionRanks(inRegion, byPercent, byName).forEach((rank, entry) => regionalRanks.set(entry, rank))
        })
        entries.forEach((entry) => {
            entry.nationalRank = nationalRanks.get(entry) || null
            entry.regionalRank = regionalRanks.get(entry) || null
        })

        const regionSummaries = geography.regions.map((region) => {
            const inRegion = scored.filter((entry) => entry.regionId === region.regionId)
            const average = mean(inRegion.map(byPercent))
            return {
                regionId: region.regionId,
                regionName: region.regionName,
                averagePercent: average === null ? null : round1(average),
                assessedCount: inRegion.length,
                districtCount: region.districtCount,
            }
        })
        const rankedRegions = regionSummaries.filter((region) => region.averagePercent !== null)
        const regionRanks = competitionRanks(rankedRegions, (region) => region.averagePercent, (region) => region.regionName)
        regionSummaries.forEach((region) => { region.rank = regionRanks.get(region) || null })

        return {
            year,
            entries,
            scored,
            regions: regionSummaries,
            byId: new Map(entries.map((entry) => [entry.districtId, entry])),
            totalDistricts: geography.districts.length,
            updatedAt: new Date(now()).toISOString(),
        }
    })

    const assertPublishedYear = async (year) => {
        const years = await loadYears()
        if (!years.includes(year)) throw new DpatPublicError('No published DPAT results for that year.', 404)
    }

    const publicListDistrict = (entry) => {
        const released = Boolean(entry.final)
        const final = entry.final || {}
        return {
            districtId: entry.districtId,
            districtName: entry.districtName,
            regionId: entry.regionId,
            regionName: entry.regionName,
            status: entry.status,
            finalScore: released ? final.grandFinal : null,
            maxScore: released ? final.grandMax : null,
            finalPercent: released ? final.overallPercent : null,
            classification: released ? classifier.classify(final.overallPercent) : null,
            sdiFinal: released ? final.sdiFinal : null,
            sdiMax: released ? final.sdiMax : null,
            piFinal: released ? final.piFinal : null,
            piMax: released ? final.piMax : null,
            ciFulfilled: released ? final.ciFulfilled : null,
            ciTotal: released ? CI_TOTAL : null,
            nationalRank: released ? entry.nationalRank : null,
            regionalRank: released ? entry.regionalRank : null,
        }
    }

    const getYears = async () => {
        const years = await loadYears()
        return {
            years,
            latestYear: years[years.length - 1],
            classificationScale: classifier.bands.map((band) => ({ label: band.label, min: band.min })),
        }
    }

    const getRegions = async () => (await loadGeography()).regions.map((region) => ({
        regionId: region.regionId,
        regionName: region.regionName,
        districtCount: region.districtCount,
    }))

    const getDistricts = async () => (await loadGeography()).districts.map((district) => ({
        districtId: district.districtId,
        districtName: district.districtName,
        regionId: district.regionId,
        regionName: district.regionName,
    }))

    const getYearScores = async (yearInput) => {
        const year = parseDpatYear(yearInput, currentYear())
        await assertPublishedYear(year)
        const model = await loadYearModel(year)
        const percents = model.scored.map((entry) => entry.final.overallPercent)
        const average = mean(percents)
        const ordered = [...model.entries].sort((a, b) => {
            if (a.nationalRank && b.nationalRank) return (a.nationalRank - b.nationalRank) || a.districtName.localeCompare(b.districtName)
            if (a.nationalRank) return -1
            if (b.nationalRank) return 1
            return a.districtName.localeCompare(b.districtName)
        })
        return {
            year,
            nationalAverage: average === null ? null : round1(average),
            assessedCount: model.scored.length,
            totalDistricts: model.totalDistricts,
            updatedAt: model.updatedAt,
            districts: ordered.map(publicListDistrict),
        }
    }

    const getRegionScores = async (yearInput) => {
        const year = parseDpatYear(yearInput, currentYear())
        await assertPublishedYear(year)
        const model = await loadYearModel(year)
        return [...model.regions]
            .sort((a, b) => ((a.rank || Infinity) - (b.rank || Infinity)) || a.regionName.localeCompare(b.regionName))
            .map((region) => ({
                regionId: region.regionId,
                regionName: region.regionName,
                averagePercent: region.averagePercent,
                classification: classifier.classify(region.averagePercent),
                assessedCount: region.assessedCount,
                districtCount: region.districtCount,
                rank: region.rank,
            }))
    }

    const getThematicAreaScores = async (yearInput) => {
        const year = parseDpatYear(yearInput, currentYear())
        await assertPublishedYear(year)
        const [model, catalogue] = await Promise.all([loadYearModel(year), loadCatalogue(year).catch(() => EMPTY_CATALOGUE)])
        const areaStats = new Map(MAIN_INDICATORS.map((indicator) => [indicator.code, { ...indicator, scores: [], maxes: [], fulfilled: 0, counted: 0 }]))

        model.scored.forEach((entry) => {
            mainRows(entry.summary.complianceIndicators).forEach((row) => {
                const stats = areaStats.get(normalizeMainCode(row.no))
                if (!stats || stats.category !== 'CI') return
                stats.counted += 1
                if (finalCiFulfilled(row)) stats.fulfilled += 1
            })
            ;[...mainRows(entry.summary.serviceDeliveryIndicators), ...mainRows(entry.summary.performanceIndicators)].forEach((row) => {
                const stats = areaStats.get(normalizeMainCode(row.no))
                if (!stats || stats.category === 'CI') return
                stats.scores.push(finalRowScore(row))
                stats.maxes.push(num(row.maxScore) || stats.maxScore || 0)
            })
        })

        const scoredArea = (stats) => {
            const averageScore = mean(stats.scores)
            const maxScore = mean(stats.maxes) ?? stats.maxScore
            return {
                code: stats.code,
                thematicArea: areaNameFor(catalogue, stats.code),
                maxScore: maxScore === null ? null : round1(maxScore),
                averageScore: averageScore === null ? null : round1(averageScore),
                averagePercent: averageScore === null || !maxScore ? null : round1((averageScore / maxScore) * 100),
            }
        }
        const areas = [...areaStats.values()]
        const ciDistribution = Array.from({ length: CI_TOTAL + 1 }, (_, fulfilled) => ({
            fulfilled,
            count: model.scored.filter((entry) => entry.final.ciFulfilled === fulfilled).length,
        }))

        return {
            year,
            assessedCount: model.scored.length,
            compliance: areas.filter((stats) => stats.category === 'CI').map((stats) => ({
                code: stats.code,
                thematicArea: areaNameFor(catalogue, stats.code),
                fulfilledCount: stats.fulfilled,
                fulfilledPercent: stats.counted ? round1((stats.fulfilled / stats.counted) * 100) : null,
            })),
            serviceDelivery: areas.filter((stats) => stats.category === 'SDI').map(scoredArea),
            performance: areas.filter((stats) => stats.category === 'PI').map(scoredArea),
            ciDistribution,
        }
    }

    const buildDistrictDetail = async (year, entry) => {
        const [comments, snapshot, catalogue] = await Promise.all([
            cms(`comments/tables/${entry.districtId}/${year}/DPAT`).catch(() => null),
            cms(`comments/table/${entry.districtId}/${year}/DPAT/assessment_start_DAPT`).catch(() => null),
            loadCatalogue(year).catch(() => EMPTY_CATALOGUE),
        ])
        const snapshotTables = Array.isArray(snapshot) ? snapshot[0]?.dddpData?.tables : null
        const subGroups = comments && snapshotTables
            ? groupSubIndicators(computeSubIndicatorFinals({ comments, snapshotTables, catalogue: catalogue.indicators }))
            : new Map()
        const areaName = (row) => areaNameFor(catalogue, normalizeMainCode(row.no), row.thematicArea)

        const scoredRows = (rows) => mainRows(rows).map((row) => {
            const code = normalizeMainCode(row.no) || String(row.no)
            const finalScore = finalRowScore(row)
            const subs = subGroups.get(code) || []
            return {
                code,
                thematicArea: areaName(row),
                finalScore,
                maxScore: num(row.maxScore),
                subIndicators: reconcilesScored(subs, finalScore) ? subs.map(publicScoredSub) : [],
            }
        })
        const final = entry.final

        return {
            districtId: entry.districtId,
            districtName: entry.districtName,
            regionId: entry.regionId,
            regionName: entry.regionName,
            year,
            status: entry.status,
            finalScore: final.grandFinal,
            maxScore: final.grandMax,
            finalPercent: final.overallPercent,
            classification: classifier.classify(final.overallPercent),
            nationalRank: entry.nationalRank,
            regionalRank: entry.regionalRank,
            compliance: mainRows(entry.summary.complianceIndicators).map((row) => {
                const code = normalizeMainCode(row.no) || String(row.no)
                const fulfilled = finalCiFulfilled(row)
                const subs = subGroups.get(code) || []
                return {
                    code,
                    thematicArea: areaName(row),
                    fulfilled,
                    subIndicators: reconcilesCompliance(subs, fulfilled) ? subs.map(publicComplianceSub) : [],
                }
            }),
            serviceDelivery: scoredRows(entry.summary.serviceDeliveryIndicators),
            performance: scoredRows(entry.summary.performanceIndicators),
            totals: {
                sdiFinal: final.sdiFinal,
                sdiMax: final.sdiMax,
                piFinal: final.piFinal,
                piMax: final.piMax,
                grandFinal: final.grandFinal,
                grandMax: final.grandMax,
                ciFulfilled: final.ciFulfilled,
                ciTotal: CI_TOTAL,
            },
        }
    }

    const getDistrictScores = async (yearInput, districtIdInput) => {
        const year = parseDpatYear(yearInput, currentYear())
        const districtId = parseDistrictId(districtIdInput)
        await assertPublishedYear(year)
        const model = await loadYearModel(year)
        const entry = model.byId.get(districtId)
        if (!entry) throw new DpatPublicError('District not found.', 404)
        if (!entry.final) {
            return {
                districtId: entry.districtId,
                districtName: entry.districtName,
                regionId: entry.regionId,
                regionName: entry.regionName,
                year,
                status: entry.status,
            }
        }
        return detailCache(`detail|${year}|${districtId}|${model.updatedAt}`, () => buildDistrictDetail(year, entry))
    }

    const getIndicators = async (yearInput) => {
        const year = parseDpatYear(yearInput, currentYear())
        const catalogue = await loadCatalogue(year).catch(() => EMPTY_CATALOGUE)
        return {
            year,
            groups: MAIN_INDICATORS.map((indicator) => ({
                code: indicator.code,
                category: indicator.category,
                thematicArea: areaNameFor(catalogue, indicator.code),
                maxScore: indicator.maxScore,
                subIndicators: SUB_INDICATORS
                    .filter((sub) => sub.groupCode === indicator.code)
                    .map((sub) => {
                        const definition = catalogue.indicators.get(sub.key)
                        return {
                            code: sub.code,
                            name: definition?.name || humanizeTableKey(sub.tableKey),
                            scoringCriteria: definition?.scoringCriteria || null,
                            maxScore: definition?.maxScore > 0 ? definition.maxScore : null,
                        }
                    }),
            })),
        }
    }

    const warm = async () => {
        const years = await loadYears()
        await loadYearModel(years[years.length - 1])
    }

    return {
        getYears,
        getRegions,
        getDistricts,
        getYearScores,
        getRegionScores,
        getThematicAreaScores,
        getDistrictScores,
        getIndicators,
        warm,
    }
}

module.exports = {
    CMS_READ_PATHS,
    DpatPublicError,
    MAIN_INDICATORS,
    SUB_INDICATORS,
    competitionRanks,
    computeDistrictFinal,
    computeSubIndicatorFinals,
    createCache,
    createClassifier,
    createDpatPublicService,
    createLimiter,
    finalCiFulfilled,
    finalRowScore,
    isEntered,
    normalizeStatus,
    parseDistrictId,
    parseDpatYear,
    reconcilesCompliance,
    reconcilesScored,
}
