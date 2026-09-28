import React, { useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
    BarList,
    ColumnChart,
    DonutChart,
    Meter,
    PercentileStrip,
    RadarChart,
    RangePlot,
    ScatterPlot,
    StackedBars,
    TrendChart,
} from './components/DpatCharts'
import DpatLeaderboard from './components/DpatLeaderboard'
import DpatRegionMap from './components/DpatRegionMap'
import { DpatSection } from './components/DpatLayout'
import { useDpatYearSeries } from './hooks/useDpat'
import {
    DPAT_COLORS,
    classificationColor,
    districtPath,
    formatDelta,
    formatPercent,
    formatScore,
    mean,
    percentColor,
    scoredDistricts,
    shortDistrictName,
    summarize,
} from './dpatFormat'

const ICONS = {
    check: <><circle cx="12" cy="12" r="9" /><path d="M8 12.5l2.7 2.7L16 10" /></>,
    alert: <><path d="M12 4l9 16H3L12 4Z" /><path d="M12 10v4" /><path d="M12 17.5v.01" /></>,
    map: <><path d="M9 4L3 6.5v13.5l6-2.5 6 2.5 6-2.5V4l-6 2.5L9 4Z" /><path d="M9 4v13.5" /><path d="M15 6.5V20" /></>,
    up: <><path d="M3 17l6-6 4 4 8-8" /><path d="M15 7h6v6" /></>,
    down: <><path d="M3 7l6 6 4-4 8 8" /><path d="M15 17h6v-6" /></>,
    shield: <><path d="M12 3l7 3v5c0 4.6-3 8.4-7 10-4-1.6-7-5.4-7-10V6l7-3Z" /><path d="M9 12l2 2 4-4" /></>,
    calendar: <><rect x="3.5" y="5" width="17" height="15" rx="2" /><path d="M3.5 10h17" /><path d="M8 3v4" /><path d="M16 3v4" /></>,
    spread: <><path d="M4 12h16" /><path d="M7 8v8" /><path d="M17 8v8" /><path d="M12 6v12" /></>,
}

const Icon = ({ name }) => <svg viewBox="0 0 24 24" aria-hidden="true">{ICONS[name]}</svg>

const QUADRANTS = [
    { key: 'both', label: 'Above average on both', text: 'Strong service delivery and strong performance.', color: DPAT_COLORS.positive },
    { key: 'sdi', label: 'Service delivery leads', text: 'Above-average SDI, below-average PI.', color: DPAT_COLORS.navy },
    { key: 'pi', label: 'Performance leads', text: 'Above-average PI, below-average SDI.', color: DPAT_COLORS.brass },
    { key: 'neither', label: 'Below average on both', text: 'The clearest candidates for targeted support.', color: DPAT_COLORS.negative },
]

const jitter = (id, salt) => {
    let hash = salt
    for (let index = 0; index < id.length; index += 1) hash = (hash * 31 + id.charCodeAt(index)) % 9973
    return ((hash % 100) / 100 - 0.5) * 1.6
}

const goodThreshold = (scale) => {
    const index = scale.findIndex((band) => band.label === 'Good')
    return scale[index >= 0 ? index : Math.min(2, scale.length - 1)]?.min ?? 50
}

const round1 = (value) => Math.round(value * 10) / 10

const plural = (count, word) => `${count} ${count === 1 ? word : `${word}s`}`

