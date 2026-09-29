import React, { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import useRegionalSummaries from '../hooks/useRegionalSummaries'
import { PROJECT_PROGRAMME_VIEWS } from '../hooks/useProjectProgrammeView'
import PublicGeoMap from './PublicGeoMap'
import PublicState from './PublicState'
import RegionalActivityRanking from './RegionalActivityRanking'

const numberFormatter = new Intl.NumberFormat('en-GH')

const assemblyType = (name = '') => {
    if (/metropolitan/i.test(name)) return 'Metropolitan'
    if (/municipal/i.test(name)) return 'Municipal'
    return 'District'
}

const DistrictDirectory = ({ region, districts, withYear }) => {
    const [query, setQuery] = useState('')
    const sorted = useMemo(() => [...districts].sort((a, b) => a.name.localeCompare(b.name)), [districts])
    const needle = query.trim().toLowerCase()
    const visible = needle ? sorted.filter((district) => district.name.toLowerCase().includes(needle)) : sorted

    return (
        <div className="geography-browser__districts">
            <div className="district-directory__aside">
                <h3>Find a district</h3>
                <p>Choose a District / MMDA in {region.name} to explore its local public information.</p>
                {districts.length > 0 && (
                    <>
                        <label className="district-directory__search">
                            <svg viewBox="0 0 20 20" aria-hidden="true"><circle cx="9" cy="9" r="6" /><path d="m17 17-3.5-3.5" /></svg>
                            <input
                                type="search"
                                value={query}
                                onChange={(event) => setQuery(event.target.value)}
                                placeholder="Filter districts"
                                aria-label={`Filter districts in ${region.name}`}
                            />
                        </label>
                        <small className="district-directory__count" aria-live="polite">
                            {needle ? `${visible.length} of ${districts.length} districts` : `${districts.length} districts`}
                        </small>
                    </>
                )}
            </div>
            {districts.length === 0 ? (
                <div className="geography-browser__empty">District links for this region are not available yet.</div>
            ) : visible.length === 0 ? (
                <div className="geography-browser__empty">No district in {region.name} matches “{query.trim()}”.</div>
            ) : (
                <div className="geography-browser__grid geography-browser__grid--districts">
                    {visible.map((district) => (
                        <Link className="geography-card geography-card--district" to={withYear(`/explore/regions/${region.slug}/districts/${district.slug}`)} key={district.id}>
                            <span data-type={assemblyType(district.name).toLowerCase()}>{assemblyType(district.name)}</span><strong>{district.name}</strong>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    )
}

const GeographyBrowser = ({
    title, description, regions = [], districts = [], activeRegion, year,
    withYear = (path) => path, regionalData, trackerKey = 'projects-programmes',
    projectProgrammeView = 'combined', onProjectProgrammeViewChange,
}) => {
    const [activeRegionSlug, setActiveRegionSlug] = useState(null)
    const supportsRegionalData = ['projects-programmes', 'meetings'].includes(trackerKey)
    const projectView = PROJECT_PROGRAMME_VIEWS.find((item) => item.key === projectProgrammeView) || PROJECT_PROGRAMME_VIEWS[0]
    const indicators = trackerKey === 'projects-programmes'
        ? PROJECT_PROGRAMME_VIEWS.map(({ indicatorKey, label }) => ({ key: indicatorKey, label }))
        : [{ key: 'meetings', label: 'Meetings' }]
    const indicatorKey = trackerKey === 'projects-programmes' ? projectView.indicatorKey : 'meetings'
    const loadedRegionalData = useRegionalSummaries({ enabled: supportsRegionalData && regions.length > 0 && !regionalData, year })
    const summariesBySlug = regionalData?.summariesBySlug || loadedRegionalData.summariesBySlug
    const regionalSummaries = regionalData?.regionalSummaries || loadedRegionalData.regionalSummaries
    const nationalSummary = regionalData?.nationalSummary || loadedRegionalData.nationalSummary
    const isLoading = regionalData ? regionalData.isLoading : loadedRegionalData.isLoading
    const summaryYear = regionalData?.year || loadedRegionalData.year
    const indicator = indicators.find((item) => item.key === indicatorKey) || indicators[0]

    const handleIndicatorChange = (nextIndicatorKey) => {
        const nextView = PROJECT_PROGRAMME_VIEWS.find((item) => item.indicatorKey === nextIndicatorKey)
        if (nextView && onProjectProgrammeViewChange) onProjectProgrammeViewChange(nextView.key)
    }

    const unavailableTrackerLabel = trackerKey === 'aap'
        ? 'Annual Action Plan'
        : trackerKey === 'igf' ? 'IGF' : 'PWDAs Programme'

    return (
        <section className="geography-browser" aria-labelledby="geography-browser-title">
            <div className="geography-browser__heading">
                <span className="section-kicker">Explore by place</span>
                <h2 id="geography-browser-title">{title}</h2>
                {description && <p>{description}</p>}
                <div className="geography-browser__path" aria-label="Geographic pathway">
                    <span>Ghana</span><span>Regions</span><span>Districts</span>
                </div>
            </div>

            {regions.length > 0 && supportsRegionalData && (
                <div className="geography-browser__explorer">
                    <PublicGeoMap
                        regions={regions} activeRegionSlug={activeRegionSlug} onActiveRegionChange={setActiveRegionSlug}
                        summariesBySlug={summariesBySlug} summariesLoading={isLoading} summaryYear={summaryYear}
                        nationalSummary={nationalSummary} indicatorKey={indicatorKey} indicators={indicators}
                        onIndicatorChange={handleIndicatorChange} withYear={withYear}
                    />
                    <nav className="region-index" aria-label="Ghana region index">
                        <div className="region-index__heading"><span>Region index</span><strong>{regions.length} regions</strong></div>
                        <div className="region-index__list">
                            {regions.map((region, index) => (
                                <Link className={`region-index__link${activeRegionSlug === region.slug ? ' region-index__link--active' : ''}`}
                                    to={withYear(`/explore/regions/${region.slug}`)} key={region.id}
                                    onMouseEnter={() => setActiveRegionSlug(region.slug)} onMouseLeave={() => setActiveRegionSlug(null)}
                                    onFocus={() => setActiveRegionSlug(region.slug)} onBlur={() => setActiveRegionSlug(null)}>
                                    <span>{String(index + 1).padStart(2, '0')}</span><strong>{region.name}</strong>
                                    <span className="region-index__meta">
                                        {Number.isInteger(summariesBySlug.get(region.slug)?.kpis?.[indicatorKey])
                                            ? `${numberFormatter.format(summariesBySlug.get(region.slug).kpis[indicatorKey])} ${indicator.label.toLowerCase()}`
                                            : Number.isInteger(region.districtCount) ? `${region.districtCount} districts` : 'View region'}
                                    </span>
                                </Link>
                            ))}
                        </div>
                    </nav>
                    <RegionalActivityRanking regions={regionalSummaries} nationalSummary={nationalSummary} isLoading={isLoading}
                        year={summaryYear || year} indicatorKey={indicatorKey} indicators={indicators}
                        onIndicatorChange={handleIndicatorChange} />
                </div>
            )}

            {regions.length > 0 && !supportsRegionalData && (
                <PublicState status="unavailable" title={`Regional ${unavailableTrackerLabel} data is unavailable`}>
                    This tracker does not yet provide a verified all-region summary for the selected year.
                </PublicState>
            )}

            {activeRegion && <DistrictDirectory region={activeRegion} districts={districts} withYear={withYear} />}
        </section>
    )
}

export default GeographyBrowser