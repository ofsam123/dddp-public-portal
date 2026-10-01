import React, { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useDeliverySummary } from '../hooks/useScopedResource'
import { formatCedis, formatCedisFull, formatCount, formatShare } from '../services/formatters'
import { GHANA } from '../data/geography'
import './ExploreDepth.css'

const ARROW = <svg viewBox="0 0 16 16" aria-hidden="true"><path d="M3 8h10M9 4l4 4-4 4" /></svg>

export const DELIVERY_METRICS = [
    { key: 'projectsProgrammesTotal', label: 'Projects & programmes', get: (metrics) => metrics.projectsProgrammesTotal, format: formatCount },
    { key: 'projects', label: 'Projects', get: (metrics) => metrics.projects, format: formatCount },
    { key: 'programmes', label: 'Programmes', get: (metrics) => metrics.programmes, format: formatCount },
    { key: 'completedProjects', label: 'Completed projects', get: (metrics) => metrics.completedProjects, format: formatCount },
    { key: 'aapActivities', label: 'AAP activities', get: (metrics) => metrics.aapActivities, format: formatCount },
    { key: 'meetings', label: 'Meetings', get: (metrics) => metrics.meetings, format: formatCount },
    { key: 'igfCollected', label: 'IGF collected', get: (metrics) => metrics.igf.collected, format: formatCedis },
    { key: 'igfReleased', label: 'IGF released', get: (metrics) => metrics.igf.released, format: formatCedis },
]

const metricByKey = (key) => DELIVERY_METRICS.find((metric) => metric.key === key) || DELIVERY_METRICS[0]

export const Placeholder = ({ children }) => <p className="xd-placeholder" role="status">{children}</p>

export const DeliveryTiles = ({ metrics, isLoading, year }) => {
    const value = (getter, format = formatCount) => (metrics ? format(getter(metrics)) : isLoading ? '…' : '—')
    const tiles = [
        { key: 'projects', label: 'Projects', value: value((m) => m.projects), note: `Active in ${year}` },
        { key: 'programmes', label: 'Programmes', value: value((m) => m.programmes), note: `Active in ${year}` },
        { key: 'completed', label: 'Completed projects', value: value((m) => m.completedProjects), note: 'Reported completed in the year' },
        { key: 'aap', label: 'Annual planned activities', value: value((m) => m.aapActivities), note: 'In Annual Action Plans' },
        { key: 'meetings', label: 'Meetings', value: value((m) => m.meetings), note: 'Recorded assembly meetings' },
        {
            key: 'igf-collected',
            label: 'IGF collected',
            value: value((m) => m.igf.collected, formatCedis),
            note: metrics ? `${formatCount(metrics.igf.records)} records · ${formatCount(metrics.igf.reportingAssemblies)} assemblies` : 'Internally Generated Funds',
        },
        {
            key: 'igf-released',
            label: 'IGF released',
            value: value((m) => m.igf.released, formatCedis),
            note: metrics ? `Reported by ${formatCount(metrics.igf.releasedAssemblies)} ${metrics.igf.releasedAssemblies === 1 ? 'assembly' : 'assemblies'}` : 'Capital expenditure releases',
        },
    ]
    return (
        <div className="xd-tiles">
            {tiles.map((tile) => (
                <article className={`xd-tile xd-tile--${tile.key}`} key={tile.key}>
                    <span>{tile.label}</span>
                    <strong>{tile.value}</strong>
                    <small>{tile.note}</small>
                </article>
            ))}
        </div>
    )
}

