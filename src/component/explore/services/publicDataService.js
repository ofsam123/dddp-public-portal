import { GHANA, districts as localDistricts, regions as localRegions } from '../data/geography'

export const PUBLIC_KPI_YEAR = new Date().getFullYear()
const PUBLIC_DATA_CACHE_TTL_MS = 5 * 60 * 1000
const publicDataCache = new Map()

const loadCached = (key, loader) => {
    const cached = publicDataCache.get(key)
    if (cached?.value && Date.now() - cached.createdAt < PUBLIC_DATA_CACHE_TTL_MS) {
        return Promise.resolve(cached.value)
    }
    if (cached?.pending) return cached.pending

    const pending = loader()
        .then((value) => {
            if (value && value !== localGeography) {
                publicDataCache.set(key, { value, createdAt: Date.now() })
            } else {
                publicDataCache.delete(key)
            }
            return value
        })
        .catch((error) => {
            publicDataCache.delete(key)
            throw error
        })
    publicDataCache.set(key, { pending })
    return pending
}

export const clearPublicDataCacheForTests = () => publicDataCache.clear()

const unavailableKpis = [
    {
        id: 'projects',
        label: 'Projects',
        status: 'unavailable',
        context: 'Live aggregate unavailable',
    },
    {
        id: 'programmes',
        label: 'Programmes',
        status: 'unavailable',
        context: 'Live aggregate unavailable',
    },
    {
        id: 'meetings',
        label: 'Meetings',
        status: 'unavailable',
        context: 'Live aggregate unavailable',
    },
]

const localGeography = {
    regions: localRegions.map((region) => ({ ...region, districtCount: null })),
    districts: localDistricts,
    meta: {
        source: 'local',
        connected: false,
        regionCount: null,
        districtCount: null,
        retrievedAt: null,
    },
}

const isValidBridgePayload = (payload) => (
    payload
    && Array.isArray(payload.regions)
    && Array.isArray(payload.districts)
    && payload.meta?.source === 'DDDP'
)

const mergeBridgeGeography = (payload) => {
    const bridgeRegionsBySlug = new Map(payload.regions.map((region) => [region.slug, region]))
    const knownRegionSlugs = new Set(localRegions.map((region) => region.slug))
    const connectedRegionSlugs = new Set()

    const regions = localRegions.map((region) => {
        const bridgeRegion = bridgeRegionsBySlug.get(region.slug)
        if (!bridgeRegion || bridgeRegion.name !== region.name || !Number.isInteger(bridgeRegion.districtCount)) {
            return { ...region, districtCount: null }
        }
        connectedRegionSlugs.add(region.slug)
        return { ...region, districtCount: bridgeRegion.districtCount }
    })

    const bridgeDistricts = payload.districts
        .filter((district) => (
            district
            && knownRegionSlugs.has(district.regionSlug)
            && connectedRegionSlugs.has(district.regionSlug)
            && typeof district.name === 'string'
            && typeof district.slug === 'string'
        ))
        .map((district) => ({
            id: district.id || `district-${district.regionSlug}-${district.slug}`,
            name: district.name,
            slug: district.slug,
            level: 'district',
            parentId: `region-${district.regionSlug}`,
        }))

    const fallbackDistricts = localDistricts.filter((district) => {
        const regionSlug = district.parentId.replace(/^region-/, '')
        return !connectedRegionSlugs.has(regionSlug)
    })

    return {
        regions,
        districts: [...bridgeDistricts, ...fallbackDistricts],
        meta: {
            source: 'DDDP',
            connected: true,
            regionCount: Number.isInteger(payload.meta.regionCount) ? payload.meta.regionCount : null,
            districtCount: Number.isInteger(payload.meta.districtCount) ? payload.meta.districtCount : null,
            retrievedAt: payload.meta.retrievedAt || null,
        },
    }
}

export const getLocalPublicGeography = () => localGeography

export const fetchPublicGeography = async ({ signal } = {}) => {
    try {
        const response = await fetch('/api/public/geography', {
            method: 'GET',
            headers: { Accept: 'application/json' },
            signal,
        })
        if (!response.ok) throw new Error('Public geography endpoint unavailable')

        const payload = await response.json()
        if (!isValidBridgePayload(payload)) throw new Error('Invalid public geography response')
        return mergeBridgeGeography(payload)
    } catch (error) {
        if (error.name === 'AbortError') throw error
        return localGeography
    }
}

export const loadPublicGeography = () => loadCached('geography', () => fetchPublicGeography())

