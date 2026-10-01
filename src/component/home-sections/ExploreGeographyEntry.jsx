import React, { useMemo, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ComposableMap, Geographies, Geography } from 'react-simple-maps'
import { PublicMotionItem, PublicMotionSection } from '../shared/PublicMotion'
import './ExploreGeographyEntry.css'

const MAP_URL = `${process.env.PUBLIC_URL}/data/ghana-regions.topo.json`
const numberFormatter = new Intl.NumberFormat('en-GH')
const MAP_FILLS = ['#16325a', '#274b7d', '#3c6aa8', '#5d86bd', '#8aa4c8', '#b3c5dd']
const ARROW = <svg viewBox="0 0 16 16" aria-hidden="true"><path d="M3 8h10M9 4l4 4-4 4" /></svg>

const normalizeName = (name = '') => name.trim().toLowerCase().replace(/\s+region$/, '').replace(/[^a-z0-9]+/g, ' ').trim()

const formatCoverage = (value, isLoading) => (
    Number.isInteger(value) ? numberFormatter.format(value) : isLoading ? '…' : '—'
)

const ExploreGeographyEntry = ({ geographyData, isLoading, withYear }) => {
    const navigate = useNavigate()
    const mapRef = useRef(null)
    const [hover, setHover] = useState(null)
    const [selectedSlug, setSelectedSlug] = useState(null)
    const regionCount = geographyData?.meta.regionCount
    const districtCount = geographyData?.meta.districtCount
    const regions = useMemo(() => geographyData?.regions || [], [geographyData])
    const regionsByName = useMemo(() => new Map(regions.map((region) => [normalizeName(region.name), region])), [regions])
    const selectedRegion = regions.find((region) => region.slug === selectedSlug) || null
    const districts = useMemo(() => (
        selectedRegion
            ? (geographyData?.districts || [])
                .filter((district) => district.parentId === selectedRegion.id)
                .sort((a, b) => a.name.localeCompare(b.name))
            : []
    ), [geographyData, selectedRegion])
    const hoveredRegion = hover ? regionsByName.get(normalizeName(hover.name)) : null

    const trackPointer = (event, name) => {
        const rect = mapRef.current?.getBoundingClientRect()
        if (!rect) return
        setHover({ name, left: event.clientX - rect.left, top: event.clientY - rect.top })
    }

    const selectRegion = (region) => {
        if (!region) return
        setSelectedSlug((current) => (current === region.slug ? null : region.slug))
    }

    const steps = [
        { key: 'national', label: 'National', text: 'Totals, trends and breakdowns for the whole country.' },
        {
            key: 'region',
            label: selectedRegion ? `${selectedRegion.name} Region` : 'Region',
            text: selectedRegion
                ? `${formatCoverage(selectedRegion.districtCount ?? districts.length, false)} District / MMDA assemblies. Choose one below or open the regional overview.`
                : 'Select a region on the map to see its districts, or compare all 16 regions.',
        },
        { key: 'district', label: 'District / MMDA', text: 'Open a district profile for local projects, finances and meetings.' },
    ]

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
                        {steps.map((step, index) => (
                            <li key={step.key} className={(step.key === 'region' && selectedRegion) || (step.key === 'district' && selectedRegion) ? 'is-active' : undefined}>
                                <span aria-hidden="true">{String(index + 1).padStart(2, '0')}</span>
                                <div>
                                    <strong>{step.label}</strong>
                                    <p>{step.text}</p>
                                    {step.key === 'region' && selectedRegion && (
                                        <Link className="pt-link home-geography__step-link" to={withYear(`/explore/regions/${selectedRegion.slug}`)}>
                                            Open {selectedRegion.name} overview {ARROW}
                                        </Link>
                                    )}
                                    {step.key === 'district' && (
                                        <label className="home-geography__select">
                                            <span className="home-geography__sr">Choose a District / MMDA</span>
                                            <select
                                                value=""
                                                disabled={!selectedRegion || districts.length === 0}
                                                onChange={(event) => event.target.value && navigate(withYear(`/explore/regions/${selectedRegion.slug}/districts/${event.target.value}`))}
                                            >
                                                <option value="">
                                                    {selectedRegion
                                                        ? districts.length ? `Choose one of ${districts.length} districts in ${selectedRegion.name}` : 'District list unavailable'
                                                        : 'Select a region on the map first'}
                                                </option>
                                                {districts.map((district) => <option key={district.id} value={district.slug}>{district.name}</option>)}
                                            </select>
                                        </label>
                                    )}
                                </div>
                            </li>
                        ))}
                    </ol>

                    <div className="home-geography__actions">
                        <Link className="pt-button pt-button--primary" to={withYear('/explore/ghana')}>
                            Explore Ghana data
                            {ARROW}
                        </Link>
                        <Link className="pt-link" to={withYear('/explore')}>All geographies {ARROW}</Link>
                    </div>
                </PublicMotionItem>

                <PublicMotionItem className="home-geography__visual">
                    <div className="home-geography__map-head">
                        <strong>{selectedRegion ? `${selectedRegion.name} Region` : 'Ghana'}</strong>
                        <small>{selectedRegion ? 'Selected · pick a district on the left' : 'Hover a region to see its name, click to list its districts'}</small>
                    </div>
                    <div className="home-geography__map" ref={mapRef} onMouseLeave={() => setHover(null)}>
                        <ComposableMap
                            width={430}
                            height={500}
                            projection="geoMercator"
                            projectionConfig={{ center: [-1.1, 8.05], scale: 3700 }}
                            role="group"
                            aria-label="Map of Ghana's regions. Select a region to list its districts."
                        >
                            <Geographies geography={MAP_URL}>
                                {({ geographies }) => geographies.map((geography, index) => {
                                    const name = geography.properties.name
                                    const region = regionsByName.get(normalizeName(name))
                                    const isSelected = region && region.slug === selectedSlug
                                    const isHovered = hover?.name === name
                                    const fill = isSelected ? '#c49a3c' : isHovered ? '#e0bd6e' : MAP_FILLS[index % MAP_FILLS.length]
                                    return (
                                        <Geography
                                            key={geography.rsmKey}
                                            geography={geography}
                                            role="button"
                                            tabIndex={region ? 0 : -1}
                                            aria-label={region ? `${region.name} Region${isSelected ? ', selected' : ''}` : name}
                                            aria-pressed={Boolean(isSelected)}
                                            onMouseEnter={(event) => trackPointer(event, name)}
                                            onMouseMove={(event) => trackPointer(event, name)}
                                            onClick={() => selectRegion(region)}
                                            onKeyDown={(event) => {
                                                if (event.key === 'Enter' || event.key === ' ') {
                                                    event.preventDefault()
                                                    selectRegion(region)
                                                }
                                            }}
                                            fill={fill}
                                            stroke="#ffffff"
                                            strokeWidth={isSelected ? 2 : 1}
                                            style={{
                                                default: { outline: 'none', cursor: region ? 'pointer' : 'default' },
                                                hover: { outline: 'none', cursor: region ? 'pointer' : 'default' },
                                                pressed: { outline: 'none' },
                                            }}
                                        />
                                    )
                                })}
                            </Geographies>
                        </ComposableMap>
                        {hover && (
                            <div className="home-geography__tip" style={{ left: hover.left, top: hover.top }} aria-hidden="true">
                                <strong>{hoveredRegion?.name || hover.name}</strong>
                                {Number.isInteger(hoveredRegion?.districtCount) && <span>{hoveredRegion.districtCount} districts</span>}
                            </div>
                        )}
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