export const ChildBars = ({ items, metricKey, metric: customMetric, onSelect, hrefFor, selectedSlug, limit = 12, emptyLabel = 'No figures recorded' }) => {
    const [showAll, setShowAll] = useState(false)
    const metric = customMetric || metricByKey(metricKey)
    const ranked = useMemo(() => [...items]
        .map((item) => ({ ...item, value: metric.get(item.metrics) }))
        .sort((a, b) => b.value - a.value || a.name.localeCompare(b.name)), [items, metric])
    const max = Math.max(0, ...ranked.map((item) => item.value))
    const total = ranked.reduce((sum, item) => sum + item.value, 0)
    const visible = showAll ? ranked : ranked.slice(0, limit)
    if (ranked.length === 0) return <Placeholder>{emptyLabel}</Placeholder>

    return (
        <>
            <ol className="xd-bars" aria-label={`${metric.label} by area`}>
                {visible.map((item, index) => {
                    const content = (
                        <>
                            <span className="xd-bars__rank">{index + 1}</span>
                            <span className="xd-bars__name">{item.name}</span>
                            <span className="xd-bars__track" aria-hidden="true"><i style={{ width: `${max > 0 ? (item.value / max) * 100 : 0}%` }} /></span>
                            <b>{metric.format(item.value)}</b>
                            <small>{formatShare(item.value, total)}</small>
                        </>
                    )
                    return (
                        <li key={item.slug} className={selectedSlug === item.slug ? 'is-selected' : undefined}>
                            {onSelect ? (
                                <button type="button" onClick={() => onSelect(item)} aria-pressed={selectedSlug === item.slug}>{content}</button>
                            ) : (
                                <Link to={hrefFor(item)}>{content}</Link>
                            )}
                        </li>
                    )
                })}
            </ol>
            {ranked.length > limit && (
                <button type="button" className="xd-more" onClick={() => setShowAll((current) => !current)} aria-expanded={showAll}>
                    {showAll ? `Show top ${limit}` : `Show all ${ranked.length}`}
                </button>
            )}
        </>
    )
}

export const SectorBars = ({ sectors }) => {
    const rows = sectors.filter((sector) => sector.total > 0).sort((a, b) => b.total - a.total)
    const max = Math.max(0, ...rows.map((row) => row.total))
    const total = rows.reduce((sum, row) => sum + row.total, 0)
    if (rows.length === 0) return <Placeholder>No projects or programmes recorded for this period.</Placeholder>
    return (
        <>
            <ol className="xd-sector-bars">
                {rows.map((row) => (
                    <li key={row.label}>
                        <span className="xd-sector-bars__name">{row.label}</span>
                        <span className="xd-sector-bars__track" aria-hidden="true">
                            <i className="is-projects" style={{ width: `${max ? (row.projects / max) * 100 : 0}%` }} />
                            <i className="is-programmes" style={{ width: `${max ? (row.programmes / max) * 100 : 0}%` }} />
                        </span>
                        <b>{formatCount(row.total)}</b>
                        <small>{formatShare(row.total, total)}</small>
                    </li>
                ))}
            </ol>
            <ul className="xd-legend">
                <li><i className="is-projects" />Projects</li>
                <li><i className="is-programmes" />Programmes</li>
            </ul>
        </>
    )
}

export const IgfSourceBars = ({ sources, total }) => {
    const rows = sources.filter((source) => source.collected > 0 || source.records > 0).sort((a, b) => b.collected - a.collected)
    const max = Math.max(0, ...rows.map((row) => row.collected))
    if (rows.length === 0) return <Placeholder>No IGF collections recorded for this period.</Placeholder>
    return (
        <ol className="xd-sector-bars xd-sector-bars--igf">
            {rows.map((row) => (
                <li key={row.label} title={formatCedisFull(row.collected)}>
                    <span className="xd-sector-bars__name">{row.label}</span>
                    <span className="xd-sector-bars__track" aria-hidden="true"><i className="is-igf" style={{ width: `${max ? (row.collected / max) * 100 : 0}%` }} /></span>
                    <b>{formatCedis(row.collected)}</b>
                    <small>{formatShare(row.collected, total)}</small>
                </li>
            ))}
        </ol>
    )
}

const TYPE_VIEWS = [
    { key: 'total', label: 'All' },
    { key: 'projects', label: 'Projects' },
    { key: 'programmes', label: 'Programmes' },
]