const isValidAvailableYearsPayload = (payload) => (
    payload
    && payload.source === 'DDDP'
    && Array.isArray(payload.years)
    && payload.years.length > 0
    && payload.years.every((year) => Number.isInteger(year))
    && payload.years.every((year, index) => index === 0 || year > payload.years[index - 1])
    && payload.latestYear === payload.years[payload.years.length - 1]
)

export const fetchPublicAvailableYears = async ({ signal } = {}) => {
    try {
        const response = await fetch('/api/public/available-years', {
            method: 'GET',
            headers: { Accept: 'application/json' },
            signal,
        })
        if (!response.ok) return null

        const payload = await response.json()
        return isValidAvailableYearsPayload(payload) ? payload : null
    } catch (error) {
        if (error.name === 'AbortError') throw error
        return null
    }
}

export const loadPublicAvailableYears = () => (
    loadCached('available-years', () => fetchPublicAvailableYears())
)

const isValidSummaryPayload = (payload, year) => (
    payload
    && payload.meta?.source === 'DDDP'
    && payload.period?.year === year
    && payload.geography
    && payload.kpis
    && ['projects', 'programmes', 'projectsProgrammesTotal', 'meetings']
        .every((key) => Number.isInteger(payload.kpis[key]) && payload.kpis[key] >= 0)
    && payload.kpis.projectsProgrammesTotal === payload.kpis.projects + payload.kpis.programmes
)

export const fetchPublicSummary = async ({ geography, regionSlug, year = PUBLIC_KPI_YEAR, signal } = {}) => {
    if (!geography) return null

    const params = new URLSearchParams({ year: String(year) })
    if (geography.level === 'region') params.set('regionSlug', geography.slug)
    if (geography.level === 'district') {
        params.set('regionSlug', regionSlug)
        params.set('districtSlug', geography.slug)
    }

    try {
        const response = await fetch(`/api/public/summary?${params.toString()}`, {
            method: 'GET',
            headers: { Accept: 'application/json' },
            signal,
        })
        if (!response.ok) return null

        const payload = await response.json()
        return isValidSummaryPayload(payload, year) ? payload : null
    } catch (error) {
        if (error.name === 'AbortError') throw error
        return null
    }
}

export const loadPublicSummary = ({ geography, regionSlug, year = PUBLIC_KPI_YEAR } = {}) => {
    if (!geography) return Promise.resolve(null)
    const key = `summary|${year}|${geography.level}|${regionSlug || ''}|${geography.slug}`
    return loadCached(key, () => fetchPublicSummary({ geography, regionSlug, year }))
}

const isValidRegionalSummariesPayload = (payload, year) => (
    payload
    && payload.meta?.source === 'DDDP'
    && payload.period?.year === year
    && payload.national?.slug === 'ghana'
    && ['projects', 'programmes', 'projectsProgrammesTotal', 'meetings']
        .every((key) => Number.isInteger(payload.national.kpis?.[key]) && payload.national.kpis[key] >= 0)
    && payload.national.kpis.projectsProgrammesTotal === payload.national.kpis.projects + payload.national.kpis.programmes
    && Array.isArray(payload.regions)
    && payload.regions.every((region) => (
        typeof region?.slug === 'string'
        && typeof region?.name === 'string'
        && ['projects', 'programmes', 'projectsProgrammesTotal', 'meetings']
            .every((key) => Number.isInteger(region.kpis?.[key]) && region.kpis[key] >= 0)
        && region.kpis.projectsProgrammesTotal === region.kpis.projects + region.kpis.programmes
    ))
)

export const fetchPublicRegionalSummaries = async ({ year = PUBLIC_KPI_YEAR, signal } = {}) => {
    try {
        const params = new URLSearchParams({ year: String(year) })
        const response = await fetch(`/api/public/regional-summaries?${params.toString()}`, {
            method: 'GET',
            headers: { Accept: 'application/json' },
            signal,
        })
        if (!response.ok) return null

        const payload = await response.json()
        return isValidRegionalSummariesPayload(payload, year) ? payload : null
    } catch (error) {
        if (error.name === 'AbortError') throw error
        return null
    }
}

export const loadPublicRegionalSummaries = ({ year = PUBLIC_KPI_YEAR } = {}) => (
    loadCached(`regional-summaries|${year}`, () => fetchPublicRegionalSummaries({ year }))
)

