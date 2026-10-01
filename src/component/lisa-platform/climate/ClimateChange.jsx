import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Image } from 'antd'
import NavBar from '../../header/NavBar'
import PublicFooter from '../../footer/PublicFooter'
import ExploreBreadcrumbs from '../../explore/components/ExploreBreadcrumbs'
import { climatePhotoUrl, getClimateOverview } from '../service/climate.service'
import {
    MAX_PLAUSIBLE_AFFECTED,
    RAINY_SEASONS,
    RISK_LEVELS,
    buildClimateIndex,
    formatDate,
    formatNumber,
    keyFindings,
    summarise,
} from './climateData'
import { ClimateMap, FieldGallery, KeyFindings, MatrixPanel, SeasonPanel, TopPlaces } from './ClimateSections'
import './ClimateChange.css'

const PAGE_SIZE = 10
const LEVEL_BY_KEY = Object.fromEntries(RISK_LEVELS.map((level) => [level.key, level]))

const percent = (part, whole) => (whole ? Math.round((part / whole) * 100) : 0)

const Chevron = ({ open }) => (
    <svg className={`cc-chevron${open ? ' is-open' : ''}`} viewBox="0 0 24 24" aria-hidden="true"><path d="m9 6 6 6-6 6" /></svg>
)

const LevelBadge = ({ level }) => {
    if (!level) return <span className="cc-badge cc-badge--none">Risk level not given</span>
    const tone = LEVEL_BY_KEY[level]
    return <span className="cc-badge" style={{ color: tone.color, background: tone.soft }}>{level} risk</span>
}

const RiskLevelPanel = ({ summary }) => (
    <article className="cc-panel">
        <h3>Risk level</h3>
        <p className="cc-panel__sub">How serious officers rated each recorded event</p>
        <div className="cc-stack" role="img" aria-label={summary.levels.map((level) => `${level.key}: ${level.total}`).join(', ')}>
            {summary.levels.filter((level) => level.total).map((level) => (
                <span key={level.key} style={{ width: `${percent(level.total, summary.records)}%`, background: level.color }} />
            ))}
        </div>
        <ul className="cc-levels">
            {summary.levels.map((level) => (
                <li key={level.key}>
                    <i style={{ background: level.color }} />
                    <span>{level.key}</span>
                    <strong>{formatNumber(level.total)}</strong>
                    <em>{percent(level.total, summary.records)}%</em>
                </li>
            ))}
        </ul>
    </article>
)

const YearPanel = ({ summary }) => {
    const max = Math.max(1, ...summary.years.map((item) => item.total))
    return (
        <article className="cc-panel">
            <h3>Records by year</h3>
            <p className="cc-panel__sub">Year the event occurred</p>
            <div className="cc-columns">
                {summary.years.map((item) => (
                    <div key={item.year} className="cc-columns__item" title={`${item.year}: ${item.total} records`}>
                        <span className="cc-columns__value">{item.total}</span>
                        <span className="cc-columns__bar" style={{ height: `${Math.max(4, (item.total / max) * 100)}%` }} />
                        <span className="cc-columns__label">{String(item.year).slice(2)}</span>
                    </div>
                ))}
            </div>
            <p className="cc-panel__foot">Years shown as ’YY</p>
        </article>
    )
}

const TypePanel = ({ summary }) => {
    const max = Math.max(1, ...summary.types.map((item) => item.total))
    return (
        <article className="cc-panel">
            <h3>Climate risks recorded</h3>
            <p className="cc-panel__sub">Number of records by type of risk</p>
            <ul className="cc-bars">
                {summary.types.slice(0, 8).map((item) => (
                    <li key={item.name}>
                        <span>{item.name}</span>
                        <strong>{item.total}</strong>
                        <i><b style={{ width: `${(item.total / max) * 100}%` }} /></i>
                    </li>
                ))}
            </ul>
        </article>
    )
}

