import React, { useId, useLayoutEffect, useMemo, useRef, useState } from 'react'
import './PortalCharts.css'

const useChartWidth = (fallback = 720) => {
    const ref = useRef(null)
    const [width, setWidth] = useState(fallback)

    useLayoutEffect(() => {
        const node = ref.current
        if (!node) return undefined
        const update = () => {
            const next = Math.round(node.clientWidth)
            if (next > 0) setWidth(next)
        }
        update()
        if (typeof ResizeObserver === 'undefined') return undefined
        const observer = new ResizeObserver(update)
        observer.observe(node)
        return () => observer.disconnect()
    }, [])

    return [ref, width]
}

const defaultFormat = new Intl.NumberFormat('en-GH')
const formatDefault = (value) => (Number.isFinite(value) ? defaultFormat.format(value) : '—')

export const niceCeil = (value) => {
    if (!Number.isFinite(value) || value <= 0) return 1
    const magnitude = 10 ** Math.floor(Math.log10(value))
    const step = [1, 1.5, 2, 2.5, 3, 4, 5, 6, 8, 10].find((candidate) => candidate * magnitude >= value)
    return step * magnitude
}

const ticksFor = (max, count = 4) => Array.from({ length: count + 1 }, (_, index) => (max / count) * index)

const compactFormat = new Intl.NumberFormat('en-GH', { notation: 'compact', maximumFractionDigits: 1 })
const formatTick = (value) => (value >= 10000 ? compactFormat.format(value) : defaultFormat.format(Math.round(value * 10) / 10))

