import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
    FacebookIcon,
    FacebookShareButton,
    TelegramIcon,
    TelegramShareButton,
    TwitterIcon,
    TwitterShareButton,
    WhatsappIcon,
    WhatsappShareButton,
} from 'react-share'
import exportFromJSON from 'export-from-json'
import NavBar from '../../../header/NavBar'
import PublicFooter from '../../../footer/PublicFooter'
import ExploreBreadcrumbs from '../../../explore/components/ExploreBreadcrumbs'
import { getAllCities, getAllForecast, getForecastsByCityAndDate } from '../../service/forcast.service'
import {
    CONDITION_GLOSSARY,
    TONES,
    cleanSummary,
    describePeriod,
    formatCity,
    formatDay,
    formatIssued,
    groupIssues,
    issueHighlights,
    issuePeriods,
    normaliseForecasts,
    toIsoDate,
} from './forecastData'
import './AllForecast.css'

const SORTS = [
    { key: 'city', label: 'City (A–Z)' },
    { key: 'region', label: 'Region' },
    { key: 'warmest', label: 'Warmest first' },
    { key: 'coolest', label: 'Coolest first' },
]

const formatTemp = (value) => (value === null || value === undefined ? '—' : `${Math.round(value)}°`)

const WeatherIcon = ({ tone = 'cloud', size = 40 }) => {
    const cloud = <path className="fc-icon__cloud" d="M14 34h20a7 7 0 0 0 .6-14 10 10 0 0 0-19-3A8.5 8.5 0 0 0 14 34Z" />
    return (
        <svg className={`fc-icon fc-icon--${tone}`} viewBox="0 0 48 48" width={size} height={size} aria-hidden="true">
            {tone === 'sun' && (
                <g className="fc-icon__sun">
                    <circle cx="24" cy="24" r="8" />
                    <path d="M24 7v4M24 37v4M7 24h4M37 24h4M12 12l3 3M33 33l3 3M12 36l3-3M33 15l3-3" />
                </g>
            )}
            {tone === 'partly' && (
                <>
                    <g className="fc-icon__sun">
                        <circle cx="17" cy="17" r="6" />
                        <path d="M17 5v3M5 17h3M8.5 8.5l2 2M25.5 8.5l-2 2" />
                    </g>
                    <path className="fc-icon__cloud" d="M18 38h17a6 6 0 0 0 .5-12 8.5 8.5 0 0 0-16-2.5A7 7 0 0 0 18 38Z" />
                </>
            )}
            {tone === 'cloud' && cloud}
            {tone === 'mist' && (
                <>
                    {cloud}
                    <path className="fc-icon__mist" d="M10 39h28M14 44h20" />
                </>
            )}
            {tone === 'rain' && (
                <>
                    {cloud}
                    <path className="fc-icon__rain" d="M17 38l-2 5M25 38l-2 5M33 38l-2 5" />
                </>
            )}
            {tone === 'storm' && (
                <>
                    {cloud}
                    <path className="fc-icon__bolt" d="M25 35l-4 6h5l-3 6" />
                    <path className="fc-icon__rain" d="M15 38l-2 5M34 38l-2 5" />
                </>
            )}
        </svg>
    )
}

const shareTextFor = (row) => {
    const parts = row.periods.map((period) => {
        const condition = period.condition ? ` ${period.condition.label.toLowerCase()}` : ''
        return `${period.label.toLowerCase()} ${formatDay(period.date)}: ${formatTemp(period.temp)}C${condition}`
    })
    return `GMet forecast for ${row.city} — ${parts.join('; ')}.`
}

const ShareRow = ({ row }) => {
    const text = shareTextFor(row)
    const url = typeof window !== 'undefined' ? window.location.href : ''
    const iconProps = { size: 26, round: true, bgStyle: { fill: '#eff3f9' }, iconFillColor: '#16325a' }
    return (
        <div className="fc-share" aria-label={`Share the forecast for ${row.city}`}>
            <span>Share</span>
            <FacebookShareButton url={url} quote={text} hashtag="#GhanaWeather" aria-label="Share on Facebook">
                <FacebookIcon {...iconProps} />
            </FacebookShareButton>
            <TwitterShareButton url={url} title={text} hashtags={['GhanaWeather']} aria-label="Share on X">
                <TwitterIcon {...iconProps} />
            </TwitterShareButton>
            <WhatsappShareButton url={url} title={text} aria-label="Share on WhatsApp">
                <WhatsappIcon {...iconProps} />
            </WhatsappShareButton>
            <TelegramShareButton url={url} title={text} aria-label="Share on Telegram">
                <TelegramIcon {...iconProps} />
            </TelegramShareButton>
        </div>
    )
}