const PlaceNavigator = ({ tree, scope, onScope, total }) => {
    const [query, setQuery] = useState('')
    const [openRegions, setOpenRegions] = useState(() => new Set())
    const [openDistricts, setOpenDistricts] = useState(() => new Set())

    const toggle = (setter, id) => setter((current) => {
        const next = new Set(current)
        if (next.has(id)) next.delete(id)
        else next.add(id)
        return next
    })

    const needle = query.trim().toLowerCase()
    const filtered = useMemo(() => {
        if (!needle) return tree
        return tree
            .map((region) => ({
                ...region,
                districts: region.districts
                    .map((district) => {
                        const districtHit = district.name.toLowerCase().includes(needle)
                        const communities = districtHit ? district.communities : district.communities.filter((item) => item.name.toLowerCase().includes(needle))
                        return districtHit || communities.length ? { ...district, communities } : null
                    })
                    .filter(Boolean),
            }))
            .filter((region) => region.districts.length || region.name.toLowerCase().includes(needle))
    }, [tree, needle])

    return (
        <nav className="cc-nav" aria-label="Choose a place">
            <label className="cc-search">
                <span className="cc-visually-hidden">Search districts and communities</span>
                <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></svg>
                <input type="search" placeholder="Search a district or community" value={query} onChange={(event) => setQuery(event.target.value)} />
            </label>
            <button type="button" className={`cc-nav__all${!scope.regionId ? ' is-active' : ''}`} onClick={() => onScope({})}>
                <span>All places</span><em>{total}</em>
            </button>
            <ul className="cc-nav__regions">
                {filtered.map((region) => {
                    const regionOpen = Boolean(needle) || openRegions.has(region.id) || scope.regionId === region.id
                    return (
                        <li key={region.id}>
                            <div className={`cc-nav__row cc-nav__row--region${scope.regionId === region.id && !scope.districtId ? ' is-active' : ''}`}>
                                <button type="button" className="cc-nav__toggle" aria-expanded={regionOpen} aria-label={`${regionOpen ? 'Collapse' : 'Expand'} ${region.name}`} onClick={() => toggle(setOpenRegions, region.id)}>
                                    <Chevron open={regionOpen} />
                                </button>
                                <button type="button" className="cc-nav__label" onClick={() => onScope({ regionId: region.id })}>
                                    <span>{region.name}</span><em>{region.count}</em>
                                </button>
                            </div>
                            {regionOpen && (
                                <ul>
                                    {region.districts.map((district) => {
                                        const districtOpen = Boolean(needle) || openDistricts.has(district.id) || scope.districtId === district.id
                                        return (
                                            <li key={district.id}>
                                                <div className={`cc-nav__row cc-nav__row--district${scope.districtId === district.id && !scope.communityId ? ' is-active' : ''}`}>
                                                    {district.communities.length ? (
                                                        <button type="button" className="cc-nav__toggle" aria-expanded={districtOpen} aria-label={`${districtOpen ? 'Collapse' : 'Expand'} ${district.name}`} onClick={() => toggle(setOpenDistricts, district.id)}>
                                                            <Chevron open={districtOpen} />
                                                        </button>
                                                    ) : <span className="cc-nav__spacer" />}
                                                    <button type="button" className="cc-nav__label" onClick={() => onScope({ regionId: region.id, districtId: district.id })}>
                                                        <span>{district.name}</span><em>{district.count}</em>
                                                    </button>
                                                </div>
                                                {districtOpen && district.communities.length > 0 && (
                                                    <ul>
                                                        {district.communities.map((community) => (
                                                            <li key={community.id}>
                                                                <button
                                                                    type="button"
                                                                    className={`cc-nav__community${scope.communityId === community.id ? ' is-active' : ''}`}
                                                                    onClick={() => onScope({ regionId: region.id, districtId: district.id, communityId: community.id })}
                                                                >
                                                                    <span>{community.name}</span><em>{community.count}</em>
                                                                </button>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                )}
                                            </li>
                                        )
                                    })}
                                </ul>
                            )}
                        </li>
                    )
                })}
                {!filtered.length && <li className="cc-nav__empty">No place matches “{query}”.</li>}
            </ul>
        </nav>
    )
}

const RecordCard = ({ row }) => {
    const { place } = row
    const [lng, lat] = row.coordinates || []
    return (
        <article className="cc-record">
            <header className="cc-record__head">
                <div className="cc-record__tags">
                    <span className="cc-type">{row.type}</span>
                    <LevelBadge level={row.riskLevel} />
                </div>
                <time dateTime={row.date || undefined}>{formatDate(row.date)}</time>
            </header>

            <h3>{row.title}</h3>
            <p className="cc-record__place">
                {place.isDistrictWide ? 'District-wide' : place.name}
                <span> · {place.districtLabel} · {place.regionName}</span>
            </p>
            {row.description && <p className="cc-record__desc">{row.description}</p>}

            <dl className="cc-facts">
                <div>
                    <dt>People affected</dt>
                    <dd>{row.affected !== null ? formatNumber(row.affected) : row.affectedUnverified ? 'Under review' : 'Not reported'}</dd>
                </div>
                <div>
                    <dt>Recorded value</dt>
                    <dd>{row.recordedValue !== null ? formatNumber(row.recordedValue) : 'Not reported'}</dd>
                </div>
                {row.livelihood && (
                    <div>
                        <dt>Main livelihood</dt>
                        <dd>{row.livelihood}</dd>
                    </div>
                )}
                {row.distanceKm !== null && (
                    <div>
                        <dt>From district capital</dt>
                        <dd>{formatNumber(row.distanceKm)} km</dd>
                    </div>
                )}
            </dl>

            {row.remarks && (
                <blockquote className="cc-remarks">
                    <span>Community remarks</span>
                    <p>{row.remarks}</p>
                </blockquote>
            )}

            {row.photos.length > 0 && (
                <div className="cc-photos">
                    <Image.PreviewGroup>
                        {row.photos.map((photoId, index) => (
                            <Image
                                key={photoId}
                                src={climatePhotoUrl(row.id, photoId)}
                                alt={`${row.title}, photo ${index + 1}`}
                                width={96}
                                height={72}
                                loading="lazy"
                                fallback="data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='96' height='72'><rect width='96' height='72' fill='%23eff3f9'/></svg>"
                            />
                        ))}
                    </Image.PreviewGroup>
                </div>
            )}

            {row.coordinates && (
                <a className="cc-record__map" href={`https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}#map=14/${lat}/${lng}`} target="_blank" rel="noreferrer">
                    <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21Z" /><circle cx="12" cy="9.5" r="2.5" /></svg>
                    View location ({lat.toFixed(3)}, {lng.toFixed(3)})
                </a>
            )}
        </article>
    )
}

const ClimateChange = () => {
    const [state, setState] = useState({ status: 'loading', data: null })
    const [scope, setScope] = useState({})
    const [level, setLevel] = useState('')
    const [type, setType] = useState('')
    const [year, setYear] = useState('')
    const [photosOnly, setPhotosOnly] = useState(false)
    const [visible, setVisible] = useState(PAGE_SIZE)

    const load = useCallback(() => {
        setState((current) => ({ ...current, status: 'loading' }))
        getClimateOverview()
            .then((response) => setState({ status: 'ready', data: response.data }))
            .catch(() => setState({ status: 'error', data: null }))
    }, [])

    useEffect(() => { load() }, [load])

    const index = useMemo(() => buildClimateIndex(state.data || {}), [state.data])
    const overall = useMemo(() => summarise(index.rows), [index.rows])

    const scopedRows = useMemo(() => index.rows.filter((row) => (!scope.regionId || row.place.regionId === scope.regionId)
        && (!scope.districtId || row.place.districtId === scope.districtId)
        && (!scope.communityId || row.place.id === scope.communityId)), [index.rows, scope])

    const filteredRows = useMemo(() => scopedRows.filter((row) => (!level || row.riskLevel === level)
        && (!type || row.type === type)
        && (!year || String(row.year) === year)
        && (!photosOnly || row.photos.length)), [scopedRows, level, type, year, photosOnly])

    const scoped = useMemo(() => summarise(scopedRows), [scopedRows])
    const findings = useMemo(() => keyFindings(scopedRows, scoped), [scopedRows, scoped])
    const regionNames = index.tree.map((item) => item.name.replace(/\s+Region$/i, '')).join(', ')
    const rainyShare = useMemo(() => {
        const dated = scoped.months.reduce((sum, item) => sum + item.total, 0)
        if (!dated) return null
        const rainy = scoped.months
            .filter((item) => RAINY_SEASONS.some((season) => season.months.includes(item.month)))
            .reduce((sum, item) => sum + item.total, 0)
        return Math.round((rainy / dated) * 100)
    }, [scoped])

    useEffect(() => { setVisible(PAGE_SIZE) }, [scope, level, type, year, photosOnly])

    const region = index.tree.find((item) => item.id === scope.regionId)
    const district = region?.districts.find((item) => item.id === scope.districtId)
    const community = district?.communities.find((item) => item.id === scope.communityId)
    const scopeTrail = [region?.name, district?.name, community?.name].filter(Boolean)
    const hasFilters = level || type || year || photosOnly

    const chooseScope = (next) => {
        setScope(next)
        document.getElementById('cc-records')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }

    return (
        <>
            <NavBar />
            <main className="cc-page">
                <header className="pt-page-hero cc-hero">
                    <div className="pt-container">
                        <ExploreBreadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'LISA climate', href: '/lisa' }, { label: 'Climate records' }]} />
                        <div className="cc-hero__grid">
                            <div>
                                <span className="pt-eyebrow"><i aria-hidden="true" />Community climate records</span>
                                <h1>Climate change records</h1>
                                <p className="pt-page-hero__lead">
                                    Floods, windstorms, erosion and other climate events recorded by district officers in the communities
                                    they serve, with the risk level, the people affected and photos from the field.
                                </p>
                            </div>
                            <dl className="cc-hero__stats" aria-label="Records at a glance">
                                <div><dt>Records</dt><dd>{state.status === 'ready' ? formatNumber(overall.records) : '—'}</dd></div>
                                <div><dt>Communities</dt><dd>{state.status === 'ready' ? formatNumber(overall.communities) : '—'}</dd></div>
                                <div><dt>Districts</dt><dd>{state.status === 'ready' ? formatNumber(overall.districts) : '—'}</dd></div>
                                <div><dt>People affected</dt><dd>{state.status === 'ready' ? formatNumber(overall.affected) : '—'}</dd></div>
                                <p>
                                    {state.status === 'ready'
                                        ? `Events from ${formatDate(overall.earliest, { month: 'short', year: 'numeric' })} to ${formatDate(overall.latest, { month: 'short', year: 'numeric' })}`
                                        : state.status === 'loading' ? 'Loading records…' : 'Records unavailable'}
                                </p>
                            </dl>
                        </div>
                    </div>
                </header>

                <div className="pt-container">
                    {state.status === 'error' && (
                        <div className="cc-state" role="alert">
                            <strong>Climate records are temporarily unavailable</strong>
                            <p>We could not reach the District Development Data Platform. Please try again in a moment.</p>
                            <button type="button" className="pt-button pt-button--secondary pt-button--sm" onClick={load}>Try again</button>
                        </div>
                    )}

                    {state.status === 'loading' && (
                        <div className="cc-skeleton" aria-busy="true" aria-label="Loading climate records">
                            <span /><span /><span />
                        </div>
                    )}

                    {state.status === 'ready' && (
                        <>
                            <section className="cc-section" aria-labelledby="cc-glance-title">
                                <div className="cc-section__head cc-section__head--split">
                                    <div>
                                        <span className="section-kicker">{scopeTrail.length ? 'Selected place' : 'Overview'}</span>
                                        <h2 id="cc-glance-title">
                                            {scopeTrail.length ? `Climate events in ${scopeTrail[scopeTrail.length - 1]}` : 'What communities are recording'}
                                        </h2>
                                        <p>
                                            {formatNumber(scoped.records)} records
                                            {scoped.communities ? ` from ${formatNumber(scoped.communities)} ${scoped.communities === 1 ? 'community' : 'communities'}` : ''}
                                            {scoped.affectedReported ? `, affecting ${formatNumber(scoped.affected)} people where a figure was reported` : ''}.
                                        </p>
                                    </div>
                                    {scopeTrail.length > 0 && (
                                        <button type="button" className="pt-button pt-button--secondary pt-button--sm" onClick={() => setScope({})}>
                                            Show all places
                                        </button>
                                    )}
                                </div>
                                <KeyFindings findings={findings} />
                                <div className="cc-glance">
                                    <RiskLevelPanel summary={scoped} />
                                    <YearPanel summary={scoped} />
                                    <TypePanel summary={scoped} />
                                </div>
                            </section>

                            <section className="cc-section" aria-labelledby="cc-map-title">
                                <div className="cc-section__head">
                                    <span className="section-kicker">Where</span>
                                    <h2 id="cc-map-title">Where events are recorded</h2>
                                    <p>
                                        Records so far come from {overall.regions} {overall.regions === 1 ? 'region' : 'regions'}: {regionNames}.
                                        Select a region or a point to focus the page on it.
                                    </p>
                                </div>
                                <ClimateMap rows={index.rows} scope={scope} onScope={chooseScope} />
                            </section>

                            <section className="cc-section" aria-labelledby="cc-when-title">
                                <div className="cc-section__head">
                                    <span className="section-kicker">When and how serious</span>
                                    <h2 id="cc-when-title">Seasons and severity</h2>
                                    <p>
                                        {rainyShare !== null ? `${rainyShare}% of dated events happened during the rainy seasons. ` : ''}
                                        The table shows which risks are most often rated high.
                                    </p>
                                </div>
                                <div className="cc-duo">
                                    <SeasonPanel summary={scoped} />
                                    <MatrixPanel rows={scopedRows} />
                                </div>
                            </section>

                            <section className="cc-section" aria-labelledby="cc-field-title">
                                <div className="cc-section__head">
                                    <span className="section-kicker">From the field</span>
                                    <h2 id="cc-field-title">Places and photos</h2>
                                    <p>The places reporting most often, and the latest photos officers have taken of climate events.</p>
                                </div>
                                <div className="cc-duo cc-duo--field">
                                    <TopPlaces rows={scopedRows} onScope={chooseScope} />
                                    <FieldGallery rows={scopedRows} onScope={chooseScope} />
                                </div>
                            </section>

                            <section className="cc-section" id="cc-records" aria-labelledby="cc-records-title">
                                <div className="cc-section__head">
                                    <span className="section-kicker">Records</span>
                                    <h2 id="cc-records-title">Browse by place</h2>
                                    <p>Pick a region, district or community to see what was recorded there. Newest records come first.</p>
                                </div>

                                <div className="cc-explorer">
                                    <PlaceNavigator tree={index.tree} scope={scope} onScope={chooseScope} total={overall.records} />

                                    <div className="cc-results">
                                        <div className="cc-results__bar">
                                            <div className="cc-trail" aria-live="polite">
                                                <button type="button" onClick={() => setScope({})} disabled={!scopeTrail.length}>All places</button>
                                                {scopeTrail.map((label, position) => (
                                                    <React.Fragment key={position}>
                                                        <span aria-hidden="true">›</span>
                                                        {position === scopeTrail.length - 1 ? (
                                                            <strong>{label}</strong>
                                                        ) : (
                                                            <button type="button" onClick={() => setScope(position === 0 ? { regionId: scope.regionId } : { regionId: scope.regionId, districtId: scope.districtId })}>{label}</button>
                                                        )}
                                                    </React.Fragment>
                                                ))}
                                            </div>

                                            <div className="cc-filters">
                                                <div className="cc-chips" role="group" aria-label="Risk level">
                                                    <button type="button" aria-pressed={!level} onClick={() => setLevel('')}>All levels</button>
                                                    {RISK_LEVELS.map((item) => (
                                                        <button type="button" key={item.key} aria-pressed={level === item.key} onClick={() => setLevel(level === item.key ? '' : item.key)}>
                                                            <i style={{ background: item.color }} />{item.key}
                                                        </button>
                                                    ))}
                                                </div>
                                                <label className="cc-select">
                                                    <span className="cc-visually-hidden">Climate risk</span>
                                                    <select value={type} onChange={(event) => setType(event.target.value)}>
                                                        <option value="">All climate risks</option>
                                                        {scoped.types.map((item) => <option key={item.name} value={item.name}>{item.name} ({item.total})</option>)}
                                                    </select>
                                                </label>
                                                <label className="cc-select">
                                                    <span className="cc-visually-hidden">Year</span>
                                                    <select value={year} onChange={(event) => setYear(event.target.value)}>
                                                        <option value="">All years</option>
                                                        {[...scoped.years].reverse().map((item) => <option key={item.year} value={item.year}>{item.year} ({item.total})</option>)}
                                                    </select>
                                                </label>
                                                <label className="cc-check">
                                                    <input type="checkbox" checked={photosOnly} onChange={(event) => setPhotosOnly(event.target.checked)} />
                                                    With photos
                                                </label>
                                            </div>
                                        </div>

                                        <p className="cc-count">
                                            Showing {Math.min(visible, filteredRows.length)} of {filteredRows.length} records
                                            {hasFilters && (
                                                <button type="button" onClick={() => { setLevel(''); setType(''); setYear(''); setPhotosOnly(false) }}>Clear filters</button>
                                            )}
                                        </p>

                                        {filteredRows.length ? (
                                            <div className="cc-records">
                                                {filteredRows.slice(0, visible).map((row) => <RecordCard key={row.id} row={row} />)}
                                            </div>
                                        ) : (
                                            <p className="cc-note">No records match these filters.</p>
                                        )}

                                        {visible < filteredRows.length && (
                                            <button type="button" className="pt-button pt-button--secondary cc-more" onClick={() => setVisible((current) => current + PAGE_SIZE)}>
                                                Show {Math.min(PAGE_SIZE, filteredRows.length - visible)} more records
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </section>
                        </>
                    )}

                    <section className="cc-section cc-about" aria-labelledby="cc-about-title">
                        <div className="cc-panel">
                            <h2 id="cc-about-title">About these records</h2>
                            <ul>
                                <li><strong>Who records them.</strong> District officers log climate events in the LISA climate change register on the District Development Data Platform, usually with photos and a location.</li>
                                <li><strong>Risk level</strong> is the officer’s assessment at the time of recording: low, medium or high.</li>
                                <li><strong>People affected</strong> is the figure reported for each event. Figures above {formatNumber(MAX_PLAUSIBLE_AFFECTED)} for a single record are treated as data-entry errors, shown as “Under review” and left out of totals{state.status === 'ready' && overall.unverified ? ` (${overall.unverified} ${overall.unverified === 1 ? 'record' : 'records'} at present)` : ''}.</li>
                                <li><strong>Recorded value</strong> is a measurement entered by the officer. The register does not state a unit, so values are shown as entered and are not added up.</li>
                                <li><strong>Privacy.</strong> Only the event details are published. The names of the officers who entered them are not shown.</li>
                            </ul>
                            <Link className="pt-link" to="/all-forcast">
                                See city weather forecasts
                                <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
                            </Link>
                        </div>
                    </section>
                </div>
            </main>
            <PublicFooter />
        </>
    )
}

export default ClimateChange