export const SectorMatrix = ({ items, areaLabel, hrefFor, onSelect }) => {
    const [typeKey, setTypeKey] = useState('total')
    const [sectorLabel, setSectorLabel] = useState('')
    const sectorLabels = useMemo(() => {
        const totals = new Map()
        items.forEach((item) => item.metrics.sectors.forEach((sector) => totals.set(sector.label, (totals.get(sector.label) || 0) + sector.total)))
        return [...totals.entries()].filter(([, value]) => value > 0).sort((a, b) => b[1] - a[1]).map(([label]) => label)
    }, [items])
    const valueOf = (item, label) => item.metrics.sectors.find((sector) => sector.label === label)?.[typeKey] || 0
    const columnMax = new Map(sectorLabels.map((label) => [label, Math.max(0, ...items.map((item) => valueOf(item, label)))]))
    const rows = [...items]
        .map((item) => ({ ...item, rowTotal: sectorLabels.reduce((sum, label) => sum + valueOf(item, label), 0) }))
        .sort((a, b) => b.rowTotal - a.rowTotal || a.name.localeCompare(b.name))
    const columnTotals = sectorLabels.map((label) => rows.reduce((sum, row) => sum + valueOf(row, label), 0))
    const activeSector = sectorLabels.includes(sectorLabel) ? sectorLabel : ''
    const chartItems = activeSector
        ? rows.map((row) => ({ ...row, metrics: { ...row.metrics, projectsProgrammesTotal: valueOf(row, activeSector) } }))
        : rows.map((row) => ({ ...row, metrics: { ...row.metrics, projectsProgrammesTotal: row.rowTotal } }))

    if (sectorLabels.length === 0) return <Placeholder>No sector information is recorded for this period.</Placeholder>

    return (
        <div className="xd-matrix">
            <div className="xd-matrix__controls">
                <div className="xd-toggle" role="group" aria-label="Activity type">
                    {TYPE_VIEWS.map((view) => (
                        <button key={view.key} type="button" className={typeKey === view.key ? 'is-active' : undefined} aria-pressed={typeKey === view.key} onClick={() => setTypeKey(view.key)}>{view.label}</button>
                    ))}
                </div>
                <label className="xd-select">
                    <span>Chart a sector</span>
                    <select value={activeSector} onChange={(event) => setSectorLabel(event.target.value)}>
                        <option value="">All sectors combined</option>
                        {sectorLabels.map((label) => <option key={label} value={label}>{label}</option>)}
                    </select>
                </label>
            </div>
            <div className="xd-matrix__chart">
                <h4>{activeSector || 'All sectors'} · {TYPE_VIEWS.find((view) => view.key === typeKey).label.toLowerCase()} by {areaLabel.toLowerCase()}</h4>
                <ChildBars items={chartItems} metricKey="projectsProgrammesTotal" hrefFor={hrefFor} onSelect={onSelect} limit={10} />
            </div>
            <div className="xd-matrix__scroll" tabIndex={0} role="region" aria-label={`Sector counts by ${areaLabel.toLowerCase()}`}>
                <table className="xd-table">
                    <thead>
                        <tr>
                            <th scope="col">{areaLabel}</th>
                            <th scope="col" className="is-total">Total</th>
                            {sectorLabels.map((label) => <th scope="col" key={label} className={label === activeSector ? 'is-active' : undefined}>{label}</th>)}
                        </tr>
                    </thead>
                    <tbody>
                        {rows.map((row) => (
                            <tr key={row.slug}>
                                <th scope="row">
                                    {onSelect
                                        ? <button type="button" onClick={() => onSelect(row)}>{row.name}</button>
                                        : <Link to={hrefFor(row)}>{row.name}</Link>}
                                </th>
                                <td className="is-total">{formatCount(row.rowTotal)}</td>
                                {sectorLabels.map((label) => {
                                    const cell = valueOf(row, label)
                                    const max = columnMax.get(label)
                                    return (
                                        <td key={label} style={{ '--heat': max ? (cell / max).toFixed(2) : 0 }} className={cell === 0 ? 'is-zero' : undefined}>
                                            {formatCount(cell)}
                                        </td>
                                    )
                                })}
                            </tr>
                        ))}
                    </tbody>
                    <tfoot>
                        <tr>
                            <th scope="row">All {areaLabel.toLowerCase()}s</th>
                            <td className="is-total">{formatCount(columnTotals.reduce((sum, value) => sum + value, 0))}</td>
                            {columnTotals.map((value, index) => <td key={sectorLabels[index]}>{formatCount(value)}</td>)}
                        </tr>
                    </tfoot>
                </table>
            </div>
        </div>
    )
}

export const MetricPicker = ({ value, onChange, label = 'Compare by', options = DELIVERY_METRICS }) => (
    <label className="xd-select">
        <span>{label}</span>
        <select value={value} onChange={(event) => onChange(event.target.value)}>
            {options.map((metric) => <option key={metric.key} value={metric.key}>{metric.label}</option>)}
        </select>
    </label>
)

