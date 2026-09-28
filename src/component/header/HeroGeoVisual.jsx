import React from 'react'
import { ComposableMap, Geographies, Geography } from 'react-simple-maps'
import DistrictDevelopmentImage from '../static/images/img/district-development.jpg'
import CapacityBuildingImage from '../static/images/img/capacity-building 2.jpg'
import { InfrastructureIcon } from '../shared/PortalIcons'

const MAP_URL = `${process.env.PUBLIC_URL}/data/ghana-regions.topo.json`

const HeroGeoVisual = () => (
    <div className="hero-geography" aria-hidden="true">
        <div className="hero-geography__header">
            <span>Ghana</span>
            <strong>Public development context</strong>
        </div>

        <div className="hero-geography__body">
            <div className="hero-geography__map">
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
                                fill="rgba(232, 241, 249, 0.16)"
                                stroke="rgba(255, 255, 255, 0.68)"
                                strokeWidth={0.7}
                                style={{
                                    default: { outline: 'none' },
                                    hover: { outline: 'none' },
                                    pressed: { outline: 'none' },
                                }}
                            />
                        ))}
                    </Geographies>
                </ComposableMap>

                <svg
                    className="hero-geography__connectors"
                    viewBox="0 0 430 500"
                    preserveAspectRatio="none"
                    aria-hidden="true"
                >
                    <path className="hero-geography__connector" d="M66 155 L132 155 L185 170" />
                    <path className="hero-geography__connector" d="M358 90 L318 90 L260 128" />
                    <path className="hero-geography__connector" d="M356 370 L316 370 L250 340" />

                    <g className="hero-geography__origin">
                        <circle className="hero-geography__origin-halo" cx="185" cy="170" r="8" />
                        <circle cx="185" cy="170" r="4" />
                    </g>
                    <g className="hero-geography__origin">
                        <circle className="hero-geography__origin-halo" cx="260" cy="128" r="8" />
                        <circle cx="260" cy="128" r="4" />
                    </g>
                    <g className="hero-geography__origin">
                        <circle className="hero-geography__origin-halo" cx="250" cy="340" r="8" />
                        <circle cx="250" cy="340" r="4" />
                    </g>
                </svg>

                <span className="hero-geography__callout hero-geography__callout--projects">
                    <img src={DistrictDevelopmentImage} alt="" decoding="async" />
                </span>
                <span className="hero-geography__callout hero-geography__callout--community">
                    <img src={CapacityBuildingImage} alt="" decoding="async" />
                </span>
                <span className="hero-geography__callout hero-geography__callout--infrastructure">
                    <InfrastructureIcon />
                </span>
            </div>

            <div className="hero-geography__hierarchy" aria-label="Ghana geographic scale: national, region, district or MMDA">
                <ol>
                    <li>
                        <span>01</span>
                        <strong>Ghana <small>National</small></strong>
                    </li>
                    <li>
                        <span>02</span>
                        <strong>Region</strong>
                    </li>
                    <li>
                        <span>03</span>
                        <strong>District / MMDA</strong>
                    </li>
                </ol>
            </div>
        </div>
    </div>
)

export default HeroGeoVisual
