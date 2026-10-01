import React from 'react'
import { Link } from 'react-router-dom'
import HeroGeoVisual from './HeroGeoVisual'
import HeroBackdrop from '../shared/HeroBackdrop'
import './Header.css'

const numberFormatter = new Intl.NumberFormat('en-GH')

const formatCount = (value, isLoading) => (Number.isInteger(value) ? numberFormatter.format(value) : isLoading ? '…' : '—')

const Header = ({
    exploreHref = '/explore',
    year,
    summaryData,
    geographyData,
    isLoading,
    summariesBySlug,
    isRegionalLoading,
    deliveryBySlug,
    isDeliveryLoading,
    withYear,
}) => {
    const regions = geographyData?.meta?.regionCount
    const districts = geographyData?.meta?.districtCount
    const activity = summaryData?.kpis?.projectsProgrammesTotal
    const meetings = summaryData?.kpis?.meetings

    return (
        <section className="home-hero" aria-labelledby="home-hero-title">
            <HeroBackdrop />
            <div className="home-hero__inner pt-container">
                <div className="home-hero__content">
                    <span className="pt-eyebrow"><i aria-hidden="true" /> Public portal · Republic of Ghana</span>
                    <h1 id="home-hero-title">
                        Development data for <span>every district</span> in Ghana
                    </h1>
                    <p>
                        See what is being planned, delivered and assessed across Ghana's regions and districts, from national totals to local detail, in one open portal.
                    </p>
                    <div className="home-hero__actions">
                        <Link className="pt-button pt-button--primary" to={exploreHref}>
                            Explore the data
                            <svg viewBox="0 0 16 16" aria-hidden="true"><path d="M3 8h10M9 4l4 4-4 4" /></svg>
                        </Link>
                        <Link className="pt-button pt-button--secondary" to="/dpat/performance-analysis">
                            DPAT Performance
                        </Link>
                    </div>

                    <dl className="home-hero__stats">
                        <div><dt>Regions</dt><dd>{formatCount(regions, isLoading)}</dd></div>
                        <div><dt>Districts / MMDAs</dt><dd>{formatCount(districts, isLoading)}</dd></div>
                        <div><dt>Latest data</dt><dd>{year || '—'}</dd></div>
                    </dl>
                </div>

                <HeroGeoVisual
                    activity={formatCount(activity, isLoading)}
                    meetings={formatCount(meetings, isLoading)}
                    year={year}
                    regions={geographyData?.regions}
                    summariesBySlug={summariesBySlug}
                    isRegionalLoading={isRegionalLoading}
                    deliveryBySlug={deliveryBySlug}
                    isDeliveryLoading={isDeliveryLoading}
                    withYear={withYear}
                />
            </div>
        </section>
    )
}

export default Header
