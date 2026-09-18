import React from 'react'
import { Link } from 'react-router-dom'
import { ComposableMap, Geographies, Geography } from 'react-simple-maps'
import { PublicMotionItem, PublicMotionSection } from '../shared/PublicMotion'
import './ExploreGeographyEntry.css'

const MAP_URL = `${process.env.PUBLIC_URL}/data/ghana-regions.topo.json`
const numberFormatter = new Intl.NumberFormat('en-GH')

const CoverageValue = ({ label, value, isLoading }) => (
    <div>
        <strong>{Number.isInteger(value) ? numberFormatter.format(value) : isLoading ? 'Loading' : 'Unavailable'}</strong>
        <span>{label}</span>
    </div>
)

const ExploreGeographyEntry = ({ geographyData, isLoading, withYear }) => {
    const regionCount = geographyData?.meta.regionCount
    const districtCount = geographyData?.meta.districtCount

    return (
        <PublicMotionSection className="home-geography" aria-labelledby="home-geography-title">
            <div className="home-geography__inner">
                <PublicMotionItem className="home-geography__content">
                    <span className="section-kicker">Explore by geography</span>
                    <h2 id="home-geography-title">See development activity across Ghana.</h2>
                    <p>
                        Move from the national picture into live public activity by Region and District/MMDA.
                    </p>

                    <div className="home-geography__coverage" aria-label="Public geography coverage">
                        <CoverageValue label="Regions" value={regionCount} isLoading={isLoading} />
                        <CoverageValue label="Districts / MMDAs" value={districtCount} isLoading={isLoading} />
                    </div>

                    <ol className="home-geography__path" aria-label="Geographic exploration path">
                        <li><span>01</span><strong>National</strong></li>
                        <li><span>02</span><strong>Region</strong></li>
                        <li><span>03</span><strong>District / MMDA</strong></li>
                    </ol>

                    <Link className="home-geography__link" to={withYear('/explore/ghana')}>
                        Explore Ghana data <span aria-hidden="true">-&gt;</span>
                    </Link>
                </PublicMotionItem>

                <PublicMotionItem className="home-geography__visual" aria-hidden="true">
                    <span>Ghana</span>
                    <ComposableMap
                        width={430}
                        height={500}
                        projection="geoMercator"
                        projectionConfig={{ center: [-1.1, 8.05], scale: 3700 }}
                        tabIndex={-1}
                    >
                        <Geographies geography={MAP_URL}>
                            {({ geographies }) => geographies.map((geography) => (
                                <Geography
                                    key={geography.rsmKey}
                                    geography={geography}
                                    tabIndex={-1}
                                    fill="#dce7f0"
                                    stroke="#ffffff"
                                    strokeWidth={0.8}
                                    style={{
                                        default: { outline: 'none' },
                                        hover: { outline: 'none' },
                                        pressed: { outline: 'none' },
                                    }}
                                />
                            ))}
                        </Geographies>
                    </ComposableMap>
                    <small>Geographic orientation</small>
                </PublicMotionItem>
            </div>
        </PublicMotionSection>
    )
}

export default ExploreGeographyEntry
