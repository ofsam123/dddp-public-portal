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
