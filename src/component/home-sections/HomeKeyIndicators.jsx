import React from 'react'
import { PublicMotionItem, PublicMotionSection } from '../shared/PublicMotion'
import { getDistributionLeaders, getProgrammeShare } from './homeDataInsights'
import './HomeKeyIndicators.css'

const numberFormatter = new Intl.NumberFormat('en-GH')
const percentFormatter = new Intl.NumberFormat('en-GH', { maximumFractionDigits: 2 })

const IndicatorState = ({ isLoading }) => isLoading ? (
    <div className="home-indicator__loading" aria-label="Loading selected-year indicator">
        <span />
        <span />
        <span />
    </div>
) : (
    <p className="home-indicator__state" aria-live="polite">Indicator unavailable</p>
)

const IndicatorHeader = ({ label, year }) => (
    <div className="home-indicator__header">
        <span className="home-indicator__label">{label}</span>
        <span className="home-indicator__year">{year || 'Selected year'}</span>
    </div>
)

const LeadingIndicator = ({ distribution, isLoading, label, countContext, shareContext, year }) => {
    const leaders = getDistributionLeaders(distribution)
    const leader = leaders[0]

    return (
        <article className="home-indicator">
            <IndicatorHeader label={label} year={year} />
            {leader ? (
                <>
                    <div className="home-indicator__finding">
                        {leaders.length > 1 && <small>Joint leaders</small>}
                        {leaders.map((item) => <h3 key={item.label}>{item.label}</h3>)}
                    </div>
                    <p className="home-indicator__summary">
                        <strong>{numberFormatter.format(leader.count)}</strong> {countContext}
                        <span aria-hidden="true"> / </span>
                        <strong>{percentFormatter.format(leader.share)}%</strong> {shareContext}
                    </p>
                </>
            ) : distribution?.total === 0 ? (
                <p className="home-indicator__state">No eligible activity recorded</p>
            ) : (
                <IndicatorState isLoading={isLoading} />
            )}
        </article>
    )
}

const ProgrammeShareIndicator = ({ summaryData, isLoading, year }) => {
    const share = getProgrammeShare(summaryData)
    const projects = summaryData?.kpis?.projects
    const programmes = summaryData?.kpis?.programmes
    const total = Number.isInteger(projects) && Number.isInteger(programmes) ? projects + programmes : null

    return (
        <article className="home-indicator home-indicator--share">
            <IndicatorHeader label="Programme share" year={year} />
            {share !== null ? (
                <>
                    <strong className="home-indicator__percentage">{percentFormatter.format(share)}%</strong>
                    <h3>of Projects &amp; Programmes are Programmes</h3>
                    <p className="home-indicator__summary">
                        <strong>{numberFormatter.format(programmes)}</strong> Programmes of <strong>{numberFormatter.format(total)}</strong> activities
                    </p>
                </>
            ) : total === 0 ? (
                <p className="home-indicator__state">No Projects or Programmes recorded</p>
            ) : (
                <IndicatorState isLoading={isLoading} />
            )}
        </article>
    )
}

const HomeKeyIndicators = ({ breakdownsData, breakdownsLoading, summaryData, summaryLoading, year }) => (
    <PublicMotionSection className="home-indicators" aria-labelledby="home-indicators-title">
        <div className="home-indicators__inner">
            <PublicMotionItem className="home-indicators__heading">
                <div>
                    <span className="section-kicker">Key indicators</span>
                    <h2 id="home-indicators-title">What stands out nationally?</h2>
                </div>
                <p>Contextual findings from eligible public activity in {year || 'the selected year'}.</p>
            </PublicMotionItem>
            <div className="home-indicators__grid">
                <PublicMotionItem>
                    <LeadingIndicator
                        distribution={breakdownsData?.developmentDimensions}
                        isLoading={breakdownsLoading}
                        label="Leading Development Dimension"
                        countContext="active Projects & Programmes"
                        shareContext="of all eligible development activity"
                        year={year}
                    />
                </PublicMotionItem>
                <PublicMotionItem>
                    <LeadingIndicator
                        distribution={breakdownsData?.meetingTypes}
                        isLoading={breakdownsLoading}
                        label="Leading Meeting Type"
                        countContext="reported Meetings"
                        shareContext="of all eligible Meetings"
                        year={year}
                    />
                </PublicMotionItem>
                <PublicMotionItem>
                    <ProgrammeShareIndicator summaryData={summaryData} isLoading={summaryLoading} year={year} />
                </PublicMotionItem>
            </div>
        </div>
    </PublicMotionSection>
)

export default HomeKeyIndicators
