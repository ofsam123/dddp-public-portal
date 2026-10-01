import React, { useMemo, useState } from 'react'
import { ComposableMap, Geographies, Geography, Marker } from 'react-simple-maps'
import { Image } from 'antd'
import { climatePhotoUrl } from '../service/climate.service'
import {
    MONTH_NAMES,
    RAINY_SEASONS,
    RISK_LEVELS,
    formatDate,
    formatNumber,
    placeLabel,
    regionBreakdown,
    regionKey,
    topPlaces,
    typeLevelMatrix,
} from './climateData'

const MAP_URL = `${process.env.PUBLIC_URL}/data/ghana-regions.topo.json`
const LEVEL_COLORS = Object.fromEntries(RISK_LEVELS.map((level) => [level.key, level.color]))
const NO_LEVEL_COLOR = '#8a97a8'
const LOW_FILL = [233, 239, 246]
const HIGH_FILL = [91, 124, 171]

const MAP_WIDTH = 640
const MAP_HEIGHT = 500
const GHANA_EXTENT = [[-3.3, 4.7], [1.2, 11.2]]

const mercatorY = (lat) => Math.log(Math.tan(Math.PI / 4 + (lat * Math.PI) / 360))
const inverseMercatorY = (y) => (Math.atan(Math.sinh(y)) * 180) / Math.PI

// Fits the projection to the recorded points so clustered southern events stay legible.
const fitProjection = (coordinates) => {
    const [[minLng, minLat], [maxLng, maxLat]] = coordinates.length
        ? coordinates.reduce(([[a, b], [c, d]], [lng, lat]) => [[Math.min(a, lng), Math.min(b, lat)], [Math.max(c, lng), Math.max(d, lat)]], [[Infinity, Infinity], [-Infinity, -Infinity]])
        : GHANA_EXTENT
    const midLng = (minLng + maxLng) / 2
    const lngSpan = Math.max(maxLng - minLng, 2.4)
    const yMin = mercatorY(minLat)
    const yMax = mercatorY(maxLat)
    const ySpan = Math.max(yMax - yMin, (2.4 * Math.PI) / 180)
    const padding = 0.82
    const scale = Math.min((MAP_WIDTH * padding) / ((lngSpan * Math.PI) / 180), (MAP_HEIGHT * padding) / ySpan)
    return { center: [midLng, inverseMercatorY((yMin + yMax) / 2)], scale: Math.min(Math.max(scale, 3200), 12000) }
}

const withAlpha = (hex, alpha) => {
    const value = parseInt(hex.slice(1), 16)
    return `rgba(${(value >> 16) & 255}, ${(value >> 8) & 255}, ${value & 255}, ${alpha.toFixed(2)})`
}

const regionFill = (value, max) => {
    if (!value) return '#f3f5f8'
    const ratio = max ? value / max : 0
    const channel = (index) => Math.round(LOW_FILL[index] + (HIGH_FILL[index] - LOW_FILL[index]) * ratio)
    return `rgb(${channel(0)}, ${channel(1)}, ${channel(2)})`
}

export const scopeForPlace = (place) => (place.isDistrictWide
    ? { regionId: place.regionId, districtId: place.districtId }
    : { regionId: place.regionId, districtId: place.districtId, communityId: place.id })

export const KeyFindings = ({ findings }) => (
    <ul className="cc-findings">
        {findings.map((item) => (
            <li key={item.key}>
                <span>{item.label}</span>
                <strong>{item.value}</strong>
                <p>{item.detail}</p>
            </li>
        ))}
    </ul>
)

