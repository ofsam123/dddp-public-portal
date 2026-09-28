import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { formatPercent } from '../dpatFormat'

const clampPercent = (value) => Math.max(0, Math.min(100, Number.isFinite(value) ? value : 0))

const niceMax = (value) => {
    if (!Number.isFinite(value) || value <= 0) return 1
    const magnitude = 10 ** Math.floor(Math.log10(value))
    const step = [1, 2, 2.5, 5, 10].find((candidate) => candidate * magnitude >= value)
    return step * magnitude
}

export const ScoreGauge = ({ percent, color, label, benchmark, benchmarkLabel = 'National average' }) => {
    const value = clampPercent(percent)
    const markerAngle = Math.PI * (1 - clampPercent(benchmark) / 100)
    const point = (radius) => [110 + radius * Math.cos(markerAngle), 112 - radius * Math.sin(markerAngle)]
    const [innerX, innerY] = point(70)
    const [outerX, outerY] = point(106)

    return (
        <figure className="dpat-gauge">
            <svg viewBox="0 0 220 138" role="img" aria-label={`Final score ${formatPercent(percent)}${label ? `, ${label}` : ''}${Number.isFinite(benchmark) ? `. ${benchmarkLabel} ${formatPercent(benchmark)}` : ''}`}>
                <path d="M 22 112 A 88 88 0 0 1 198 112" className="dpat-gauge__track" pathLength="100" />
                <path
                    d="M 22 112 A 88 88 0 0 1 198 112"
                    className="dpat-gauge__value"
                    pathLength="100"
                    style={{ stroke: color, strokeDasharray: `${value} 100` }}
                />
                {Number.isFinite(benchmark) && (
                    <line x1={innerX} y1={innerY} x2={outerX} y2={outerY} className="dpat-gauge__marker" />
                )}
                <text x="110" y="96" className="dpat-gauge__number">{formatPercent(percent)}</text>
                {label && <text x="110" y="118" className="dpat-gauge__label" style={{ fill: color }}>{label}</text>}
                <text x="22" y="132" className="dpat-gauge__axis">0</text>
                <text x="198" y="132" className="dpat-gauge__axis">100</text>
            </svg>
            {Number.isFinite(benchmark) && (
                <figcaption><i aria-hidden="true" /> {benchmarkLabel}: {formatPercent(benchmark)}</figcaption>
            )}
        </figure>
    )
}

export const DonutChart = ({ segments, centerValue, centerLabel, ariaLabel }) => {
    const total = segments.reduce((sum, segment) => sum + segment.value, 0)
    let offset = 0

    return (
        <div className="dpat-donut">
            <svg viewBox="0 0 200 200" role="img" aria-label={ariaLabel}>
                <circle cx="100" cy="100" r="74" className="dpat-donut__track" />
                {total > 0 && segments.map((segment) => {
                    const share = (segment.value / total) * 100
                    const visible = share > 0.6 ? share - 0.6 : share
                    const element = (
                        <circle
                            key={segment.label}
                            cx="100"
                            cy="100"
                            r="74"
                            pathLength="100"
                            className="dpat-donut__segment"
                            style={{ stroke: segment.color, strokeDasharray: `${visible} ${100 - visible}`, strokeDashoffset: -offset }}
                            transform="rotate(-90 100 100)"
                        >
                            <title>{`${segment.label}: ${segment.value}`}</title>
                        </circle>
                    )
                    offset += share
                    return element
                })}
                <text x="100" y="98" className="dpat-donut__value">{centerValue}</text>
                <text x="100" y="120" className="dpat-donut__label">{centerLabel}</text>
            </svg>
            <ul className="dpat-legend">
                {segments.map((segment) => (
                    <li key={segment.label}>
                        <i style={{ background: segment.color }} aria-hidden="true" />
                        <span>{segment.label}{segment.hint && <small>{segment.hint}</small>}</span>
                        <b>{segment.value}</b>
                        <em>{total ? formatPercent((segment.value / total) * 100, 0) : '—'}</em>
                    </li>
                ))}
            </ul>
        </div>
    )
}

