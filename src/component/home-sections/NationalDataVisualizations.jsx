import React, { useCallback, useMemo, useState } from 'react'
import { PublicMotionItem, PublicMotionSection } from '../shared/PublicMotion'
import {
    FundingLandscape,
    InsightRibbon,
    PlannedActivity,
    SectorLandscape,
} from './CitizenProjectInsights'
import './CitizenProjectInsights.css'
import './NationalDataVisualizations.css'

const numberFormatter = new Intl.NumberFormat('en-GH')
const percentFormatter = new Intl.NumberFormat('en-GH', { maximumFractionDigits: 2 })

const DistributionLoading = ({ rows }) => (
    <div className="distribution-loading" aria-label="Loading distribution">
        {Array.from({ length: rows }, (_, index) => (
            <div key={index} aria-hidden="true">
                <span />
                <span style={{ width: `${Math.max(28, 88 - index * 8)}%` }} />
            </div>
        ))}
    </div>
)

const DistributionChart = ({ distribution, isLoading, title, question, year, initialLimit }) => {
    const [showAll, setShowAll] = useState(false)
    const categories = useMemo(() => (
        (distribution?.categories || [])
            .slice()
            .sort((first, second) => second.count - first.count || first.label.localeCompare(second.label))
    ), [distribution])
    const maxValue = categories.length > 0 ? Math.max(...categories.map((category) => category.count)) : 0
    const visibleCategories = initialLimit && !showAll ? categories.slice(0, initialLimit) : categories
    const hasMore = initialLimit && categories.length > initialLimit
    const titleId = `${title.replace(/\s+/g, '-').toLowerCase()}-title`

    return (
        <article className="distribution-chart" aria-labelledby={titleId}>
            <div className="distribution-chart__heading">
                <div className="distribution-chart__context">
                    <span className="section-kicker">{year || 'Selected year'}</span>
                    {distribution && (
                        <span>
                            <strong>{numberFormatter.format(distribution.total)}</strong> eligible records
                        </span>
                    )}
                </div>
                <h3 id={titleId}>{title}</h3>
                <p>{question}</p>
            </div>

            {distribution ? (
                <>
                    <ol className="distribution-bars" aria-label={`${title} in ${year}`}>
                        {visibleCategories.map((category) => (
                            <li key={category.label}>
                                <span className="distribution-bars__label">{category.label}</span>
                                <span className="distribution-bars__track" aria-hidden="true">
                                    <span
                                        className={category.count === 0 ? 'is-zero' : undefined}
                                        style={{ width: `${maxValue > 0 ? (category.count / maxValue) * 100 : 0}%` }}
                                    />
                                </span>
                                <strong>{numberFormatter.format(category.count)}</strong>
                                <small>{percentFormatter.format(category.share)}%</small>
                            </li>
                        ))}
                    </ol>
                    <div className="distribution-chart__footer">
                        <p>
                            {numberFormatter.format(distribution.classified)} classified of {numberFormatter.format(distribution.total)} eligible records.
                            {' '}{numberFormatter.format(distribution.unclassified)} unclassified.
                        </p>
                        {hasMore && (
                            <button
                                type="button"
                                aria-expanded={showAll}
                                onClick={() => setShowAll((current) => !current)}
                            >
                                {showAll ? `Show leading ${initialLimit}` : `Show all ${categories.length} meeting types`}
                            </button>
                        )}
                    </div>
                </>
            ) : isLoading ? (
                <DistributionLoading rows={initialLimit || 7} />
            ) : (
                <p className="distribution-chart__state">Distribution unavailable</p>
            )}
        </article>
    )
}

const NationalDataVisualizations = ({ breakdownsData, isLoading, year }) => {
    const [hasEntered, setHasEntered] = useState(false)
    const handleEnter = useCallback(() => setHasEntered(true), [])

    return (
        <PublicMotionSection
            className="national-data"
            aria-labelledby="national-data-title"
            onEnter={handleEnter}
        >
            <PublicMotionItem className="national-data__heading">
                <span className="section-kicker">National insights</span>
                <h2 id="national-data-title">What does the national data tell us?</h2>
                <p>A closer look at recorded development and governance activity in {year || 'the selected year'}.</p>
            </PublicMotionItem>
            <InsightRibbon
                active={hasEntered}
                breakdownsData={breakdownsData}
                isLoading={isLoading}
            />
            <PlannedActivity
                activity={breakdownsData?.plannedProjectActivity}
                active={hasEntered}
                isLoading={isLoading}
                year={year}
            />
            <div className="national-data__story-block">
                <PublicMotionItem className="national-data__story-heading">
                    <span>Development focus</span>
                    <h3>Where are projects and development activity focused?</h3>
                </PublicMotionItem>
                <div className="national-data__pair national-data__pair--focus">
                    <SectorLandscape
                        distribution={breakdownsData?.projectSectors}
                        isLoading={isLoading}
                        year={year}
                    />
                    <PublicMotionItem>
                        <DistributionChart
                            distribution={breakdownsData?.developmentDimensions}
                            isLoading={isLoading}
                            title="Development dimensions"
                            question="Recorded Projects and Programmes grouped by development dimension."
                            year={year}
                        />
                    </PublicMotionItem>
                </div>
            </div>
            <div className="national-data__story-block national-data__story-block--support">
                <PublicMotionItem className="national-data__story-heading">
                    <span>Support and governance</span>
                    <h3>How is recorded activity supported and governed?</h3>
                </PublicMotionItem>
                <div className="national-data__pair national-data__pair--support">
                    <FundingLandscape
                        distribution={breakdownsData?.primaryFundingSources}
                        isLoading={isLoading}
                        year={year}
                    />
                    <PublicMotionItem>
                        <DistributionChart
                            distribution={breakdownsData?.meetingTypes}
                            isLoading={isLoading}
                            title="Meeting types"
                            question="Recorded governance activity grouped by meeting type."
                            year={year}
                            initialLimit={8}
                        />
                    </PublicMotionItem>
                </div>
            </div>
        </PublicMotionSection>
    )
}

export default NationalDataVisualizations
