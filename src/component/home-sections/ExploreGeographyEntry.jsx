import React from 'react'
import { Link } from 'react-router-dom'
import { ComposableMap, Geographies, Geography } from 'react-simple-maps'
import { PublicMotionItem, PublicMotionSection } from '../shared/PublicMotion'
import './ExploreGeographyEntry.css'

const MAP_URL = `${process.env.PUBLIC_URL}/data/ghana-regions.topo.json`
const numberFormatter = new Intl.NumberFormat('en-GH')
const MAP_FILLS = ['#16325a', '#274b7d', '#3c6aa8', '#5d86bd', '#8aa4c8', '#b3c5dd']

const PATH_STEPS = [
    { label: 'National', text: 'Totals, trends and breakdowns for the whole country.' },
    { label: 'Region', text: 'Compare the 16 regions and see where activity is concentrated.' },
    { label: 'District / MMDA', text: 'Open a district profile for local projects and meetings.' },
]

const formatCoverage = (value, isLoading) => (
    Number.isInteger(value) ? numberFormatter.format(value) : isLoading ? '…' : '—'
)

const ExploreGeographyEntry = ({ geographyData, isLoading, withYear }) => {
    const regionCount = geographyData?.meta.regionCount
    const districtCount = geographyData?.meta.districtCount

    return (
        <PublicMotionSection className="pt-section home-geography" aria-labelledby="home-geography-title">
            <div className="pt-container home-geography__inner">
                <PublicMotionItem className="home-geography__content">
                    <span className="section-kicker">Explore by geography</span>
                    <h2 id="home-geography-title">Start national, then go local</h2>
                    <p>
                        Follow development activity from the national picture down to each Region and District / MMDA, using the same live public data.
                    </p>

                    <ol className="home-geography__path" aria-label="Geographic exploration path">
                        {PATH_STEPS.map((step, index) => (
                            <li key={step.label}>
                                <span aria-hidden="true">{String(index + 1).padStart(2, '0')}</span>
                                <div>
                                    <strong>{step.label}</strong>
                                    <p>{step.text}</p>
                                </div>
                            </li>
                        ))}
                    </ol>

                    <div className="home-geography__actions">
                        <Link className="pt-button pt-button--primary" to={withYear('/explore/ghana')}>
                            Explore Ghana data
                            <svg viewBox="0 0 16 16" aria-hidden="true"><path d="M3 8h10M9 4l4 4-4 4" /></svg>
                        </Link>
                        <Link className="pt-link" to={withYear('/explore')}>All geographies <svg viewBox="0 0 16 16" aria-hidden="true"><path d="M3 8h10M9 4l4 4-4 4" /></svg></Link>
                    </div>
                </PublicMotionItem>

                <PublicMotionItem className="home-geography__visual">
                    <div className="home-geography__map" aria-hidden="true">
                        <ComposableMap
                            width={430}
                            height={500}
                            projection="geoMercator"
                            projectionConfig={{ center: [-1.1, 8.05], scale: 3700 }}
                            tabIndex={-1}
                        >
                            <Geographies geography={MAP_URL}>
                                {({ geographies }) => geographies.map((geography, index) => (
                                    <Geography
                                        key={geography.rsmKey}
                                        geography={geography}
                                        tabIndex={-1}
                                        fill={MAP_FILLS[index % MAP_FILLS.length]}
                                        stroke="#ffffff"
                                        strokeWidth={1}
                                        style={{
                                            default: { outline: 'none' },
                                            hover: { outline: 'none', fill: '#c49a3c' },
                                            pressed: { outline: 'none' },
                                        }}
                                    />
                                ))}
                            </Geographies>
                        </ComposableMap>
                    </div>
                    <dl className="home-geography__coverage" aria-label="Public geography coverage">
                        <div>
                            <dt>Regions</dt>
                            <dd>{formatCoverage(regionCount, isLoading)}</dd>
                        </div>
                        <div>
                            <dt>Districts / MMDAs</dt>
                            <dd>{formatCoverage(districtCount, isLoading)}</dd>
                        </div>
                    </dl>
                </PublicMotionItem>
            </div>
        </PublicMotionSection>
    )
}

export default ExploreGeographyEntry