export const ColumnChart = ({ bins, markers = [], ariaLabel, xLabel, yLabel }) => {
    const width = 640
    const height = 270
    const pad = { top: 34, right: 12, bottom: 46, left: 40 }
    const innerWidth = width - pad.left - pad.right
    const innerHeight = height - pad.top - pad.bottom
    const maxValue = niceMax(Math.max(0, ...bins.map((bin) => bin.value)))
    const slot = innerWidth / Math.max(bins.length, 1)
    const barWidth = slot * 0.7
    const ticks = [0, 0.25, 0.5, 0.75, 1].map((ratio) => Math.round(maxValue * ratio * 10) / 10)

    return (
        <svg className="dpat-columns" viewBox={`0 0 ${width} ${height}`} role="img" aria-label={ariaLabel}>
            {ticks.map((tick) => {
                const y = pad.top + innerHeight - (tick / maxValue) * innerHeight
                return (
                    <g key={tick}>
                        <line x1={pad.left} x2={width - pad.right} y1={y} y2={y} className="dpat-columns__grid" />
                        <text x={pad.left - 8} y={y + 4} className="dpat-columns__tick" textAnchor="end">{tick}</text>
                    </g>
                )
            })}
            {bins.map((bin, index) => {
                const barHeight = (bin.value / maxValue) * innerHeight
                const x = pad.left + index * slot + (slot - barWidth) / 2
                const y = pad.top + innerHeight - barHeight
                return (
                    <g key={bin.key}>
                        <rect x={x} y={y} width={barWidth} height={Math.max(barHeight, bin.value > 0 ? 2 : 0)} rx="3" style={{ fill: bin.color }}>
                            <title>{bin.title || `${bin.label}: ${bin.value}`}</title>
                        </rect>
                        {bin.value > 0 && <text x={x + barWidth / 2} y={y - 6} className="dpat-columns__value" textAnchor="middle">{bin.value}</text>}
                        <text x={x + barWidth / 2} y={height - pad.bottom + 18} className="dpat-columns__label" textAnchor="middle">{bin.label}</text>
                    </g>
                )
            })}
            {markers.map((marker) => {
                const x = pad.left + clampPercent(marker.position * 100) / 100 * innerWidth
                const hasNeighbourRight = markers.some((other) => other !== marker && other.position >= marker.position && other.position - marker.position < 0.3)
                const hasNeighbourLeft = markers.some((other) => other !== marker && other.position < marker.position && marker.position - other.position < 0.3)
                const anchor = hasNeighbourRight ? 'end' : hasNeighbourLeft ? 'start' : marker.position > 0.8 ? 'end' : marker.position < 0.2 ? 'start' : 'middle'
                const offset = anchor === 'end' ? -5 : anchor === 'start' ? 5 : 0
                return (
                    <g key={marker.label} className="dpat-columns__marker" style={{ color: marker.color }}>
                        <line x1={x} x2={x} y1={pad.top - 10} y2={pad.top + innerHeight} />
                        <text x={x + offset} y={pad.top - 14} textAnchor={anchor}>{marker.label}</text>
                    </g>
                )
            })}
            {xLabel && <text x={pad.left + innerWidth / 2} y={height - 6} className="dpat-columns__axis-label" textAnchor="middle">{xLabel}</text>}
            {yLabel && <text x={12} y={pad.top + innerHeight / 2} className="dpat-columns__axis-label" textAnchor="middle" transform={`rotate(-90 12 ${pad.top + innerHeight / 2})`}>{yLabel}</text>}
        </svg>
    )
}

