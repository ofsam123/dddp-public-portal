const CLASSIFICATION_PALETTE = ['#1e6b52', '#4f9a78', '#3a6ea5', '#c79a3e', '#b4493f']
const NEUTRAL_COLOR = '#a3acb9'

export const DPAT_COLORS = {
    navy: '#16325A',
    brass: '#b38b3f',
    positive: CLASSIFICATION_PALETTE[0],
    neutral: CLASSIFICATION_PALETTE[2],
    negative: CLASSIFICATION_PALETTE[4],
}

export const classificationColor = (label, scale = []) => {
    const index = scale.findIndex((band) => band.label === label)
    return index >= 0 ? CLASSIFICATION_PALETTE[Math.min(index, CLASSIFICATION_PALETTE.length - 1)] : NEUTRAL_COLOR
}

export const classifyPercent = (percent, scale = []) => {
    if (!Number.isFinite(percent)) return null
    return (scale.find((band) => percent >= band.min) || scale[scale.length - 1])?.label || null
}

export const percentColor = (percent, scale = []) => classificationColor(classifyPercent(percent, scale), scale)

export const formatPercent = (value, digits = 1) => (Number.isFinite(value) ? `${value.toFixed(digits)}%` : '—')

export const formatScore = (value) => {
    if (!Number.isFinite(value)) return '—'
    return Number.isInteger(value) ? String(value) : value.toFixed(1)
}

export const formatDelta = (value) => {
    if (!Number.isFinite(value)) return '—'
    const rounded = Math.round(value * 10) / 10
    if (rounded === 0) return 'Level with'
    return `${rounded > 0 ? '+' : '−'}${Math.abs(rounded).toFixed(1)} pts`
}

export const ordinal = (value) => {
    if (!Number.isInteger(value)) return '—'
    const mod100 = value % 100
    const suffix = mod100 >= 11 && mod100 <= 13 ? 'th' : ({ 1: 'st', 2: 'nd', 3: 'rd' }[value % 10] || 'th')
    return `${value}${suffix}`
}

export const formatDateTime = (value) => {
    if (!value) return null
    const date = new Date(value)
    if (Number.isNaN(date.getTime())) return null
    return new Intl.DateTimeFormat('en-GH', { dateStyle: 'medium', timeStyle: 'short' }).format(date)
}

export const median = (values) => {
    const sorted = values.filter(Number.isFinite).sort((a, b) => a - b)
    if (sorted.length === 0) return null
    const middle = Math.floor(sorted.length / 2)
    return sorted.length % 2 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2
}

export const mean = (values) => {
    const finite = values.filter(Number.isFinite)
    return finite.length ? finite.reduce((total, value) => total + value, 0) / finite.length : null
}

const quantile = (sorted, share) => {
    if (!sorted.length) return null
    const position = (sorted.length - 1) * share
    const lower = Math.floor(position)
    const upper = Math.ceil(position)
    return sorted[lower] + (sorted[upper] - sorted[lower]) * (position - lower)
}

export const summarize = (values) => {
    const sorted = values.filter(Number.isFinite).sort((a, b) => a - b)
    if (!sorted.length) return null
    return {
        count: sorted.length,
        min: sorted[0],
        p10: quantile(sorted, 0.1),
        q1: quantile(sorted, 0.25),
        median: quantile(sorted, 0.5),
        q3: quantile(sorted, 0.75),
        p90: quantile(sorted, 0.9),
        max: sorted[sorted.length - 1],
        mean: mean(sorted),
    }
}

export const scoredDistricts = (scores) => (scores?.districts || []).filter((district) => Number.isFinite(district.finalPercent))

export const districtPath = (districtId, year) => `/dpat/performance-analysis/districts/${districtId}${year ? `?year=${year}` : ''}`

export const shortDistrictName = (name = '') => name
    .replace(/\s+(Municipal|Metropolitan|District)\s+Assembly$/i, ' $1')
    .replace(/\s+Assembly$/i, '')
    .trim()
