import React, { useRef, useState } from 'react'
import { ComposableMap, Geographies, Geography } from 'react-simple-maps'
import { DPAT_COLORS, classificationColor, formatPercent, ordinal } from '../dpatFormat'

const MAP_URL = `${process.env.PUBLIC_URL}/data/ghana-regions.topo.json`

const normalizeName = (name = '') => name.trim().toLowerCase().replace(/\s+region$/, '').replace(/[^a-z0-9]+/g, ' ').trim()

const LOW_COLOR = [230, 235, 242]
const HIGH_COLOR = [22, 50, 90]

const scaleColor = (value, min, max) => {
    if (!Number.isFinite(value)) return '#eef2f5'
    const ratio = max === min ? 1 : (value - min) / (max - min)
    const channel = (index) => Math.round(LOW_COLOR[index] + (HIGH_COLOR[index] - LOW_COLOR[index]) * ratio)
    return `rgb(${channel(0)}, ${channel(1)}, ${channel(2)})`
}

const DpatRegionMap = ({ regions, scale, nationalAverage, onSelectRegion, selectedRegionId }) => {
    const [hoveredId, setHoveredId] = useState(null)
    const [pointer, setPointer] = useState(null)
    const canvasRef = useRef(null)
    const regionsByName = new Map(regions.map((region) => [normalizeName(region.regionName), region]))
    const hovered = regions.find((region) => region.regionId === hoveredId)
    const focus = regions.find((region) => region.regionId === (hoveredId || selectedRegionId))
    const rankedCount = regions.filter((region) => region.rank).length
    const values = regions.map((region) => region.averagePercent).filter(Number.isFinite)
    const minValue = values.length ? Math.min(...values) : 0
    const maxValue = values.length ? Math.max(...values) : 0

    const trackPointer = (event) => {
        const bounds = canvasRef.current?.getBoundingClientRect()
        if (!bounds) return
        const x = event.clientX - bounds.left
        setPointer({ x, y: event.clientY - bounds.top, flip: x > bounds.width * 0.62 })
    }

    return (
        <div className="dpat-map">
            <div className="dpat-map__status" aria-live="polite">
                {focus ? (
                    <>
                        <span>{ordinal(focus.rank)} of {rankedCount} regions</span>
                        <strong>{focus.regionName}</strong>
                        <b style={{ color: classificationColor(focus.classification, scale) }}>{formatPercent(focus.averagePercent)}</b>
                        <small>{focus.classification || 'No published results'} · {focus.assessedCount} of {focus.districtCount} districts</small>
                    </>
                ) : (
                    <>
                        <span>Hover or tap a region</span>
                        <strong>Ghana</strong>
                        <b>{formatPercent(nationalAverage)}</b>
                        <small>National average final score</small>
                    </>
                )}
            </div>
            <div className="dpat-map__canvas" ref={canvasRef} onMouseMove={trackPointer} onMouseLeave={() => setPointer(null)}>
                <ComposableMap
                    className="dpat-map__svg"
                    width={520}
                    height={620}
                    projection="geoMercator"
                    projectionConfig={{ center: [-1.1, 8.05], scale: 4500 }}
                    role="group"
                    aria-label="Map of Ghana's regions shaded by average DPAT final score"
                >
                    <Geographies geography={MAP_URL}>
                        {({ geographies }) => geographies.map((geography) => {
                            const region = regionsByName.get(normalizeName(geography.properties.name))
                            if (!region) return null
                            const fill = scaleColor(region.averagePercent, minValue, maxValue)
                            const isActive = region.regionId === selectedRegionId || region.regionId === hoveredId
                            const select = () => onSelectRegion?.(region.regionId)
                            return (
                                <Geography
                                    key={geography.rsmKey}
                                    geography={geography}
                                    role="button"
                                    tabIndex={0}
                                    aria-label={`${region.regionName}: average final score ${formatPercent(region.averagePercent)}, ${region.classification || 'no published results'}`}
                                    onMouseEnter={() => setHoveredId(region.regionId)}
                                    onMouseLeave={() => setHoveredId(null)}
                                    onFocus={() => setHoveredId(region.regionId)}
                                    onBlur={() => setHoveredId(null)}
                                    onClick={select}
                                    onKeyDown={(event) => {
                                        if (event.key !== 'Enter' && event.key !== ' ') return
                                        event.preventDefault()
                                        select()
                                    }}
                                    style={{
                                        default: { fill, stroke: isActive ? DPAT_COLORS.brass : '#ffffff', strokeWidth: isActive ? 2.6 : 1.2, outline: 'none', transition: 'fill 200ms ease' },
                                        hover: { fill, stroke: DPAT_COLORS.brass, strokeWidth: 2.6, outline: 'none', cursor: 'pointer' },
                                        pressed: { fill, stroke: DPAT_COLORS.brass, strokeWidth: 2.6, outline: 'none' },
                                    }}
                                />
                            )
                        })}
                    </Geographies>
                </ComposableMap>
                {hovered && pointer && (
                    <div
                        className={`dpat-map__tooltip${pointer.flip ? ' is-flipped' : ''}`}
                        style={{ left: pointer.x, top: pointer.y }}
                        aria-hidden="true"
                    >
                        <strong>{hovered.regionName}</strong>
                        <span>
                            <i style={{ background: classificationColor(hovered.classification, scale) }} />
                            <b>{formatPercent(hovered.averagePercent)}</b>
                            {hovered.classification && ` · ${hovered.classification}`}
                        </span>
                        {hovered.rank && <small>{ordinal(hovered.rank)} of {rankedCount} regions · click to open</small>}
                    </div>
                )}
            </div>
            <div className="dpat-map__legend" aria-label={`Average final score from ${formatPercent(minValue)} to ${formatPercent(maxValue)}`}>
                <span>{formatPercent(minValue)}</span>
                <i aria-hidden="true" style={{ background: `linear-gradient(90deg, ${scaleColor(minValue, minValue, maxValue)}, ${scaleColor(maxValue, minValue, maxValue)})` }} />
                <span>{formatPercent(maxValue)}</span>
                <small>Average final score by region</small>
            </div>
        </div>
    )
}

export default DpatRegionMap