const buildAnalysis = ({ insights, scores, regions, thematic, scale }) => {
    const { scored } = insights
    const threshold = goodThreshold(scale)
    const stats = summarize(scored.map((district) => district.finalPercent))
    const lowestBand = scale[scale.length - 1]
    const nationalAverage = scores.nationalAverage

    const regionRows = (regions || [])
        .filter((region) => region.rank)
        .sort((a, b) => a.rank - b.rank)
        .map((region) => {
            const members = scored.filter((district) => district.regionId === region.regionId)
            return {
                region,
                members,
                stats: summarize(members.map((district) => district.finalPercent)),
                best: members[0],
                mix: scale.map((band) => ({ label: band.label, value: members.filter((district) => district.classification === band.label).length, color: classificationColor(band.label, scale) })),
            }
        })
        .filter((row) => row.stats)

    const areas = thematic ? [...thematic.serviceDelivery, ...thematic.performance].filter((area) => Number.isFinite(area.averagePercent)) : []
    const strongest = areas.reduce((best, area) => (!best || area.averagePercent > best.averagePercent ? area : best), null)
    const weakest = areas.reduce((low, area) => (!low || area.averagePercent < low.averagePercent ? area : low), null)

    const sdiShare = (district) => (district.sdiFinal / district.sdiMax) * 100
    const piShare = (district) => (district.piFinal / district.piMax) * 100
    const xRef = mean(scored.map(sdiShare))
    const yRef = mean(scored.map(piShare))
    const quadrantOf = (district) => {
        const sdiHigh = sdiShare(district) >= xRef
        const piHigh = piShare(district) >= yRef
        if (sdiHigh && piHigh) return 'both'
        if (sdiHigh) return 'sdi'
        if (piHigh) return 'pi'
        return 'neither'
    }
    const quadrantCounts = QUADRANTS.reduce((counts, quadrant) => ({ ...counts, [quadrant.key]: 0 }), {})
    scored.forEach((district) => { quadrantCounts[quadrantOf(district)] += 1 })

    const points = scored.map((district) => ({
        key: district.districtId,
        x: sdiShare(district) + jitter(district.districtId, 7),
        y: piShare(district) + jitter(district.districtId, 13),
        color: classificationColor(district.classification, scale),
        district,
    }))

    const topTen = scored.slice(0, 10)
    const bottomTen = scored.slice(-10)

    return {
        threshold,
        stats,
        nationalAverage,
        goodCount: scored.filter((district) => district.finalPercent >= threshold).length,
        lowestBand,
        lowCount: lowestBand ? scored.filter((district) => district.classification === lowestBand.label).length : 0,
        regionRows,
        areas,
        strongest,
        weakest,
        xRef,
        yRef,
        quadrantCounts,
        points,
        topAverage: mean(topTen.map((district) => district.finalPercent)),
        bottomAverage: mean(bottomTen.map((district) => district.finalPercent)),
        averageCi: mean(scored.map((district) => district.ciFulfilled)),
        noCi: scored.filter((district) => district.ciFulfilled === 0).length,
    }
}

const buildYearly = ({ series, years, year, scored, threshold }) => {
    if (!series) return null
    const rows = years
        .map((option, index) => {
            const yearScores = series[index]
            if (!yearScores) return null
            const districts = scoredDistricts(yearScores)
            const stats = summarize(districts.map((district) => district.finalPercent))
            return {
                year: option,
                districts,
                nationalAverage: yearScores.nationalAverage,
                median: stats?.median ?? null,
                assessed: districts.length,
                goodShare: districts.length ? (districts.filter((district) => district.finalPercent >= threshold).length / districts.length) * 100 : null,
            }
        })
        .filter(Boolean)
    const currentIndex = rows.findIndex((row) => row.year === year)
    const previous = currentIndex > 0 ? rows[currentIndex - 1] : null
    if (!previous) return { rows, previous: null, movers: null }

    const previousById = new Map(previous.districts.map((district) => [district.districtId, district]))
    const changes = scored
        .filter((district) => previousById.has(district.districtId))
        .map((district) => {
            const before = previousById.get(district.districtId).finalPercent
            return { ...district, previousPercent: before, change: round1(district.finalPercent - before) }
        })
    const byName = (a, b) => a.districtName.localeCompare(b.districtName)
    return {
        rows,
        previous,
        movers: {
            previousYear: previous.year,
            compared: changes.length,
            improved: changes.filter((item) => item.change > 0).sort((a, b) => b.change - a.change || byName(a, b)).slice(0, 10),
            declined: changes.filter((item) => item.change < 0).sort((a, b) => a.change - b.change || byName(a, b)).slice(0, 10),
            improvedCount: changes.filter((item) => item.change > 0).length,
            declinedCount: changes.filter((item) => item.change < 0).length,
            unchangedCount: changes.filter((item) => item.change === 0).length,
            averageChange: mean(changes.map((item) => item.change)),
        },
    }
}

