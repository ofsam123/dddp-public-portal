import React, { useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ComposableMap, Geographies, Geography } from 'react-simple-maps'
import { CommunityIcon, InfrastructureIcon } from '../shared/PortalIcons'

const MAP_URL = `${process.env.PUBLIC_URL}/data/ghana-regions.topo.json`
const REGION_TINTS = ['#c9d6ea', '#a9bedc', '#dce5f2', '#8ea9d0', '#b9cae3', '#e6edf6']

const TIP_WIDTH = 232
const TIP_OFFSET = 16

const numberFormatter = new Intl.NumberFormat('en-GH')

const normalizeName = (name = '') => name.trim().toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim()

const HeroGeoVisual = ({
    activity,
    meetings,
    year,
    regions = [],
    summariesBySlug = new Map(),
    isRegionalLoading = false,
    withYear = (path) => path,
}) => {
    const navigate = useNavigate()
    const panelRef = useRef(null)
    const [hover, setHover] = useState(null)
    const regionsByName = useMemo(
        () => new Map(regions.map((region) => [normalizeName(region.name), region])),
        [regions],
    )

    const trackPointer = (event, geographyName) => {
        const rect = panelRef.current?.getBoundingClientRect()
        if (!rect) return
        const x = event.clientX - rect.left
        const y = event.clientY - rect.top
        const preferred = x > rect.width * 0.55 ? x - TIP_OFFSET - TIP_WIDTH : x + TIP_OFFSET
        setHover({
            name: geographyName,
            left: Math.max(8, Math.min(preferred, rect.width - TIP_WIDTH - 8)),
            top: y,
            below: y < 190,
        })
    }

    const hoveredRegion = hover ? regionsByName.get(normalizeName(hover.name)) : null
    const hoveredKpis = hoveredRegion ? summariesBySlug.get(hoveredRegion.slug)?.kpis : null
    const formatKpi = (key) => (
        Number.isInteger(hoveredKpis?.[key]) ? numberFormatter.format(hoveredKpis[key]) : isRegionalLoading ? '…' : '—'
    )

    return (
        <div className="hero-visual" aria-hidden="true">
            <div className="hero-visual__panel" ref={panelRef}>
                <div className="hero-visual__panel-head">
                    <span>Ghana</span>
                    <small>16 regions · hover to see figures</small>
                </div>
                <ComposableMap
                    className="hero-visual__map"
                    width={430}
                    height={500}
                    projection="geoMercator"
                    projectionConfig={{ center: [-1.1, 8.05], scale: 3700 }}
                    tabIndex={-1}
                    onMouseLeave={() => setHover(null)}
                >
                    <Geographies geography={MAP_URL}>
                        {({ geographies }) => geographies.map((geography, index) => {
                            const name = geography.properties.name
                            const region = regionsByName.get(normalizeName(name))
                            const isActive = hover?.name === name
                            const fill = isActive ? '#16325a' : REGION_TINTS[index % REGION_TINTS.length]

                            return (
                                <Geography
                                    key={geography.rsmKey}
                                    geography={geography}
                                    tabIndex={-1}
                                    className={isActive ? 'is-active' : undefined}
                                    onMouseEnter={(event) => trackPointer(event, name)}
                                    onMouseMove={(event) => trackPointer(event, name)}
                                    onClick={() => region && navigate(withYear(`/explore/regions/${region.slug}`))}
                                    style={{
                                        default: { fill, stroke: isActive ? '#c49a3c' : '#ffffff', strokeWidth: isActive ? 2 : 1.1, outline: 'none' },
                                        hover: { fill, stroke: '#c49a3c', strokeWidth: 2, outline: 'none', cursor: region ? 'pointer' : 'default' },
                                        pressed: { fill, stroke: '#c49a3c', strokeWidth: 2, outline: 'none' },
                                    }}
                                />
                            )
                        })}
                    </Geographies>
                </ComposableMap>
                <ol className="hero-visual__path">
                    <li>Ghana</li>
                    <li>Region</li>
                    <li>District / MMDA</li>
                </ol>

                {hover && (
                    <div
                        className={`hero-map-tip${hover.below ? ' is-below' : ''}`}
                        style={{ left: hover.left, top: hover.top, width: TIP_WIDTH }}
                    >
                        <strong className="hero-map-tip__title">{hoveredRegion?.name || hover.name} Region</strong>
                        <div className="hero-map-tip__total">
                            <span>Projects &amp; programmes</span>
                            <b>{formatKpi('projectsProgrammesTotal')}</b>
                        </div>
                        <dl className="hero-map-tip__rows">
                            <div><dt><i className="is-navy" />Projects</dt><dd>{formatKpi('projects')}</dd></div>
                            <div><dt><i className="is-gold" />Programmes</dt><dd>{formatKpi('programmes')}</dd></div>
                            <div><dt><i className="is-green" />Meetings</dt><dd>{formatKpi('meetings')}</dd></div>
                        </dl>
                        <small className="hero-map-tip__foot">
                            {!hoveredKpis && !isRegionalLoading
                                ? `${year ? `${year} d` : 'D'}ata unavailable`
                                : `${year || ''}${year ? ' · ' : ''}Click to explore`}
                        </small>
                    </div>
                )}
            </div>

            <div className="hero-visual__card hero-visual__card--activity">
                <span className="hero-visual__icon pt-icon"><InfrastructureIcon /></span>
                <div>
                    <small>Projects &amp; programmes{year ? ` · ${year}` : ''}</small>
                    <strong>{activity}</strong>
                </div>
            </div>

            <div className="hero-visual__card hero-visual__card--meetings">
                <span className="hero-visual__icon hero-visual__icon--gold pt-icon"><CommunityIcon /></span>
                <div>
                    <small>Meetings recorded</small>
                    <strong>{meetings}</strong>
                </div>
            </div>
        </div>
    )
}

export default HeroGeoVisual