const isValidDistribution = (distribution) => (
    distribution
    && Number.isInteger(distribution.total)
    && distribution.total >= 0
    && Number.isInteger(distribution.classified)
    && distribution.classified >= 0
    && Number.isInteger(distribution.unclassified)
    && distribution.unclassified >= 0
    && distribution.classified + distribution.unclassified === distribution.total
    && distribution.shareDenominator === 'allEligible'
    && Array.isArray(distribution.categories)
    && distribution.categories.length > 0
    && distribution.categories.every((category) => (
        typeof category?.label === 'string'
        && category.label.length > 0
        && Number.isInteger(category.count)
        && category.count >= 0
        && Number.isFinite(category.share)
        && category.share >= 0
        && category.share <= 100
    ))
    && distribution.categories.reduce((sum, category) => sum + category.count, 0) === distribution.classified
)

const isValidProjectDistribution = (distribution, expectedDenominator) => (
    distribution
    && Number.isInteger(distribution.eligibleTotal)
    && distribution.eligibleTotal >= 0
    && Number.isInteger(distribution.classifiedTotal)
    && distribution.classifiedTotal >= 0
    && Number.isInteger(distribution.unclassifiedTotal)
    && distribution.unclassifiedTotal >= 0
    && distribution.classifiedTotal + distribution.unclassifiedTotal === distribution.eligibleTotal
    && distribution.shareDenominator === expectedDenominator
    && Array.isArray(distribution.categories)
    && distribution.categories.length > 0
    && distribution.categories.every((category) => (
        typeof category?.label === 'string'
        && category.label.length > 0
        && Number.isInteger(category.count)
        && category.count >= 0
        && Number.isFinite(category.share)
        && category.share >= 0
        && category.share <= 100
    ))
    && distribution.categories.reduce((sum, category) => sum + category.count, 0)
        === distribution.classifiedTotal
)

const isValidPlannedProjectActivity = (activity) => (
    activity
    && Number.isInteger(activity.expectedStarts)
    && activity.expectedStarts >= 0
    && Number.isInteger(activity.expectedCompletions)
    && activity.expectedCompletions >= 0
)

const isValidNationalBreakdownsPayload = (payload, year) => (
    payload
    && payload.meta?.source === 'DDDP'
    && payload.period?.year === year
    && isValidDistribution(payload.developmentDimensions)
    && isValidDistribution(payload.meetingTypes)
    && isValidProjectDistribution(payload.projectSectors, 'classifiedProjects')
    && isValidProjectDistribution(payload.primaryFundingSources, 'eligibleProjects')
    && isValidPlannedProjectActivity(payload.plannedProjectActivity)
)

export const fetchPublicNationalBreakdowns = async ({ year = PUBLIC_KPI_YEAR, signal } = {}) => {
    try {
        const params = new URLSearchParams({ year: String(year) })
        const response = await fetch(`/api/public/national-breakdowns?${params.toString()}`, {
            method: 'GET',
            headers: { Accept: 'application/json' },
            signal,
        })
        if (!response.ok) return null

        const payload = await response.json()
        return isValidNationalBreakdownsPayload(payload, year) ? payload : null
    } catch (error) {
        if (error.name === 'AbortError') throw error
        return null
    }
}

export const loadPublicNationalBreakdowns = ({ year = PUBLIC_KPI_YEAR } = {}) => (
    loadCached(`national-breakdowns|${year}`, () => fetchPublicNationalBreakdowns({ year }))
)

export const getNationalGeography = () => GHANA

export const getRegions = (geographyData = localGeography) => geographyData.regions

export const getRegionBySlug = (regionSlug, geographyData = localGeography) => (
    geographyData.regions.find((region) => region.slug === regionSlug) || null
)

export const getDistricts = (regionId, geographyData = localGeography) => (
    geographyData.districts.filter((district) => district.parentId === regionId)
)

export const getDistrictBySlug = (regionId, districtSlug, geographyData = localGeography) => (
    geographyData.districts.find((district) => district.parentId === regionId && district.slug === districtSlug) || null
)

const getTrackerKpis = (summaryData) => {
    return [
        { id: 'projects', label: 'Projects', value: summaryData.kpis.projects, status: 'available' },
        { id: 'programmes', label: 'Programmes', value: summaryData.kpis.programmes, status: 'available' },
        { id: 'meetings', label: 'Meetings', value: summaryData.kpis.meetings, status: 'available' },
    ]
}

export const getPublicSummary = (geography, summaryData = null) => ({
    geography,
    kpis: summaryData ? getTrackerKpis(summaryData) : unavailableKpis,
    kpiContext: summaryData
        ? {
            geography: summaryData.geography.name,
            year: summaryData.period.year,
            source: summaryData.meta.source,
            retrievedAt: summaryData.meta.retrievedAt,
        }
        : null,
})
