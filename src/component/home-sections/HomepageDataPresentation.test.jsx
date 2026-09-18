import { fireEvent, render, screen, within } from '@testing-library/react'
import HomeKeyIndicators from './HomeKeyIndicators'
import NationalDataVisualizations from './NationalDataVisualizations'

const buildDistribution = (prefix, count) => {
    const categories = Array.from({ length: count }, (_, index) => ({
        label: `${prefix} ${index + 1}`,
        count: count - index,
        share: Number((((count - index) / 100) * 100).toFixed(2)),
    }))
    const classified = categories.reduce((sum, category) => sum + category.count, 0)
    return {
        total: classified + 2,
        classified,
        unclassified: 2,
        shareDenominator: 'allEligible',
        categories,
    }
}

test('keeps KPI loading distinct from unavailable and then renders live indicator values', () => {
    const { rerender } = render(
        <HomeKeyIndicators
            breakdownsData={null}
            breakdownsLoading
            summaryData={null}
            summaryLoading
            year={2026}
        />,
    )

    expect(screen.queryByText('Indicator unavailable')).not.toBeInTheDocument()
    expect(screen.getAllByLabelText('Loading selected-year indicator')).toHaveLength(3)

    rerender(
        <HomeKeyIndicators
            breakdownsData={{
                developmentDimensions: {
                    total: 10,
                    categories: [{ label: 'Social Development', count: 6, share: 60 }],
                },
                meetingTypes: {
                    total: 8,
                    categories: [{ label: 'General Assembly', count: 4, share: 50 }],
                },
            }}
            breakdownsLoading={false}
            summaryData={{ kpis: { projects: 75, programmes: 25 } }}
            summaryLoading={false}
            year={2026}
        />,
    )

    expect(screen.getByRole('heading', { name: 'Social Development' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'General Assembly' })).toBeInTheDocument()
    expect(screen.getByText('25%')).toBeInTheDocument()
    expect(screen.getAllByText('2026')).toHaveLength(3)
})

test('renders seven dimensions, eight meeting types initially, and all meeting types on request', () => {
    render(
        <NationalDataVisualizations
            breakdownsData={{
                developmentDimensions: buildDistribution('Dimension', 7),
                meetingTypes: buildDistribution('Meeting', 18),
                projectSectors: {
                    eligibleTotal: 10,
                    classifiedTotal: 8,
                    unclassifiedTotal: 2,
                    categories: [
                        { label: 'Health', count: 5, share: 62.5 },
                        { label: 'Education', count: 3, share: 37.5 },
                    ],
                },
                primaryFundingSources: {
                    eligibleTotal: 10,
                    classifiedTotal: 8,
                    unclassifiedTotal: 2,
                    categories: Array.from({ length: 8 }, (_, index) => ({
                        label: `Funding ${index + 1}`,
                        count: 8 - index,
                        share: 8 - index,
                    })),
                },
                plannedProjectActivity: { expectedStarts: 4, expectedCompletions: 6 },
            }}
            isLoading={false}
            year={2026}
        />,
    )

    const dimensions = screen.getByRole('article', { name: 'Development dimensions' })
    const meetings = screen.getByRole('article', { name: 'Meeting types' })
    expect(within(dimensions).getAllByRole('listitem')).toHaveLength(7)
    expect(within(meetings).getAllByRole('listitem')).toHaveLength(8)
    expect(within(dimensions).getByText(/2 unclassified/)).toBeInTheDocument()
    expect(within(meetings).getByText(/2 unclassified/)).toBeInTheDocument()

    fireEvent.click(within(meetings).getByRole('button', { name: 'Show all 18 meeting types' }))

    expect(within(meetings).getAllByRole('listitem')).toHaveLength(18)
    expect(within(meetings).getByRole('button', { name: 'Show leading 8' })).toHaveAttribute('aria-expanded', 'true')
    expect(screen.getByRole('heading', { name: 'What project activity is expected in 2026?' })).toBeInTheDocument()
    expect(screen.getAllByText('Health').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Funding 1').length).toBeGreaterThan(0)

    const healthEntries = screen.getAllByRole('listitem', { name: /Health: 5 projects/i })
    const [healthSegment, healthLabel] = healthEntries
    fireEvent.mouseEnter(healthLabel)
    expect(healthSegment).toHaveClass('is-active')
    fireEvent.mouseLeave(healthLabel)
    expect(healthSegment).not.toHaveClass('is-active')

    fireEvent.click(screen.getByRole('button', { name: 'View all 8 funding sources' }))
    expect(screen.getByText('Funding 8')).toBeInTheDocument()
})
