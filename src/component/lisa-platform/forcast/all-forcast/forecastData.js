const PERIOD_KEYS = ['morning', 'afternoon', 'evening']
const PERIOD_LABELS = { morning: 'Morning', afternoon: 'Afternoon', evening: 'Evening' }

// GMet bulletin codes; anything unlisted falls back to a title-cased version of the raw code.
const CONDITIONS = {
    SUNNY: { label: 'Sunny', tone: 'sun' },
    'P\'SUNNY': { label: 'Partly sunny', tone: 'partly' },
    'P\'CLOUDY': { label: 'Partly cloudy', tone: 'partly' },
    CLOUDY: { label: 'Cloudy', tone: 'cloud' },
    'V\'CLOUDY': { label: 'Very cloudy', tone: 'cloud' },
    OVERCAST: { label: 'Overcast', tone: 'cloud' },
    MIST: { label: 'Mist', tone: 'mist' },
    FOG: { label: 'Fog', tone: 'mist' },
    HAZE: { label: 'Haze', tone: 'mist' },
    HZ: { label: 'Haze', tone: 'mist' },
    DUST: { label: 'Dust haze', tone: 'mist' },
    DZ: { label: 'Drizzle', tone: 'rain' },
    'SL\'T RAIN': { label: 'Slight rain', tone: 'rain' },
    RAIN: { label: 'Rain', tone: 'rain' },
    RA: { label: 'Rain', tone: 'rain' },
    SHRA: { label: 'Rain showers', tone: 'rain' },
    TS: { label: 'Thunderstorms', tone: 'storm' },
    TSRA: { label: 'Thunderstorms with rain', tone: 'storm' },
}

export const CONDITION_GLOSSARY = [
    { code: 'P\'CLOUDY', ...CONDITIONS['P\'CLOUDY'] },
    { code: 'CLOUDY', ...CONDITIONS.CLOUDY },
    { code: 'V\'CLOUDY', ...CONDITIONS['V\'CLOUDY'] },
    { code: 'MIST', ...CONDITIONS.MIST },
    { code: 'SL\'T RAIN', ...CONDITIONS['SL\'T RAIN'] },
    { code: 'RAIN', ...CONDITIONS.RAIN },
    { code: 'TSRA', ...CONDITIONS.TSRA },
    { code: 'SUNNY', ...CONDITIONS.SUNNY },
]

export const TONES = [
    { key: 'sun', label: 'Sunny', color: '#d9b25a' },
    { key: 'partly', label: 'Partly cloudy', color: '#9fb4d3' },
    { key: 'cloud', label: 'Cloudy', color: '#5b7cab' },
    { key: 'mist', label: 'Mist or haze', color: '#b7c2d0' },
    { key: 'rain', label: 'Rain', color: '#2f6fb0' },
    { key: 'storm', label: 'Thunderstorms', color: '#16325a' },
]

const WET_TONES = new Set(['rain', 'storm'])