const PeriodCell = ({ period }) => (
    <li className="fc-period">
        <span className="fc-period__name">{period.label}</span>
        <span className="fc-period__date">{formatDay(period.date) || '—'}</span>
        <WeatherIcon tone={period.condition?.tone} />
        <strong className="fc-period__temp">{formatTemp(period.temp)}</strong>
        <span className="fc-period__condition">{period.condition?.label || 'No condition given'}</span>
        <span className="fc-period__chance">
            {period.condition?.chance !== null && period.condition?.chance !== undefined ? `${period.condition.chance}% chance` : '\u00a0'}
        </span>
    </li>
)

const ForecastCard = ({ row }) => (
    <article className="fc-card">
        <header className="fc-card__head">
            <div>
                <h3>{row.city}</h3>
                <span>{row.region ? `${row.region} Region` : 'Region not listed'}</span>
            </div>
            <div className="fc-card__range" aria-label={`Temperature range ${formatTemp(row.min)} to ${formatTemp(row.max)} Celsius`}>
                <strong>{row.min === row.max ? formatTemp(row.max) : `${formatTemp(row.min)} – ${formatTemp(row.max)}`}</strong>
                <span>°C range</span>
            </div>
        </header>
        {row.periods.length ? (
            <ol className="fc-card__periods" style={{ '--fc-periods': row.periods.length }}>
                {row.periods.map((period) => <PeriodCell key={period.key} period={period} />)}
            </ol>
        ) : (
            <p className="fc-card__empty">No period values were published for this city.</p>
        )}
        <footer className="fc-card__foot">
            <ShareRow row={row} />
        </footer>
    </article>
)

const ForecastTable = ({ rows, periods }) => (
    <div className="fc-table-wrap">
        <table className="fc-table">
            <caption className="fc-visually-hidden">Forecast by city and period, temperatures in degrees Celsius</caption>
            <thead>
                <tr>
                    <th scope="col">City</th>
                    <th scope="col">Region</th>
                    {periods.map((period) => (
                        <th scope="col" key={period.key}>
                            {period.label}
                            <small>{formatDay(period.date)}</small>
                        </th>
                    ))}
                </tr>
            </thead>
            <tbody>
                {rows.map((row) => (
                    <tr key={row.id}>
                        <th scope="row">{row.city}</th>
                        <td>{row.region || '—'}</td>
                        {periods.map((period) => {
                            const value = row.periods.find((item) => item.key === period.key)
                            return (
                                <td key={period.key}>
                                    {value ? (
                                        <span className="fc-table__cell">
                                            <WeatherIcon tone={value.condition?.tone} size={26} />
                                            <strong>{formatTemp(value.temp)}</strong>
                                            <span>
                                                {value.condition?.label || '—'}
                                                {value.condition?.chance != null && <em>{value.condition.chance}%</em>}
                                            </span>
                                        </span>
                                    ) : '—'}
                                </td>
                            )
                        })}
                    </tr>
                ))}
            </tbody>
        </table>
    </div>
)

const ConditionMix = ({ periods, cityCount }) => (
    <div className="fc-mix">
        {periods.map((period) => (
            <div className="fc-mix__row" key={period.key}>
                <div className="fc-mix__label">
                    <strong>{period.label}</strong>
                    <span>{formatDay(period.date)} · avg {formatTemp(period.average)}C</span>
                </div>
                <div className="fc-mix__bar" role="img" aria-label={`${describePeriod(period)}: ${period.toneCounts.map((tone) => `${tone.count} ${tone.label.toLowerCase()}`).join(', ')}`}>
                    {period.toneCounts.map((tone) => (
                        <span
                            key={tone.key}
                            style={{ width: `${(tone.count / (period.count || cityCount || 1)) * 100}%`, background: tone.color }}
                            title={`${tone.label}: ${tone.count} ${tone.count === 1 ? 'city' : 'cities'}`}
                        />
                    ))}
                </div>
            </div>
        ))}
        <ul className="fc-mix__legend">
            {TONES.filter((tone) => periods.some((period) => period.toneCounts.some((item) => item.key === tone.key))).map((tone) => (
                <li key={tone.key}><i style={{ background: tone.color }} />{tone.label}</li>
            ))}
        </ul>
    </div>
)