const buildFindings = ({ analysis, insights, yearly, scale, year }) => {
    const { scored } = insights
    const findings = [
        {
            key: 'good',
            icon: 'check',
            tone: 'positive',
            label: 'Rated Good or better',
            value: formatPercent((analysis.goodCount / scored.length) * 100, 0),
            text: `${analysis.goodCount} of ${scored.length} districts scored ${analysis.threshold}% or more in ${year}.`,
        },
        analysis.lowestBand && {
            key: 'low',
            icon: 'alert',
            tone: 'negative',
            label: `Rated ${analysis.lowestBand.label}`,
            value: plural(analysis.lowCount, 'district'),
            text: `Scored below ${scale[scale.length - 2]?.min ?? analysis.threshold}% and may need targeted support.`,
        },
        analysis.regionRows.length > 1 && {
            key: 'regions',
            icon: 'map',
            tone: 'neutral',
            label: 'Gap between regions',
            value: `${formatScore(round1(analysis.regionRows[0].region.averagePercent - analysis.regionRows[analysis.regionRows.length - 1].region.averagePercent))} pts`,
            text: `${analysis.regionRows[0].region.regionName} leads at ${formatPercent(analysis.regionRows[0].region.averagePercent)}; ${analysis.regionRows[analysis.regionRows.length - 1].region.regionName} trails at ${formatPercent(analysis.regionRows[analysis.regionRows.length - 1].region.averagePercent)}.`,
        },
        {
            key: 'spread',
            icon: 'spread',
            tone: 'neutral',
            label: 'Middle half of districts',
            value: `${formatPercent(analysis.stats.q1, 0)} – ${formatPercent(analysis.stats.q3, 0)}`,
            text: `Half of all districts fall in this ${formatScore(round1(analysis.stats.q3 - analysis.stats.q1))}-point band around the ${formatPercent(analysis.stats.median)} median.`,
        },
        analysis.strongest && {
            key: 'strongest',
            icon: 'up',
            tone: 'positive',
            label: 'Strongest thematic area',
            value: formatPercent(analysis.strongest.averagePercent, 0),
            text: `${analysis.strongest.code} · ${analysis.strongest.thematicArea} earns the largest share of available points.`,
        },
        analysis.weakest && {
            key: 'weakest',
            icon: 'down',
            tone: 'negative',
            label: 'Weakest thematic area',
            value: formatPercent(analysis.weakest.averagePercent, 0),
            text: `${analysis.weakest.code} · ${analysis.weakest.thematicArea} is where districts lose the most points.`,
        },
        {
            key: 'compliance',
            icon: 'shield',
            tone: 'brass',
            label: 'Compliance indicators met',
            value: `${(analysis.averageCi ?? 0).toFixed(1)} of 4`,
            text: `On average. ${plural(insights.fullCompliance, 'district')} fulfilled all four; ${analysis.noCi} fulfilled none.`,
        },
        yearly?.movers && {
            key: 'yoy',
            icon: 'calendar',
            tone: scored.length && analysis.nationalAverage >= yearly.previous.nationalAverage ? 'positive' : 'negative',
            label: `National average since ${yearly.previous.year}`,
            value: formatDelta(analysis.nationalAverage - yearly.previous.nationalAverage),
            text: `${yearly.movers.improvedCount} of ${yearly.movers.compared} comparable districts improved on their ${yearly.previous.year} final score.`,
        },
    ]
    return findings.filter(Boolean)
}

