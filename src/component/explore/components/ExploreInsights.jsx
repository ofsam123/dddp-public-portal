import React, { useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { LineChart, ScatterPlot, Sparkline } from '../../shared/charts/PortalCharts'
import { formatCedis } from '../services/formatters'
import './ExploreInsights.css'

const numberFormat = new Intl.NumberFormat('en-GH')
const formatNumber = (value) => (Number.isFinite(value) ? numberFormat.format(Math.round(value)) : '—')
const ARROW = <svg viewBox="0 0 16 16" aria-hidden="true"><path d="M3 8h10M9 4l4 4-4 4" /></svg>

const SERIES = [
    { key: 'projects', label: 'Projects', color: '#16325a' },
    { key: 'programmes', label: 'Programmes', color: '#c49a3c' },
    { key: 'meetings', label: 'Meetings', color: '#1f8f5f' },
]

const AAP_SERIES = { key: 'aapActivities', label: 'AAP activities', color: '#5b7cab' }
const IGF_SERIES = [
    { key: 'igfCollected', label: 'IGF collected', color: '#0f8a7e' },
    { key: 'igfReleased', label: 'IGF released', color: '#c2553f' },
]

const changeBetween = (current, previous) => {
    if (!Number.isFinite(current) || !Number.isFinite(previous) || previous === 0) return null
    return ((current - previous) / previous) * 100
}

const Change = ({ value, previousYear }) => {
    if (value === null) return <span className="explore-trend-card__change">No comparison for {previousYear || 'the previous year'}</span>
    const direction = value > 0.05 ? 'up' : value < -0.05 ? 'down' : 'flat'
    return (
        <span className={`explore-trend-card__change is-${direction}`}>
            <b>{direction === 'up' ? '▲' : direction === 'down' ? '▼' : '■'} {Math.abs(value).toFixed(1)}%</b> vs {previousYear}
        </span>
    )
}

const Placeholder = ({ children }) => <p className="explore-insights__placeholder" role="status">{children}</p>

export const ExploreTrends = ({ year, trend, delivery = { data: null, isLoading: false } }) => {
    const rows = trend.summaries
    const index = trend.years.indexOf(year)
    const current = rows[index]
    const previous = index > 0 ? rows[index - 1] : null
    const pipelineCurrent = trend.pipeline[index]
    const pipelinePrevious = index > 0 ? trend.pipeline[index - 1] : null
    const hasRows = rows.some(Boolean)
    const deliveryByYear = new Map((delivery.data?.series || []).map((row) => [row.year, row]))
    const deliveryRows = trend.years.map((item) => deliveryByYear.get(item) || null)
    const deliveryCurrent = deliveryRows[index]
    const deliveryPrevious = index > 0 ? deliveryRows[index - 1] : null
    const deliveryCard = (series, extra) => ({
        ...series,
        value: deliveryCurrent?.[series.key],
        change: changeBetween(deliveryCurrent?.[series.key], deliveryPrevious?.[series.key]),
        values: deliveryRows.map((row) => row?.[series.key] ?? null),
        loading: delivery.isLoading,
        ...extra,
    })

    const cards = [
        ...SERIES.filter((series) => series.key !== 'meetings').map((series) => ({
            ...series,
            value: current?.[series.key],
            change: changeBetween(current?.[series.key], previous?.[series.key]),
            values: rows.map((row) => row?.[series.key] ?? null),
            note: `Active during ${year || 'the year'}`,
            loading: trend.isLoading,
        })),
        deliveryCard(IGF_SERIES[0], {
            label: 'IGF collected & released',
            format: formatCedis,
            note: deliveryCurrent ? `Released: ${formatCedis(deliveryCurrent.igfReleased)}` : 'Internally Generated Funds',
        }),
        deliveryCard({ ...AAP_SERIES, label: 'Annual planned activities' }, { note: 'Activities in Annual Action Plans' }),
        deliveryCard({ key: 'completedProjects', label: 'Completed projects', color: '#1f8f5f' }, { note: 'Reported completed during the year' }),
        {
            key: 'starts',
            label: 'Expected project starts',
            color: '#5b7cab',
            value: pipelineCurrent?.expectedStarts,
            change: changeBetween(pipelineCurrent?.expectedStarts, pipelinePrevious?.expectedStarts),
            values: trend.pipeline.map((row) => row?.expectedStarts ?? null),
            note: 'Projects planned to begin',
            loading: trend.isPipelineLoading,
        },
    ]

    const peak = useMemo(() => {
        const totals = rows.map((row) => (row ? row.projectsProgrammesTotal : null))
        const max = Math.max(...totals.filter(Number.isFinite))
        const peakIndex = totals.indexOf(max)
        return peakIndex >= 0 ? { year: trend.years[peakIndex], value: max } : null
    }, [rows, trend.years])

    const first = rows.find(Boolean)
    const growth = first && current ? changeBetween(current.projectsProgrammesTotal, first.projectsProgrammesTotal) : null
    const meetingsPerHundred = current?.projectsProgrammesTotal ? (current.meetings / current.projectsProgrammesTotal) * 100 : null

    return (
        <>
            <section className="explore-section explore-insights" aria-labelledby="explore-glance-title">
                <div className="explore-section__heading">
                    <span className="section-kicker">Ghana in {year || '…'}</span>
                    <h2 id="explore-glance-title">The national picture at a glance</h2>
                    <p>Recorded activity across all 16 regions for the selected year, with the change from the year before and the trend since {trend.years[0] || '…'}.</p>
                </div>
                <div className="explore-trend-cards">
                    {cards.map((card) => (
                        <article className="explore-trend-card" key={card.key} style={{ '--accent': card.color }}>
                            <span className="explore-trend-card__label"><i aria-hidden="true" />{card.label}</span>
                            <strong>{card.loading ? '…' : (card.format || formatNumber)(card.value)}</strong>
                            {!card.loading && <Change value={card.change} previousYear={trend.years[index - 1]} />}
                            <div className="explore-trend-card__spark">
                                <Sparkline values={card.values} color={card.color} />
                            </div>
                            <span className="explore-trend-card__note">{card.note}</span>
                        </article>
                    ))}
                </div>
            </section>

            <section className="explore-section explore-insights" aria-labelledby="explore-trend-title">
                <div className="explore-section__heading">
                    <span className="section-kicker">Over time</span>
                    <h2 id="explore-trend-title">How recorded activity has changed</h2>
                    <p>Projects and programmes whose implementation period overlaps each year, meetings held, Annual Action Plan (AAP) activities and Internally Generated Funds (IGF) collected and released, from {trend.years[0] || '…'} to {year || '…'}. Hover the charts for each year&apos;s figures.</p>
                </div>
                <div className="explore-insights__split">
                    <div className="explore-chart-card">
                        <h3 className="explore-chart-card__title">Activity recorded</h3>
                        {trend.isLoading ? <Placeholder>Loading national trend…</Placeholder> : hasRows ? (
                            <LineChart
                                xValues={trend.years}
                                activeX={year}
                                formatY={formatNumber}
                                ariaLabel={`Line chart of projects, programmes, meetings and AAP activities in Ghana from ${trend.years[0]} to ${year}`}
                                series={[
                                    ...SERIES.map((series) => ({ ...series, values: rows.map((row) => row?.[series.key] ?? null) })),
                                    { ...AAP_SERIES, values: deliveryRows.map((row) => row?.aapActivities ?? null) },
                                ]}
                            />
                        ) : <Placeholder>The national trend is not available right now.</Placeholder>}
                    </div>
                    <aside className="explore-insights__facts" aria-label="Trend highlights">
                        <div>
                            <span>Busiest year</span>
                            <strong>{peak ? peak.year : '—'}</strong>
                            <p>{peak ? `${formatNumber(peak.value)} projects and programmes` : 'Waiting for data'}</p>
                        </div>
                        <div>
                            <span>Change since {trend.years[0] || '…'}</span>
                            <strong>{growth === null ? '—' : growth >= 200 ? `${(growth / 100 + 1).toFixed(0)}×` : `${growth > 0 ? '+' : ''}${growth.toFixed(0)}%`}</strong>
                            <p>{growth !== null && growth >= 200 ? `as many projects and programmes as in ${trend.years[0]}` : 'in projects and programmes recorded'}</p>
                        </div>
                        <div>
                            <span>Meetings per 100 activities</span>
                            <strong>{meetingsPerHundred === null ? '—' : meetingsPerHundred.toFixed(0)}</strong>
                            <p>in {year || 'the selected year'}</p>
                        </div>
                    </aside>
                </div>
                <div className="explore-insights__split">
                    <div className="explore-chart-card">
                        <h3 className="explore-chart-card__title">Internally Generated Funds (GH₵)</h3>
                        {delivery.isLoading ? <Placeholder>Loading IGF figures… this can take a few seconds.</Placeholder> : deliveryRows.some(Boolean) ? (
                            <LineChart
                                xValues={trend.years}
                                activeX={year}
                                formatY={formatCedis}
                                yTickFormat={(value) => formatCedis(value).replace('GH₵ ', '')}
                                height={260}
                                ariaLabel={`Line chart of IGF collected and released in Ghana from ${trend.years[0]} to ${year}`}
                                series={IGF_SERIES.map((series) => ({ ...series, values: deliveryRows.map((row) => row?.[series.key] ?? null) }))}
                            />
                        ) : <Placeholder>IGF figures are not available right now.</Placeholder>}
                    </div>
                    <aside className="explore-insights__facts" aria-label="IGF and AAP highlights">
                        <div>
                            <span>IGF collected in {year || '…'}</span>
                            <strong>{formatCedis(deliveryCurrent?.igfCollected)}</strong>
                            <p>{deliveryPrevious ? `${formatCedis(deliveryPrevious.igfCollected)} in ${deliveryPrevious.year}` : 'As recorded in the IGF tracker'}</p>
                        </div>
                        <div>
                            <span>IGF released in {year || '…'}</span>
                            <strong>{formatCedis(deliveryCurrent?.igfReleased)}</strong>
                            <p>Capital expenditure releases reported by assemblies</p>
                        </div>
                        <div>
                            <span>AAP activities in {year || '…'}</span>
                            <strong>{formatNumber(deliveryCurrent?.aapActivities)}</strong>
                            <p>{deliveryPrevious ? `${formatNumber(deliveryPrevious.aapActivities)} in ${deliveryPrevious.year}` : 'Planned in Annual Action Plans'}</p>
                        </div>
                    </aside>
                </div>
            </section>
        </>
    )
}

export const ExploreRegionalPlots = ({ year, regional, trend, withYear }) => {
    const navigate = useNavigate()
    const regions = regional.regionalSummaries
    const national = regional.nationalSummary?.kpis

    const points = useMemo(() => regions.map((region) => ({
        key: region.slug,
        label: region.name,
        x: region.kpis.projectsProgrammesTotal,
        y: region.kpis.meetings,
        r: 7,
        region,
    })), [regions])

    const avgX = points.length ? points.reduce((sum, point) => sum + point.x, 0) / points.length : null
    const avgY = points.length ? points.reduce((sum, point) => sum + point.y, 0) / points.length : null
    const coloured = points.map((point) => ({
        ...point,
        color: point.x >= avgX && point.y >= avgY ? '#1f8f5f' : point.x >= avgX || point.y >= avgY ? '#16325a' : '#8a97a8',
    }))
    const ranked = [...points].sort((a, b) => b.x - a.x)
    const topShare = national?.projectsProgrammesTotal
        ? (ranked.slice(0, 3).reduce((sum, point) => sum + point.x, 0) / national.projectsProgrammesTotal) * 100
        : null
    const maxX = ranked[0]?.x || 1

    const pipelineRows = trend.pipeline
    const hasPipeline = pipelineRows.some(Boolean)

    return (
        <>
            <section className="explore-section explore-insights" aria-labelledby="explore-regions-plot-title">
                <div className="explore-section__heading">
                    <span className="section-kicker">Regions compared · {year || '…'}</span>
                    <h2 id="explore-regions-plot-title">Delivery and governance by region</h2>
                    <p>Each dot is a region, placed by its recorded projects and programmes and the meetings its assemblies held. Regions in the shaded area are above the regional average on both. Select a dot to open the region.</p>
                </div>
                <div className="explore-insights__split explore-insights__split--wide">
                    <div className="explore-chart-card">
                        {regional.isLoading ? <Placeholder>Loading regional figures…</Placeholder> : points.length > 0 ? (
                            <>
                                <ScatterPlot
                                    points={coloured}
                                    xLabel="Projects & programmes"
                                    yLabel="Meetings"
                                    xRef={avgX}
                                    yRef={avgY}
                                    labelCount={7}
                                    ariaLabel={`Scatter plot of projects and programmes against meetings for Ghana's regions in ${year}`}
                                    onSelect={(point) => navigate(withYear(`/explore/regions/${point.key}`))}
                                    renderTooltip={(point) => (
                                        <>
                                            <strong>{point.label}</strong>
                                            <span>Projects<b>{formatNumber(point.region.kpis.projects)}</b></span>
                                            <span>Programmes<b>{formatNumber(point.region.kpis.programmes)}</b></span>
                                            <span>Meetings<b>{formatNumber(point.region.kpis.meetings)}</b></span>
                                        </>
                                    )}
                                />
                                <ul className="pc-legend">
                                    <li><i style={{ background: '#1f8f5f' }} />Above average on both</li>
                                    <li><i style={{ background: '#16325a' }} />Above average on one</li>
                                    <li><i style={{ background: '#8a97a8' }} />Below average on both</li>
                                    <li><i className="is-dashed" style={{ background: '#5b7cab' }} />Regional averages</li>
                                </ul>
                            </>
                        ) : <Placeholder>Regional figures are not available right now.</Placeholder>}
                    </div>
                    <aside className="explore-chart-card explore-leaders" aria-labelledby="explore-leaders-title">
                        <h3 id="explore-leaders-title">Most active regions</h3>
                        <p>{topShare === null ? 'Share of national projects and programmes.' : `The top three regions hold ${topShare.toFixed(0)}% of national projects and programmes.`}</p>
                        <ol>
                            {ranked.slice(0, 6).map((point, position) => (
                                <li key={point.key}>
                                    <Link to={withYear(`/explore/regions/${point.key}`)}>
                                        <span className="explore-leaders__rank">{position + 1}</span>
                                        <span className="explore-leaders__name">{point.label}</span>
                                        <b>{formatNumber(point.x)}</b>
                                        <span className="explore-leaders__bar" aria-hidden="true"><i style={{ width: `${(point.x / maxX) * 100}%` }} /></span>
                                    </Link>
                                </li>
                            ))}
                        </ol>
                        <Link className="pt-link" to={withYear('/explore/ghana')}>Compare all 16 regions {ARROW}</Link>
                    </aside>
                </div>
            </section>

            <section className="explore-section explore-insights" aria-labelledby="explore-pipeline-title">
                <div className="explore-section__heading">
                    <span className="section-kicker">Project pipeline</span>
                    <h2 id="explore-pipeline-title">Projects expected to start and finish</h2>
                    <p>Projects whose planned start or planned completion falls in each year. When completions run above starts, assemblies are closing out more work than they are opening.</p>
                </div>
                <div className="explore-chart-card">
                    {trend.isPipelineLoading ? <Placeholder>Loading the project pipeline… this can take a few seconds.</Placeholder> : hasPipeline ? (
                        <LineChart
                            xValues={trend.years}
                            activeX={year}
                            formatY={formatNumber}
                            height={260}
                            ariaLabel={`Line chart of expected project starts and completions from ${trend.years[0]} to ${year}`}
                            series={[
                                { key: 'starts', label: 'Expected starts', color: '#16325a', values: pipelineRows.map((row) => row?.expectedStarts ?? null) },
                                { key: 'completions', label: 'Expected completions', color: '#c49a3c', values: pipelineRows.map((row) => row?.expectedCompletions ?? null) },
                            ]}
                        />
                    ) : <Placeholder>The project pipeline is not available right now.</Placeholder>}
                </div>
            </section>
        </>
    )
}

const NEXT_LINKS = [
    { label: 'Ghana overview', text: 'National totals, development dimensions and every region side by side.', to: '/explore/ghana', keepYear: true },
    { label: 'District performance (DPAT)', text: 'Official Final Scores, outcomes and rankings for every assembly.', to: '/dpat/performance-analysis' },
    { label: 'How DPAT works', text: 'What the assessment measures and how the Final Score is formed.', to: '/dpat/assessment' },
]

export const ExploreNext = ({ withYear }) => (
    <section className="explore-section explore-insights" aria-labelledby="explore-next-title">
        <div className="explore-section__heading">
            <span className="section-kicker">Keep exploring</span>
            <h2 id="explore-next-title">Go further</h2>
        </div>
        <div className="explore-next">
            {NEXT_LINKS.map((link) => (
                <Link className="explore-next__card" to={link.keepYear ? withYear(link.to) : link.to} key={link.label}>
                    <strong>{link.label}</strong>
                    <span>{link.text}</span>
                    <i aria-hidden="true">{ARROW}</i>
                </Link>
            ))}
        </div>
    </section>
)
