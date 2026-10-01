const numberFormat = new Intl.NumberFormat('en-GH')
const compactFormat = new Intl.NumberFormat('en-GH', { notation: 'compact', maximumFractionDigits: 1 })
const fullMoneyFormat = new Intl.NumberFormat('en-GH', { maximumFractionDigits: 0 })

export const formatCount = (value) => (Number.isFinite(value) ? numberFormat.format(Math.round(value)) : '—')

export const formatCedis = (value) => (Number.isFinite(value) ? `GH₵ ${compactFormat.format(value)}` : '—')

export const formatCedisFull = (value) => (Number.isFinite(value) ? `GH₵ ${fullMoneyFormat.format(value)}` : '—')

export const formatShare = (part, total, digits = 0) => (
    Number.isFinite(part) && Number.isFinite(total) && total > 0 ? `${((part / total) * 100).toFixed(digits)}%` : '—'
)
