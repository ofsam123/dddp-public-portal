import React, { useMemo, useState } from 'react'
import { AnimatedNumber, PublicMotionItem } from '../shared/PublicMotion'

const numberFormatter = new Intl.NumberFormat('en-GH')
const percentFormatter = new Intl.NumberFormat('en-GH', { maximumFractionDigits: 2 })

const InsightLoading = ({ rows = 4 }) => (
    <div className="citizen-insight-loading" aria-label="Loading selected-year project insight">
        {Array.from({ length: rows }, (_, index) => (
            <span key={index} aria-hidden="true" style={{ width: `${88 - index * 9}%` }} />
        ))}
    </div>
)

const InsightState = ({ isLoading }) => (
    isLoading
        ? <InsightLoading />
        : <p className="citizen-insight__state">Selected-year project insight unavailable</p>
)

const getLeadingCategory = (distribution) => (
    distribution?.categories?.find((category) => category.count > 0) || null
)

const RibbonState = ({ isLoading }) => (
    isLoading
        ? <span className="insight-ribbon__loading" aria-label="Loading selected-year insight" />
        : <strong className="insight-ribbon__unavailable">Unavailable</strong>
)

export const InsightRibbon = ({ active, breakdownsData, isLoading }) => {
    const activeProjects = breakdownsData?.projectSectors?.eligibleTotal
    const leadingSector = getLeadingCategory(breakdownsData?.projectSectors)
    const leadingFunding = getLeadingCategory(breakdownsData?.primaryFundingSources)

    return (
        <PublicMotionItem className="insight-ribbon" aria-label="Selected-year national highlights">
            <div className="insight-ribbon__item insight-ribbon__item--number">
                {Number.isInteger(activeProjects) ? (
                    <AnimatedNumber value={activeProjects} active={active} />
                ) : (
                    <RibbonState isLoading={isLoading} />
                )}
                <span>Active projects</span>
            </div>
            <div className="insight-ribbon__item">
                {leadingSector ? (
                    <strong>{leadingSector.label}</strong>
                ) : breakdownsData?.projectSectors?.eligibleTotal === 0 ? (
                    <strong>None recorded</strong>
                ) : (
                    <RibbonState isLoading={isLoading} />
                )}
                <span>Leading recorded sector</span>
            </div>
            <div className="insight-ribbon__item">
                {leadingFunding ? (
                    <strong>{leadingFunding.label}</strong>
                ) : breakdownsData?.primaryFundingSources?.eligibleTotal === 0 ? (
                    <strong>None recorded</strong>
                ) : (
                    <RibbonState isLoading={isLoading} />
                )}
                <span>Leading primary funding source</span>
            </div>
        </PublicMotionItem>
    )
}

export const PlannedActivity = ({ activity, active, isLoading, year }) => (
    <PublicMotionItem className="planned-activity">
        <div className="citizen-insight__heading">
            <span className="section-kicker">Planned project activity</span>
            <h3>What project activity is expected in {year || 'the selected year'}?</h3>
        </div>
        {activity ? (
            <div className="planned-activity__pipeline">
                <div className="planned-activity__measure planned-activity__measure--starts">
                    <span>Expected starts</span>
                    <AnimatedNumber value={activity.expectedStarts} active={active} />
                </div>
                <div className="planned-activity__year" aria-label={`Selected year ${year}`}>
                    <span>{year}</span>
                </div>
                <div className="planned-activity__measure planned-activity__measure--completions">
                    <span>Expected completions</span>
                    <AnimatedNumber value={activity.expectedCompletions} active={active} />
                </div>
            </div>
        ) : (
            <InsightState isLoading={isLoading} />
        )}
        <p className="citizen-insight__note">Based on recorded expected project dates.</p>
    </PublicMotionItem>
)

