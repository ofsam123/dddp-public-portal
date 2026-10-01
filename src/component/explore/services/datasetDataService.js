const CACHE_TTL_MS = 5 * 60 * 1000
const cache = new Map()

const loadCached = (key, loader) => {
    const cached = cache.get(key)
    if (cached?.value && Date.now() - cached.createdAt < CACHE_TTL_MS) return Promise.resolve(cached.value)
    if (cached?.pending) return cached.pending
    const pending = loader().then((value) => {
        cache.set(key, { value, createdAt: Date.now() })
        return value
    }).catch((error) => { cache.delete(key); throw error })
    cache.set(key, { pending })
    return pending
}

const isDistribution = (value) => value && Number.isInteger(value.total) && Number.isInteger(value.classified) && Number.isInteger(value.unclassified) && value.classified + value.unclassified === value.total && Array.isArray(value.categories)
const isAapPayload = (value, year) => value?.meta?.source === 'DDDP' && value?.period?.year === year && Number.isInteger(value?.metrics?.recordedActivities) && ['activityTypes', 'activityStates', 'sectors', 'developmentDimensions', 'approval'].every((key) => isDistribution(value?.distributions?.[key]))

const scopeParams = ({ geography, regionSlug, year }) => {
    const params = new URLSearchParams({ year: String(year) })
    if (geography.level === 'region') params.set('regionSlug', geography.slug)
    if (geography.level === 'district') { params.set('regionSlug', regionSlug); params.set('districtSlug', geography.slug) }
    return params
}

const loadJson = async (url, isValid) => {
    const response = await fetch(url, { headers: { Accept: 'application/json' } })
    if (!response.ok) return null
    const payload = await response.json()
    return isValid(payload) ? payload : null
}

const isScopedPayload = (value, year) => value?.meta?.source === 'DDDP' && value?.period?.year === year && value?.metrics && Array.isArray(value?.children)
const isDeliveryMetrics = (metrics) => ['projects', 'programmes', 'meetings', 'aapActivities', 'completedProjects'].every((key) => Number.isInteger(metrics?.[key]))
    && Number.isFinite(metrics?.igf?.collected) && Number.isFinite(metrics?.igf?.released) && Array.isArray(metrics?.sectors)

export const loadDeliverySummary = ({ geography, regionSlug, year }) => {
    if (!geography || !Number.isInteger(year)) return Promise.resolve(null)
    const params = scopeParams({ geography, regionSlug, year })
    return loadCached(`delivery|${params.toString()}`, () => loadJson(
        `/api/public/delivery?${params.toString()}`,
        (payload) => isScopedPayload(payload, year) && isDeliveryMetrics(payload.metrics) && payload.children.every((child) => isDeliveryMetrics(child.metrics)),
    ))
}

export const loadDeliverySeries = ({ from, to }) => {
    if (!Number.isInteger(from) || !Number.isInteger(to)) return Promise.resolve(null)
    const params = new URLSearchParams({ from: String(from), to: String(to) })
    return loadCached(`delivery-series|${params.toString()}`, () => loadJson(
        `/api/public/delivery-series?${params.toString()}`,
        (payload) => payload?.meta?.source === 'DDDP' && Array.isArray(payload?.series)
            && payload.series.every((row) => Number.isInteger(row.year) && Number.isInteger(row.aapActivities) && Number.isFinite(row.igfCollected) && Number.isFinite(row.igfReleased)),
    ))
}

export const loadSchoolProfile = ({ geography, regionSlug, year }) => {
    if (!geography || !Number.isInteger(year)) return Promise.resolve(null)
    const params = scopeParams({ geography, regionSlug, year })
    return loadCached(`schools|${params.toString()}`, () => loadJson(
        `/api/public/schools?${params.toString()}`,
        (payload) => isScopedPayload(payload, year) && Number.isInteger(payload.metrics.schools) && Array.isArray(payload.metrics.facilities),
    ))
}

export const loadAapSummary = ({ geography, regionSlug, year }) => {
    if (!geography || !Number.isInteger(year)) return Promise.resolve(null)
    const params = new URLSearchParams({ year: String(year) })
    if (geography.level === 'region') params.set('regionSlug', geography.slug)
    if (geography.level === 'district') { params.set('regionSlug', regionSlug); params.set('districtSlug', geography.slug) }
    const key = `aap|${params.toString()}`
    return loadCached(key, async () => {
        const response = await fetch(`/api/public/aap-summary?${params.toString()}`, { headers: { Accept: 'application/json' } })
        if (!response.ok) return null
        const payload = await response.json()
        return isAapPayload(payload, year) ? payload : null
    })
}