export const BarList = ({ items, marker, highlightKey, emptyText = 'No published results.' }) => {
    if (!items.length) return <p className="dpat-empty">{emptyText}</p>
    return (
        <ol className="dpat-barlist">
            {items.map((item) => {
                const width = item.max ? clampPercent((item.value / item.max) * 100) : 0
                const label = item.to ? <Link to={item.to}>{item.label}</Link> : item.label
                return (
                    <li key={item.key} className={item.key === highlightKey ? 'is-highlighted' : undefined}>
                        {item.rank !== undefined && <span className="dpat-barlist__rank">{item.rank ?? '—'}</span>}
                        <div className="dpat-barlist__label">
                            <strong>{label}</strong>
                            {item.sublabel && <small>{item.sublabel}</small>}
                        </div>
                        <div className="dpat-barlist__track" aria-hidden="true">
                            <span style={{ width: `${width}%`, background: item.color }} />
                            {marker && Number.isFinite(marker.value) && (
                                <i style={{ left: `${clampPercent(marker.value)}%` }} title={marker.label} />
                            )}
                        </div>
                        <b>{item.display}</b>
                    </li>
                )
            })}
        </ol>
    )
}

export const Meter = ({ value, max, color, label, display }) => (
    <div className="dpat-meter">
        <div className="dpat-meter__head">
            <span>{label}</span>
            <b>{display}</b>
        </div>
        <div className="dpat-meter__track" role="img" aria-label={`${label}: ${display}`}>
            <span style={{ width: `${max ? clampPercent((value / max) * 100) : 0}%`, background: color }} />
        </div>
    </div>
)

export const TrendChart = ({ points, seriesLabel = 'District', benchmarkLabel = 'National average' }) => {
    const width = 560
    const height = 250
    const pad = { top: 30, right: 16, bottom: 40, left: 40 }
    const innerWidth = width - pad.left - pad.right
    const innerHeight = height - pad.top - pad.bottom
    const slot = innerWidth / Math.max(points.length, 1)
    const barWidth = Math.min(46, slot * 0.3)
    const y = (value) => pad.top + innerHeight - (clampPercent(value) / 100) * innerHeight

    return (
        <figure className="dpat-trend">
            <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label={points.map((point) => `${point.year}: ${seriesLabel} ${formatPercent(point.value)}, ${benchmarkLabel} ${formatPercent(point.benchmark)}`).join('. ')}>
                {[0, 25, 50, 75, 100].map((tick) => (
                    <g key={tick}>
                        <line x1={pad.left} x2={width - pad.right} y1={y(tick)} y2={y(tick)} className="dpat-columns__grid" />
                        <text x={pad.left - 8} y={y(tick) + 4} className="dpat-columns__tick" textAnchor="end">{tick}</text>
                    </g>
                ))}
                {points.map((point, index) => {
                    const center = pad.left + slot * index + slot / 2
                    const bars = [
                        { key: 'series', value: point.value, className: 'dpat-trend__series', x: center - barWidth - 3 },
                        { key: 'benchmark', value: point.benchmark, className: 'dpat-trend__benchmark', x: center + 3 },
                    ]
                    return (
                        <g key={point.year}>
                            {bars.map((bar) => Number.isFinite(bar.value) ? (
                                <g key={bar.key}>
                                    <rect x={bar.x} y={y(bar.value)} width={barWidth} height={pad.top + innerHeight - y(bar.value)} rx="3" className={bar.className} />
                                    <text x={bar.x + barWidth / 2} y={y(bar.value) - 6} textAnchor="middle" className="dpat-columns__value">{formatPercent(bar.value, 0)}</text>
                                </g>
                            ) : (
                                <text key={bar.key} x={bar.x + barWidth / 2} y={pad.top + innerHeight - 6} textAnchor="middle" className="dpat-columns__tick">n/a</text>
                            ))}
                            <text x={center} y={height - pad.bottom + 20} textAnchor="middle" className="dpat-columns__label">{point.year}</text>
                        </g>
                    )
                })}
            </svg>
            <figcaption className="dpat-trend__legend">
                <span><i className="dpat-trend__series" aria-hidden="true" />{seriesLabel}</span>
                <span><i className="dpat-trend__benchmark" aria-hidden="true" />{benchmarkLabel}</span>
            </figcaption>
        </figure>
    )
}

const AXIS_TICKS = [0, 25, 50, 75, 100]

