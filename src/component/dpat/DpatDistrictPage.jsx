import React, { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import PublicState from '../explore/components/PublicState'
import { BarList, Meter, ScoreGauge, TrendChart } from './components/DpatCharts'
import { DpatError, DpatHero, DpatKpi, DpatLoading, DpatPageShell, DpatSection, DpatToolbar } from './components/DpatLayout'
import {
    useDpatDistrict,
    useDpatDistrictTrend,
    useDpatScores,
    useDpatThematicAreas,
    useDpatYear,
    useDpatYears,
} from './hooks/useDpat'
import {
    DPAT_COLORS,
    classificationColor,
    districtPath,
    formatDelta,
    formatPercent,
    formatScore,
    mean,
    ordinal,
    percentColor,
    scoredDistricts,
    shortDistrictName,
} from './dpatFormat'

const clamp = (value) => Math.max(0, Math.min(100, value))

const DISTRICT_SECTIONS = [
    { id: 'scorecard', label: 'Scorecard' },
    { id: 'areas', label: 'Thematic areas' },
    { id: 'compliance', label: 'Compliance' },
    { id: 'trend', label: 'Trend & region' },
]

const AreaRow = ({ row, nationalAverage, scale, defaultOpen }) => {
    const percent = row.maxScore ? (row.finalScore / row.maxScore) * 100 : 0
    const color = percentColor(percent, scale)
    const markerPercent = Number.isFinite(nationalAverage) && row.maxScore ? clamp((nationalAverage / row.maxScore) * 100) : null

    return (
        <details className="dpat-area" open={defaultOpen}>
            <summary>
                <span className="dpat-code">{row.code}</span>
                <span className="dpat-area__name">
                    <strong>{row.thematicArea}</strong>
                    {Number.isFinite(nationalAverage) && <small>National average {formatScore(nationalAverage)} of {formatScore(row.maxScore)}</small>}
                </span>
                <span className="dpat-area__track" aria-hidden="true">
                    <i style={{ width: `${clamp(percent)}%`, background: color }} />
                    {markerPercent !== null && <em style={{ left: `${markerPercent}%` }} />}
                </span>
                <b>{formatScore(row.finalScore)}<small> / {formatScore(row.maxScore)}</small></b>
            </summary>
            {row.subIndicators.length > 0 ? (
                <table className="dpat-subtable">
                    <caption>Final score for each indicator in {row.code}</caption>
                    <thead>
                        <tr>
                            <th scope="col">Code</th>
                            <th scope="col">Indicator</th>
                            <th scope="col" className="is-numeric">Final score</th>
                        </tr>
                    </thead>
                    <tbody>
                        {row.subIndicators.map((sub) => {
                            const subPercent = sub.maxScore ? clamp((sub.finalScore / sub.maxScore) * 100) : 0
                            return (
                                <tr key={sub.code}>
                                    <td className="dpat-subtable__code">{sub.code}</td>
                                    <th scope="row">{sub.name}</th>
                                    <td className="is-numeric">
                                        <div className="dpat-subtable__score">
                                            <span aria-hidden="true"><i style={{ width: `${subPercent}%`, background: percentColor(subPercent, scale) }} /></span>
                                            <b>{formatScore(sub.finalScore)}<small> / {formatScore(sub.maxScore)}</small></b>
                                        </div>
                                    </td>
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
            ) : (
                <p className="dpat-empty">Indicator-level final scores are not available for this area.</p>
            )}
        </details>
    )
}

const ComplianceCard = ({ item }) => (
    <article className={`dpat-ci-card${item.fulfilled ? ' is-fulfilled' : ' is-unfulfilled'}`}>
        <header>
            <span className="dpat-ci-card__icon" aria-hidden="true">{item.fulfilled ? '✓' : '✕'}</span>
            <div>
                <span className="dpat-code">{item.code}</span>
                <strong>{item.thematicArea}</strong>
            </div>
            <b>{item.fulfilled ? 'Fulfilled' : 'Not fulfilled'}</b>
        </header>
        {item.subIndicators.length > 0 && (
            <ul>
                {item.subIndicators.map((sub) => {
                    const state = sub.fulfilled === true ? 'yes' : sub.fulfilled === false ? 'no' : 'unknown'
                    return (
                        <li key={sub.code} className={`is-${state}`}>
                            <i aria-hidden="true">{state === 'yes' ? '✓' : state === 'no' ? '✕' : '–'}</i>
                            <span className="dpat-code dpat-code--muted">{sub.code}</span>
                            <span>{sub.name}</span>
                            <em>{state === 'yes' ? 'Fulfilled' : state === 'no' ? 'Not fulfilled' : 'Not rated'}</em>
                        </li>
                    )
                })}
            </ul>
        )}
    </article>
)

const DistrictResults = ({ district, scores, thematic, trend, scale, year }) => {
    const [expandAll, setExpandAll] = useState(false)
    const color = classificationColor(district.classification, scale)
    const scored = scoredDistricts(scores)
    const regionDistricts = scored
        .filter((item) => item.regionId === district.regionId)
        .sort((a, b) => (a.regionalRank - b.regionalRank) || a.districtName.localeCompare(b.districtName))
    const regionalAverage = mean(regionDistricts.map((item) => item.finalPercent))
    const nationalAverage = scores?.nationalAverage
    const areaAverages = new Map(thematic ? [...thematic.serviceDelivery, ...thematic.performance].map((area) => [area.code, area.averageScore]) : [])
    const trendPoints = (trend || []).map((point) => ({ year: point.year, value: point.finalPercent, benchmark: point.nationalAverage }))

    return (
        <>
            <div className="dpat-scorecard" id="scorecard">
                <div className="dpat-card dpat-scorecard__gauge">
                    <h3>Final score</h3>
                    <ScoreGauge percent={district.finalPercent} color={color} label={district.classification} benchmark={nationalAverage} />
                </div>
                <div className="dpat-kpi-grid dpat-kpi-grid--3 dpat-scorecard__stats">
                    <DpatKpi label="Final score" value={formatScore(district.finalScore)} unit={` / ${district.maxScore}`} accent={color} context={`Final outcome: ${district.classification}`} />
                    <DpatKpi label="National rank" value={ordinal(district.nationalRank)} context={`of ${scores?.assessedCount ?? '—'} districts with published results`} />
                    <DpatKpi label="Regional rank" value={ordinal(district.regionalRank)} context={`of ${regionDistricts.length} in ${district.regionName}`} />
                    <DpatKpi label="Compliance indicators" value={district.totals.ciFulfilled} unit={` / ${district.totals.ciTotal}`} context="Fulfilled in the final outcome" />
                    <DpatKpi label="Versus national average" value={formatDelta(district.finalPercent - nationalAverage)} context={`National average ${formatPercent(nationalAverage)}`} />
                    <DpatKpi label="Versus regional average" value={formatDelta(district.finalPercent - regionalAverage)} context={`${district.regionName} average ${formatPercent(regionalAverage)}`} />
                </div>
            </div>

            <DpatSection id="composition" kicker="Score composition" title="Where the final score comes from" description="The final score is the sum of service delivery (SDI) and performance (PI) points.">
                <div className="dpat-card dpat-composition">
                    <Meter label="Service Delivery Indicators (SDI)" value={district.totals.sdiFinal} max={district.totals.sdiMax} display={`${formatScore(district.totals.sdiFinal)} / ${district.totals.sdiMax}`} color={DPAT_COLORS.navy} />
                    <Meter label="Performance Indicators (PI)" value={district.totals.piFinal} max={district.totals.piMax} display={`${formatScore(district.totals.piFinal)} / ${district.totals.piMax}`} color={DPAT_COLORS.brass} />
                    <Meter label="Total final score" value={district.totals.grandFinal} max={district.totals.grandMax} display={`${formatScore(district.totals.grandFinal)} / ${district.totals.grandMax} (${formatPercent(district.finalPercent)})`} color={color} />
                </div>
            </DpatSection>

            <DpatSection
                id="areas"
                kicker="Thematic areas"
                title="Results by thematic area"
                description="Final score in each area. Open an area to see the final score for every indicator in it."
                actions={<button type="button" className="dpat-button dpat-button--ghost" onClick={() => setExpandAll((open) => !open)}>{expandAll ? 'Collapse all' : 'Expand all'}</button>}
            >
                <div className="dpat-grid dpat-grid--2">
                    <div className="dpat-card">
                        <h3>Service Delivery Indicators · {formatScore(district.totals.sdiFinal)} / {district.totals.sdiMax}</h3>
                        <div className="dpat-area-list" key={`sdi-${expandAll}`}>
                            {district.serviceDelivery.map((row) => <AreaRow key={row.code} row={row} nationalAverage={areaAverages.get(row.code)} scale={scale} defaultOpen={expandAll} />)}
                        </div>
                    </div>
                    <div className="dpat-card">
                        <h3>Performance Indicators · {formatScore(district.totals.piFinal)} / {district.totals.piMax}</h3>
                        <div className="dpat-area-list" key={`pi-${expandAll}`}>
                            {district.performance.map((row) => <AreaRow key={row.code} row={row} nationalAverage={areaAverages.get(row.code)} scale={scale} defaultOpen={expandAll} />)}
                        </div>
                    </div>
                </div>
                <p className="dpat-note"><i className="dpat-note__marker" aria-hidden="true" /> The vertical line on each bar marks the national average for that area.</p>
            </DpatSection>

            <DpatSection id="compliance" kicker="Compliance" title="Compliance indicators" description={`${district.totals.ciFulfilled} of ${district.totals.ciTotal} compliance indicators fulfilled in the final outcome.`}>
                <div className="dpat-grid dpat-grid--2">
                    {district.compliance.map((item) => <ComplianceCard key={item.code} item={item} />)}
                </div>
            </DpatSection>

            <div className="dpat-grid dpat-grid--2 dpat-grid--top dpat-section" id="trend">
                <div className="dpat-card dpat-card--sticky">
                    <span className="dpat-kicker">Trend</span>
                    <h3>Year-over-year final score</h3>
                    {trendPoints.length > 0 ? (
                        <>
                            <TrendChart points={trendPoints} seriesLabel={shortDistrictName(district.districtName)} />
                            <table className="dpat-mini-table">
                                <thead><tr><th scope="col">Year</th><th scope="col" className="is-numeric">Final score</th><th scope="col" className="is-numeric">National rank</th></tr></thead>
                                <tbody>
                                    {trend.map((point) => (
                                        <tr key={point.year}>
                                            <th scope="row">{point.year}</th>
                                            <td className="is-numeric">{formatPercent(point.finalPercent)}</td>
                                            <td className="is-numeric">{point.nationalRank ? `${ordinal(point.nationalRank)} of ${point.assessedCount}` : '—'}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </>
                    ) : <p className="dpat-empty">Loading trend…</p>}
                </div>
                <div className="dpat-card">
                    <span className="dpat-kicker">{district.regionName} Region</span>
                    <h3>How it compares within the region</h3>
                    <BarList
                        items={regionDistricts.map((item) => ({
                            key: item.districtId,
                            rank: item.regionalRank,
                            label: shortDistrictName(item.districtName),
                            value: item.finalPercent,
                            max: 100,
                            display: formatPercent(item.finalPercent),
                            color: classificationColor(item.classification, scale),
                            to: item.districtId === district.districtId ? undefined : districtPath(item.districtId, year),
                        }))}
                        highlightKey={district.districtId}
                        marker={{ value: regionalAverage, label: 'Regional average' }}
                    />
                    <p className="dpat-note"><i className="dpat-note__marker" aria-hidden="true" /> Line marks the {district.regionName} average.</p>
                </div>
            </div>
        </>
    )
}

const DpatDistrictPage = () => {
    const { districtId } = useParams()
    useEffect(() => { window.scrollTo(0, 0) }, [districtId])
    const years = useDpatYears()
    const [year, setYear] = useDpatYear(years.data)
    const district = useDpatDistrict(year, districtId)
    const scores = useDpatScores(year)
    const thematic = useDpatThematicAreas(year)
    const trend = useDpatDistrictTrend(years.data?.years, districtId)
    const scale = useMemo(() => years.data?.classificationScale || [], [years.data])
    const data = district.data
    const released = Boolean(data && Number.isFinite(data.finalPercent))
    const color = released ? classificationColor(data.classification, scale) : null

    const breadcrumbs = [
        { label: 'Home', href: '/' },
        { label: 'DPAT Performance Analysis', href: `/dpat/performance-analysis${year ? `?year=${year}` : ''}` },
        ...(data ? [{ label: data.regionName, href: `/dpat/performance-analysis?year=${year}&view=regions&region=${data.regionId}` }] : []),
        { label: data ? shortDistrictName(data.districtName) : 'District' },
    ]

    const renderBody = () => {
        if (years.isLoading || district.isLoading) return <DpatLoading title="Loading district final results" />
        if (years.error) return <DpatError error={years.error} />
        if (district.error || !data) return <DpatError error={district.error} title="District results are unavailable" />
        if (!released) {
            return (
                <div className="dpat-state">
                    <PublicState status="not-yet-published" title="Assessment in progress">
                        The {year} DPAT assessment for {data.districtName} is not yet complete (current stage: {data.status}). Final scores are published once the assessment is completed.
                    </PublicState>
                    <Link className="dpat-button dpat-button--ghost" to={`/dpat/performance-analysis?year=${year}&view=rankings`}>Back to rankings</Link>
                </div>
            )
        }
        return <DistrictResults district={data} scores={scores.data} thematic={thematic.data} trend={trend.data} scale={scale} year={year} />
    }

    return (
        <DpatPageShell>
            <DpatHero
                breadcrumbs={breadcrumbs}
                eyebrow={data ? `${data.regionName} Region · DPAT final outcome` : 'DPAT final outcome'}
                title={data ? data.districtName : 'District results'}
                description={released
                    ? `Final DPAT score of ${formatPercent(data.finalPercent)} in ${year}, ranked ${ordinal(data.nationalRank)} nationally and ${ordinal(data.regionalRank)} in ${data.regionName}.`
                    : null}
                year={year}
                years={years.data?.years}
                onYearChange={setYear}
                updatedAt={scores.data?.updatedAt}
                badges={released ? (
                    <>
                        <span className="dpat-pill dpat-pill--solid" style={{ '--pill-color': color }}>{data.classification}</span>
                        <span className="dpat-pill dpat-pill--light">{data.status}</span>
                    </>
                ) : data ? <span className="dpat-pill dpat-pill--light">{data.status}</span> : null}
            />
            <DpatToolbar year={year} label="District page sections">
                <Link className="dpat-tabs__back" to={`/dpat/performance-analysis${year ? `?year=${year}&view=rankings` : ''}`}>
                    <span aria-hidden="true">←</span> All districts
                </Link>
                {released && DISTRICT_SECTIONS.map((section) => (
                    <button
                        type="button"
                        key={section.id}
                        onClick={() => document.getElementById(section.id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
                    >
                        {section.label}
                    </button>
                ))}
            </DpatToolbar>
            <div className="dpat-container dpat-body">{renderBody()}</div>
        </DpatPageShell>
    )
}

export default DpatDistrictPage