const sortRows = (rows, sort) => {
    const byCity = (a, b) => a.city.localeCompare(b.city)
    const list = [...rows]
    if (sort === 'warmest') return list.sort((a, b) => (b.max ?? -Infinity) - (a.max ?? -Infinity) || byCity(a, b))
    if (sort === 'coolest') return list.sort((a, b) => (a.min ?? Infinity) - (b.min ?? Infinity) || byCity(a, b))
    if (sort === 'region') return list.sort((a, b) => (a.region || '~').localeCompare(b.region || '~') || byCity(a, b))
    return list.sort(byCity)
}

const ArchiveLookup = ({ cities, defaultDate, coverage }) => {
    const [cityId, setCityId] = useState('')
    const [date, setDate] = useState(defaultDate)
    const [state, setState] = useState({ status: 'idle', rows: [] })

    useEffect(() => { setDate((current) => current || defaultDate) }, [defaultDate])

    const sortedCities = useMemo(
        () => [...cities].sort((a, b) => String(a.city).localeCompare(String(b.city))),
        [cities],
    )

    const onSubmit = (event) => {
        event.preventDefault()
        if (!cityId || !date) {
            setState({ status: 'invalid', rows: [] })
            return
        }
        setState({ status: 'loading', rows: [] })
        getForecastsByCityAndDate(cityId, date)
            .then((response) => {
                const rows = normaliseForecasts(Array.isArray(response.data) ? response.data : [], cities)
                setState({ status: rows.length ? 'done' : 'empty', rows })
            })
            .catch(() => setState({ status: 'error', rows: [] }))
    }

    const cityName = formatCity(cities.find((city) => String(city.id) === String(cityId))?.city || '')
    const dateLabel = date ? new Date(`${date}T00:00:00`).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : ''

    return (
        <section className="fc-section" aria-labelledby="fc-lookup-title">
            <div className="fc-section__head">
                <div>
                    <span className="section-kicker">Archive</span>
                    <h2 id="fc-lookup-title">Look up a past forecast</h2>
                    <p>
                        Choose a city and the day you are interested in. You will see every forecast period that covered that day.
                        {coverage && ` The archive currently holds forecasts for ${coverage}.`}
                    </p>
                </div>
            </div>

            <form className="fc-lookup" onSubmit={onSubmit}>
                <label>
                    <span>City</span>
                    <select value={cityId} onChange={(event) => setCityId(event.target.value)}>
                        <option value="">Select a city</option>
                        {sortedCities.map((city) => (
                            <option key={city.id} value={city.id}>
                                {formatCity(city.city)}{city.region?.name ? ` — ${city.region.name}` : ''}
                            </option>
                        ))}
                    </select>
                </label>
                <label>
                    <span>Date</span>
                    <input type="date" value={date} onChange={(event) => setDate(event.target.value)} />
                </label>
                <button type="submit" className="pt-button pt-button--primary pt-button--sm" disabled={state.status === 'loading'}>
                    {state.status === 'loading' ? 'Searching…' : 'Look up forecast'}
                </button>
            </form>

            <div className="fc-lookup__result" aria-live="polite">
                {state.status === 'invalid' && <p className="fc-note">Choose both a city and a date to search the archive.</p>}
                {state.status === 'error' && <p className="fc-note fc-note--warn">The archive could not be reached. Please try again shortly.</p>}
                {state.status === 'empty' && (
                    <p className="fc-note">No forecast was published for {cityName} on {dateLabel}.{coverage && ` Try a date within ${coverage}.`}</p>
                )}
                {state.status === 'done' && (
                    <div className="fc-grid fc-grid--lookup">
                        {state.rows.map((row) => <ForecastCard key={row.id} row={row} />)}
                    </div>
                )}
            </div>
        </section>
    )
}