export const ScatterPlot = ({ points, xLabel, yLabel, xRef, yRef, ariaLabel, onSelect, renderTooltip }) => {
    const [hovered, setHovered] = useState(null)
    const width = 640
    const height = 440
    const pad = { top: 18, right: 18, bottom: 50, left: 54 }
    const innerWidth = width - pad.left - pad.right
    const innerHeight = height - pad.top - pad.bottom
    const sx = (value) => pad.left + (clampPercent(value) / 100) * innerWidth
    const sy = (value) => pad.top + innerHeight - (clampPercent(value) / 100) * innerHeight
    const refX = Number.isFinite(xRef) ? sx(xRef) : null
    const refY = Number.isFinite(yRef) ? sy(yRef) : null

    return (
        <div className="dpat-scatter">
            <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label={ariaLabel}>
                {refX !== null && refY !== null && (
                    <>
                        <rect x={refX} y={pad.top} width={pad.left + innerWidth - refX} height={refY - pad.top} className="dpat-scatter__zone is-strong" />
                        <rect x={pad.left} y={refY} width={refX - pad.left} height={pad.top + innerHeight - refY} className="dpat-scatter__zone is-weak" />
                    </>
                )}
                {AXIS_TICKS.map((tick) => (
                    <g key={tick}>
                        <line x1={pad.left} x2={width - pad.right} y1={sy(tick)} y2={sy(tick)} className="dpat-columns__grid" />
                        <line x1={sx(tick)} x2={sx(tick)} y1={pad.top} y2={pad.top + innerHeight} className="dpat-columns__grid" />
                        <text x={pad.left - 10} y={sy(tick) + 4} className="dpat-columns__tick" textAnchor="end">{tick}%</text>
                        <text x={sx(tick)} y={pad.top + innerHeight + 18} className="dpat-columns__tick" textAnchor="middle">{tick}%</text>
                    </g>
                ))}
                {refX !== null && <line x1={refX} x2={refX} y1={pad.top} y2={pad.top + innerHeight} className="dpat-scatter__ref" />}
                {refY !== null && <line x1={pad.left} x2={width - pad.right} y1={refY} y2={refY} className="dpat-scatter__ref" />}
                {points.map((point) => (
                    <circle
                        key={point.key}
                        cx={sx(point.x)}
                        cy={sy(point.y)}
                        r={hovered?.key === point.key ? 8 : 5}
                        className={`dpat-scatter__dot${hovered?.key === point.key ? ' is-active' : ''}`}
                        style={{ fill: point.color }}
                        onMouseEnter={() => setHovered(point)}
                        onMouseLeave={() => setHovered(null)}
                        onClick={() => onSelect?.(point)}
                    />
                ))}
                <text x={pad.left + innerWidth / 2} y={height - 8} className="dpat-columns__axis-label" textAnchor="middle">{xLabel}</text>
                <text x={14} y={pad.top + innerHeight / 2} className="dpat-columns__axis-label" textAnchor="middle" transform={`rotate(-90 14 ${pad.top + innerHeight / 2})`}>{yLabel}</text>
            </svg>
            {hovered && renderTooltip && (
                <div
                    className={`dpat-chart-tooltip${hovered.x > 62 ? ' is-flipped' : ''}`}
                    style={{ left: `${(sx(hovered.x) / width) * 100}%`, top: `${(sy(hovered.y) / height) * 100}%` }}
                    aria-hidden="true"
                >
                    {renderTooltip(hovered)}
                </div>
            )}
        </div>
    )
}

