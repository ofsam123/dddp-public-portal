export const PUBLIC_INDICATORS = [
    { key: 'projects', label: 'Projects' },
    { key: 'programmes', label: 'Programmes' },
    { key: 'meetings', label: 'Meetings' },
]

export const getSharePercent = (value, nationalTotal) => (
    Number.isFinite(value) && Number.isFinite(nationalTotal) && nationalTotal > 0
        ? (value / nationalTotal) * 100
        : null
)

export const getRegionalRank = (regions, regionSlug, indicatorKey) => {
    const selected = regions.find((region) => region.slug === regionSlug)
    const value = selected?.kpis?.[indicatorKey]
    if (!Number.isInteger(value)) return null

    const comparable = regions.filter((region) => Number.isInteger(region.kpis?.[indicatorKey]))
    return {
        position: 1 + comparable.filter((region) => region.kpis[indicatorKey] > value).length,
        total: comparable.length,
    }
}

export const getRegionComparisons = ({ regionSlug, regions = [], nationalSummary }) => (
    Object.fromEntries(PUBLIC_INDICATORS.map(({ key }) => {
        const region = regions.find((item) => item.slug === regionSlug)
        const value = region?.kpis?.[key]
        const nationalTotal = nationalSummary?.kpis?.[key]

        return [key, {
            sharePercent: getSharePercent(value, nationalTotal),
            rank: getRegionalRank(regions, regionSlug, key),
        }]
    }))
)