const AllForecast = () => {
    const [history, setHistory] = useState([])
    const [cities, setCities] = useState([])
    const [status, setStatus] = useState('loading')
    const [issueKey, setIssueKey] = useState('')
    const [query, setQuery] = useState('')
    const [region, setRegion] = useState('')
    const [sort, setSort] = useState('city')
    const [view, setView] = useState('cards')

    const load = useCallback(() => {
        setStatus('loading')
        Promise.allSettled([getAllForecast(), getAllCities()]).then(([forecastResult, citiesResult]) => {
            if (citiesResult.status === 'fulfilled' && Array.isArray(citiesResult.value.data)) setCities(citiesResult.value.data)
            if (forecastResult.status === 'fulfilled' && Array.isArray(forecastResult.value.data)) {
                setHistory(forecastResult.value.data)
                setStatus('ready')
            } else {
                setStatus('error')
            }
        })
    }, [])

    useEffect(() => { load() }, [load])

    const issues = useMemo(() => groupIssues(history), [history])
    const issue = issues.find((item) => item.key === issueKey) || issues[0] || null
    const rows = useMemo(() => normaliseForecasts(issue?.items || [], cities), [issue, cities])
    const periods = useMemo(() => issuePeriods(rows), [rows])
    const highlights = useMemo(() => issueHighlights(rows), [rows])
    const summary = cleanSummary(issue?.items?.[0]?.summary)
    const regions = useMemo(() => [...new Set(rows.map((row) => row.region).filter(Boolean))].sort(), [rows])

    const visibleRows = useMemo(() => {
        const needle = query.trim().toLowerCase()
        const filtered = rows.filter((row) => (!region || row.region === region)
            && (!needle || row.city.toLowerCase().includes(needle) || row.region.toLowerCase().includes(needle)))
        return sortRows(filtered, sort)
    }, [rows, query, region, sort])

    const coverage = useMemo(() => {
        const dates = issues.flatMap((item) => issuePeriods(normaliseForecasts(item.items)).map((period) => period.date)).filter(Boolean)
        if (!dates.length) return ''
        const sorted = [...dates].sort((a, b) => a - b)
        const first = sorted[0]
        const last = sorted[sorted.length - 1]
        const fmt = (date) => date.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
        return toIsoDate(first) === toIsoDate(last) ? fmt(first) : `${fmt(first)} to ${fmt(last)}`
    }, [issues])

    const handleExport = () => {
        exportFromJSON({
            data: visibleRows.map((row) => {
                const record = { City: row.city, Region: row.region, Issued: formatIssued(row.issued) }
                periods.forEach((period) => {
                    const value = row.periods.find((item) => item.key === period.key)
                    const heading = describePeriod(period)
                    record[`${heading} temp (°C)`] = value?.temp ?? ''
                    record[`${heading} condition`] = value?.condition?.label ?? ''
                    record[`${heading} chance (%)`] = value?.condition?.chance ?? ''
                })
                return record
            }),
            fileName: `gmet-city-forecast-${toIsoDate(issue?.issued) || 'latest'}`,
            exportType: exportFromJSON.types.csv,
        })
    }

    const firstPeriod = periods[0]
    const lastPeriod = periods[periods.length - 1]

    return (
        <>
            <NavBar />
            <main className="fc-page">
                <header className="pt-page-hero fc-hero">
                    <div className="pt-container">
                        <ExploreBreadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'LISA climate', href: '/lisa' }, { label: 'City forecasts' }]} />
                        <div className="fc-hero__grid">
                            <div>
                                <span className="pt-eyebrow"><i aria-hidden="true" />Ghana Meteorological Agency</span>
                                <h1>City weather forecasts</h1>
                                <p className="pt-page-hero__lead">
                                    Morning, afternoon and evening forecasts for cities across Ghana, issued by GMet and shared
                                    through the LISA climate information service to support local planning.
                                </p>
                            </div>
                            <dl className="fc-issue" aria-label="Forecast bulletin details">
                                <div>
                                    <dt>Bulletin issued</dt>
                                    <dd>{status === 'loading' ? 'Loading…' : formatIssued(issue?.issued) || 'Not available'}</dd>
                                </div>
                                <div>
                                    <dt>Covers</dt>
                                    <dd>
                                        {firstPeriod
                                            ? firstPeriod === lastPeriod
                                                ? describePeriod(firstPeriod)
                                                : `${describePeriod(firstPeriod)} to ${describePeriod(lastPeriod)}`
                                            : '—'}
                                    </dd>
                                </div>
                                <div>
                                    <dt>Coverage</dt>
                                    <dd>
                                        {highlights.cityCount
                                            ? `${highlights.cityCount} cities${highlights.regionCount ? ` in ${highlights.regionCount} regions` : ''}`
                                            : '—'}
                                    </dd>
                                </div>
                                {issues.length > 1 && (
                                    <div>
                                        <dt><label htmlFor="fc-issue-select">Earlier bulletins</label></dt>
                                        <dd>
                                            <select id="fc-issue-select" value={issue?.key || ''} onChange={(event) => setIssueKey(event.target.value)}>
                                                {issues.map((item) => <option key={item.key} value={item.key}>{formatIssued(item.issued)}</option>)}
                                            </select>
                                        </dd>
                                    </div>
                                )}
                            </dl>
                        </div>
                    </div>
                </header>

                {status === 'error' && (
                    <div className="pt-container">
                        <div className="fc-state" role="alert">
                            <strong>Forecasts are temporarily unavailable</strong>
                            <p>We could not reach the LISA forecast service. Please try again in a moment.</p>
                            <button type="button" className="pt-button pt-button--secondary pt-button--sm" onClick={load}>Try again</button>
                        </div>
                    </div>
                )}

                {status === 'loading' && (
                    <div className="pt-container fc-grid fc-grid--skeleton" aria-busy="true" aria-label="Loading forecasts">
                        {Array.from({ length: 6 }, (_, index) => <div className="fc-card fc-card--skeleton" key={index} />)}
                    </div>
                )}

                {status === 'ready' && (
                    <div className="pt-container">
                        <section className="fc-bulletin" aria-labelledby="fc-bulletin-title">
                            <article className="fc-panel fc-summary">
                                <span className="section-kicker">Forecast summary</span>
                                <h2 id="fc-bulletin-title">What to expect</h2>
                                <p>{summary || 'GMet did not publish a written summary with this bulletin.'}</p>
                                <small>Source: Ghana Meteorological Agency (GMet) bulletin, {formatIssued(issue?.issued)}</small>
                            </article>

                            <div className="fc-panel fc-highlights">
                                <dl className="fc-stats">
                                    <div>
                                        <dt>Warmest</dt>
                                        <dd>
                                            <strong>{formatTemp(highlights.warmest?.temp)}C</strong>
                                            <span>{highlights.warmest ? `${highlights.warmest.city} · ${describePeriod(highlights.warmest.period)}` : '—'}</span>
                                        </dd>
                                    </div>
                                    <div>
                                        <dt>Coolest</dt>
                                        <dd>
                                            <strong>{formatTemp(highlights.coolest?.temp)}C</strong>
                                            <span>{highlights.coolest ? `${highlights.coolest.city} · ${describePeriod(highlights.coolest.period)}` : '—'}</span>
                                        </dd>
                                    </div>
                                    <div>
                                        <dt>Rain expected</dt>
                                        <dd>
                                            <strong>{highlights.wetCount}<small> of {highlights.cityCount}</small></strong>
                                            <span>cities with rain in at least one period</span>
                                        </dd>
                                    </div>
                                    <div>
                                        <dt>Thunderstorms</dt>
                                        <dd>
                                            <strong>{highlights.stormCount}<small> of {highlights.cityCount}</small></strong>
                                            <span>cities with a thunderstorm risk</span>
                                        </dd>
                                    </div>
                                </dl>
                                <h3>Conditions across all cities</h3>
                                <ConditionMix periods={periods} cityCount={highlights.cityCount} />
                            </div>
                        </section>

                        <section className="fc-section" aria-labelledby="fc-cities-title">
                            <div className="fc-section__head">
                                <div>
                                    <span className="section-kicker">By city</span>
                                    <h2 id="fc-cities-title">Forecast for each city</h2>
                                    <p>Periods are listed in time order. The morning forecast is for the next morning after the bulletin is issued.</p>
                                </div>
                            </div>

                            <div className="fc-toolbar" role="search">
                                <label className="fc-field fc-field--search">
                                    <span className="fc-visually-hidden">Search cities</span>
                                    <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></svg>
                                    <input type="search" placeholder="Search a city or region" value={query} onChange={(event) => setQuery(event.target.value)} />
                                </label>
                                <label className="fc-field">
                                    <span>Region</span>
                                    <select value={region} onChange={(event) => setRegion(event.target.value)}>
                                        <option value="">All regions</option>
                                        {regions.map((name) => <option key={name} value={name}>{name}</option>)}
                                    </select>
                                </label>
                                <label className="fc-field">
                                    <span>Sort by</span>
                                    <select value={sort} onChange={(event) => setSort(event.target.value)}>
                                        {SORTS.map((option) => <option key={option.key} value={option.key}>{option.label}</option>)}
                                    </select>
                                </label>
                                <div className="fc-toggle" role="group" aria-label="Display as">
                                    <button type="button" aria-pressed={view === 'cards'} onClick={() => setView('cards')}>Cards</button>
                                    <button type="button" aria-pressed={view === 'table'} onClick={() => setView('table')}>Table</button>
                                </div>
                                <button type="button" className="pt-button pt-button--secondary pt-button--sm fc-toolbar__download" onClick={handleExport} disabled={!visibleRows.length}>
                                    <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 4v11M7 10l5 5 5-5M5 20h14" /></svg>
                                    Download CSV
                                </button>
                            </div>

                            <p className="fc-count" aria-live="polite">
                                Showing {visibleRows.length} of {rows.length} cities
                                {(query || region) && (
                                    <button type="button" onClick={() => { setQuery(''); setRegion('') }}>Clear filters</button>
                                )}
                            </p>

                            {!visibleRows.length ? (
                                <p className="fc-note">No city matches your search.</p>
                            ) : view === 'table' ? (
                                <ForecastTable rows={visibleRows} periods={periods} />
                            ) : (
                                <div className="fc-grid fc-grid--cities">
                                    {visibleRows.map((row) => <ForecastCard key={row.id} row={row} />)}
                                </div>
                            )}
                        </section>
                    </div>
                )}

                <div className="pt-container">
                    {status !== 'error' && <ArchiveLookup cities={cities} defaultDate={toIsoDate(issue?.issued)} coverage={coverage} />}

                    <section className="fc-section fc-guide" aria-labelledby="fc-guide-title">
                        <div className="fc-section__head">
                            <div>
                                <span className="section-kicker">Reading the forecast</span>
                                <h2 id="fc-guide-title">What the terms mean</h2>
                            </div>
                        </div>
                        <div className="fc-guide__grid">
                            <ul className="fc-glossary">
                                {CONDITION_GLOSSARY.map((item) => (
                                    <li key={item.code}>
                                        <WeatherIcon tone={item.tone} size={34} />
                                        <div>
                                            <strong>{item.label}</strong>
                                            <code>{item.code}</code>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                            <div className="fc-panel fc-notes">
                                <h3>About this data</h3>
                                <ul>
                                    <li><strong>Chance of occurrence.</strong> A percentage after a condition, such as “Thunderstorms with rain 40%”, is GMet’s estimated likelihood of that weather.</li>
                                    <li><strong>Periods.</strong> Each bulletin covers the afternoon and evening of the issue day and the following morning.</li>
                                    <li><strong>Temperatures</strong> are in degrees Celsius and are expected values for the period, not observed readings.</li>
                                    <li><strong>Source.</strong> Forecasts are issued by the Ghana Meteorological Agency and published through LISA, the Local Information System for Climate Change Adaptation.</li>
                                </ul>
                                <Link className="pt-link" to="/lisa">
                                    More climate information
                                    <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
                                </Link>
                            </div>
                        </div>
                    </section>
                </div>
            </main>
            <PublicFooter />
        </>
    )
}

export default AllForecast