export const LineChart = ({
    series,
    xValues,
    formatY = formatDefault,
    yMax,
    yTickFormat = formatTick,
    height = 300,
    ariaLabel,
    activeX,
    area = true,
}) => {
    const [hoverIndex, setHoverIndex] = useState(null)
    const gradientPrefix = `pc-fill-${useId().replace(/:/g, '')}`
    const [containerRef, width] = useChartWidth()
    const pad = { top: 20, right: 20, bottom: 36, left: 52 }
    const innerWidth = width - pad.left - pad.right
    const innerHeight = height - pad.top - pad.bottom
    const allValues = series.flatMap((item) => item.values.filter(Number.isFinite))
    const max = yMax ?? niceCeil(Math.max(0, ...allValues))
    const step = xValues.length > 1 ? innerWidth / (xValues.length - 1) : 0
    const sx = (index) => pad.left + (xValues.length > 1 ? index * step : innerWidth / 2)
    const sy = (value) => pad.top + innerHeight - (Math.max(0, value) / max) * innerHeight

    const paths = useMemo(() => series.map((item) => {
        const segments = []
        let current = []
        item.values.forEach((value, index) => {
            if (Number.isFinite(value)) current.push([sx(index), sy(value)])
            else if (current.length) { segments.push(current); current = [] }
        })
        if (current.length) segments.push(current)
        return {
            ...item,
            line: segments.map((points) => `M${points.map((p) => p.join(',')).join('L')}`).join(''),
            fill: segments.map((points) => `M${points[0][0]},${pad.top + innerHeight}L${points.map((p) => p.join(',')).join('L')}L${points[points.length - 1][0]},${pad.top + innerHeight}Z`).join(''),
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }), [series, xValues.length, max, height, width])

    const hovered = hoverIndex !== null ? hoverIndex : null
    const activeIndex = xValues.indexOf(activeX)
    const labelEvery = Math.ceil(xValues.length / Math.max(2, Math.floor(innerWidth / 44)))

    return (
        <div className="pc-line" ref={containerRef}>
            <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label={ariaLabel} onMouseLeave={() => setHoverIndex(null)}>
                <defs>
                    {series.map((item) => (
                        <linearGradient key={item.key} id={`${gradientPrefix}-${item.key}`} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0" stopColor={item.color} stopOpacity="0.16" />
                            <stop offset="1" stopColor={item.color} stopOpacity="0" />
                        </linearGradient>
                    ))}
                </defs>
                {ticksFor(max).map((tick) => (
                    <g key={tick}>
                        <line className="pc-grid" x1={pad.left} x2={width - pad.right} y1={sy(tick)} y2={sy(tick)} />
                        <text className="pc-tick" x={pad.left - 10} y={sy(tick) + 4} textAnchor="end">{yTickFormat(tick)}</text>
                    </g>
                ))}
                {xValues.map((x, index) => (index % labelEvery === 0 || index === xValues.length - 1) && (
                    <text key={x} className={`pc-tick${index === activeIndex ? ' is-active' : ''}`} x={sx(index)} y={height - 12} textAnchor="middle">{x}</text>
                ))}
                {activeIndex >= 0 && <line className="pc-active" x1={sx(activeIndex)} x2={sx(activeIndex)} y1={pad.top} y2={pad.top + innerHeight} />}
                {area && paths.map((item) => <path key={`${item.key}-fill`} d={item.fill} fill={`url(#${gradientPrefix}-${item.key})`} />)}
                {paths.map((item) => (
                    <path key={item.key} className="pc-line__path" d={item.line} style={{ stroke: item.color, strokeDasharray: item.dashed ? '6 5' : undefined }} />
                ))}
                {series.map((item) => item.values.map((value, index) => Number.isFinite(value) && (
                    <circle
                        key={`${item.key}-${xValues[index]}`}
                        className={`pc-line__dot${hovered === index ? ' is-hovered' : ''}`}
                        cx={sx(index)}
                        cy={sy(value)}
                        r={hovered === index ? 5 : 3}
                        style={{ stroke: item.color }}
                    />
                )))}
                {hovered !== null && <line className="pc-hover" x1={sx(hovered)} x2={sx(hovered)} y1={pad.top} y2={pad.top + innerHeight} />}
                {xValues.map((x, index) => (
                    <rect
                        key={`hit-${x}`}
                        className="pc-hit"
                        x={sx(index) - (step || innerWidth) / 2}
                        y={pad.top}
                        width={step || innerWidth}
                        height={innerHeight}
                        onMouseEnter={() => setHoverIndex(index)}
                    />
                ))}
            </svg>
            {hovered !== null && (
                <div
                    className={`pc-tooltip${sx(hovered) / width > 0.6 ? ' is-left' : ''}`}
                    style={{ left: `${(sx(hovered) / width) * 100}%`, top: `${(pad.top / height) * 100}%` }}
                    aria-hidden="true"
                >
                    <strong>{xValues[hovered]}</strong>
                    {series.map((item) => (
                        <span key={item.key}><i style={{ background: item.color }} />{item.label}<b>{formatY(item.values[hovered])}</b></span>
                    ))}
                </div>
            )}
            <ul className="pc-legend">
                {series.map((item) => (
                    <li key={item.key}><i style={{ background: item.color }} className={item.dashed ? 'is-dashed' : undefined} />{item.label}</li>
                ))}
            </ul>
        </div>
    )
}

export const ScatterPlot = ({
    points,
    xLabel,
    yLabel,
    formatX = formatDefault,
    formatY = formatDefault,
    xRef,
    yRef,
    labelCount = 6,
    ariaLabel,
    onSelect,
    renderTooltip,
    height = 420,
    xMax: xMaxProp,
    yMax: yMaxProp,
}) => {
    const [hovered, setHovered] = useState(null)
    const [containerRef, width] = useChartWidth()
    const pad = { top: 20, right: 28, bottom: 52, left: 64 }
    const innerWidth = width - pad.left - pad.right
    const innerHeight = height - pad.top - pad.bottom
    const xMax = xMaxProp ?? niceCeil(Math.max(0, ...points.map((point) => point.x)))
    const yMax = yMaxProp ?? niceCeil(Math.max(0, ...points.map((point) => point.y)))
    const sx = (value) => pad.left + (Math.max(0, value) / xMax) * innerWidth
    const sy = (value) => pad.top + innerHeight - (Math.max(0, value) / yMax) * innerHeight
    const labelled = useMemo(() => {
        const placed = []
        const keys = new Map()
        const overlaps = (a, b) => a.x1 < b.x2 && a.x2 > b.x1 && a.y1 < b.y2 && a.y2 > b.y1
        const circles = points.map((point) => {
            const r = point.r || 7
            return { key: point.key, x1: sx(point.x) - r, x2: sx(point.x) + r, y1: sy(point.y) - r, y2: sy(point.y) + r }
        })
        ;[...points]
            .sort((a, b) => (b.x / xMax + b.y / yMax) - (a.x / xMax + a.y / yMax))
            .forEach((point) => {
                if (keys.size >= labelCount) return
                const offset = (point.r || 7) + 5
                const labelWidth = point.label.length * 6.6
                const candidates = [
                    { side: 'right', x1: sx(point.x) + offset, x2: sx(point.x) + offset + labelWidth },
                    { side: 'left', x1: sx(point.x) - offset - labelWidth, x2: sx(point.x) - offset },
                ]
                const box = candidates
                    .map((candidate) => ({ ...candidate, y1: sy(point.y) - 8, y2: sy(point.y) + 8 }))
                    .find((candidate) => candidate.x1 > pad.left && candidate.x2 < width - 4
                        && !placed.some((other) => overlaps(candidate, other))
                        && !circles.some((circle) => circle.key !== point.key && overlaps(candidate, circle)))
                if (!box) return
                placed.push(box)
                keys.set(point.key, box.side)
            })
        return keys
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [points, labelCount, xMax, yMax, height, width])

    return (
        <div className="pc-scatter" ref={containerRef}>
            <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label={ariaLabel}>
                {Number.isFinite(xRef) && Number.isFinite(yRef) && (
                    <rect className="pc-scatter__zone" x={sx(xRef)} y={pad.top} width={pad.left + innerWidth - sx(xRef)} height={sy(yRef) - pad.top} />
                )}
                {ticksFor(yMax).map((tick) => (
                    <g key={`y-${tick}`}>
                        <line className="pc-grid" x1={pad.left} x2={width - pad.right} y1={sy(tick)} y2={sy(tick)} />
                        <text className="pc-tick" x={pad.left - 10} y={sy(tick) + 4} textAnchor="end">{formatTick(tick)}</text>
                    </g>
                ))}
                {ticksFor(xMax).map((tick) => (
                    <g key={`x-${tick}`}>
                        <line className="pc-grid" x1={sx(tick)} x2={sx(tick)} y1={pad.top} y2={pad.top + innerHeight} />
                        <text className="pc-tick" x={sx(tick)} y={pad.top + innerHeight + 20} textAnchor="middle">{formatTick(tick)}</text>
                    </g>
                ))}
                {Number.isFinite(xRef) && <line className="pc-ref" x1={sx(xRef)} x2={sx(xRef)} y1={pad.top} y2={pad.top + innerHeight} />}
                {Number.isFinite(yRef) && <line className="pc-ref" x1={pad.left} x2={width - pad.right} y1={sy(yRef)} y2={sy(yRef)} />}
                {points.map((point) => {
                    const isHovered = hovered?.key === point.key
                    return (
                        <g key={point.key}>
                            <circle
                                className={`pc-scatter__dot${isHovered ? ' is-hovered' : ''}${onSelect ? ' is-clickable' : ''}`}
                                cx={sx(point.x)}
                                cy={sy(point.y)}
                                r={(point.r || 7) + (isHovered ? 3 : 0)}
                                style={{ fill: point.color }}
                                onMouseEnter={() => setHovered(point)}
                                onMouseLeave={() => setHovered(null)}
                                onClick={() => onSelect?.(point)}
                            />
                            {(labelled.has(point.key) || isHovered) && (() => {
                                const onLeft = labelled.get(point.key) === 'left' || (!labelled.has(point.key) && sx(point.x) / width > 0.75)
                                const offset = (point.r || 7) + 5
                                return (
                                    <text
                                        className="pc-scatter__label"
                                        x={sx(point.x) + (onLeft ? -offset : offset)}
                                        y={sy(point.y) + 4}
                                        textAnchor={onLeft ? 'end' : 'start'}
                                    >
                                        {point.label}
                                    </text>
                                )
                            })()}
                        </g>
                    )
                })}
                <text className="pc-axis" x={pad.left + innerWidth / 2} y={height - 8} textAnchor="middle">{xLabel}</text>
                <text className="pc-axis" x={16} y={pad.top + innerHeight / 2} textAnchor="middle" transform={`rotate(-90 16 ${pad.top + innerHeight / 2})`}>{yLabel}</text>
            </svg>
            {hovered && (
                <div
                    className={`pc-tooltip pc-tooltip--point${sx(hovered.x) / width > 0.6 ? ' is-left' : ''}`}
                    style={{ left: `${(sx(hovered.x) / width) * 100}%`, top: `${(sy(hovered.y) / height) * 100}%` }}
                    aria-hidden="true"
                >
                    {renderTooltip ? renderTooltip(hovered) : (
                        <>
                            <strong>{hovered.label}</strong>
                            <span>{xLabel}<b>{formatX(hovered.x)}</b></span>
                            <span>{yLabel}<b>{formatY(hovered.y)}</b></span>
                        </>
                    )}
                </div>
            )}
        </div>
    )
}

export const Histogram = ({ bins, domain = [0, 100], tickStep = 10, markers = [], ariaLabel, renderTooltip, height = 260 }) => {
    const [hovered, setHovered] = useState(null)
    const [containerRef, width] = useChartWidth()
    const pad = { top: 16, right: 16, bottom: 34, left: 44 }
    const innerWidth = width - pad.left - pad.right
    const innerHeight = height - pad.top - pad.bottom
    const max = niceCeil(Math.max(1, ...bins.map((bin) => bin.count)))
    const sx = (value) => pad.left + ((value - domain[0]) / (domain[1] - domain[0])) * innerWidth
    const sy = (value) => pad.top + innerHeight - (value / max) * innerHeight
    const ticks = []
    const effectiveStep = innerWidth < 420 ? tickStep * 2 : tickStep
    for (let tick = domain[0]; tick <= domain[1]; tick += effectiveStep) ticks.push(tick)

    return (
        <div className="pc-line pc-histogram" ref={containerRef}>
            <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label={ariaLabel} onMouseLeave={() => setHovered(null)}>
                {ticksFor(max).map((tick) => (
                    <g key={`y-${tick}`}>
                        <line className="pc-grid" x1={pad.left} x2={width - pad.right} y1={sy(tick)} y2={sy(tick)} />
                        <text className="pc-tick" x={pad.left - 10} y={sy(tick) + 4} textAnchor="end">{formatTick(tick)}</text>
                    </g>
                ))}
                {bins.map((bin) => {
                    const x = sx(bin.start) + 1.5
                    const barWidth = Math.max(1, sx(bin.end) - sx(bin.start) - 3)
                    return (
                        <g key={bin.key}>
                            <rect
                                className={`pc-histogram__bar${hovered?.key === bin.key ? ' is-hovered' : ''}`}
                                x={x}
                                y={sy(bin.count)}
                                width={barWidth}
                                height={Math.max(0, pad.top + innerHeight - sy(bin.count))}
                                rx="3"
                                style={{ fill: bin.color }}
                            />
                            <rect className="pc-hit" x={x} y={pad.top} width={barWidth} height={innerHeight} onMouseEnter={() => setHovered(bin)} />
                        </g>
                    )
                })}
                {markers.map((marker) => (
                    <g key={marker.label}>
                        <line className="pc-active" x1={sx(marker.value)} x2={sx(marker.value)} y1={pad.top} y2={pad.top + innerHeight} />
                        <text className="pc-marker" x={sx(marker.value) + 6} y={pad.top + 12}>{marker.label}</text>
                    </g>
                ))}
                {ticks.map((tick) => (
                    <text key={`x-${tick}`} className="pc-tick" x={sx(tick)} y={height - 12} textAnchor="middle">{tick}</text>
                ))}
            </svg>
            {hovered && (
                <div
                    className={`pc-tooltip${sx(hovered.start) / width > 0.6 ? ' is-left' : ''}`}
                    style={{ left: `${(sx((hovered.start + hovered.end) / 2) / width) * 100}%`, top: `${(pad.top / height) * 100}%` }}
                    aria-hidden="true"
                >
                    {renderTooltip ? renderTooltip(hovered) : <><strong>{hovered.label}</strong><span>Count<b>{formatDefault(hovered.count)}</b></span></>}
                </div>
            )}
        </div>
    )
}

export const Sparkline = ({ values, color = '#16325a', width = 120, height = 36 }) => {
    const finite = values.filter(Number.isFinite)
    if (finite.length < 2) return null
    const max = Math.max(...finite)
    const min = Math.min(...finite)
    const range = max - min || 1
    const step = width / (values.length - 1)
    const points = values.map((value, index) => (Number.isFinite(value) ? [index * step, height - 3 - ((value - min) / range) * (height - 6)] : null)).filter(Boolean)
    const line = `M${points.map((point) => point.join(',')).join('L')}`
    const last = points[points.length - 1]

    return (
        <svg className="pc-spark" viewBox={`0 0 ${width} ${height}`} aria-hidden="true">
            <path d={`${line}L${last[0]},${height}L${points[0][0]},${height}Z`} style={{ fill: color }} className="pc-spark__fill" />
            <path d={line} style={{ stroke: color }} className="pc-spark__line" />
            <circle cx={last[0]} cy={last[1]} r="3" style={{ fill: color }} />
        </svg>
    )
}
