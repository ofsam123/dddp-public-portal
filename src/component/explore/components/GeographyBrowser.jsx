import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import useRegionalSummaries from '../hooks/useRegionalSummaries'
import { PUBLIC_INDICATORS } from '../services/regionalInsights'
import PublicGeoMap from './PublicGeoMap'
import RegionalActivityRanking from './RegionalActivityRanking'

const numberFormatter = new Intl.NumberFormat('en-GH')

const GeographyBrowser = ({
    title,
    description,
    regions = [],
    districts = [],
    activeRegion,
    year,
    withYear = (path) => path,
    regionalData,
}) => {
    const [activeRegionSlug, setActiveRegionSlug] = useState(null)
    const [indicatorKey, setIndicatorKey] = useState(PUBLIC_INDICATORS[0].key)
    const loadedRegionalData = useRegionalSummaries({ enabled: regions.length > 0 && !regionalData, year })
    const summariesBySlug = regionalData?.summariesBySlug || loadedRegionalData.summariesBySlug
    const regionalSummaries = regionalData?.regionalSummaries || loadedRegionalData.regionalSummaries
    const nationalSummary = regionalData?.nationalSummary || loadedRegionalData.nationalSummary
    const isLoading = regionalData ? regionalData.isLoading : loadedRegionalData.isLoading
    const summaryYear = regionalData?.year || loadedRegionalData.year
    const indicator = PUBLIC_INDICATORS.find((item) => item.key === indicatorKey)

    return (
        <section className="geography-browser" aria-labelledby="geography-browser-title">
            <div className="geography-browser__heading">
                <span className="section-kicker">Explore by place</span>
                <h2 id="geography-browser-title">{title}</h2>
                {description && <p>{description}</p>}
                <div className="geography-browser__path" aria-label="Geographic pathway">
                    <span>Ghana</span>
                    <span>Regions</span>
                    <span>Districts</span>
                </div>
            </div>

            {regions.length > 0 && (
                <div className="geography-browser__explorer">
                    <PublicGeoMap
                        regions={regions}
                        activeRegionSlug={activeRegionSlug}
                        onActiveRegionChange={setActiveRegionSlug}
                        summariesBySlug={summariesBySlug}
                        summariesLoading={isLoading}
                        summaryYear={summaryYear}
                        nationalSummary={nationalSummary}
                        indicatorKey={indicatorKey}
                        onIndicatorChange={setIndicatorKey}
                        withYear={withYear}
                    />
                    <nav className="region-index" aria-label="Ghana region index">
                        <div className="region-index__heading">
                            <span>Region index</span>
                            <strong>{regions.length} regions</strong>
                        </div>
                        <div className="region-index__list">
                            {regions.map((region, index) => (
                                <Link
                                    className={`region-index__link${activeRegionSlug === region.slug ? ' region-index__link--active' : ''}`}
                                    to={withYear(`/explore/regions/${region.slug}`)}
                                    key={region.id}
                                    onMouseEnter={() => setActiveRegionSlug(region.slug)}
                                    onMouseLeave={() => setActiveRegionSlug(null)}
                                    onFocus={() => setActiveRegionSlug(region.slug)}
                                    onBlur={() => setActiveRegionSlug(null)}
                                >
                                    <span>{String(index + 1).padStart(2, '0')}</span>
                                    <strong>{region.name}</strong>
                                    <span className="region-index__meta">
                                        {Number.isInteger(summariesBySlug.get(region.slug)?.kpis?.[indicatorKey])
                                            ? `${numberFormatter.format(summariesBySlug.get(region.slug).kpis[indicatorKey])} ${indicator.label.toLowerCase()}`
                                            : Number.isInteger(region.districtCount) ? `${region.districtCount} districts` : '->'}
                                    </span>
                                </Link>
                            ))}
                        </div>
                    </nav>
                    <RegionalActivityRanking
                        regions={regionalSummaries}
                        nationalSummary={nationalSummary}
                        isLoading={isLoading}
                        year={summaryYear || year}
                        indicatorKey={indicatorKey}
                        onIndicatorChange={setIndicatorKey}
                    />
                </div>
            )}

            {activeRegion && (
                <div className="geography-browser__districts">
                    <div>
                        <h3>Districts in {activeRegion.name}</h3>
                        <p>
                            Choose a district to explore local public information.
                        </p>
                    </div>
                    {districts.length > 0 ? (
                        <div className="geography-browser__grid geography-browser__grid--districts">
                            {districts.map((district) => (
                                <Link className="geography-card geography-card--district" to={withYear(`/explore/regions/${activeRegion.slug}/districts/${district.slug}`)} key={district.id}>
                                    <span>District / MMDA</span>
                                    <strong>{district.name}</strong>
                                    <small>{activeRegion.name}</small>
                                </Link>
                            ))}
                        </div>
                    ) : (
                        <div className="geography-browser__empty">
                            District links for this region are not available yet.
                        </div>
                    )}
                </div>
            )}
        </section>
    )
}

export default GeographyBrowser