export const ClimateMap = ({ rows, scope, onScope }) => {
    const [hover, setHover] = useState(null)
    const regions = useMemo(() => regionBreakdown(rows), [rows])
    const regionsByKey = useMemo(() => new Map(regions.map((region) => [regionKey(region.name), region])), [regions])
    const max = Math.max(1, ...regions.map((region) => region.records))
    const points = useMemo(() => {
        const order = { Low: 0, Medium: 1, High: 2 }
        return rows.filter((row) => row.coordinates).sort((a, b) => (order[a.riskLevel] ?? -1) - (order[b.riskLevel] ?? -1))
    }, [rows])
    const projectionConfig = useMemo(() => fitProjection(points.map((row) => row.coordinates)), [points])

    return (
        <div className="cc-map">
            <div className="cc-map__canvas">
                <ComposableMap
                    width={MAP_WIDTH}
                    height={MAP_HEIGHT}
                    projection="geoMercator"
                    projectionConfig={projectionConfig}
                    aria-label="Map of Ghana showing where climate events were recorded"
                >
                    <Geographies geography={MAP_URL}>
                        {({ geographies }) => geographies.map((geography) => {
                            const region = regionsByKey.get(regionKey(geography.properties.name))
                            const isActive = region && scope.regionId === region.id
                            const fill = regionFill(region?.records, max)
                            const style = {
                                fill,
                                stroke: isActive ? '#c49a3c' : '#ffffff',
                                strokeWidth: isActive ? 2.6 : 1,
                                outline: 'none',
                            }
                            return (
                                <Geography
                                    key={geography.rsmKey}
                                    geography={geography}
                                    tabIndex={region ? 0 : -1}
                                    role={region ? 'button' : undefined}
                                    aria-label={region ? `${region.name}: ${region.records} records. Show these records.` : `${geography.properties.name} Region: no records`}
                                    onMouseEnter={() => setHover({ kind: 'region', name: `${geography.properties.name} Region`, region })}
                                    onMouseLeave={() => setHover(null)}
                                    onClick={() => region && onScope({ regionId: region.id })}
                                    onKeyDown={(event) => {
                                        if (region && (event.key === 'Enter' || event.key === ' ')) {
                                            event.preventDefault()
                                            onScope({ regionId: region.id })
                                        }
                                    }}
                                    style={{
                                        default: style,
                                        hover: { ...style, stroke: region ? '#c49a3c' : '#ffffff', strokeWidth: region ? 2.2 : 1, cursor: region ? 'pointer' : 'default' },
                                        pressed: style,
                                    }}
                                />
                            )
                        })}
                    </Geographies>
                    {points.map((row) => (
                        <Marker key={row.id} coordinates={row.coordinates}>
                            <circle
                                className="cc-map__point"
                                r={row.riskLevel === 'High' ? 5 : 4}
                                fill={LEVEL_COLORS[row.riskLevel] || NO_LEVEL_COLOR}
                                onMouseEnter={() => setHover({ kind: 'record', row })}
                                onMouseLeave={() => setHover(null)}
                                onClick={() => onScope(scopeForPlace(row.place))}
                            >
                                <title>{`${row.title} — ${placeLabel(row.place)}, ${formatDate(row.date)}`}</title>
                            </circle>
                        </Marker>
                    ))}
                </ComposableMap>
            </div>

            <div className="cc-map__side">
                <div className="cc-map__status" aria-live="polite">
                    {hover?.kind === 'record' ? (
                        <>
                            <span>{hover.row.type} · {hover.row.riskLevel ? `${hover.row.riskLevel} risk` : 'Risk level not given'}</span>
                            <strong>{hover.row.title}</strong>
                            <p>{placeLabel(hover.row.place)}, {hover.row.place.regionName} · {formatDate(hover.row.date)}</p>
                        </>
                    ) : hover?.kind === 'region' ? (
                        <>
                            <span>Region</span>
                            <strong>{hover.name}</strong>
                            <p>{hover.region ? `${hover.region.records} records · ${hover.region.communities} communities · mostly ${hover.region.topType?.toLowerCase()}` : 'No climate records yet'}</p>
                        </>
                    ) : (
                        <>
                            <span>How to read the map</span>
                            <strong>{formatNumber(points.length)} mapped events</strong>
                            <p>Darker regions have more records. Each dot is an event with a recorded location. Select a region or dot to see its records.</p>
                        </>
                    )}
                </div>

                <ul className="cc-map__legend">
                    {RISK_LEVELS.map((level) => <li key={level.key}><i style={{ background: level.color }} />{level.key} risk</li>)}
                    <li><i style={{ background: NO_LEVEL_COLOR }} />Not given</li>
                </ul>

                <table className="cc-regions">
                    <caption className="cc-visually-hidden">Climate records by region</caption>
                    <thead>
                        <tr>
                            <th scope="col">Region</th>
                            <th scope="col">Records</th>
                            <th scope="col">High risk</th>
                            <th scope="col">Main risk</th>
                        </tr>
                    </thead>
                    <tbody>
                        {regions.map((region) => (
                            <tr key={region.id} className={scope.regionId === region.id ? 'is-active' : ''}>
                                <th scope="row">
                                    <button type="button" onClick={() => onScope({ regionId: region.id })}>{region.name.replace(/\s+Region$/i, '')}</button>
                                </th>
                                <td>
                                    <span className="cc-regions__bar"><i style={{ width: `${(region.records / max) * 100}%` }} /></span>
                                    {region.records}
                                </td>
                                <td>{Math.round((region.high / region.records) * 100)}%</td>
                                <td>{region.topType}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                <p className="cc-map__note">{formatNumber(rows.length - points.length)} records have no usable location and appear in the table and list only.</p>
            </div>
        </div>
    )
}

export const SeasonPanel = ({ summary }) => {
    const max = Math.max(1, ...summary.months.map((item) => item.total))
    const peak = [...summary.months].sort((a, b) => b.total - a.total)[0]
    const seasonOf = (month) => RAINY_SEASONS.find((season) => season.months.includes(month))
    return (
        <article className="cc-panel cc-season">
            <h3>When events happen</h3>
            <p className="cc-panel__sub">
                Records by month of the year{peak?.total ? `, peaking in ${MONTH_NAMES[peak.month - 1]}` : ''}
            </p>
            <div className="cc-season__chart">
                {summary.months.map((item) => {
                    const season = seasonOf(item.month)
                    return (
                        <div key={item.month} className={`cc-season__month${season ? ` is-${season.key}` : ''}`} title={`${MONTH_NAMES[item.month - 1]}: ${item.total} records`}>
                            <span className="cc-season__value">{item.total || ''}</span>
                            <span className="cc-season__bar" style={{ height: `${item.total ? Math.max(4, (item.total / max) * 100) : 0}%` }} />
                            <span className="cc-season__label">{item.label.charAt(0)}</span>
                        </div>
                    )
                })}
            </div>
            <ul className="cc-season__legend">
                {RAINY_SEASONS.map((season) => (
                    <li key={season.key} className={`is-${season.key}`}><i />{season.label} ({MONTH_NAMES[season.months[0] - 1].slice(0, 3)}–{MONTH_NAMES[season.months[season.months.length - 1] - 1].slice(0, 3)})</li>
                ))}
            </ul>
            <p className="cc-panel__foot">Shaded months mark the two rainy seasons of southern and middle Ghana.</p>
        </article>
    )
}

export const MatrixPanel = ({ rows }) => {
    const matrix = useMemo(() => typeLevelMatrix(rows), [rows])
    return (
        <article className="cc-panel cc-matrix">
            <h3>How serious each risk is</h3>
            <p className="cc-panel__sub">Records by climate risk and risk level</p>
            <div className="cc-matrix__wrap">
                <table>
                    <thead>
                        <tr>
                            <th scope="col">Climate risk</th>
                            {matrix.columns.map((level) => <th scope="col" key={level || 'none'}>{level || 'Not given'}</th>)}
                            <th scope="col">Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        {matrix.types.map((type) => (
                            <tr key={type.name}>
                                <th scope="row">{type.name}</th>
                                {type.cells.map((cell) => {
                                    const color = LEVEL_COLORS[cell.level] || NO_LEVEL_COLOR
                                    const alpha = cell.total ? 0.12 + (cell.total / matrix.max) * 0.7 : 0
                                    return (
                                        <td key={cell.level || 'none'}>
                                            <span
                                                className="cc-matrix__cell"
                                                style={{
                                                    background: cell.total ? withAlpha(color, alpha) : 'transparent',
                                                    color: alpha > 0.5 ? '#fff' : 'var(--pt-ink)',
                                                }}
                                            >
                                                {cell.total || '·'}
                                            </span>
                                        </td>
                                    )
                                })}
                                <td className="cc-matrix__total">{type.total}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </article>
    )
}

export const TopPlaces = ({ rows, onScope }) => {
    const places = useMemo(() => topPlaces(rows, 8), [rows])
    return (
        <article className="cc-panel cc-places">
            <h3>Places with the most records</h3>
            <p className="cc-panel__sub">Communities and district-wide entries, ranked by number of events</p>
            <ol>
                {places.map((item, index) => (
                    <li key={item.key}>
                        <span className="cc-places__rank">{index + 1}</span>
                        <button type="button" onClick={() => onScope(scopeForPlace(item.place))}>
                            <strong>{item.name}{item.place.isDistrictWide ? <small> district-wide</small> : null}</strong>
                            <span>{item.place.isDistrictWide ? item.place.regionName : `${item.place.districtLabel}, ${item.place.regionName}`}</span>
                        </button>
                        <dl>
                            <div><dt>Records</dt><dd>{item.records}</dd></div>
                            <div><dt>Main risk</dt><dd>{item.topType}</dd></div>
                            <div><dt>People affected</dt><dd>{item.affected ? formatNumber(item.affected) : '—'}</dd></div>
                        </dl>
                    </li>
                ))}
            </ol>
        </article>
    )
}

export const FieldGallery = ({ rows, onScope }) => {
    const items = useMemo(() => rows.filter((row) => row.photos.length).slice(0, 8), [rows])
    if (!items.length) return null
    return (
        <div className="cc-gallery">
            <Image.PreviewGroup>
                {items.map((row) => (
                    <figure key={row.id}>
                        <Image
                            src={climatePhotoUrl(row.id, row.photos[0])}
                            alt={`${row.title}, ${placeLabel(row.place)}`}
                            loading="lazy"
                            fallback="data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='320' height='220'><rect width='320' height='220' fill='%23eff3f9'/></svg>"
                        />
                        <figcaption>
                            <span>{row.type} · {formatDate(row.date)}</span>
                            <button type="button" onClick={() => onScope(scopeForPlace(row.place))}>{row.title}</button>
                            <small>{placeLabel(row.place)}, {row.place.regionName}</small>
                        </figcaption>
                    </figure>
                ))}
            </Image.PreviewGroup>
        </div>
    )
}
