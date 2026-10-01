import React, { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import NavBar from '../header/NavBar'
import PublicFooter from '../footer/PublicFooter'
import DataPageHeader from './components/DataPageHeader'
import { ExploreNext } from './components/ExploreInsights'
import { LineChart, Sparkline } from '../shared/charts/PortalCharts'
import usePublicGeography from './hooks/usePublicGeography'
import usePublicYear from './hooks/usePublicYear'
import { getNationalGeography, getRegions, loadPublicNationalBreakdowns } from './services/publicDataService'
import { loadAapSummary } from './services/datasetDataService'
import './Explore.css'
import './DevelopmentDimension.css'

const DIMENSIONS = [
    {
        key: 'Social Development (SD)',
        short: 'Social development',
        code: 'SD',
        color: '#16325a',
        text: 'Education, health, water, sanitation, social protection and other services that build human capital.',
    },
    {
        key: 'Environment, infrastructure and human settlement',
        short: 'Environment, infrastructure & settlements',
        code: 'EIHS',
        color: '#1f8f5f',
        text: 'Roads, energy, housing, spatial planning, environmental protection and climate action.',
    },
    {
        key: 'Governance, Corruption And Public Accountability(GCPA)',
        short: 'Governance & accountability',
        code: 'GCPA',
        color: '#c49a3c',
        text: 'Local governance, public financial management, transparency, security and citizen participation.',
    },
    {
        key: 'Economic Development (ED)',
        short: 'Economic development',
        code: 'ED',
        color: '#3a6ea5',
        text: 'Agriculture, local economic development, trade, tourism and job creation.',
    },
    {
        key: 'Implementation, Coordination, Monitoring And Evaluation',
        short: 'Implementation, coordination & M&E',
        code: 'ICME',
        color: '#2c8c99',
        text: 'Planning, coordination, monitoring and evaluation of the development plan itself.',
    },
    {
        key: 'Emergency Planning And Covid-19 Response',
        short: 'Emergency planning & COVID-19',
        code: 'EP',
        color: '#b4493f',
        text: 'Disaster preparedness, emergency response and COVID-19 recovery measures.',
    },
    {
        key: 'Other',
        short: 'Other',
        code: 'Other',
        color: '#8a97a8',
        text: 'Activities recorded without one of the main development dimensions.',
    },
]

const TREND_SPAN = 8
const REGION_CONCURRENCY = 4
const numberFormat = new Intl.NumberFormat('en-GH')
const formatNumber = (value) => (Number.isFinite(value) ? numberFormat.format(Math.round(value)) : '—')
const formatShare = (value, digits = 1) => (Number.isFinite(value) ? `${value.toFixed(digits)}%` : '—')

const toShares = (distribution) => {
    if (!distribution || !distribution.total) return null
    const byLabel = new Map(distribution.categories.map((category) => [category.label, category.count]))
    return {
        total: distribution.total,
        classified: distribution.classified,
        unclassified: distribution.unclassified,
        dims: Object.fromEntries(DIMENSIONS.map((dimension) => {
            const count = byLabel.get(dimension.key) || 0
            return [dimension.key, { count, share: (count / distribution.total) * 100 }]
        })),
    }
}

const runLimited = async (items, limit, worker) => {
    let next = 0
    const runners = Array.from({ length: Math.min(limit, items.length) }, async () => {
        while (next < items.length) {
            const item = items[next]
            next += 1
            await worker(item)
        }
    })
    await Promise.all(runners)
}

const useDimensionTrend = ({ year, years }) => {
    const windowYears = useMemo(
        () => (Number.isInteger(year) ? years.filter((item) => item <= year).slice(-TREND_SPAN) : []),
        [year, years],
    )
    const key = windowYears.join(',')
    const [state, setState] = useState({ key: null, rows: [] })

    useEffect(() => {
        if (!key) return undefined
        let active = true
        const list = key.split(',').map(Number)
        Promise.all(list.map((item) => loadPublicNationalBreakdowns({ year: item }).catch(() => null)))
            .then((rows) => active && setState({ key, rows: rows.map((row) => toShares(row?.developmentDimensions)) }))
        return () => {
            active = false
        }
    }, [key])

    return { years: windowYears, rows: state.key === key ? state.rows : [], isLoading: Boolean(key) && state.key !== key }
}

const useAapDimensions = ({ year, regions }) => {
    const regionKey = regions.map((region) => region.slug).join(',')
    const [national, setNational] = useState({ year: null, value: null })
    const [byRegion, setByRegion] = useState({ year: null, values: {} })

    useEffect(() => {
        if (!Number.isInteger(year)) return undefined
        let active = true
        loadAapSummary({ geography: getNationalGeography(), year })
            .catch(() => null)
            .then((payload) => active && setNational({ year, value: toShares(payload?.distributions?.developmentDimensions) }))
        return () => {
            active = false
        }
    }, [year])

    useEffect(() => {
        if (!Number.isInteger(year) || !regionKey) return undefined
        let active = true
        setByRegion({ year, values: {} })
        runLimited(regions, REGION_CONCURRENCY, async (region) => {
            const payload = await loadAapSummary({ geography: { level: 'region', slug: region.slug }, year }).catch(() => null)
            if (!active) return
            const value = toShares(payload?.distributions?.developmentDimensions)
            setByRegion((current) => (current.year === year ? { year, values: { ...current.values, [region.slug]: value || 'unavailable' } } : current))
        })
        return () => {
            active = false
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [year, regionKey])

    return {
        national: national.year === year ? national.value : null,
        isNationalLoading: national.year !== year,
        byRegion: byRegion.year === year ? byRegion.values : {},
    }
}

const Placeholder = ({ children }) => <p className="dimension-placeholder" role="status">{children}</p>

const DimensionCards = ({ year, trend }) => {
    const index = trend.years.indexOf(year)
    const current = trend.rows[index]
    const previous = index > 0 ? trend.rows[index - 1] : null

    return (
        <div className="dimension-cards">
            {DIMENSIONS.map((dimension) => {
                const value = current?.dims[dimension.key]
                const before = previous?.dims[dimension.key]
                const change = value && before?.count ? ((value.count - before.count) / before.count) * 100 : null
                return (
                    <article className="dimension-card" key={dimension.key} style={{ '--dim': dimension.color }}>
                        <header>
                            <span className="dimension-card__code">{dimension.code}</span>
                            <h3>{dimension.short}</h3>
                        </header>
                        <p>{dimension.text}</p>
                        <div className="dimension-card__figures">
                            <strong>{trend.isLoading ? '…' : formatNumber(value?.count)}</strong>
                            <span>{trend.isLoading ? '' : `${formatShare(value?.share)} of projects & programmes`}</span>
                        </div>
                        {!trend.isLoading && change !== null && (
                            <span className={`dimension-card__change is-${change >= 0 ? 'up' : 'down'}`}>
                                {change >= 0 ? '▲' : '▼'} {Math.abs(change).toFixed(1)}% vs {trend.years[index - 1]}
                            </span>
                        )}
                        <div className="dimension-card__spark">
                            <Sparkline values={trend.rows.map((row) => row?.dims[dimension.key]?.count ?? null)} color={dimension.color} />
                        </div>
                    </article>
                )
            })}
        </div>
    )
}

const FocusComparison = ({ projects, aap, year, isLoading }) => {
    const max = Math.max(1, ...DIMENSIONS.flatMap((dimension) => [projects?.dims[dimension.key]?.share || 0, aap?.dims[dimension.key]?.share || 0]))
    const lead = projects ? DIMENSIONS.reduce((best, dimension) => (projects.dims[dimension.key].count > projects.dims[best.key].count ? dimension : best), DIMENSIONS[0]) : null

    return (
        <div className="dimension-split">
            <div className="explore-chart-card">
                <div className="dimension-chart-head">
                    <h3>Share of recorded activity by dimension, {year}</h3>
                    <ul className="pc-legend">
                        <li><i style={{ background: 'var(--pt-navy)' }} />Projects &amp; programmes</li>
                        <li><i style={{ background: 'var(--pt-gold)' }} />Annual action plan activities</li>
                    </ul>
                </div>
                {isLoading && !projects ? <Placeholder>Loading dimension breakdown…</Placeholder> : (
                    <ul className="dimension-bars">
                        {DIMENSIONS.map((dimension) => {
                            const p = projects?.dims[dimension.key]
                            const a = aap?.dims[dimension.key]
                            return (
                                <li key={dimension.key}>
                                    <span className="dimension-bars__label"><i style={{ background: dimension.color }} />{dimension.short}</span>
                                    <div className="dimension-bars__rows">
                                        <div>
                                            <span className="dimension-bars__track"><i style={{ width: `${((p?.share || 0) / max) * 100}%` }} /></span>
                                            <b>{formatShare(p?.share)}</b>
                                        </div>
                                        <div className="is-aap">
                                            <span className="dimension-bars__track"><i style={{ width: `${((a?.share || 0) / max) * 100}%` }} /></span>
                                            <b>{aap ? formatShare(a?.share) : '…'}</b>
                                        </div>
                                    </div>
                                </li>
                            )
                        })}
                    </ul>
                )}
            </div>
            <aside className="explore-insights__facts" aria-label="Dimension highlights">
                <div>
                    <span>Leading dimension</span>
                    <strong className="dimension-fact__text">{lead ? lead.short : '—'}</strong>
                    <p>{lead ? `${formatShare(projects.dims[lead.key].share)} of projects and programmes in ${year}` : 'Waiting for data'}</p>
                </div>
                <div>
                    <span>Projects &amp; programmes</span>
                    <strong>{formatNumber(projects?.total)}</strong>
                    <p>{projects ? `${formatNumber(projects.unclassified)} without a dimension` : 'recorded in the year'}</p>
                </div>
                <div>
                    <span>Action plan activities</span>
                    <strong>{aap ? formatNumber(aap.total) : '…'}</strong>
                    <p>{aap ? `${formatNumber(aap.unclassified)} without a dimension` : 'Loading annual action plans'}</p>
                </div>
            </aside>
        </div>
    )
}

const MixOverTime = ({ trend, year }) => {
    const rows = trend.rows
    const hasRows = rows.some(Boolean)

    return (
        <div className="explore-chart-card">
            {trend.isLoading ? <Placeholder>Loading the dimension trend… this can take a few seconds.</Placeholder> : hasRows ? (
                <>
                    <LineChart
                        xValues={trend.years}
                        activeX={year}
                        formatY={(value) => formatShare(value)}
                        yTickFormat={(value) => `${Math.round(value)}%`}
                        area={false}
                        ariaLabel={`Line chart of each development dimension's share of projects and programmes from ${trend.years[0]} to ${year}`}
                        series={DIMENSIONS.map((dimension) => ({
                            key: dimension.code,
                            label: dimension.short,
                            color: dimension.color,
                            values: rows.map((row) => row?.dims[dimension.key]?.share ?? null),
                        }))}
                    />
                    <div className="dimension-mix">
                        <h3>Mix by year</h3>
                        {trend.years.map((item, index) => rows[index] && (
                            <div className={`dimension-mix__row${item === year ? ' is-active' : ''}`} key={item}>
                                <span>{item}</span>
                                <div className="dimension-mix__bar">
                                    {DIMENSIONS.map((dimension) => {
                                        const share = rows[index].dims[dimension.key].share
                                        return share > 0 && (
                                            <i key={dimension.key} style={{ width: `${share}%`, background: dimension.color }} title={`${dimension.short}: ${formatShare(share)}`}>
                                                {share >= 9 ? `${Math.round(share)}%` : ''}
                                            </i>
                                        )
                                    })}
                                </div>
                                <b>{formatNumber(rows[index].total)}</b>
                            </div>
                        ))}
                    </div>
                </>
            ) : <Placeholder>The dimension trend is not available right now.</Placeholder>}
        </div>
    )
}

const heat = (share) => `rgba(22, 50, 90, ${Math.min(0.92, 0.06 + (share / 55) * 0.86)})`

const RegionalHeatmap = ({ regions, byRegion, national, year, withYear }) => {
    const [selected, setSelected] = useState(null)
    const loaded = regions.filter((region) => byRegion[region.slug] && byRegion[region.slug] !== 'unavailable')
    const pending = regions.filter((region) => !byRegion[region.slug]).length
    const selectedRegion = regions.find((region) => region.slug === selected) || loaded[0] || null
    const selectedData = selectedRegion ? byRegion[selectedRegion.slug] : null

    const leaders = DIMENSIONS.slice(0, 6).map((dimension) => {
        const best = loaded.reduce((top, region) => (!top || byRegion[region.slug].dims[dimension.key].share > byRegion[top.slug].dims[dimension.key].share ? region : top), null)
        return { dimension, region: best, share: best ? byRegion[best.slug].dims[dimension.key].share : null }
    })

    return (
        <>
            <div className="explore-chart-card dimension-heatmap-card">
                <div className="dimension-chart-head">
                    <h3>Annual action plan activities by region and dimension, {year}</h3>
                    <span className="dimension-progress" aria-live="polite">
                        {pending > 0 ? `Loading regions… ${regions.length - pending} of ${regions.length}` : `${loaded.length} regions`}
                    </span>
                </div>
                <div className="dimension-heatmap" role="region" aria-label="Regional heatmap" tabIndex={0}>
                    <table>
                        <thead>
                            <tr>
                                <th scope="col">Region</th>
                                {DIMENSIONS.map((dimension) => <th scope="col" key={dimension.key} title={dimension.short}>{dimension.code}</th>)}
                                <th scope="col">Activities</th>
                            </tr>
                        </thead>
                        <tbody>
                            {national && (
                                <tr className="is-national">
                                    <th scope="row">Ghana</th>
                                    {DIMENSIONS.map((dimension) => <td key={dimension.key}>{formatShare(national.dims[dimension.key].share, 0)}</td>)}
                                    <td className="is-total">{formatNumber(national.total)}</td>
                                </tr>
                            )}
                            {regions.map((region) => {
                                const data = byRegion[region.slug]
                                const isSelected = selectedRegion?.slug === region.slug
                                return (
                                    <tr key={region.slug} className={isSelected ? 'is-selected' : undefined}>
                                        <th scope="row">
                                            <button type="button" onClick={() => setSelected(region.slug)} aria-pressed={isSelected}>{region.name}</button>
                                        </th>
                                        {DIMENSIONS.map((dimension) => {
                                            if (!data) return <td key={dimension.key} className="is-loading">…</td>
                                            if (data === 'unavailable') return <td key={dimension.key} className="is-loading">—</td>
                                            const share = data.dims[dimension.key].share
                                            return (
                                                <td key={dimension.key} style={{ background: heat(share), color: share > 24 ? '#fff' : 'var(--pt-ink)' }}>
                                                    {formatShare(share, 0)}
                                                </td>
                                            )
                                        })}
                                        <td className="is-total">{data && data !== 'unavailable' ? formatNumber(data.total) : '…'}</td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                </div>
                <p className="dimension-note">Each cell is the dimension&apos;s share of the region&apos;s recorded annual action plan activities. Darker cells mean a larger share. Select a region to compare it with Ghana.</p>
            </div>

            <div className="dimension-region">
                <div className="explore-chart-card">
                    {selectedRegion && selectedData && selectedData !== 'unavailable' ? (
                        <>
                            <div className="dimension-chart-head">
                                <h3>{selectedRegion.name} compared with Ghana</h3>
                                <Link className="pt-link" to={withYear(`/explore/regions/${selectedRegion.slug}`)}>
                                    Open {selectedRegion.name}
                                    <svg viewBox="0 0 16 16" aria-hidden="true"><path d="M3 8h10M9 4l4 4-4 4" /></svg>
                                </Link>
                            </div>
                            <ul className="dimension-compare">
                                {DIMENSIONS.map((dimension) => {
                                    const share = selectedData.dims[dimension.key].share
                                    const base = national?.dims[dimension.key].share
                                    const diff = Number.isFinite(base) ? share - base : null
                                    return (
                                        <li key={dimension.key}>
                                            <span className="dimension-bars__label"><i style={{ background: dimension.color }} />{dimension.short}</span>
                                            <span className="dimension-compare__track">
                                                <i style={{ width: `${Math.min(100, share * 1.6)}%`, background: dimension.color }} />
                                                {Number.isFinite(base) && <em style={{ left: `${Math.min(100, base * 1.6)}%` }} title={`Ghana: ${formatShare(base)}`} />}
                                            </span>
                                            <b>{formatShare(share)}</b>
                                            <small className={diff === null ? '' : diff >= 0 ? 'is-up' : 'is-down'}>
                                                {diff === null ? '' : `${diff >= 0 ? '+' : '−'}${Math.abs(diff).toFixed(1)} pts`}
                                            </small>
                                        </li>
                                    )
                                })}
                            </ul>
                            <p className="dimension-note">The marker on each bar shows Ghana&apos;s national share. Points show how far {selectedRegion.name} sits above or below it.</p>
                        </>
                    ) : <Placeholder>Regional figures are loading…</Placeholder>}
                </div>
                <aside className="explore-chart-card dimension-leaders" aria-labelledby="dimension-leaders-title">
                    <h3 id="dimension-leaders-title">Where each dimension leads</h3>
                    <p>The region with the largest share of its action plan activities in each dimension.</p>
                    <ul>
                        {leaders.map(({ dimension, region, share }) => (
                            <li key={dimension.key}>
                                <i style={{ background: dimension.color }} />
                                <span>
                                    <small>{dimension.short}</small>
                                    <strong>{region ? region.name : '…'}</strong>
                                </span>
                                <b>{formatShare(share, 0)}</b>
                            </li>
                        ))}
                    </ul>
                </aside>
            </div>
        </>
    )
}

const ABOUT = [
    {
        title: 'Projects & programmes',
        text: 'Projects and programmes recorded by assemblies whose expected implementation period overlaps the selected year, grouped by the development dimension they were assigned.',
    },
    {
        title: 'Annual action plan activities',
        text: 'Activities in assemblies\' annual action plans for the selected year. This is a wider set than projects and programmes, and is available for every region.',
    },
    {
        title: 'How shares are calculated',
        text: 'Shares are calculated over all recorded activities, including the small number without a dimension, so they may add up to slightly less than 100%.',
    },
]

const DevelopmentDimensionPage = () => {
    const { geographyData } = usePublicGeography()
    const publicYear = usePublicYear()
    const regions = useMemo(() => [...getRegions(geographyData)].sort((a, b) => a.name.localeCompare(b.name)), [geographyData])
    const trend = useDimensionTrend({ year: publicYear.year, years: publicYear.years })
    const aap = useAapDimensions({ year: publicYear.year, regions })
    const current = trend.rows[trend.years.indexOf(publicYear.year)] || null

    return (
        <>
            <NavBar />
            <main className="explore-page dimension-page">
                <DataPageHeader
                    breadcrumbs={[{ label: 'Home', href: publicYear.withYear('/') }, { label: 'Data & statistics' }, { label: 'Development dimensions' }]}
                    eyebrow="Data & statistics"
                    title="Development dimensions"
                    description="Ghana's national development framework groups district activity into development dimensions. See how recorded projects, programmes and annual action plan activities are shared across them, how that has changed and how regions differ."
                    actions={(
                        <>
                            <Link className="pt-button pt-button--primary" to={publicYear.withYear('/explore')}>
                                Explore by place
                                <svg viewBox="0 0 16 16" aria-hidden="true"><path d="M3 8h10M9 4l4 4-4 4" /></svg>
                            </Link>
                            <Link className="pt-button pt-button--secondary" to={publicYear.withYear('/explore/ghana')}>Ghana overview</Link>
                        </>
                    )}
                    publicYear={publicYear}
                    source={publicYear.availability?.source}
                    retrievedAt={publicYear.availability?.retrievedAt}
                />

                <section className="explore-section" aria-labelledby="dimension-cards-title">
                    <div className="explore-section__heading">
                        <span className="section-kicker">The {DIMENSIONS.length} dimensions · {publicYear.year || '…'}</span>
                        <h2 id="dimension-cards-title">What each dimension covers</h2>
                        <p>Recorded projects and programmes in each dimension for the selected year, with the change from the year before and the trend since {trend.years[0] || '…'}.</p>
                    </div>
                    <DimensionCards year={publicYear.year} trend={trend} />
                </section>

                <section className="explore-section" aria-labelledby="dimension-focus-title">
                    <div className="explore-section__heading">
                        <span className="section-kicker">Where activity is focused</span>
                        <h2 id="dimension-focus-title">Projects and plans side by side</h2>
                        <p>How each dimension&apos;s share of projects and programmes compares with its share of the activities assemblies planned in their annual action plans.</p>
                    </div>
                    <FocusComparison projects={current} aap={aap.national} year={publicYear.year} isLoading={trend.isLoading} />
                </section>

                <section className="explore-section" aria-labelledby="dimension-trend-title">
                    <div className="explore-section__heading">
                        <span className="section-kicker">Over time</span>
                        <h2 id="dimension-trend-title">How the mix has changed</h2>
                        <p>Each dimension&apos;s share of recorded projects and programmes from {trend.years[0] || '…'} to {publicYear.year || '…'}. Hover the chart for each year&apos;s figures.</p>
                    </div>
                    <MixOverTime trend={trend} year={publicYear.year} />
                </section>

                <section className="explore-section" aria-labelledby="dimension-regions-title">
                    <div className="explore-section__heading">
                        <span className="section-kicker">Regions compared</span>
                        <h2 id="dimension-regions-title">How regions differ</h2>
                        <p>The dimension mix of annual action plan activities in each of Ghana&apos;s regions. Regions fill in as their figures load.</p>
                    </div>
                    <RegionalHeatmap regions={regions} byRegion={aap.byRegion} national={aap.national} year={publicYear.year} withYear={publicYear.withYear} />
                </section>

                <section className="explore-section" aria-labelledby="dimension-about-title">
                    <div className="explore-section__heading">
                        <span className="section-kicker">About this data</span>
                        <h2 id="dimension-about-title">Reading these figures</h2>
                    </div>
                    <div className="dimension-about">
                        {ABOUT.map((item) => (
                            <article key={item.title}>
                                <h3>{item.title}</h3>
                                <p>{item.text}</p>
                            </article>
                        ))}
                    </div>
                </section>

                <ExploreNext withYear={publicYear.withYear} />
            </main>
            <PublicFooter />
        </>
    )
}

export default DevelopmentDimensionPage
