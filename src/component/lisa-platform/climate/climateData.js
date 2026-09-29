// Single-community entries above this are data-entry errors (e.g. 343434343) and are left out of totals.
export const MAX_PLAUSIBLE_AFFECTED = 100000

export const RISK_LEVELS = [
    { key: 'High', color: '#b4442f', soft: '#fbeae6' },
    { key: 'Medium', color: '#c49a3c', soft: '#f8f1e1' },
    { key: 'Low', color: '#1f8f5f', soft: '#e8f5ee' },
]

export const shortDistrict = (name) => String(name || '')
    .replace(/\s+District Assembly$/i, '')
    .replace(/\s+Assembly$/i, '')
    .trim()

export const plausibleAffected = (value) => (Number.isFinite(value) && value >= 0 && value <= MAX_PLAUSIBLE_AFFECTED ? value : null)

export const formatNumber = (value) => (Number.isFinite(value) ? new Intl.NumberFormat('en-GB').format(value) : '—')

export const formatDate = (iso, options = { day: 'numeric', month: 'short', year: 'numeric' }) => {
    if (!iso) return 'Date not recorded'
    const date = new Date(`${iso}T00:00:00`)
    return Number.isNaN(date.getTime()) ? 'Date not recorded' : date.toLocaleDateString('en-GB', options)
}

const sentenceCase = (value) => {
    if (!value) return value
    const letters = value.replace(/[^A-Za-z]/g, '')
    if (!letters || letters !== letters.toUpperCase()) return value
    const lower = value.toLowerCase()
    return lower.charAt(0).toUpperCase() + lower.slice(1)
}

export const buildClimateIndex = ({ places = [], risks = [], records = [] } = {}) => {
    const placeById = new Map(places.map((place) => [place.id, {
        ...place,
        districtLabel: shortDistrict(place.districtName),
        isDistrictWide: place.level === 3,
    }]))
    const riskById = new Map(risks.map((risk) => [risk.id, risk]))

    const rows = records
        .filter((record) => placeById.has(record.placeId))
        .map((record) => {
            const place = placeById.get(record.placeId)
            const risk = riskById.get(record.riskId) || null
            return {
                ...record,
                place,
                type: risk?.type || 'Unclassified',
                title: sentenceCase(risk?.name) || `${risk?.type || 'Climate'} record`,
                description: sentenceCase(risk?.description),
                livelihood: risk?.livelihood || null,
                distanceKm: risk?.distanceKm ?? null,
                remarks: sentenceCase(record.remarks),
                affected: plausibleAffected(record.affectedPersons),
                affectedUnverified: record.affectedPersons !== null && plausibleAffected(record.affectedPersons) === null,
                year: record.date ? Number(record.date.slice(0, 4)) : null,
            }
        })

    const regions = new Map()
    rows.forEach((row) => {
        const { place } = row
        if (!regions.has(place.regionId)) regions.set(place.regionId, { id: place.regionId, name: place.regionName, districts: new Map(), count: 0 })
        const region = regions.get(place.regionId)
        region.count += 1
        if (!region.districts.has(place.districtId)) {
            region.districts.set(place.districtId, { id: place.districtId, name: place.districtLabel, communities: new Map(), count: 0 })
        }
        const district = region.districts.get(place.districtId)
        district.count += 1
        if (!place.isDistrictWide) {
            const community = district.communities.get(place.id) || { id: place.id, name: place.name, count: 0 }
            community.count += 1
            district.communities.set(place.id, community)
        }
    })

    const tree = [...regions.values()]
        .map((region) => ({
            ...region,
            districts: [...region.districts.values()]
                .map((district) => ({ ...district, communities: [...district.communities.values()].sort((a, b) => a.name.localeCompare(b.name)) }))
                .sort((a, b) => a.name.localeCompare(b.name)),
        }))
        .sort((a, b) => a.name.localeCompare(b.name))

    return { rows, tree }
}

export const summarise = (rows) => {
    const count = (key) => {
        const map = new Map()
        rows.forEach((row) => {
            const value = typeof key === 'function' ? key(row) : row[key]
            if (value !== null && value !== undefined) map.set(value, (map.get(value) || 0) + 1)
        })
        return map
    }
    const levels = count('riskLevel')
    const types = [...count('type').entries()].map(([name, total]) => ({ name, total })).sort((a, b) => b.total - a.total || a.name.localeCompare(b.name))
    const years = [...count('year').entries()].map(([year, total]) => ({ year, total })).sort((a, b) => a.year - b.year)
    const affectedValues = rows.map((row) => row.affected).filter((value) => value !== null)
    return {
        records: rows.length,
        communities: new Set(rows.filter((row) => !row.place.isDistrictWide).map((row) => row.place.id)).size,
        districts: new Set(rows.map((row) => row.place.districtId)).size,
        regions: new Set(rows.map((row) => row.place.regionId)).size,
        affected: affectedValues.reduce((sum, value) => sum + value, 0),
        affectedReported: affectedValues.length,
        unverified: rows.filter((row) => row.affectedUnverified).length,
        withPhotos: rows.filter((row) => row.photos.length).length,
        levels: RISK_LEVELS.map((level) => ({ ...level, total: levels.get(level.key) || 0 })),
        types,
        years,
        latest: rows.map((row) => row.date).filter(Boolean).sort().pop() || null,
        earliest: rows.map((row) => row.date).filter(Boolean).sort()[0] || null,
    }
}