const titleCase = (value) => String(value || '')
    .toLowerCase()
    .replace(/(^|[\s'-])([a-z])/g, (match, lead, letter) => `${lead}${letter.toUpperCase()}`)

export const formatCity = (value) => titleCase(value)

export const parseCondition = (raw) => {
    if (!raw || typeof raw !== 'string') return null
    const text = raw.replace(/[\u2018\u2019`\u00b4]/g, '\'').replace(/\s+/g, ' ').trim()
    const match = text.match(/^(.*?)\s*(?:\((\d{1,3})\s*%\))?$/)
    const code = (match?.[1] || text).trim().toUpperCase()
    const chance = match?.[2] ? Number(match[2]) : null
    const known = CONDITIONS[code]
    return {
        code,
        chance,
        label: known ? known.label : titleCase(code.replace(/'/g, ' ')),
        tone: known ? known.tone : 'cloud',
        isWet: WET_TONES.has(known?.tone),
    }
}

export const toDate = (parts) => {
    if (!Array.isArray(parts) || parts.length < 3) return null
    const date = new Date(parts[0], parts[1] - 1, parts[2], parts[3] || 0, parts[4] || 0)
    return Number.isNaN(date.getTime()) ? null : date
}

export const toIsoDate = (date) => {
    if (!date) return ''
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${date.getFullYear()}-${month}-${day}`
}

export const formatDay = (date, options = {}) => (date
    ? date.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', ...options })
    : '')

export const formatIssued = (date) => (date
    ? `${date.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}, ${date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}`
    : '')

const isPresent = (value) => value !== null && value !== undefined && value !== ''

export const toPeriods = (forecast) => PERIOD_KEYS
    .map((key, order) => {
        const temp = forecast?.[`${key}TemperatureValue`]
        const condition = parseCondition(forecast?.[`${key}WeatherCondition`])
        return {
            key,
            order,
            label: PERIOD_LABELS[key],
            date: toDate(forecast?.[`${key}ForecastDate`]),
            temp: isPresent(temp) && Number.isFinite(Number(temp)) ? Number(temp) : null,
            condition,
        }
    })
    .filter((period) => period.temp !== null || period.condition)
    .sort((a, b) => ((a.date?.getTime() ?? 0) - (b.date?.getTime() ?? 0)) || a.order - b.order)

export const cleanSummary = (summary) => {
    const text = typeof summary === 'string' ? summary : summary?.content
    if (!text) return ''
    return text
        .replace(/\s*\n\s*/g, ' ')
        .replace(/^\s*[A-Za-z]{2,9}\.?\s+\d{1,2}\/\d{1,2}\/\d{2,4}\.?\s*/, '')
        .trim()
}

export const normaliseForecasts = (forecasts, cities = []) => {
    const regionByCity = new Map(cities.map((city) => [String(city.city || '').toUpperCase(), city.region?.name || '']))
    return (forecasts || []).filter(Boolean).map((forecast) => {
        const periods = toPeriods(forecast)
        const temps = periods.map((period) => period.temp).filter((temp) => temp !== null)
        return {
            raw: forecast,
            id: `${forecast.city}-${(forecast.date || []).join('-')}`,
            city: formatCity(forecast.city),
            region: regionByCity.get(String(forecast.city || '').toUpperCase()) || '',
            issued: toDate(forecast.date),
            periods,
            min: temps.length ? Math.min(...temps) : null,
            max: temps.length ? Math.max(...temps) : null,
            isWet: periods.some((period) => period.condition?.isWet),
        }
    })
}

// History arrives as one array per bulletin; newest first.
export const groupIssues = (history) => {
    const groups = Array.isArray(history) && history.some(Array.isArray)
        ? history.filter(Array.isArray)
        : [Array.isArray(history) ? history : []]
    return groups
        .map((items) => items.filter(Boolean))
        .filter((items) => items.length)
        .map((items) => {
            const issued = items.map((item) => toDate(item.date)).filter(Boolean).sort((a, b) => b - a)[0] || null
            return { key: issued ? issued.toISOString() : String(items.length), issued, items }
        })
        .sort((a, b) => (b.issued?.getTime() ?? 0) - (a.issued?.getTime() ?? 0))
}

const mostCommonDate = (dates) => {
    const counts = new Map()
    dates.filter(Boolean).forEach((date) => {
        const key = toIsoDate(date)
        counts.set(key, { date, count: (counts.get(key)?.count || 0) + 1 })
    })
    return [...counts.values()].sort((a, b) => b.count - a.count)[0]?.date || null
}

export const issuePeriods = (rows) => PERIOD_KEYS
    .map((key, order) => {
        const matches = rows.map((row) => row.periods.find((period) => period.key === key)).filter(Boolean)
        const temps = matches.map((period) => period.temp).filter((temp) => temp !== null)
        const toneCounts = TONES.map((tone) => ({
            ...tone,
            count: matches.filter((period) => period.condition?.tone === tone.key).length,
        })).filter((tone) => tone.count)
        return {
            key,
            order,
            label: PERIOD_LABELS[key],
            date: mostCommonDate(matches.map((period) => period.date)),
            count: matches.length,
            average: temps.length ? temps.reduce((sum, temp) => sum + temp, 0) / temps.length : null,
            toneCounts,
        }
    })
    .filter((period) => period.count)
    .sort((a, b) => ((a.date?.getTime() ?? 0) - (b.date?.getTime() ?? 0)) || a.order - b.order)

export const issueHighlights = (rows) => {
    const readings = rows.flatMap((row) => row.periods
        .filter((period) => period.temp !== null)
        .map((period) => ({ city: row.city, region: row.region, period, temp: period.temp })))
    const byTemp = [...readings].sort((a, b) => b.temp - a.temp || a.city.localeCompare(b.city))
    const wetCities = rows.filter((row) => row.isWet)
    const stormCities = rows.filter((row) => row.periods.some((period) => period.condition?.tone === 'storm'))
    return {
        warmest: byTemp[0] || null,
        coolest: byTemp[byTemp.length - 1] || null,
        wetCount: wetCities.length,
        stormCount: stormCities.length,
        cityCount: rows.length,
        regionCount: new Set(rows.map((row) => row.region).filter(Boolean)).size,
    }
}

export const describePeriod = (period) => [period.label, formatDay(period.date)].filter(Boolean).join(', ')
