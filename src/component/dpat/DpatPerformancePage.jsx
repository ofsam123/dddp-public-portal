import React, { useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { BarList, ColumnChart } from './components/DpatCharts'
import DpatRankingsTable from './components/DpatRankingsTable'
import DpatOverview from './DpatOverview'
import { DpatError, DpatHero, DpatKpi, DpatLoading, DpatPageShell, DpatSection, DpatToolbar } from './components/DpatLayout'
import {
    useDpatIndicators,
    useDpatRegionScores,
    useDpatScores,
    useDpatSearchParam,
    useDpatSearchUpdater,
    useDpatThematicAreas,
    useDpatYear,
    useDpatYears,
} from './hooks/useDpat'
import {
    DPAT_COLORS,
    classificationColor,
    classifyPercent,
    districtPath,
    formatPercent,
    formatScore,
    mean,
    median,
    percentColor,
    scoredDistricts,
    shortDistrictName,
} from './dpatFormat'

const VIEWS = [
    { key: 'overview', label: 'Overview' },
    { key: 'rankings', label: 'District rankings' },
    { key: 'regions', label: 'Regions' },
    { key: 'thematic', label: 'Thematic areas' },
    { key: 'indicators', label: 'Indicator guide' },
]

const buildInsights = (scores, scale) => {
    const scored = scoredDistricts(scores).sort((a, b) => (a.nationalRank - b.nationalRank) || a.districtName.localeCompare(b.districtName))
    if (!scores || scored.length === 0) return null
    const percents = scored.map((district) => district.finalPercent)
    const highest = scored[0]
    const lowest = scored[scored.length - 1]
    const bins = Array.from({ length: 10 }, (_, index) => {
        const from = index * 10
        const count = percents.filter((percent) => Math.min(Math.floor(percent / 10), 9) === index).length
        return {
            key: `bin-${from}`,
            label: `${from}–${from + 10}`,
            value: count,
            color: percentColor(from + 5, scale),
            title: `${count} ${count === 1 ? 'district' : 'districts'} scored ${from}–${from + 10}%`,
        }
    })

    return {
        scored,
        highest,
        highestTies: scored.filter((district) => district.finalPercent === highest.finalPercent).length - 1,
        lowest,
        lowestTies: scored.filter((district) => district.finalPercent === lowest.finalPercent).length - 1,
        median: median(percents),
        fullCompliance: scored.filter((district) => district.ciFulfilled === district.ciTotal).length,
        sdiAverage: mean(scored.map((district) => district.sdiFinal)),
        sdiMax: scored[0].sdiMax,
        piAverage: mean(scored.map((district) => district.piFinal)),
        piMax: scored[0].piMax,
        top: scored.slice(0, 10),
        bottom: scored.slice(-10).reverse(),
        bins,
        classification: scale.map((band, index) => ({
            label: band.label,
            hint: index === 0 ? `${band.min}% and above` : `${band.min}–${scale[index - 1].min}%`,
            value: scored.filter((district) => district.classification === band.label).length,
            color: classificationColor(band.label, scale),
        })),
    }
}

const OverviewKpis = ({ scores, insights, scale }) => {
    const nationalClass = classifyPercent(scores.nationalAverage, scale)
    return (
        <div className="dpat-kpi-grid">
            <DpatKpi label="National average final score" value={formatPercent(scores.nationalAverage)} accent={classificationColor(nationalClass, scale)} context={`${nationalClass} · mean of ${scores.assessedCount} published districts`} />
            <DpatKpi label="Median final score" value={formatPercent(insights.median)} context="Half of all districts scored at or above this" />
            <DpatKpi label="Highest final score" value={formatPercent(insights.highest.finalPercent)} accent={classificationColor(insights.highest.classification, scale)}>
                <p><Link to={districtPath(insights.highest.districtId, scores.year)}>{shortDistrictName(insights.highest.districtName)}</Link>{insights.highestTies > 0 ? ` and ${insights.highestTies} other${insights.highestTies > 1 ? 's' : ''}` : ''}</p>
            </DpatKpi>
            <DpatKpi label="Lowest final score" value={formatPercent(insights.lowest.finalPercent)} accent={classificationColor(insights.lowest.classification, scale)}>
                <p><Link to={districtPath(insights.lowest.districtId, scores.year)}>{shortDistrictName(insights.lowest.districtName)}</Link>{insights.lowestTies > 0 ? ` and ${insights.lowestTies} other${insights.lowestTies > 1 ? 's' : ''}` : ''}</p>
            </DpatKpi>
            <DpatKpi label="Districts with published results" value={scores.assessedCount} unit={` / ${scores.totalDistricts}`} context="Only completed or closed assessments are published">
                <div className="dpat-kpi__track" aria-hidden="true"><span style={{ width: `${(scores.assessedCount / scores.totalDistricts) * 100}%` }} /></div>
            </DpatKpi>
            <DpatKpi label="Average service delivery (SDI)" value={formatScore(Math.round(insights.sdiAverage * 10) / 10)} unit={` / ${insights.sdiMax}`} context={`${formatPercent((insights.sdiAverage / insights.sdiMax) * 100, 0)} of available SDI points`} />
            <DpatKpi label="Average performance (PI)" value={formatScore(Math.round(insights.piAverage * 10) / 10)} unit={` / ${insights.piMax}`} context={`${formatPercent((insights.piAverage / insights.piMax) * 100, 0)} of available PI points`} />
            <DpatKpi label="Full compliance" value={insights.fullCompliance} unit={insights.fullCompliance === 1 ? ' district' : ' districts'} context="Fulfilled all 4 compliance indicators (CI)" />
        </div>
    )
}

const RegionsView = ({ scores, regions, scale, year, selectedRegionId, onSelectRegion }) => {
    const scored = scoredDistricts(scores)
    const selected = regions.find((region) => region.regionId === selectedRegionId)
    const inSelected = selected
        ? scored.filter((district) => district.regionId === selected.regionId).sort((a, b) => a.regionalRank - b.regionalRank || a.districtName.localeCompare(b.districtName))
        : []
    const selectedId = selected?.regionId

    useEffect(() => {
        if (!selectedId) return undefined
        const frame = requestAnimationFrame(() => {
            document.getElementById('region-detail')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
        })
        return () => cancelAnimationFrame(frame)
    }, [selectedId])

    return (
        <>
            <DpatSection id="region-cards" kicker="Regions" title="Regional league table" description="Select a region to see how its districts rank against each other.">
                <div className="dpat-region-grid">
                    {regions.map((region) => {
                        const districts = scored.filter((district) => district.regionId === region.regionId)
                        const best = districts.reduce((top, district) => (!top || district.finalPercent > top.finalPercent ? district : top), null)
                        const color = classificationColor(region.classification, scale)
                        const isSelected = region.regionId === selectedRegionId
                        return (
                            <button
                                type="button"
                                key={region.regionId}
                                className={`dpat-region-card${isSelected ? ' is-selected' : ''}`}
                                aria-pressed={isSelected}
                                onClick={() => onSelectRegion(isSelected ? null : region.regionId)}
                            >
                                <span className="dpat-region-card__rank">{region.rank ? `#${region.rank}` : '—'}</span>
                                <strong>{region.regionName}</strong>
                                <b style={{ color }}>{formatPercent(region.averagePercent)}</b>
                                {region.classification && <span className="dpat-pill" style={{ '--pill-color': color }}>{region.classification}</span>}
                                <span className="dpat-region-card__track" aria-hidden="true">
                                    <i style={{ width: `${region.averagePercent || 0}%`, background: color }} />
                                    <em style={{ left: `${scores.nationalAverage}%` }} />
                                </span>
                                <small>{region.assessedCount} of {region.districtCount} districts published</small>
                                {best && <small>Top: {shortDistrictName(best.districtName)} ({formatPercent(best.finalPercent, 0)})</small>}
                            </button>
                        )
                    })}
                </div>
            </DpatSection>

            {selected && (
                <DpatSection
                    id="region-detail"
                    kicker={`${selected.regionName} Region`}
                    title={`District ranking in ${selected.regionName}`}
                    description={`Average final score ${formatPercent(selected.averagePercent)} (${selected.classification}), ranked ${selected.rank} of ${regions.filter((region) => region.rank).length} regions.`}
                    actions={(
                        <button
                            type="button"
                            className="dpat-button dpat-button--ghost"
                            onClick={() => {
                                onSelectRegion(null)
                                document.getElementById('region-cards')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
                            }}
                        >
                            Back to all regions
                        </button>
                    )}
                >
                    <div className="dpat-kpi-grid dpat-region-kpis">
                        <DpatKpi label="Regional average" value={formatPercent(selected.averagePercent)} accent={classificationColor(selected.classification, scale)} context={`National average ${formatPercent(scores.nationalAverage)}`} />
                        <DpatKpi label="Highest in region" value={inSelected[0] ? formatPercent(inSelected[0].finalPercent) : '—'} context={inSelected[0] ? shortDistrictName(inSelected[0].districtName) : null} />
                        <DpatKpi label="Lowest in region" value={inSelected.length ? formatPercent(inSelected[inSelected.length - 1].finalPercent) : '—'} context={inSelected.length ? shortDistrictName(inSelected[inSelected.length - 1].districtName) : null} />
                        <DpatKpi label="Median in region" value={inSelected.length ? formatPercent(median(inSelected.map((district) => district.finalPercent))) : '—'} context={`${inSelected.length} published ${inSelected.length === 1 ? 'district' : 'districts'}`} />
                    </div>
                    <DpatRankingsTable districts={scores.districts} regions={regions} scale={scale} year={year} lockedRegionId={selected.regionId} title={`${selected.regionName} district rankings`} />
                </DpatSection>
            )}
        </>
    )
}

const ThematicView = ({ thematic, scale }) => {
    const areas = [...thematic.serviceDelivery, ...thematic.performance].filter((area) => Number.isFinite(area.averagePercent))
    const strongest = areas.reduce((top, area) => (!top || area.averagePercent > top.averagePercent ? area : top), null)
    const weakest = areas.reduce((low, area) => (!low || area.averagePercent < low.averagePercent ? area : low), null)
    const areaItems = (list) => list.map((area) => ({
        key: area.code,
        label: `${area.code} · ${area.thematicArea}`,
        sublabel: `Average ${formatScore(area.averageScore)} of ${formatScore(area.maxScore)} points`,
        value: area.averagePercent,
        max: 100,
        display: formatPercent(area.averagePercent, 0),
        color: percentColor(area.averagePercent, scale),
    }))

    return (
        <>
            <div className="dpat-kpi-grid dpat-kpi-grid--3">
                {strongest && <DpatKpi label="Strongest area nationally" value={formatPercent(strongest.averagePercent, 0)} accent={percentColor(strongest.averagePercent, scale)} context={`${strongest.code} · ${strongest.thematicArea}`} />}
                {weakest && <DpatKpi label="Weakest area nationally" value={formatPercent(weakest.averagePercent, 0)} accent={percentColor(weakest.averagePercent, scale)} context={`${weakest.code} · ${weakest.thematicArea}`} />}
                <DpatKpi label="Districts included" value={thematic.assessedCount} context="Published final results only" />
            </div>
            <DpatSection id="sdi" kicker="Service Delivery Indicators" title="Service delivery (SDI)" description="National average final score per area, as a share of the points available.">
                <div className="dpat-card"><BarList items={areaItems(thematic.serviceDelivery)} /></div>
            </DpatSection>
            <DpatSection id="pi" kicker="Performance Indicators" title="Performance (PI)" description="National average final score per area, as a share of the points available.">
                <div className="dpat-card"><BarList items={areaItems(thematic.performance)} /></div>
            </DpatSection>
            <DpatSection id="ci" kicker="Compliance Indicators" title="Compliance (CI)" description="Share of districts whose final outcome fulfilled each compliance indicator.">
                <div className="dpat-grid dpat-grid--2">
                    <div className="dpat-card">
                        <h3>Fulfilment rate by indicator</h3>
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
            </DpatSection>
        </>
    )
}

const CATEGORY_INFO = {
    CI: { title: 'Compliance Indicators', text: 'Requirements on statutory meetings, public financial management and transparency, recorded as fulfilled or not fulfilled.' },
    SDI: { title: 'Service Delivery Indicators', text: 'How well the assembly delivers basic services, planning, social protection, sanitation and local economic development.' },
    PI: { title: 'Performance Indicators', text: 'Annual Action Plan delivery, revenue generation, audit performance and support to social services.' },
}

const IndicatorsView = ({ year, scale }) => {
    const { data, error, isLoading } = useDpatIndicators(year)
    if (isLoading) return <DpatLoading title="Loading the indicator guide" />
    if (error || !data) return <DpatError error={error} title="The indicator guide is unavailable" />
    const categories = ['CI', 'SDI', 'PI'].map((category) => {
        const groups = data.groups.filter((group) => group.category === category)
        return { category, groups, maxScore: groups.reduce((total, group) => total + (group.maxScore || 0), 0) }
    })

    return (
        <>
            <DpatSection id="structure" kicker="Methodology" title="How the DPAT final score works" description="Every district is scored out of 100 points across service delivery and performance, with compliance indicators recorded as fulfilled or not fulfilled.">
                <div className="dpat-grid dpat-grid--3">
                    {categories.map(({ category, groups, maxScore }) => (
                        <div className="dpat-card dpat-structure" key={category}>
                            <span className="dpat-kicker">{category}</span>
                            <h3>{CATEGORY_INFO[category].title}</h3>
                            <b>{category === 'CI' ? `${groups.length} indicators` : `${maxScore} points`}</b>
                            <p>{CATEGORY_INFO[category].text}</p>
                        </div>
                    ))}
                </div>
                <div className="dpat-card dpat-scale">
                    <h3>Final outcome bands</h3>
                    <ul>
                        {scale.map((band, index) => (
                            <li key={band.label}>
                                <i style={{ background: classificationColor(band.label, scale) }} aria-hidden="true" />
                                <strong>{band.label}</strong>
                                <span>{index === 0 ? `${band.min}% and above` : `${band.min}% to below ${scale[index - 1].min}%`}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            </DpatSection>
            {categories.map(({ category, groups }) => (
                <DpatSection key={category} id={`guide-${category.toLowerCase()}`} kicker={category} title={CATEGORY_INFO[category].title}>
                    <div className="dpat-accordion">
                        {groups.map((group) => (
                            <details key={group.code}>
                                <summary>
                                    <span className="dpat-code">{group.code}</span>
                                    <strong>{group.thematicArea}</strong>
                                    <em>{group.maxScore ? `${group.maxScore} points` : 'Fulfilled / not fulfilled'}</em>
                                </summary>
                                <ul>
                                    {group.subIndicators.map((sub) => (
                                        <li key={sub.code}>
                                            <div>
                                                <span className="dpat-code dpat-code--muted">{sub.code}</span>
                                                <strong>{sub.name}</strong>
                                                {sub.maxScore && <em>{sub.maxScore} {sub.maxScore === 1 ? 'point' : 'points'}</em>}
                                            </div>
                                            {sub.scoringCriteria && (
                                                <details>
                                                    <summary>How it is scored</summary>
                                                    <p>{sub.scoringCriteria}</p>
                                                </details>
                                            )}
                                        </li>
                                    ))}
                                </ul>
                            </details>
                        ))}
                    </div>
                </DpatSection>
            ))}
        </>
    )
}

const DpatPerformancePage = () => {
    const years = useDpatYears()
    const [year, setYear] = useDpatYear(years.data)
    const [viewParam] = useDpatSearchParam('view')
    const [regionParam, setRegion] = useDpatSearchParam('region')
    const updateSearch = useDpatSearchUpdater()
    const view = VIEWS.some((item) => item.key === viewParam) ? viewParam : 'overview'
    const scores = useDpatScores(year)
    const regions = useDpatRegionScores(year)
    const thematic = useDpatThematicAreas(view === 'overview' || view === 'thematic' ? year : null)
    const scale = useMemo(() => years.data?.classificationScale || [], [years.data])
    const insights = useMemo(() => buildInsights(scores.data, scale), [scores.data, scale])

    const openRegion = (regionId) => updateSearch({ view: 'regions', region: regionId })

    const renderView = () => {
        if (view === 'indicators') return <IndicatorsView year={year} scale={scale} />
        if (scores.isLoading || regions.isLoading) return <DpatLoading />
        if (scores.error || !scores.data || !insights) return <DpatError error={scores.error} />
        if (view === 'rankings') {
            return (
                <DpatSection id="rankings" kicker="Rankings" title="District rankings" description="Every district's final score. Districts with equal final scores share a rank; ties are listed alphabetically.">
                    <DpatRankingsTable districts={scores.data.districts} regions={regions.data || []} scale={scale} year={year} />
                </DpatSection>
            )
        }
        if (view === 'regions') {
            if (!regions.data) return <DpatError error={regions.error} />
            return <RegionsView scores={scores.data} regions={regions.data} scale={scale} year={year} selectedRegionId={regionParam} onSelectRegion={setRegion} />
        }
        if (view === 'thematic') {
            if (thematic.isLoading) return <DpatLoading title="Loading thematic area results" />
            if (thematic.error || !thematic.data) return <DpatError error={thematic.error} />
            return <ThematicView thematic={thematic.data} scale={scale} />
        }
        return <DpatOverview scores={scores.data} insights={insights} regions={regions.data} thematic={thematic.data} scale={scale} year={year} years={years.data.years} onOpenRegion={openRegion} />
    }

    return (
        <DpatPageShell>
            <DpatHero
                breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'DPAT' }, { label: 'Performance Analysis' }]}
                eyebrow="District Performance Assessment Tool"
                title={year ? `How Ghana's districts performed in ${year}` : 'DPAT performance analysis'}
                description="Official final DPAT outcomes for every Metropolitan, Municipal and District Assembly: national benchmarks, rankings, regional comparisons and indicator-level results."
                year={year}
                years={years.data?.years}
                onYearChange={setYear}
                updatedAt={scores.data?.updatedAt}
            >
                {scores.data && insights && <OverviewKpis scores={scores.data} insights={insights} scale={scale} />}
            </DpatHero>

            {years.error && <DpatError error={years.error} />}
            {years.isLoading && <DpatLoading />}
            {years.data && (
                <>
                    <DpatToolbar year={year} label="Performance analysis views">
                        {VIEWS.map((item) => (
                            <button
                                type="button"
                                key={item.key}
                                className={view === item.key ? 'is-active' : undefined}
                                aria-current={view === item.key ? 'page' : undefined}
                                onClick={() => updateSearch({ view: item.key === 'overview' ? null : item.key, region: null })}
                            >
                                {item.label}
                            </button>
                        ))}
                    </DpatToolbar>
                    <div className="dpat-container dpat-body">{renderView()}</div>
                </>
            )}
        </DpatPageShell>
    )
}

export default DpatPerformancePage
