export const getDistributionLeaders = (distribution) => {
    const categories = distribution?.categories || []
    const highestCount = categories.reduce((highest, category) => (
        Number.isInteger(category.count) ? Math.max(highest, category.count) : highest
    ), 0)

    return highestCount > 0
        ? categories.filter((category) => category.count === highestCount)
        : []
}

export const getProgrammeShare = (summaryData) => {
    const projects = summaryData?.kpis?.projects
    const programmes = summaryData?.kpis?.programmes
    if (!Number.isInteger(projects) || !Number.isInteger(programmes)) return null

    const total = projects + programmes
    return total > 0 ? (programmes / total) * 100 : null
}
