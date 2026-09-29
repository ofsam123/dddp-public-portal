import React, { useCallback, useState } from 'react'
import { Link } from 'react-router-dom'
import PublicYearSelector from '../explore/components/PublicYearSelector'
import { AnimatedNumber, PublicMotionItem, PublicMotionSection } from '../shared/PublicMotion'
import './Platform.css'

const formatRetrievedAt = (value) => {
    if (!value) return null
    const date = new Date(value)
    if (Number.isNaN(date.getTime())) return null
    return new Intl.DateTimeFormat('en-GH', { dateStyle: 'medium', timeStyle: 'short' }).format(date)
}

const Platform = ({
    geographyData,
    isGeographyLoading,
    isLoading,
    publicYear,
    summaryData,
}) => {
    const [isInView, setIsInView] = useState(false)
    const handleSectionEnter = useCallback(() => setIsInView(true), [])
    const retrievedAt = formatRetrievedAt(summaryData?.meta.retrievedAt)
    const valueClassName = (value, className = '') => (
        `${className}${Number.isInteger(value) ? '' : ' is-unavailable'}`
    )
    const projects = summaryData?.kpis.projects
    const programmes = summaryData?.kpis.programmes
    const projectsProgrammesTotal = summaryData?.kpis.projectsProgrammesTotal
    const meetings = summaryData?.kpis.meetings
    const regions = geographyData.meta.regionCount
    const districts = geographyData.meta.districtCount
    const projectShare = Number.isInteger(projects) && Number.isInteger(programmes) && projects + programmes > 0
        ? (projects / (projects + programmes)) * 100
        : null

    return (
        <PublicMotionSection onEnter={handleSectionEnter} className="pt-section pt-section--tint platform-snapshot-section" id="public-snapshot" aria-labelledby="platform-access-title">
            <div className="pt-container">
                <PublicMotionItem className="pt-section-head">
                    <div>
                        <span className="section-kicker">National snapshot</span>
                        <h2 id="platform-access-title">Ghana at a glance</h2>
                        <p>Projects and programmes whose expected implementation period falls in the selected year, alongside recorded governance meetings.</p>
                    </div>
                    <div className="platform-snapshot__context" aria-label="National indicator context">
                        <PublicYearSelector
                            year={publicYear.year}
                            years={publicYear.years}
                            isLoading={publicYear.isLoading}
                            onChange={publicYear.setYear}
                        />
                        <small>
                            {summaryData ? 'Source: DDDP' : isLoading ? 'Loading live data' : 'Live data unavailable'}
                            {retrievedAt && ` · Retrieved ${retrievedAt}`}
                        </small>
                    </div>
                </PublicMotionItem>

                <PublicMotionItem className="platform-snapshot" aria-label="National public indicator snapshot">
                    <article className="platform-kpi platform-kpi--lead">
                        <span className="platform-kpi__label">Development activity</span>
                        <AnimatedNumber
                            as="div"
                            active={isInView}
                            value={projectsProgrammesTotal}
                            className={valueClassName(projectsProgrammesTotal, 'platform-kpi__value')}
                        />
                        <h3>Projects &amp; programmes</h3>
                        <div className="platform-kpi__split" aria-hidden="true">
                            <i style={{ width: `${projectShare ?? 50}%` }} />
                        </div>
                        <div className="platform-kpi__breakdown" aria-label="Projects and programmes breakdown">
                            <div>
                                <span><i className="is-projects" aria-hidden="true" />Projects</span>
                                <AnimatedNumber active={isInView} value={projects} className={valueClassName(projects)} />
                            </div>
                            <div>
                                <span><i className="is-programmes" aria-hidden="true" />Programmes</span>
                                <AnimatedNumber active={isInView} value={programmes} className={valueClassName(programmes)} />
                            </div>
                        </div>
                    </article>

                    <article className="platform-kpi">
                        <span className="platform-kpi__label">Governance activity</span>
                        <AnimatedNumber as="div" active={isInView} value={meetings} className={valueClassName(meetings, 'platform-kpi__value')} />
                        <h3>Meetings</h3>
                        <p>Statutory and assembly meetings recorded by districts.</p>
                    </article>

                    <article className="platform-kpi" aria-label="Public geography coverage">
                        <span className="platform-kpi__label">Geographic coverage</span>
                        <div className="platform-kpi__coverage">
                            <div>
                                <AnimatedNumber as="div" active={isInView} value={regions} className={valueClassName(regions, 'platform-kpi__value')} />
                                <h3>Regions</h3>
                            </div>
                            <div>
                                <AnimatedNumber as="div" active={isInView} value={districts} className={valueClassName(districts, 'platform-kpi__value')} />
                                <h3>Districts / MMDAs</h3>
                            </div>
                        </div>
                        {!geographyData.meta.connected && !isGeographyLoading && <p>Coverage unavailable</p>}
                    </article>
                </PublicMotionItem>

                <PublicMotionItem className="platform-snapshot__footer">
                    <p>Open the national overview to compare regions and drill into any district.</p>
                    <Link className="pt-link" to={publicYear.withYear('/explore/ghana')}>
                        Explore national data
                        <svg viewBox="0 0 16 16" aria-hidden="true"><path d="M3 8h10M9 4l4 4-4 4" /></svg>
                    </Link>
                </PublicMotionItem>
            </div>
        </PublicMotionSection>
    )
}

export default Platform