export const RadarChart = ({ axes, color = '#16325A', benchmark, ariaLabel }) => {
    const size = 400
    const center = size / 2
    const radius = 138
    const angle = (index) => -Math.PI / 2 + (index * 2 * Math.PI) / axes.length
    const point = (index, value) => {
        const distance = (clampPercent(value) / 100) * radius
        return [center + distance * Math.cos(angle(index)), center + distance * Math.sin(angle(index))]
    }
    const polygon = (valueOf) => axes.map((axis, index) => point(index, valueOf(axis)).join(',')).join(' ')

    return (
        <svg className="dpat-radar" viewBox={`0 0 ${size} ${size}`} role="img" aria-label={ariaLabel}>
            {[25, 50, 75, 100].map((ring) => (
                <polygon key={ring} points={polygon(() => ring)} className="dpat-radar__ring" />
            ))}
            {[25, 50, 75].map((ring) => (
                <text key={ring} x={center + 4} y={center - (ring / 100) * radius - 3} className="dpat-radar__tick">{ring}%</text>
            ))}
            {axes.map((axis, index) => {
                const [x, y] = point(index, 100)
                return <line key={axis.key} x1={center} y1={center} x2={x} y2={y} className="dpat-radar__spoke" />
            })}
            {Number.isFinite(benchmark) && <polygon points={polygon(() => benchmark)} className="dpat-radar__benchmark" />}
            <polygon points={polygon((axis) => axis.value)} className="dpat-radar__area" style={{ fill: color, stroke: color }} />
            {axes.map((axis, index) => {
                const [x, y] = point(index, axis.value)
                const [labelX, labelY] = point(index, 118)
                const cos = Math.cos(angle(index))
                const anchor = Math.abs(cos) < 0.25 ? 'middle' : cos > 0 ? 'start' : 'end'
                return (
                    <g key={axis.key}>
                        <circle cx={x} cy={y} r="4" className="dpat-radar__dot" style={{ fill: color }}>
                            <title>{`${axis.label} ${axis.name || ''}: ${formatPercent(axis.value, 0)}`}</title>
                        </circle>
                        <text x={labelX} y={labelY - 2} textAnchor={anchor} className="dpat-radar__label">{axis.label}</text>
                        <text x={labelX} y={labelY + 12} textAnchor={anchor} className="dpat-radar__value">{formatPercent(axis.value, 0)}</text>
                    </g>
                )
            })}
        </svg>
    )
}

export const StackedBars = ({ rows, legend }) => (
    <div className="dpat-stacked">
        <ul className="dpat-inline-legend">
            {legend.map((item) => <li key={item.label}><i style={{ background: item.color }} aria-hidden="true" />{item.label}</li>)}
        </ul>
        <ol>
            {rows.map((row) => (
                <li key={row.key}>
                    <span className="dpat-stacked__label"><strong>{row.label}</strong>{row.meta && <small>{row.meta}</small>}</span>
                    <span className="dpat-stacked__bar" role="img" aria-label={`${row.label}: ${row.segments.map((segment) => `${segment.label} ${segment.value}`).join(', ')}`}>
                        {row.segments.filter((segment) => segment.value > 0).map((segment) => {
                            const share = row.total ? (segment.value / row.total) * 100 : 0
                            return (
                                <i key={segment.label} style={{ width: `${share}%`, background: segment.color }} title={`${segment.label}: ${segment.value}`}>
                                    {share >= 11 ? segment.value : ''}
                                </i>
                            )
                        })}
                    </span>
                </li>
            ))}
        </ol>
    </div>
)

export const RangePlot = ({ rows, marker, markerLabel = 'National average' }) => (
    <div className="dpat-range">
        <div className="dpat-range__axis" aria-hidden="true">
            <span />
            <span className="dpat-range__ticks">{AXIS_TICKS.map((tick) => <i key={tick} style={{ left: `${tick}%` }}>{tick}</i>)}</span>
            <span />
        </div>
        <ol>
            {rows.map((row) => (
                <li key={row.key}>
                    <span className="dpat-range__label"><strong>{row.label}</strong>{row.meta && <small>{row.meta}</small>}</span>
                    <span className="dpat-range__track" role="img" aria-label={`${row.label}: lowest ${formatPercent(row.min, 0)}, median ${formatPercent(row.median, 0)}, highest ${formatPercent(row.max, 0)}`}>
                        <i className="dpat-range__whisker" style={{ left: `${clampPercent(row.min)}%`, width: `${clampPercent(row.max) - clampPercent(row.min)}%` }} />
                        <i className="dpat-range__box" style={{ left: `${clampPercent(row.q1)}%`, width: `${Math.max(clampPercent(row.q3) - clampPercent(row.q1), 0.8)}%`, background: row.color }} />
                        <i className="dpat-range__median" style={{ left: `${clampPercent(row.median)}%` }} />
                        {Number.isFinite(marker) && <em style={{ left: `${clampPercent(marker)}%` }} title={markerLabel} />}
                    </span>
                    <b>{formatPercent(row.min, 0)}–{formatPercent(row.max, 0)}</b>
                </li>
            ))}
        </ol>
    </div>
)