const Spotlight = ({ scored, analysis, scale, year }) => {
    const leader = scored[0]
    const joint = scored.filter((district) => district.nationalRank === leader.nationalRank).slice(1)
    const color = classificationColor(leader.classification, scale)
    return (
        <aside className="dpat-card dpat-spotlight">
            <div className="dpat-spotlight__top">
                <span className="dpat-spotlight__medal" aria-hidden="true">1</span>
                <span className="dpat-kicker">Top performer · {year}</span>
            </div>
            <Link className="dpat-spotlight__name" to={districtPath(leader.districtId, year)}>{shortDistrictName(leader.districtName)}</Link>
            <p className="dpat-spotlight__meta">
                {leader.regionName} Region
                {joint.length > 0 && ` · joint first with ${joint.map((district) => shortDistrictName(district.districtName)).join(', ')}`}
            </p>
            <div className="dpat-spotlight__score">
                <b style={{ color }}>{formatPercent(leader.finalPercent)}</b>
                <span className="dpat-pill" style={{ '--pill-color': color }}>{leader.classification}</span>
            </div>
            <p className="dpat-spotlight__delta">{formatDelta(leader.finalPercent - analysis.nationalAverage)} vs national average</p>
            <div className="dpat-spotlight__meters">
                <Meter label="Service delivery (SDI)" value={leader.sdiFinal} max={leader.sdiMax} display={`${leader.sdiFinal} / ${leader.sdiMax}`} color={DPAT_COLORS.navy} />
                <Meter label="Performance (PI)" value={leader.piFinal} max={leader.piMax} display={`${leader.piFinal} / ${leader.piMax}`} color={DPAT_COLORS.brass} />
                <Meter label="Compliance (CI)" value={leader.ciFulfilled} max={leader.ciTotal} display={`${leader.ciFulfilled} / ${leader.ciTotal}`} color={DPAT_COLORS.positive} />
            </div>
            <dl className="dpat-spotlight__gap">
                <div><dt>Top 10 average</dt><dd>{formatPercent(analysis.topAverage)}</dd></div>
                <div><dt>Bottom 10 average</dt><dd>{formatPercent(analysis.bottomAverage)}</dd></div>
                <div><dt>Gap</dt><dd>{formatScore(round1(analysis.topAverage - analysis.bottomAverage))} pts</dd></div>
            </dl>
            <Link className="dpat-button dpat-button--ghost" to={districtPath(leader.districtId, year)}>View full scorecard</Link>
        </aside>
    )
}

