import { getDistributionLeaders, getProgrammeShare } from './homeDataInsights'

test('returns every category tied for the highest non-zero count', () => {
    const distribution = {
        categories: [
            { label: 'First', count: 7 },
            { label: 'Second', count: 7 },
            { label: 'Third', count: 2 },
        ],
    }

    expect(getDistributionLeaders(distribution)).toEqual([
        { label: 'First', count: 7 },
        { label: 'Second', count: 7 },
    ])
})

test('does not present a leader when every category is genuinely zero', () => {
    expect(getDistributionLeaders({ categories: [
        { label: 'First', count: 0 },
        { label: 'Second', count: 0 },
    ] })).toEqual([])
})

test('calculates Programme Share from the live Projects and Programmes denominator', () => {
    expect(getProgrammeShare({ kpis: { projects: 75, programmes: 25 } })).toBe(25)
})

test('keeps a zero denominator distinct from a zero Programme Share', () => {
    expect(getProgrammeShare({ kpis: { projects: 0, programmes: 0 } })).toBeNull()
    expect(getProgrammeShare({ kpis: { projects: 10, programmes: 0 } })).toBe(0)
})