const ScopeProfile = ({ data, isLoading, year }) => (
    <div className="xd-profile-grid">
        <div className="xd-card">
            <h4>Projects &amp; programmes by sector</h4>
            {data ? <SectorBars sectors={data.metrics.sectors} /> : <Placeholder>{isLoading ? 'Loading sectors…' : 'Sector figures unavailable'}</Placeholder>}
        </div>
        <div className="xd-card">
            <h4>IGF collected by source</h4>
            {data ? <IgfSourceBars sources={data.metrics.igfSources} total={data.metrics.igf.collected} /> : <Placeholder>{isLoading ? 'Loading IGF…' : 'IGF figures unavailable'}</Placeholder>}
            {data && <p className="xd-note">{formatCedisFull(data.metrics.igf.collected)} collected in {year}; {formatCedisFull(data.metrics.igf.released)} released for capital expenditure.</p>}
        </div>
    </div>
)

const sourceNote = (year) => `Source: DDDP trackers, ${year}. Projects and programmes are counted when their expected implementation period overlaps the year; completed projects had a progress report marked Completed during the year; IGF follows each record's reporting year.`

export const DrillDownExplorer = ({ year, geographyData, withYear }) => {
    const [regionSlug, setRegionSlug] = useState(null)
    const [districtSlug, setDistrictSlug] = useState(null)
    const [metricKey, setMetricKey] = useState('projectsProgrammesTotal')
    const region = (geographyData?.regions || []).find((item) => item.slug === regionSlug) || null
    const district = region ? (geographyData?.districts || []).find((item) => item.parentId === region.id && item.slug === districtSlug) || null : null
    const national = useDeliverySummary({ geography: GHANA, year })
    const regional = useDeliverySummary({ geography: region, year, enabled: Boolean(region) })
    const local = useDeliverySummary({ geography: district ? { ...district, level: 'district' } : null, regionSlug: region?.slug, year, enabled: Boolean(district) })
    const current = district ? local : region ? regional : national
    const childSource = region ? regional : national
    const children = childSource.data?.children || []
    const scopeName = district?.name || (region ? `${region.name} Region` : 'Ghana')
    const pageHref = district
        ? withYear(`/explore/regions/${region.slug}/districts/${district.slug}`)
        : region ? withYear(`/explore/regions/${region.slug}`) : withYear('/explore/ghana')

    const selectChild = (item) => {
        if (!region) {
            setRegionSlug(item.slug)
            setDistrictSlug(null)
        } else {
            setDistrictSlug(item.slug === districtSlug ? null : item.slug)
        }
    }

    return (
        <section className="explore-section xd-section" aria-labelledby="xd-drill-title">
            <div className="explore-section__heading">
                <span className="section-kicker">Drill down · {year || '…'}</span>
                <h2 id="xd-drill-title">From Ghana to every district</h2>
                <p>Select a region to chart its districts, then select a district to see its projects, finances and sectors in depth. Every level uses the same live DDDP data.</p>
            </div>

            <nav className="xd-crumbs" aria-label="Drill-down level">
                <button type="button" className={!region ? 'is-current' : undefined} onClick={() => { setRegionSlug(null); setDistrictSlug(null) }}>Ghana</button>
                {region && <button type="button" className={!district ? 'is-current' : undefined} onClick={() => setDistrictSlug(null)}>{region.name} Region</button>}
                {district && <span className="is-current">{district.name}</span>}
                <label className="xd-select xd-crumbs__picker">
                    <span>Region</span>
                    <select value={regionSlug || ''} onChange={(event) => { setRegionSlug(event.target.value || null); setDistrictSlug(null) }}>
                        <option value="">All regions</option>
                        {(geographyData?.regions || []).map((item) => <option key={item.slug} value={item.slug}>{item.name}</option>)}
                    </select>
                </label>
            </nav>

            <DeliveryTiles metrics={current.data?.metrics} isLoading={current.isLoading} year={year} />

            <div className="xd-drill">
                <div className="xd-card">
                    <div className="xd-card__head">
                        <h3>{region ? `Districts in ${region.name}` : "Ghana's regions"}</h3>
                        <MetricPicker value={metricKey} onChange={setMetricKey} />
                    </div>
                    {childSource.isLoading ? <Placeholder>Loading {region ? 'district' : 'regional'} figures… the first load can take up to a minute.</Placeholder> : children.length ? (
                        <ChildBars items={children} metricKey={metricKey} onSelect={selectChild} selectedSlug={district?.slug} limit={region ? 12 : 16} />
                    ) : <Placeholder>Figures are not available right now.</Placeholder>}
                    <p className="xd-note">{region ? 'Select a district to see it in depth.' : 'Select a region to drill down to its districts.'}</p>
                </div>
                <div className="xd-scope">
                    <div className="xd-scope__head">
                        <div>
                            <span className="section-kicker">In depth</span>
                            <h3>{scopeName}</h3>
                        </div>
                        <Link className="pt-link" to={pageHref}>Open full profile {ARROW}</Link>
                    </div>
                    <ScopeProfile data={current.data} isLoading={current.isLoading} year={year} />
                </div>
            </div>

            <div className="xd-card xd-card--flush">
                <div className="xd-card__head">
                    <h3>Sectors of projects &amp; programmes by {region ? 'district' : 'region'}</h3>
                </div>
                {childSource.isLoading ? <Placeholder>Loading sector breakdown…</Placeholder> : (
                    <SectorMatrix items={children} areaLabel={region ? 'District' : 'Region'} onSelect={selectChild} />
                )}
            </div>
            <p className="xd-source">{sourceNote(year)}</p>
        </section>
    )
}

