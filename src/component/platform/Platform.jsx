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

    return (
        <PublicMotionSection onEnter={handleSectionEnter} className="platform-access" id="public-snapshot" aria-labelledby="platform-access-title">
            <PublicMotionItem className="platform-access__heading-row">
                <div className="platform-access__heading">
                    <span className="section-kicker">National snapshot</span>
                    <h2 id="platform-access-title">Ghana at a glance</h2>
                    <p>Current DDDP project, programme and meeting counts for Ghana.</p>
                </div>
                <div className="platform-access__context" aria-label="National indicator context">
                    <PublicYearSelector
                        year={publicYear.year}
                        years={publicYear.years}
                        isLoading={publicYear.isLoading}
                        onChange={publicYear.setYear}
                    />
                    <span>{summaryData ? 'Source: DDDP' : isLoading ? 'Loading live data' : 'Live data unavailable'}</span>
                    {retrievedAt && <span>Retrieved {retrievedAt}</span>}
                </div>
            </PublicMotionItem>

            <PublicMotionItem className="platform-snapshot" aria-label="National public indicator snapshot">
                <article className="platform-snapshot__activity">
                    <span className="platform-snapshot__label">Development activity</span>
                    <AnimatedNumber
                        as="div"
                        active={isInView}
                        value={projectsProgrammesTotal}
                        className={valueClassName(projectsProgrammesTotal, 'platform-snapshot__primary-value')}
                    />
                    <h3>Projects &amp; programmes</h3>
                    <div className="platform-snapshot__activity-detail" aria-label="Projects and programmes breakdown">
                        <div>
                            <AnimatedNumber active={isInView} value={projects} className={valueClassName(projects)} />
                            <span>Projects</span>
                        </div>
                        <div>
                            <AnimatedNumber active={isInView} value={programmes} className={valueClassName(programmes)} />
                            <span>Programmes</span>
                        </div>
                    </div>
                </article>

                <div className="platform-snapshot__secondary">
                    <article className="platform-snapshot__meetings">
                        <span className="platform-snapshot__label">Governance activity</span>
                        <AnimatedNumber active={isInView} value={meetings} className={valueClassName(meetings)} />
                        <h3>Meetings</h3>
                    </article>

                    <div className="platform-snapshot__coverage" aria-label="Public geography coverage">
                        <span className="platform-snapshot__label">Geographic coverage</span>
                        <div>
                            <p><AnimatedNumber active={isInView} value={regions} className={valueClassName(regions)} /> Regions</p>
                            <p><AnimatedNumber active={isInView} value={districts} className={valueClassName(districts)} /> Districts / MMDAs</p>
                        </div>
                        {!geographyData.meta.connected && !isGeographyLoading && <small>Coverage unavailable</small>}
                    </div>
                </div>
            </PublicMotionItem>

            <PublicMotionItem className="platform-access__footer">
                <p>National activity and public geography coverage in one view.</p>
                <Link to={publicYear.withYear('/explore/ghana')}>Explore national data <span aria-hidden="true">-&gt;</span></Link>
            </PublicMotionItem>
        </PublicMotionSection>
    )
}

export default Platform
