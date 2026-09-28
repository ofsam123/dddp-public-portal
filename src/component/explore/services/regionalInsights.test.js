import { getRegionComparisons, getRegionalRank, getSharePercent } from './regionalInsights'

const regions = [
    { slug: 'alpha', kpis: { projects: 25, programmes: 4, meetings: 10 } },
    { slug: 'beta', kpis: { projects: 50, programmes: 4, meetings: 5 } },
    { slug: 'gamma', kpis: { projects: 0, programmes: 2, meetings: 15 } },
]

test('calculates a region share from the national aggregate', () => {
    expect(getSharePercent(25, 100)).toBe(25)
    expect(getSharePercent(0, 100)).toBe(0)
    expect(getSharePercent(2, 0)).toBeNull()
})

test('ranks regions by the selected metric and preserves ties', () => {
    expect(getRegionalRank(regions, 'alpha', 'projects')).toEqual({ position: 2, total: 3 })
    expect(getRegionalRank(regions, 'alpha', 'programmes')).toEqual({ position: 1, total: 3 })
})

test('builds comparisons for only the existing public indicators', () => {
    const result = getRegionComparisons({
        regionSlug: 'alpha',
        regions,
        nationalSummary: { kpis: { projects: 100, programmes: 10, meetings: 50 } },
    })

    expect(result.projects.sharePercent).toBe(25)
    expect(result.projects.rank).toEqual({ position: 2, total: 3 })
    expect(Object.keys(result)).toEqual(['projects', 'programmes', 'meetings'])
})