export const SectorLandscape = ({ distribution, isLoading, year }) => {
    const [activeCategory, setActiveCategory] = useState(null)
    const categories = useMemo(() => (
        (distribution?.categories || []).filter((category) => category.count > 0)
    ), [distribution])
    const clearActiveCategory = () => setActiveCategory(null)

    return (
        <PublicMotionItem className="sector-landscape">
            <div className="citizen-insight__heading">
                <span className="section-kicker">Projects by sector</span>
                <h3>Which sectors have the most recorded projects?</h3>
                <p>Active projects represented in the selected {year || ''} period.</p>
            </div>
            {distribution ? (
                <>
                    <ol
                        className={`sector-landscape__band${activeCategory ? ' has-active' : ''}`}
                        aria-label={`Project sector shares in ${year}`}
                    >
                        {categories.map((category) => (
                            <li
                                key={category.label}
                                className={activeCategory === category.label ? 'is-active' : undefined}
                                style={{ flexGrow: category.count }}
                                tabIndex="0"
                                aria-label={`${category.label}: ${numberFormatter.format(category.count)} projects, ${percentFormatter.format(category.share)} percent of classified projects`}
                                onMouseEnter={() => setActiveCategory(category.count > 0 ? category.label : null)}
                                onMouseLeave={clearActiveCategory}
                                onFocus={() => setActiveCategory(category.count > 0 ? category.label : null)}
                                onBlur={clearActiveCategory}
                            />
                        ))}
                    </ol>
                    <ol className="sector-landscape__index">
                        {distribution.categories.map((category, index) => (
                            <li
                                key={category.label}
                                tabIndex="0"
                                onMouseEnter={() => setActiveCategory(category.count > 0 ? category.label : null)}
                                onMouseLeave={clearActiveCategory}
                                onFocus={() => setActiveCategory(category.count > 0 ? category.label : null)}
                                onBlur={clearActiveCategory}
                                aria-label={`${category.label}: ${numberFormatter.format(category.count)} projects, ${percentFormatter.format(category.share)} percent`}
                            >
                                <i className={`sector-landscape__key sector-landscape__key--${index % 6}`} aria-hidden="true" />
                                <span>{category.label}</span>
                                <strong>{numberFormatter.format(category.count)}</strong>
                                <small>{percentFormatter.format(category.share)}%</small>
                            </li>
                        ))}
                    </ol>
                    <p className="citizen-insight__note">
                        {numberFormatter.format(distribution.classifiedTotal)} of {numberFormatter.format(distribution.eligibleTotal)} eligible projects have a recorded sector.
                        {distribution.unclassifiedTotal > 0 && ` ${numberFormatter.format(distribution.unclassifiedTotal)} are unclassified.`}
                    </p>
                </>
            ) : (
                <InsightState isLoading={isLoading} />
            )}
        </PublicMotionItem>
    )
}

export const FundingLandscape = ({ distribution, isLoading, year }) => {
    const [showAll, setShowAll] = useState(false)
    const categories = distribution?.categories || []
    const visibleCategories = showAll ? categories : categories.slice(0, 6)
    const maxValue = categories[0]?.count || 0

    return (
        <PublicMotionItem className="funding-landscape">
            <div className="citizen-insight__heading">
                <span className="section-kicker">Primary funding sources</span>
                <h3>Who is recorded as funding projects?</h3>
                <p>Number of eligible projects by recorded primary funding source, not funding amounts.</p>
            </div>
            {distribution ? (
                <>
                    <ol className="funding-landscape__ranking" aria-label={`Primary funding sources in ${year}`}>
                        {visibleCategories.map((category, index) => (
                            <li key={category.label}>
                                <span className="funding-landscape__rank">{String(index + 1).padStart(2, '0')}</span>
                                <span className="funding-landscape__label">{category.label}</span>
                                <span className="funding-landscape__plot" aria-hidden="true">
                                    <i style={{ width: `${maxValue > 0 ? (category.count / maxValue) * 100 : 0}%` }} />
                                </span>
                                <strong>{numberFormatter.format(category.count)}</strong>
                                <small>{percentFormatter.format(category.share)}%</small>
                            </li>
                        ))}
                    </ol>
                    <div className="funding-landscape__footer">
                        <p className="citizen-insight__note">
                            Based on {numberFormatter.format(distribution.classifiedTotal)} projects with a recorded primary funding source.
                            {distribution.unclassifiedTotal > 0 && ` ${numberFormatter.format(distribution.unclassifiedTotal)} of ${numberFormatter.format(distribution.eligibleTotal)} eligible projects are unclassified.`}
                        </p>
                        {categories.length > 6 && (
                            <button
                                type="button"
                                aria-expanded={showAll}
                                onClick={() => setShowAll((current) => !current)}
                            >
                                {showAll ? 'Show leading sources' : `View all ${categories.length} funding sources`}
                            </button>
                        )}
                    </div>
                </>
            ) : (
                <InsightState isLoading={isLoading} />
            )}
        </PublicMotionItem>
    )
}