const DpatOverview = ({ scores, insights, regions, thematic, scale, year, years, onOpenRegion }) => {
    const navigate = useNavigate()
    const series = useDpatYearSeries(years)
    const analysis = useMemo(() => buildAnalysis({ insights, scores, regions, thematic, scale }), [insights, scores, regions, thematic, scale])
    const yearly = useMemo(
        () => buildYearly({ series: series.data, years, year, scored: insights.scored, threshold: analysis.threshold }),
        [series.data, years, year, insights.scored, analysis.threshold],
    )
    const findings = buildFindings({ analysis, insights, yearly, scale, year })
    const nationalAverage = scores.nationalAverage
    const nationalMarker = { value: nationalAverage, label: `National average ${formatPercent(nationalAverage)}` }
    const classificationLegend = scale.map((band) => ({ label: band.label, color: classificationColor(band.label, scale) }))

    return (
        <>
            <DpatSection id="findings" kicker="Analysis" title="Key findings" description={`What the ${year} final results show at a glance.`}>
                <div className="dpat-findings">
                    {findings.map((finding) => (
                        <article className={`dpat-finding is-${finding.tone}`} key={finding.key}>
                            <span className="dpat-finding__icon"><Icon name={finding.icon} /></span>
                            <div>
                                <span className="dpat-finding__label">{finding.label}</span>
                                <b className="dpat-finding__value">{finding.value}</b>
                                <p>{finding.text}</p>
                            </div>
                        </article>
                    ))}
                </div>
            </DpatSection>

            <DpatSection id="outcomes" kicker="Final outcomes" title="How districts performed" description={`Distribution of the ${scores.assessedCount} published final scores for ${year}.`}>
                <div className="dpat-grid dpat-grid--2">
                    <div className="dpat-card">
                        <h3>Final outcome mix</h3>
                        <DonutChart
                            segments={insights.classification}
                            centerValue={scores.assessedCount}
                            centerLabel="districts"
                            ariaLabel={insights.classification.map((item) => `${item.label}: ${item.value}`).join(', ')}
                        />
                    </div>
                    <div className="dpat-card">
                        <h3>Final score distribution</h3>
                        <ColumnChart
                            bins={insights.bins}
                            markers={[{ label: `National avg ${formatPercent(nationalAverage)}`, position: nationalAverage / 100, color: DPAT_COLORS.navy }]}
                            xLabel="Final score (%)"
                            yLabel="Districts"
                            ariaLabel={insights.bins.map((bin) => `${bin.label}%: ${bin.value}`).join(', ')}
                        />
                    </div>
                </div>
                <div className="dpat-card dpat-card--spaced">
                    <div className="dpat-card__header">
                        <h3>Where districts sit on the scale</h3>
                        <p>
                            Scores range from {formatPercent(analysis.stats.min)} to {formatPercent(analysis.stats.max)}. The shaded box holds the middle
                            half of districts ({formatPercent(analysis.stats.q1, 0)}–{formatPercent(analysis.stats.q3, 0)}); the whiskers cover 80% of districts.
                        </p>
                    </div>
                    <PercentileStrip stats={analysis.stats} marker={nationalAverage} />
                </div>
            </DpatSection>

            <DpatSection
                id="leaders"
                kicker="Rankings"
                title="Leaders and laggards"
                description={`Ranked by final score. Each bar splits the score into service delivery and performance points${yearly?.movers ? `; switch views to see who moved most since ${yearly.movers.previousYear}` : ''}.`}
                actions={<Link className="dpat-button dpat-button--ghost" to={`?year=${year}&view=rankings`}>Full rankings</Link>}
            >
                <div className="dpat-grid dpat-grid--lead">
                    <DpatLeaderboard scored={insights.scored} movers={yearly?.movers} nationalAverage={nationalAverage} scale={scale} year={year} />
                    <Spotlight scored={insights.scored} analysis={analysis} scale={scale} year={year} />
                </div>
            </DpatSection>

            <DpatSection
                id="balance"
                kicker="Service delivery vs performance"
                title="How balanced are districts?"
                description="Each dot is a district, placed by the share of service delivery (SDI) and performance (PI) points it earned. Dashed lines mark the national averages. Hover for details; click to open a scorecard."
            >
                <div className="dpat-grid dpat-grid--lead">
                    <div className="dpat-card">
                        <ScatterPlot
                            points={analysis.points}
                            xRef={analysis.xRef}
                            yRef={analysis.yRef}
                            xLabel="Service delivery score (% of SDI points)"
                            yLabel="Performance score (% of PI points)"
                            ariaLabel={`Scatter plot of ${analysis.points.length} districts by service delivery and performance share`}
                            onSelect={(point) => navigate(districtPath(point.key, year))}
                            renderTooltip={({ district }) => (
                                <>
                                    <strong>{shortDistrictName(district.districtName)}</strong>
                                    <span>{district.regionName} Region</span>
                                    <span>SDI {district.sdiFinal}/{district.sdiMax} · PI {district.piFinal}/{district.piMax}</span>
                                    <b>{formatPercent(district.finalPercent)} · {district.classification}</b>
                                </>
                            )}
                        />
                        <ul className="dpat-inline-legend dpat-inline-legend--center">
                            {classificationLegend.map((item) => <li key={item.label}><i style={{ background: item.color }} aria-hidden="true" />{item.label}</li>)}
                        </ul>
                    </div>
                    <div className="dpat-card dpat-quadrants">
                        <h3>Where districts fall</h3>
                        <ul>
                            {QUADRANTS.map((quadrant) => {
                                const count = analysis.quadrantCounts[quadrant.key]
                                const share = (count / insights.scored.length) * 100
                                return (
                                    <li key={quadrant.key}>
                                        <div className="dpat-quadrants__head">
                                            <span><i style={{ background: quadrant.color }} aria-hidden="true" />{quadrant.label}</span>
                                            <b>{count}</b>
                                        </div>
                                        <div className="dpat-quadrants__track" aria-hidden="true"><i style={{ width: `${share}%`, background: quadrant.color }} /></div>
                                        <small>{formatPercent(share, 0)} of districts · {quadrant.text}</small>
                                    </li>
                                )
                            })}
                        </ul>
                        <p className="dpat-quadrants__note">
                            National averages: SDI {formatPercent(analysis.xRef, 0)} and PI {formatPercent(analysis.yRef, 0)} of available points.
                        </p>
                    </div>
                </div>
            </DpatSection>

            {regions && (
                <DpatSection id="regional" kicker="Regions" title="Regional performance" description="Average final score of the published districts in each region, how outcomes are distributed, and how widely districts vary within each region.">
                    <div className="dpat-grid dpat-grid--map">
                        <div className="dpat-card">
                            <DpatRegionMap regions={regions} scale={scale} nationalAverage={nationalAverage} onSelectRegion={onOpenRegion} />
                        </div>
                        <div className="dpat-card">
                            <h3>Regional ranking</h3>
                            <BarList
                                items={analysis.regionRows.map(({ region }) => ({
                                    key: region.regionId,
                                    rank: region.rank,
                                    label: region.regionName,
                                    sublabel: `${region.assessedCount} of ${region.districtCount} districts`,
                                    value: region.averagePercent,
                                    max: 100,
                                    display: formatPercent(region.averagePercent),
                                    color: classificationColor(region.classification, scale),
                                    to: `?year=${year}&view=regions&region=${region.regionId}`,
                                }))}
                                marker={nationalMarker}
                            />
                        </div>
                    </div>
                    <div className="dpat-grid dpat-grid--2 dpat-grid--spaced">
                        <div className="dpat-card">
                            <h3>Outcome mix by region</h3>
                            <StackedBars
                                legend={classificationLegend}
                                rows={analysis.regionRows.map(({ region, mix, members }) => ({
                                    key: region.regionId,
                                    label: region.regionName,
                                    meta: plural(members.length, 'district'),
                                    total: members.length,
                                    segments: mix,
                                }))}
                            />
                        </div>
                        <div className="dpat-card">
                            <h3>Score spread within each region</h3>
                            <RangePlot
                                marker={nationalAverage}
                                rows={analysis.regionRows.map(({ region, stats }) => ({
                                    key: region.regionId,
                                    label: region.regionName,
                                    meta: `Median ${formatPercent(stats.median, 0)}`,
                                    color: classificationColor(region.classification, scale),
                                    ...stats,
                                }))}
                            />
                            <p className="dpat-note"><i className="dpat-note__marker" aria-hidden="true" /> Line: lowest to highest district. Box: middle half. Tick: median. Dashed: national average.</p>
                        </div>
                    </div>
                    <div className="dpat-card dpat-card--spaced">
                        <h3>Best-performing district in each region</h3>
                        <ul className="dpat-leaders-grid">
                            {analysis.regionRows.map(({ region, best }) => best && (
                                <li key={region.regionId}>
                                    <span>{region.regionName}</span>
                                    <Link to={districtPath(best.districtId, year)}>{shortDistrictName(best.districtName)}</Link>
                                    <div>
                                        <b style={{ color: classificationColor(best.classification, scale) }}>{formatPercent(best.finalPercent)}</b>
                                        <small>{best.nationalRank ? `#${best.nationalRank} nationally` : ''}</small>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>
                </DpatSection>
            )}

            {analysis.areas.length > 0 && (
                <DpatSection
                    id="thematic-snapshot"
                    kicker="Thematic areas"
                    title="Where points are won and lost"
                    description="National average final score in each service delivery (SDI) and performance (PI) area as a share of the points available, and how districts fared on compliance."
                    actions={<Link className="dpat-button dpat-button--ghost" to={`?year=${year}&view=thematic`}>All thematic results</Link>}
                >
                    <div className="dpat-grid dpat-grid--2">
                        <div className="dpat-card">
                            <h3>Thematic profile</h3>
                            <RadarChart
                                axes={analysis.areas.map((area) => ({ key: area.code, label: area.code, name: area.thematicArea, value: area.averagePercent }))}
                                benchmark={nationalAverage}
                                color={DPAT_COLORS.navy}
                                ariaLabel={analysis.areas.map((area) => `${area.code} ${formatPercent(area.averagePercent, 0)}`).join(', ')}
                            />
                            <ul className="dpat-inline-legend dpat-inline-legend--center">
                                <li><i style={{ background: DPAT_COLORS.navy }} aria-hidden="true" />Average share of points</li>
                                <li><i className="is-dashed" aria-hidden="true" />National average final score ({formatPercent(nationalAverage, 0)})</li>
                            </ul>
                        </div>
                        <div className="dpat-card">
                            <h3>Areas ranked</h3>
                            <BarList items={[...analysis.areas].sort((a, b) => b.averagePercent - a.averagePercent).map((area) => ({
                                key: area.code,
                                label: `${area.code} · ${area.thematicArea}`,
                                sublabel: `Average ${formatScore(area.averageScore)} of ${formatScore(area.maxScore)} points`,
                                value: area.averagePercent,
                                max: 100,
                                display: formatPercent(area.averagePercent, 0),
                                color: percentColor(area.averagePercent, scale),
                            }))} />
                        </div>
                    </div>
                    {thematic?.compliance?.length > 0 && (
                        <div className="dpat-grid dpat-grid--2 dpat-grid--spaced">
                            <div className="dpat-card">
                                <h3>Compliance indicators fulfilled</h3>
                                <BarList items={thematic.compliance.map((area) => ({
                                    key: area.code,
                                    label: `${area.code} · ${area.thematicArea}`,
                                    sublabel: `${area.fulfilledCount} of ${thematic.assessedCount} districts`,
                                    value: area.fulfilledPercent,
                                    max: 100,
                                    display: formatPercent(area.fulfilledPercent, 0),
                                    color: DPAT_COLORS.navy,
                                }))} />
                            </div>
                            <div className="dpat-card">
                                <h3>Compliance indicators met per district</h3>
                                <ColumnChart
                                    bins={thematic.ciDistribution.map((item) => ({
                                        key: `ci-${item.fulfilled}`,
                                        label: `${item.fulfilled} of 4`,
                                        value: item.count,
                                        color: item.fulfilled === 4 ? DPAT_COLORS.positive : item.fulfilled === 0 ? DPAT_COLORS.negative : DPAT_COLORS.neutral,
                                    }))}
                                    xLabel="Compliance indicators fulfilled"
                                    yLabel="Districts"
                                    ariaLabel={thematic.ciDistribution.map((item) => `${item.fulfilled} of 4: ${item.count} districts`).join(', ')}
                                />
                            </div>
                        </div>
                    )}
                </DpatSection>
            )}

            {years.length > 1 && (
                <DpatSection id="year-on-year" kicker="Trend" title="Year-on-year performance" description="How the national picture has changed across assessment years, based on each year's published final scores.">
                    {series.isLoading && <div className="dpat-card"><p className="dpat-empty">Loading year-on-year comparison…</p></div>}
                    {yearly && yearly.rows.length > 1 && (
                        <div className="dpat-grid dpat-grid--2">
                            <div className="dpat-card">
                                <h3>National average and median by year</h3>
                                <TrendChart
                                    points={yearly.rows.map((row) => ({ year: row.year, value: row.nationalAverage, benchmark: row.median }))}
                                    seriesLabel="National average"
                                    benchmarkLabel="Median"
                                />
                                <table className="dpat-mini-table">
                                    <thead>
                                        <tr>
                                            <th scope="col">Year</th>
                                            <th scope="col" className="is-numeric">Districts</th>
                                            <th scope="col" className="is-numeric">National average</th>
                                            <th scope="col" className="is-numeric">Good or better</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {yearly.rows.map((row) => (
                                            <tr key={row.year}>
                                                <th scope="row">{row.year}</th>
                                                <td className="is-numeric">{row.assessed}</td>
                                                <td className="is-numeric">{formatPercent(row.nationalAverage)}</td>
                                                <td className="is-numeric">{formatPercent(row.goodShare, 0)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            {yearly.movers && (
                                <div className="dpat-card">
                                    <h3>District movement since {yearly.movers.previousYear}</h3>
                                    <DonutChart
                                        segments={[
                                            { label: 'Improved', value: yearly.movers.improvedCount, color: DPAT_COLORS.positive },
                                            { label: 'Declined', value: yearly.movers.declinedCount, color: DPAT_COLORS.negative },
                                            { label: 'Unchanged', value: yearly.movers.unchangedCount, color: '#a3acb9' },
                                        ]}
                                        centerValue={yearly.movers.compared}
                                        centerLabel="compared"
                                        ariaLabel={`Improved ${yearly.movers.improvedCount}, declined ${yearly.movers.declinedCount}, unchanged ${yearly.movers.unchangedCount}`}
                                    />
                                    <p className="dpat-note">
                                        Average change {formatDelta(yearly.movers.averageChange)} across {yearly.movers.compared} districts published in both years.
                                    </p>
                                </div>
                            )}
                        </div>
                    )}
                </DpatSection>
            )}
        </>
    )
}

export default DpatOverview
