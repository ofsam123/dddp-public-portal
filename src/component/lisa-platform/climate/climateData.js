// Single-community entries above this are data-entry errors (e.g. 343434343) and are left out of totals.
export const MAX_PLAUSIBLE_AFFECTED = 100000

export const RISK_LEVELS = [
    { key: 'High', color: '#b4442f', soft: '#fbeae6' },
    { key: 'Medium', color: '#c49a3c', soft: '#f8f1e1' },
    { key: 'Low', color: '#1f8f5f', soft: '#e8f5ee' },
]

export const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
export const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
// Southern Ghana's rainfall pattern: major season April–July, minor season September–November.
export const RAINY_SEASONS = [
    { key: 'major', label: 'Major rainy season', months: [4, 5, 6, 7] },
    { key: 'minor', label: 'Minor rainy season', months: [9, 10, 11] },
]

const GHANA_BOUNDS = { minLng: -3.4, maxLng: 1.4, minLat: 4.5, maxLat: 11.3 }

export const validCoordinates = (coordinates) => {
    if (!Array.isArray(coordinates) || coordinates.length < 2) return null
    const [lng, lat] = coordinates.map(Number)
    const inside = lng >= GHANA_BOUNDS.minLng && lng <= GHANA_BOUNDS.maxLng && lat >= GHANA_BOUNDS.minLat && lat <= GHANA_BOUNDS.maxLat
    return inside ? [lng, lat] : null
}

export const regionKey = (name) => String(name || '').replace(/\s+Region$/i, '').trim().toLowerCase()

export const placeLabel = (place) => (place.isDistrictWide ? place.districtLabel : place.name)

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
                coordinates: validCoordinates(record.coordinates),
                month: record.date ? Number(record.date.slice(5, 7)) : null,
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
        months: MONTHS.map((label, index) => ({ month: index + 1, label, total: rows.filter((row) => row.month === index + 1).length })),
    }
}

export const typeLevelMatrix = (rows, limit = 8) => {
    const columns = [...RISK_LEVELS.map((level) => level.key), null]
    const byType = new Map()
    rows.forEach((row) => {
        if (!byType.has(row.type)) byType.set(row.type, { name: row.type, total: 0, cells: new Map(columns.map((key) => [key, 0])) })
        const entry = byType.get(row.type)
        entry.total += 1
        entry.cells.set(row.riskLevel, (entry.cells.get(row.riskLevel) || 0) + 1)
    })
    const types = [...byType.values()]
        .sort((a, b) => b.total - a.total || a.name.localeCompare(b.name))
        .slice(0, limit)
        .map((entry) => ({ name: entry.name, total: entry.total, cells: columns.map((key) => ({ level: key, total: entry.cells.get(key) || 0 })) }))
    return { columns, types, max: Math.max(1, ...types.flatMap((entry) => entry.cells.map((cell) => cell.total))) }
}

const UNCLASSIFIED = 'Unclassified'

const topBy = (map) => {
    const ranked = [...map.entries()].sort((a, b) => b[1] - a[1] || String(a[0]).localeCompare(String(b[0])))
    return (ranked.find(([key]) => key !== UNCLASSIFIED) || ranked[0])?.[0] || null
}

const groupStats = (rows, keyOf, describe) => {
    const groups = new Map()
    rows.forEach((row) => {
        const key = keyOf(row)
        if (!groups.has(key)) groups.set(key, { key, ...describe(row), records: 0, high: 0, affected: 0, types: new Map(), places: new Set(), latest: null })
        const group = groups.get(key)
        group.records += 1
        if (row.riskLevel === 'High') group.high += 1
        if (row.affected !== null) group.affected += row.affected
        group.types.set(row.type, (group.types.get(row.type) || 0) + 1)
        if (!row.place.isDistrictWide) group.places.add(row.place.id)
        if (row.date && (!group.latest || row.date > group.latest)) group.latest = row.date
    })
    return [...groups.values()].map(({ types, places, ...group }) => ({ ...group, communities: places.size, topType: topBy(types) }))
}

export const regionBreakdown = (rows) => groupStats(
    rows,
    (row) => row.place.regionId,
    (row) => ({ id: row.place.regionId, name: row.place.regionName }),
).sort((a, b) => b.records - a.records || a.name.localeCompare(b.name))

export const topPlaces = (rows, limit = 8) => groupStats(
    rows,
    (row) => row.place.id,
    (row) => ({ place: row.place, name: placeLabel(row.place) }),
).sort((a, b) => b.records - a.records || b.affected - a.affected || a.name.localeCompare(b.name)).slice(0, limit)

export const keyFindings = (rows, summary) => {
    if (!rows.length) return []
    const findings = []
    const topType = summary.types.find((item) => item.name !== UNCLASSIFIED) || summary.types[0]
    if (topType) {
        findings.push({ key: 'type', label: 'Most recorded risk', value: topType.name, detail: `${topType.total} of ${summary.records} records (${Math.round((topType.total / summary.records) * 100)}%)` })
    }
    const dated = summary.months.reduce((sum, item) => sum + item.total, 0)
    const peak = [...summary.months].sort((a, b) => b.total - a.total)[0]
    if (peak?.total) {
        const major = summary.months.filter((item) => RAINY_SEASONS[0].months.includes(item.month)).reduce((sum, item) => sum + item.total, 0)
        findings.push({ key: 'month', label: 'Peak month', value: MONTH_NAMES[peak.month - 1], detail: `${Math.round((major / dated) * 100)}% of events fall in April–July` })
    }
    const regions = regionBreakdown(rows)
    if (regions.length > 1) {
        findings.push({ key: 'region', label: 'Most records', value: regions[0].name, detail: `${regions[0].records} records from ${regions[0].communities} communities` })
    } else {
        const places = topPlaces(rows, 1)
        if (places[0]) findings.push({ key: 'region', label: 'Most records', value: places[0].name, detail: `${places[0].records} ${places[0].records === 1 ? 'record' : 'records'}` })
    }
    const high = summary.levels.find((level) => level.key === 'High')
    if (high) {
        findings.push({ key: 'high', label: 'Rated high risk', value: `${Math.round((high.total / summary.records) * 100)}%`, detail: `${high.total} records need the most attention` })
    }
    return findings
}