export const GeographyDepth = ({ geography, region, year, withYear }) => {
    const [metricKey, setMetricKey] = useState('projectsProgrammesTotal')
    const summary = useDeliverySummary({ geography, regionSlug: region?.slug, year })
    const children = summary.data?.children || []
    const childLabel = geography.level === 'national' ? 'Region' : 'District'
    const hrefFor = (item) => (geography.level === 'national'
        ? withYear(`/explore/regions/${item.slug}`)
        : withYear(`/explore/regions/${geography.slug}/districts/${item.slug}`))

    return (
        <section className="explore-section xd-section" aria-labelledby="xd-depth-title">
            <div className="explore-section__heading">
                <span className="section-kicker">In depth · {year || '…'}</span>
                <h2 id="xd-depth-title">{geography.name} in depth</h2>
                <p>
                    {geography.level === 'district'
                        ? `Projects, programmes, planned activities and Internally Generated Funds recorded by ${geography.name}.`
                        : `Projects, programmes, planned activities and Internally Generated Funds across ${geography.name}, with every ${childLabel.toLowerCase()} compared.`}
                </p>
            </div>
            <DeliveryTiles metrics={summary.data?.metrics} isLoading={summary.isLoading} year={year} />
            {children.length > 0 && (
                <div className="xd-card">
                    <div className="xd-card__head">
                        <h3>{childLabel}s compared</h3>
                        <MetricPicker value={metricKey} onChange={setMetricKey} />
                    </div>
                    <ChildBars items={children} metricKey={metricKey} hrefFor={hrefFor} limit={16} />
                </div>
            )}
            <ScopeProfile data={summary.data} isLoading={summary.isLoading} year={year} />
            {children.length > 0 && (
                <div className="xd-card xd-card--flush">
                    <div className="xd-card__head">
                        <h3>Sectors of projects &amp; programmes by {childLabel.toLowerCase()}</h3>
                    </div>
                    <SectorMatrix items={children} areaLabel={childLabel} hrefFor={hrefFor} />
                </div>
            )}
            {geography.level === 'district' && summary.data && (
                <div className="xd-card">
                    <div className="xd-card__head"><h3>Sector list</h3></div>
                    <div className="xd-matrix__scroll">
                        <table className="xd-table xd-table--list">
                            <thead><tr><th scope="col">Sector</th><th scope="col">Projects</th><th scope="col">Programmes</th><th scope="col" className="is-total">Total</th></tr></thead>
                            <tbody>
                                {summary.data.metrics.sectors.filter((sector) => sector.total > 0).sort((a, b) => b.total - a.total).map((sector) => (
                                    <tr key={sector.label}><th scope="row">{sector.label}</th><td>{formatCount(sector.projects)}</td><td>{formatCount(sector.programmes)}</td><td className="is-total">{formatCount(sector.total)}</td></tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <p className="xd-note">Records are registered at district level, the most detailed level with published data.</p>
                </div>
            )}
            {summary.isLoading && !summary.data && <Placeholder>Loading in-depth figures… the first load can take up to a minute.</Placeholder>}
            <p className="xd-source">{sourceNote(year)}</p>
        </section>
    )
}
