import React from 'react'
import { ComposableMap, Geographies, Geography } from 'react-simple-maps'
import { useNavigate } from 'react-router-dom'
import { getSharePercent, PUBLIC_INDICATORS } from '../services/regionalInsights'

const MAP_URL = `${process.env.PUBLIC_URL}/data/ghana-regions.topo.json`

const normalizeRegionName = (name = '') => name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()

const numberFormatter = new Intl.NumberFormat('en-GH')
const percentFormatter = new Intl.NumberFormat('en-GH', { maximumFractionDigits: 1 })
const LOW_COLOR = [231, 238, 244]
const HIGH_COLOR = [22, 50, 90]

const getScaleColor = (value, min, max) => {
    if (!Number.isFinite(value)) return '#eef2f5'
    const ratio = max === min ? 1 : (value - min) / (max - min)
    const channel = (index) => Math.round(LOW_COLOR[index] + ((HIGH_COLOR[index] - LOW_COLOR[index]) * ratio))
    return `rgb(${channel(0)}, ${channel(1)}, ${channel(2)})`
}

const PublicGeoMap = ({
    regions,
    activeRegionSlug,
    onActiveRegionChange,
    summariesBySlug = new Map(),
    summariesLoading = false,
    summaryYear,
    nationalSummary,
    indicatorKey,
    indicators = PUBLIC_INDICATORS,
    onIndicatorChange,
    withYear = (path) => path,
}) => {
    const navigate = useNavigate()
    const regionsByName = new Map(regions.map((region) => [normalizeRegionName(region.name), region]))
    const activeRegion = regions.find((region) => region.slug === activeRegionSlug)
    const activeSummary = activeRegion ? summariesBySlug.get(activeRegion.slug) : null
    const indicator = indicators.find((item) => item.key === indicatorKey) || indicators[0]
    const values = regions
        .map((region) => summariesBySlug.get(region.slug)?.kpis?.[indicator.key])
        .filter(Number.isFinite)
    const minValue = values.length > 0 ? Math.min(...values) : 0
    const maxValue = values.length > 0 ? Math.max(...values) : 0
    const activeValue = activeSummary?.kpis?.[indicator.key]
    const activeShare = getSharePercent(activeValue, nationalSummary?.kpis?.[indicator.key])

    const openRegion = (region) => {
        navigate(withYear(`/explore/regions/${region.slug}`))
    }

    const handleKeyDown = (event, region) => {
        if (event.key !== 'Enter' && event.key !== ' ') return
        event.preventDefault()
        openRegion(region)
    }

    return (
        <div className="public-geo-map" aria-labelledby="ghana-region-map-title">
            <div className="public-geo-map__heading">
                <div>
                    <span className="section-kicker">Regional map</span>
                    <h3 id="ghana-region-map-title">Ghana's 16 regions</h3>
                    {indicators.length > 1 && <div className="public-geo-map__indicators" aria-label="Projects and programmes view">
                        {indicators.map((item) => (
                            <button
                                type="button"
                                className={indicator.key === item.key ? 'is-active' : ''}
                                aria-pressed={indicator.key === item.key}
                                onClick={() => onIndicatorChange(item.key)}
                                key={item.key}
                            >
                                {item.label}
                            </button>
                        ))}
                    </div>}
                </div>
                <div className="public-geo-map__status" aria-live="polite">
                    <strong>{activeRegion ? activeRegion.name : 'Select a region'}</strong>
                    {activeRegion && Number.isInteger(activeValue) && (
                        <div className="public-geo-map__selected-value">
                            <span>{indicator.label}</span>
                            <b>{numberFormatter.format(activeValue)}</b>
                            {activeShare !== null && <small>{percentFormatter.format(activeShare)}% of Ghana total</small>}
                        </div>
                    )}
                    {activeRegion && !Number.isInteger(activeValue) && (
                        <span>{summariesLoading ? `Loading ${summaryYear} data` : `${summaryYear} data unavailable`}</span>
                    )}
                </div>
            </div>

            <ComposableMap
                className="public-geo-map__svg"
                width={520}
                height={620}
                projection="geoMercator"
                projectionConfig={{ center: [-1.1, 8.05], scale: 4500 }}
                role="group"
                aria-label="Interactive map of Ghana's regions"
            >
                <Geographies geography={MAP_URL}>
                    {({ geographies }) => geographies.map((geography) => {
                        const region = regionsByName.get(normalizeRegionName(geography.properties.name))
                        if (!region) return null

                        const isActive = activeRegionSlug === region.slug
                        const value = summariesBySlug.get(region.slug)?.kpis?.[indicator.key]
                        const fill = getScaleColor(value, minValue, maxValue)
                        const share = getSharePercent(value, nationalSummary?.kpis?.[indicator.key])

                        return (
                            <Geography
                                key={geography.rsmKey}
                                geography={geography}
                                role="link"
                                tabIndex={0}
                                aria-label={Number.isInteger(value)
                                    ? `Explore ${region.name} Region. ${numberFormatter.format(value)} ${indicator.label.toLowerCase()} in ${summaryYear}${share !== null ? `, ${percentFormatter.format(share)} percent of the Ghana total` : ''}.`
                                    : `Explore ${region.name} Region`}
                                onMouseEnter={() => onActiveRegionChange(region.slug)}
                                onMouseLeave={() => onActiveRegionChange(null)}
                                onFocus={() => onActiveRegionChange(region.slug)}
                                onBlur={() => onActiveRegionChange(null)}
                                onClick={() => openRegion(region)}
                                onKeyDown={(event) => handleKeyDown(event, region)}
                                style={{
                                    default: {
                                        fill,
                                        stroke: isActive ? '#c49a2c' : '#ffffff',
                                        strokeWidth: isActive ? 2.8 : 1,
                                        outline: 'none',
                                    },
                                    hover: {
                                        fill,
                                        stroke: '#c49a2c',
                                        strokeWidth: 2.8,
                                        outline: 'none',
                                        cursor: 'pointer',
                                    },
                                    pressed: {
                                        fill,
                                        stroke: '#c49a2c',
                                        strokeWidth: 2.8,
                                        outline: 'none',
                                    },
                                }}
                            />
                        )
                    })}
                </Geographies>
            </ComposableMap>

            <div className="public-geo-map__legend" aria-label={`${indicator.label} map scale from ${minValue} to ${maxValue}`}>
                <span>Fewer</span>
                <div aria-hidden="true" />
                <span>More</span>
                <small>{numberFormatter.format(minValue)}</small>
                <small>{indicator.label}, {summaryYear}</small>
                <small>{numberFormatter.format(maxValue)}</small>
            </div>
        </div>
    )
}

export default PublicGeoMap