export const PercentileStrip = ({ stats, marker, markerLabel = 'National average' }) => {
    const labels = [
        { key: 'p10', label: '10th percentile', value: stats.p10, side: 'below' },
        { key: 'q1', label: '25th percentile', value: stats.q1, side: 'above' },
        { key: 'median', label: 'Median', value: stats.median, side: 'below' },
        { key: 'q3', label: '75th percentile', value: stats.q3, side: 'above' },
        { key: 'p90', label: '90th percentile', value: stats.p90, side: 'below' },
    ]
    return (
        <div className="dpat-pstrip" role="img" aria-label={labels.map((item) => `${item.label} ${formatPercent(item.value)}`).join(', ')}>
            <div className="dpat-pstrip__labels is-above">
                {labels.filter((item) => item.side === 'above').map((item) => (
                    <span key={item.key} style={{ left: `${clampPercent(item.value)}%` }}><b>{formatPercent(item.value, 0)}</b><small>{item.label}</small></span>
                ))}
            </div>
            <div className="dpat-pstrip__track">
                <i className="dpat-pstrip__range" style={{ left: `${clampPercent(stats.min)}%`, width: `${clampPercent(stats.max) - clampPercent(stats.min)}%` }} />
                <i className="dpat-pstrip__whisker" style={{ left: `${clampPercent(stats.p10)}%`, width: `${clampPercent(stats.p90) - clampPercent(stats.p10)}%` }} />
                <i className="dpat-pstrip__box" style={{ left: `${clampPercent(stats.q1)}%`, width: `${clampPercent(stats.q3) - clampPercent(stats.q1)}%` }} />
                <i className="dpat-pstrip__median" style={{ left: `${clampPercent(stats.median)}%` }} />
                {Number.isFinite(marker) && <em style={{ left: `${clampPercent(marker)}%` }} />}
                <b className="dpat-pstrip__end is-min" style={{ left: `${clampPercent(stats.min)}%` }} title={`Lowest ${formatPercent(stats.min)}`} />
                <b className="dpat-pstrip__end is-max" style={{ left: `${clampPercent(stats.max)}%` }} title={`Highest ${formatPercent(stats.max)}`} />
            </div>
            <div className="dpat-pstrip__labels is-below">
                {labels.filter((item) => item.side === 'below').map((item) => (
                    <span key={item.key} style={{ left: `${clampPercent(item.value)}%` }}><b>{formatPercent(item.value, 0)}</b><small>{item.label}</small></span>
                ))}
            </div>
            <div className="dpat-pstrip__axis" aria-hidden="true">
                {AXIS_TICKS.map((tick) => <i key={tick} style={{ left: `${tick}%` }}>{tick}%</i>)}
            </div>
            <ul className="dpat-inline-legend dpat-pstrip__legend" aria-hidden="true">
                <li><i className="is-box" />Middle 50% of districts</li>
                <li><i className="is-whisker" />10th–90th percentile</li>
                <li><i className="is-range" />Full range ({formatPercent(stats.min, 0)}–{formatPercent(stats.max, 0)})</li>
                {Number.isFinite(marker) && <li><i className="is-marker" />{markerLabel} {formatPercent(marker)}</li>}
            </ul>
        </div>
    )
}

export const CompositionBar = ({ sdi, pi, max = 100, marker, sdiColor = '#16325A', piColor = '#b38b3f' }) => (
    <span className="dpat-compbar" role="img" aria-label={`Service delivery ${sdi} points and performance ${pi} points out of ${max}`}>
        <i style={{ width: `${clampPercent((sdi / max) * 100)}%`, background: sdiColor }} />
        <i style={{ width: `${clampPercent((pi / max) * 100)}%`, background: piColor }} />
        {Number.isFinite(marker) && <em style={{ left: `${clampPercent(marker)}%` }} />}
    </span>
)
