const DPAT_API_BASE = '/api/public/dpat'
const CACHE_TTL_MS = 5 * 60 * 1000
const cache = new Map()

const getJson = (path) => {
    const hit = cache.get(path)
    if (hit?.value && Date.now() - hit.createdAt < CACHE_TTL_MS) return Promise.resolve(hit.value)
    if (hit?.pending) return hit.pending

    const pending = fetch(`${DPAT_API_BASE}${path}`, { method: 'GET', headers: { Accept: 'application/json' } })
        .then(async (response) => {
            if (!response.ok) {
                const error = new Error(`DPAT request failed (${response.status})`)
                error.status = response.status
                throw error
            }
            return response.json()
        })
        .then((value) => {
            cache.set(path, { value, createdAt: Date.now() })
            return value
        })
        .catch((error) => {
            cache.delete(path)
            throw error
        })
    cache.set(path, { pending })
    return pending
}

export const fetchDpatYears = () => getJson('/years')
export const fetchDpatScores = (year) => getJson(`/scores/${year}`)
export const fetchDpatRegionScores = (year) => getJson(`/scores/${year}/regions`)
export const fetchDpatThematicAreas = (year) => getJson(`/scores/${year}/thematic-areas`)
export const fetchDpatDistrict = (year, districtId) => getJson(`/scores/${year}/district/${encodeURIComponent(districtId)}`)
export const fetchDpatIndicators = (year) => getJson(`/indicators/${year}`)
