import React, { useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import NavBar from '../header/NavBar'
import PublicFooter from '../footer/PublicFooter'
import ExploreBreadcrumbs from '../explore/components/ExploreBreadcrumbs'
import HeroBackdrop from '../shared/HeroBackdrop'
import { Histogram, LineChart, ScatterPlot } from '../shared/charts/PortalCharts'
import { useDpatIndicators, useDpatScores, useDpatThematicAreas, useDpatYearSeries, useDpatYears } from './hooks/useDpat'
import {
    classificationColor,
    districtPath,
    formatPercent,
    mean,
    median,
    percentColor,
    scoredDistricts,
    shortDistrictName,
} from './dpatFormat'
import './DpatAssessmentGuide.css'

const ARROW = <svg viewBox="0 0 16 16" aria-hidden="true"><path d="M3 8h10M9 4l4 4-4 4" /></svg>
const RESULTS_PATH = '/dpat/performance-analysis'
const numberFormat = new Intl.NumberFormat('en-GH')

const CATEGORY_COPY = {
    CI: {
        title: 'Compliance Indicators',
        short: 'CI',
        measure: 'Fulfilled or not fulfilled',
        text: 'The statutory, financial management and transparency requirements the rest of the assessment rests on: Assembly meetings and approvals, functioning statutory organs, public financial management and auditing, and accountability to citizens.',
    },
    SDI: {
        title: 'Service Delivery Index',
        short: 'SDI',
        text: 'How well the assembly delivers and coordinates services: basic and social services, physical planning, social protection, sanitation and local economic development.',
    },
    PI: {
        title: 'Performance Index',
        short: 'PI',
        text: 'How the assembly performs as an institution: implementing its annual action plan, raising revenue, audit performance and supporting access to social services.',
    },
}

const AREA_SHADES = {
    SDI: ['#16325a', '#24497d', '#3a6195', '#5b7cab', '#7d97bf', '#a3b6d4'],
    PI: ['#a57f2c', '#c49a3c', '#d4b067', '#e3cb96'],
}

const PURPOSE = [
    {
        title: 'Accountability to citizens',
        text: 'Every published assembly receives a Final Score and outcome, so residents can see how their District / MMDA is performing and how it compares nationally.',
    },
    {
        title: 'Better local services',
        text: 'Scores are built from indicators on services people use every day, showing where assemblies are strong and where delivery needs attention.',
    },
    {
        title: 'Evidence for support',
        text: 'National and regional bodies use results to target capacity building and to inform performance-based support to assemblies.',
    },
]

const STEPS = [
    { title: 'Evidence prepared', text: 'Each assembly compiles the records and documents that show what it did during the assessment year, indicator by indicator.' },
    { title: 'Independent assessment', text: 'Assessors verify the evidence for every indicator against its published scoring criteria and record points awarded.' },
    { title: 'Review and validation', text: 'Results go through a structured review and validation process before they are confirmed as final.' },
    { title: 'Final Score and outcome', text: 'Service delivery and performance points are added into a Final Score out of 100 and placed in an outcome band.' },
    { title: 'Publication', text: 'Once an assembly has completed the full process its Final Score, outcome and rankings are published here.' },
]

const READING = [
    { title: 'Final Scores only', text: 'Every figure on this portal is a Final Score or Final Outcome: the confirmed result at the end of the assessment process.' },
    { title: 'Shared rankings', text: 'Assemblies with the same Final Score share a rank, and the next rank is skipped (1, 1, 3). Ties are listed alphabetically.' },
    { title: 'Compliance matters', text: 'Every scorecard shows how many of the four Compliance Indicators were fulfilled. Read it together with the Final Score: it shows whether core governance requirements were met.' },
    { title: 'Published assemblies', text: 'Only assemblies whose assessment is complete are published and ranked. Others appear as not yet published.' },
]

const FAQ = [
    {
        q: 'What does the Final Score represent?',
        a: 'It is the total of the points an assembly earned on the Service Delivery Index and the Performance Index, expressed out of 100, after the full assessment and validation process has been completed.',
    },
    {
        q: 'How is the outcome band decided?',
        a: 'The Final Score is compared with the published outcome scale. For example, a Final Score of exactly 40 falls in the Good band because each band starts at its lower bound.',
    },
    {
        q: 'What does it mean when a Compliance Indicator is not fulfilled?',
        a: 'At least one of its requirements, such as a statutory meeting, an approval deadline or an audit submission, could not be verified as met for the assessment year. The result appears on the assembly\'s scorecard. Because these requirements underpin planning, budgeting and accountability, gaps in compliance tend to go with weaker service delivery and performance.',
    },
    {
        q: 'Why is an assembly missing from the rankings?',
        a: 'Results are published only after an assembly completes the full assessment process. Assemblies still in progress are listed as not yet published and are not ranked.',
    },
    {
        q: 'Can I see what each indicator requires?',
        a: 'Yes. The indicator guide lists every thematic area, sub-indicator, maximum points and scoring criteria for each published year.',
    },
    {
        q: 'How often is DPAT carried out?',
        a: 'DPAT runs in annual cycles. Each set of results on this portal is labelled with its assessment year, and you can switch between published years.',
    },
]

const bandRanges = (scale) => scale.map((band, index) => ({
    ...band,
    max: index === 0 ? 100 : scale[index - 1].min,
    color: classificationColor(band.label, scale),
})).reverse()

const AtAGlance = ({ totals, assessedCount, totalDistricts, year, isLoading }) => {
    const rows = [
        { label: 'Service Delivery Index', value: totals.SDI ? `${totals.SDI} points` : null },
        { label: 'Performance Index', value: totals.PI ? `${totals.PI} points` : null },
        { label: 'Compliance Indicators', value: totals.CI ? `${totals.CI} indicators` : null },
        { label: `Assemblies published${year ? ` (${year})` : ''}`, value: assessedCount != null ? `${numberFormat.format(assessedCount)}${totalDistricts ? ` of ${numberFormat.format(totalDistricts)}` : ''}` : null },
    ]

    return (
        <aside className="dpat-guide-glance pt-card" aria-label="DPAT at a glance">
            <span className="section-kicker">At a glance</span>
            <div className="dpat-guide-glance__total">
                <strong>{totals.SDI && totals.PI ? totals.SDI + totals.PI : '100'}</strong>
                <span>points make up every Final Score</span>
            </div>
            <dl>
                {rows.map((row) => (
                    <div key={row.label}>
                        <dt>{row.label}</dt>
                        <dd>{row.value || (isLoading ? '…' : '—')}</dd>
                    </div>
                ))}
            </dl>
        </aside>
    )
}

const PointsBar = ({ groups }) => {
    const scored = groups.filter((group) => group.category !== 'CI' && Number.isFinite(group.maxScore))
    const total = scored.reduce((sum, group) => sum + group.maxScore, 0)
    if (!total) return null
    const shadeIndex = { SDI: 0, PI: 0 }

    return (
        <div className="dpat-guide-points" aria-label={`How the ${total} points are shared across thematic areas`}>
            <div className="dpat-guide-points__bar">
                {scored.map((group) => {
                    const shades = AREA_SHADES[group.category]
                    const color = shades[shadeIndex[group.category]++ % shades.length]
                    return (
                        <span
                            key={group.code}
                            style={{ width: `${(group.maxScore / total) * 100}%`, background: color }}
                            title={`${group.code} · ${group.thematicArea}: ${group.maxScore} points`}
                        >
                            <b>{group.code.replace(' ', '')}</b>
                            <i>{group.maxScore}</i>
                        </span>
                    )
                })}
            </div>
            <div className="dpat-guide-points__scale" aria-hidden="true">
                <span>0</span>
                <span>{total} points</span>
            </div>
        </div>
    )
}

const CategoryCard = ({ category, groups }) => {
    const copy = CATEGORY_COPY[category]
    const items = groups.filter((group) => group.category === category)
    const points = items.reduce((sum, group) => sum + (group.maxScore || 0), 0)

    return (
        <article className={`dpat-guide-category dpat-guide-category--${category.toLowerCase()} pt-card`}>
            <header>
                <span className="dpat-guide-category__code">{copy.short}</span>
                <div>
                    <h3>{copy.title}</h3>
                    <p className="dpat-guide-category__measure">{category === 'CI' ? copy.measure : `${points} of 100 points`}</p>
                </div>
            </header>
            <p>{copy.text}</p>
            <ul>
                {items.map((group) => (
                    <li key={group.code}>
                        <span className="dpat-guide-category__area-code">{group.code}</span>
                        <span className="dpat-guide-category__area-name">
                            {group.thematicArea}
                            <small>{group.subIndicators?.length || 0} sub-indicators</small>
                        </span>
                        <b>{category === 'CI' ? '✓ / ✗' : `${group.maxScore} pts`}</b>
                    </li>
                ))}
            </ul>
        </article>
    )
}

const Loading = ({ label }) => <p className="dpat-guide-loading" role="status">{label}</p>

const ComplianceSection = ({ groups, compliance, scored, year, isLoading }) => {
    const ciGroups = groups.filter((group) => group.category === 'CI')
    const total = ciGroups.length || 4
    const rates = new Map((compliance || []).map((item) => [item.code, item]))
    const levels = Array.from({ length: total + 1 }, (_, fulfilled) => {
        const members = scored.filter((district) => district.ciFulfilled === fulfilled)
        return {
            fulfilled,
            count: members.length,
            share: scored.length ? (members.length / scored.length) * 100 : 0,
            average: mean(members.map((district) => district.finalPercent)),
        }
    })
    const maxCount = Math.max(1, ...levels.map((level) => level.count))
    const allFulfilled = levels[total]?.count ?? 0
    const noneAverage = levels[0]?.average
    const someAverage = mean(scored.filter((district) => district.ciFulfilled > 0).map((district) => district.finalPercent))
    const subCount = ciGroups.reduce((sum, group) => sum + (group.subIndicators?.length || 0), 0)

    return (
        <section className="pt-section pt-section--compact" aria-labelledby="dpat-guide-compliance">
            <div className="pt-container">
                <div className="pt-section-head">
                    <div>
                        <span className="section-kicker">Compliance Indicators</span>
                        <h2 id="dpat-guide-compliance">Compliance comes first</h2>
                        <p>
                            {total} Compliance Indicators{subCount ? `, made up of ${subCount} requirements,` : ''} check the governance basics every assembly must have in place. An indicator is fulfilled only when all of its requirements are verified as met. If any one is missing, the indicator is not fulfilled.
                        </p>
                    </div>
                </div>

                {isLoading ? <Loading label="Loading Compliance Indicators…" /> : (
                    <>
                        <div className="dpat-guide-ci">
                            {ciGroups.map((group) => {
                                const rate = rates.get(group.code)
                                return (
                                    <article className="dpat-guide-ci__card pt-card" key={group.code}>
                                        <header>
                                            <span className="dpat-guide-category__code">{group.code.replace(' ', '')}</span>
                                            <h3>{group.thematicArea}</h3>
                                        </header>
                                        {rate && (
                                            <div className="dpat-guide-ci__rate">
                                                <div>
                                                    <strong>{formatPercent(rate.fulfilledPercent)}</strong>
                                                    <span>of assemblies fulfilled this in {year}</span>
                                                </div>
                                                <span className="dpat-guide-ci__track" aria-hidden="true"><i style={{ width: `${rate.fulfilledPercent || 0}%` }} /></span>
                                            </div>
                                        )}
                                        <ul>
                                            {(group.subIndicators || []).map((sub) => (
                                                <li key={sub.code}><span>{sub.code}</span>{sub.name}</li>
                                            ))}
                                        </ul>
                                    </article>
                                )
                            })}
                        </div>

                        {scored.length > 0 && (
                            <div className="dpat-guide-ci__charts">
                                <div className="dpat-guide-chart pt-card">
                                    <div className="dpat-guide-chart__head">
                                        <div>
                                            <h3>How many indicators assemblies fulfilled</h3>
                                            <p>Published assemblies in {year} by the number of Compliance Indicators fulfilled, out of {total}.</p>
                                        </div>
                                    </div>
                                    <ul className="dpat-guide-ci__levels">
                                        {levels.slice().reverse().map((level) => (
                                            <li key={level.fulfilled}>
                                                <span>{level.fulfilled} of {total}</span>
                                                <span className="dpat-guide-ci__level-bar" aria-hidden="true">
                                                    <i style={{ width: `${(level.count / maxCount) * 100}%`, opacity: 0.45 + (level.fulfilled / total) * 0.55 }} />
                                                </span>
                                                <b>{numberFormat.format(level.count)}</b>
                                                <em>{formatPercent(level.share)}</em>
                                            </li>
                                        ))}
                                    </ul>
                                    <p className="dpat-guide-note">
                                        {allFulfilled === 1 ? 'Only 1 assembly' : `${numberFormat.format(allFulfilled)} assemblies`} fulfilled all {total} in {year}.
                                    </p>
                                </div>

                                <div className="dpat-guide-chart pt-card">
                                    <div className="dpat-guide-chart__head">
                                        <div>
                                            <h3>Compliance and the Final Score</h3>
                                            <p>Average Final Score of assemblies grouped by how many Compliance Indicators they fulfilled in {year}.</p>
                                        </div>
                                    </div>
                                    <div className="dpat-guide-ci__columns" role="img" aria-label={`Average Final Score by Compliance Indicators fulfilled in ${year}: ${levels.map((level) => `${level.fulfilled} fulfilled ${formatPercent(level.average)}`).join(', ')}`}>
                                        {levels.map((level) => (
                                            <div key={level.fulfilled}>
                                                <span className="dpat-guide-ci__column">
                                                    <b>{formatPercent(level.average, 0)}</b>
                                                    <i style={{ height: `${level.average || 0}%`, opacity: 0.45 + (level.fulfilled / total) * 0.55 }} />
                                                </span>
                                                <strong>{level.fulfilled}</strong>
                                                <small>{numberFormat.format(level.count)} {level.count === 1 ? 'assembly' : 'assemblies'}</small>
                                            </div>
                                        ))}
                                    </div>
                                    <p className="dpat-guide-note">Compliance Indicators fulfilled (out of {total}). Groups with very few assemblies should be read with care.</p>
                                </div>
                            </div>
                        )}

                        <div className="dpat-guide-ci__why">
                            <div>
                                <h3>Why compliance carries weight</h3>
                                <p>
                                    Compliance Indicators cover the meetings, approvals, procurement, audit and public engagement that make an assembly&apos;s planning and spending work. When they are not met, plans, budgets and accountability are weaker, and that shows across service delivery and performance.
                                    {Number.isFinite(noneAverage) && Number.isFinite(someAverage) && ` In ${year}, assemblies that fulfilled at least one Compliance Indicator averaged ${formatPercent(someAverage)}, compared with ${formatPercent(noneAverage)} for those that fulfilled none.`}
                                </p>
                            </div>
                            <Link className="pt-button pt-button--secondary" to={`${RESULTS_PATH}?view=indicators`}>Compliance requirements in full {ARROW}</Link>
                        </div>
                    </>
                )}
            </div>
        </section>
    )
}

const DpatAssessmentGuide = () => {
    const navigate = useNavigate()
    const yearsState = useDpatYears()
    const yearsData = yearsState.data
    const latestYear = yearsData?.latestYear ?? null
    const scale = useMemo(() => yearsData?.classificationScale || [], [yearsData])
    const indicatorsState = useDpatIndicators(latestYear)
    const scoresState = useDpatScores(latestYear)
    const thematicState = useDpatThematicAreas(latestYear)
    const seriesState = useDpatYearSeries(yearsData?.years)
    const groups = useMemo(() => indicatorsState.data?.groups || [], [indicatorsState.data])

    const totals = useMemo(() => ({
        SDI: groups.filter((group) => group.category === 'SDI').reduce((sum, group) => sum + (group.maxScore || 0), 0),
        PI: groups.filter((group) => group.category === 'PI').reduce((sum, group) => sum + (group.maxScore || 0), 0),
        CI: groups.filter((group) => group.category === 'CI').length,
    }), [groups])

    const scored = useMemo(() => scoredDistricts(scoresState.data), [scoresState.data])
    const bands = useMemo(() => bandRanges(scale).map((band) => {
        const count = scored.filter((district) => district.classification === band.label).length
        return { ...band, count, share: scored.length ? (count / scored.length) * 100 : 0 }
    }), [scale, scored])

    const bins = useMemo(() => Array.from({ length: 20 }, (_, index) => {
        const start = index * 5
        const end = start + 5
        const count = scored.filter((district) => district.finalPercent >= start && (index === 19 ? district.finalPercent <= end : district.finalPercent < end)).length
        return { key: start, start, end, count, label: `${start}–${index === 19 ? 100 : end - 0.1}`, color: percentColor(start + 2.5, scale) }
    }), [scored, scale])

    const scatterPoints = useMemo(() => scored
        .filter((district) => district.sdiMax > 0 && district.piMax > 0)
        .map((district) => ({
            key: district.districtId,
            label: shortDistrictName(district.districtName),
            x: (district.sdiFinal / district.sdiMax) * 100,
            y: (district.piFinal / district.piMax) * 100,
            r: 4.5,
            color: classificationColor(district.classification, scale),
            district,
        })), [scored, scale])

    const trend = useMemo(() => {
        const years = yearsData?.years || []
        const rows = (seriesState.data || []).map((scores, index) => {
            const list = scoredDistricts(scores)
            return {
                year: years[index],
                average: scores?.nationalAverage ?? null,
                median: median(list.map((district) => district.finalPercent)),
                bandShares: Object.fromEntries(scale.map((band) => [
                    band.label,
                    list.length ? (list.filter((district) => district.classification === band.label).length / list.length) * 100 : 0,
                ])),
                assessed: scores?.assessedCount ?? null,
                goodOrBetter: list.length ? (list.filter((district) => district.finalPercent >= (scale.find((band) => band.label === 'Good')?.min ?? 40)).length / list.length) * 100 : null,
            }
        })
        return { years, rows }
    }, [seriesState.data, yearsData, scale])

    const average = scoresState.data?.nationalAverage ?? null
    const medianScore = median(scored.map((district) => district.finalPercent))
    const avgSdi = mean(scatterPoints.map((point) => point.x))
    const avgPi = mean(scatterPoints.map((point) => point.y))
    const aboveBoth = scatterPoints.filter((point) => point.x >= avgSdi && point.y >= avgPi).length

    return (
        <div className="dpat-guide">
            <NavBar />
            <main>
                <header className="pt-page-hero dpat-guide-hero">
                    <HeroBackdrop />
                    <div className="pt-container dpat-guide-hero__grid">
                        <div>
                            <ExploreBreadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'DPAT', href: RESULTS_PATH }, { label: 'Assessment methodology' }]} />
                            <span className="pt-eyebrow dpat-guide-hero__eyebrow"><i aria-hidden="true" /> Methodology{latestYear ? ` · ${latestYear} cycle` : ''}</span>
                            <h1>How DPAT assesses district performance</h1>
                            <p className="pt-page-hero__lead">
                                The District Performance Assessment Tool (DPAT) is Ghana&apos;s annual assessment of how Metropolitan, Municipal and District Assemblies deliver services and manage public resources. This guide explains what is measured, how the Final Score is formed and how to read the published results.
                            </p>
                            <div className="pt-page-hero__actions">
                                <Link className="pt-button pt-button--primary" to={RESULTS_PATH}>
                                    {latestYear ? `See the ${latestYear} results` : 'See the latest results'} {ARROW}
                                </Link>
                                <Link className="pt-button pt-button--secondary" to={`${RESULTS_PATH}?view=indicators`}>Indicator guide</Link>
                            </div>
                        </div>
                        <AtAGlance
                            totals={totals}
                            assessedCount={scoresState.data?.assessedCount ?? null}
                            totalDistricts={scoresState.data?.totalDistricts ?? null}
                            year={latestYear}
                            isLoading={yearsState.isLoading || indicatorsState.isLoading || scoresState.isLoading}
                        />
                    </div>
                </header>

                <section className="pt-section pt-section--compact" aria-labelledby="dpat-guide-purpose">
                    <div className="pt-container">
                        <div className="pt-section-head">
                            <div>
                                <span className="section-kicker">Why DPAT</span>
                                <h2 id="dpat-guide-purpose">A common yardstick for every assembly</h2>
                                <p>{scoresState.data?.totalDistricts ? `All ${numberFormat.format(scoresState.data.totalDistricts)}` : 'All'} Metropolitan, Municipal and District Assemblies are assessed with the same indicators and scoring criteria, so results can be compared fairly across the country.</p>
                            </div>
                        </div>
                        <div className="dpat-guide-purpose">
                            {PURPOSE.map((item, index) => (
                                <article className="pt-card" key={item.title}>
                                    <span className="dpat-guide-num" aria-hidden="true">{String(index + 1).padStart(2, '0')}</span>
                                    <h3>{item.title}</h3>
                                    <p>{item.text}</p>
                                </article>
                            ))}
                        </div>
                    </div>
                </section>

                <section className="pt-section pt-section--tint pt-section--compact" aria-labelledby="dpat-guide-structure">
                    <div className="pt-container">
                        <div className="pt-section-head">
                            <div>
                                <span className="section-kicker">What is assessed</span>
                                <h2 id="dpat-guide-structure">Three parts, one Final Score</h2>
                                <p>
                                    Compliance Indicators are checked first, because they cover the statutory and financial requirements everything else depends on. Points are then awarded on the Service Delivery Index and the Performance Index, which together total 100 points{latestYear ? ` in the ${latestYear} framework` : ''}.
                                </p>
                            </div>
                            <Link className="pt-link" to={`${RESULTS_PATH}?view=indicators`}>Every sub-indicator and its criteria {ARROW}</Link>
                        </div>
                        {indicatorsState.isLoading ? <Loading label="Loading the assessment framework…" /> : groups.length > 0 ? (
                            <>
                                <PointsBar groups={groups} />
                                <div className="dpat-guide-categories">
                                    {['CI', 'SDI', 'PI'].map((category) => <CategoryCard key={category} category={category} groups={groups} />)}
                                </div>
                            </>
                        ) : <Loading label="The assessment framework is not available right now." />}
                    </div>
                </section>

                <ComplianceSection
                    groups={groups}
                    compliance={thematicState.data?.compliance}
                    scored={scored}
                    year={latestYear}
                    isLoading={indicatorsState.isLoading || scoresState.isLoading}
                />

                <section className="pt-section pt-section--tint pt-section--compact" aria-labelledby="dpat-guide-process">
                    <div className="pt-container dpat-guide-process">
                        <div>
                            <span className="section-kicker">The assessment cycle</span>
                            <h2 id="dpat-guide-process" className="pt-heading">From evidence to Final Outcome</h2>
                            <p className="dpat-guide-lead">Each cycle follows the same stages for every assembly. Only results that have completed every stage are published.</p>
                            <div className="dpat-guide-formula" aria-label="How the Final Score is calculated">
                                <span>Final Score</span>
                                <i>=</i>
                                <span>SDI points{totals.SDI ? <small>of {totals.SDI}</small> : null}</span>
                                <i>+</i>
                                <span>PI points{totals.PI ? <small>of {totals.PI}</small> : null}</span>
                            </div>
                            <p className="dpat-guide-note">Each assembly&apos;s Compliance Indicator result, the number fulfilled out of {totals.CI || 4}, is published with its Final Score.</p>
                        </div>
                        <ol className="dpat-guide-steps">
                            {STEPS.map((step, index) => (
                                <li key={step.title}>
                                    <span aria-hidden="true">{index + 1}</span>
                                    <div>
                                        <h3>{step.title}</h3>
                                        <p>{step.text}</p>
                                    </div>
                                </li>
                            ))}
                        </ol>
                    </div>
                </section>

                <section className="pt-section pt-section--compact" aria-labelledby="dpat-guide-bands">
                    <div className="pt-container">
                        <div className="pt-section-head">
                            <div>
                                <span className="section-kicker">Final Outcome bands</span>
                                <h2 id="dpat-guide-bands">From a score to an outcome</h2>
                                <p>Each Final Score falls into one of five bands. Each band starts at its lower bound, so a Final Score of 40 is Good and 75 is Excellent.</p>
                            </div>
                        </div>
                        {bands.length > 0 && (
                            <div className="dpat-guide-scale pt-card">
                                <div className="dpat-guide-scale__bar" aria-hidden="true">
                                    {bands.map((band) => (
                                        <span key={band.label} style={{ width: `${band.max - band.min}%`, background: band.color }}>{band.max - band.min >= 10 ? band.label : ''}</span>
                                    ))}
                                </div>
                                <div className="dpat-guide-scale__ticks" aria-hidden="true">
                                    {[0, ...bands.map((band) => band.max)].map((tick) => <span key={tick} style={{ left: `${tick}%` }}>{tick}</span>)}
                                </div>
                                <ul className="dpat-guide-bands">
                                    {bands.map((band) => (
                                        <li key={band.label} style={{ '--band': band.color }}>
                                            <strong>{band.label}</strong>
                                            <span>{band.min === 0 ? 'Below' : `${band.min} to`} {band.min === 0 ? band.max : band.max === 100 ? 100 : `below ${band.max}`}</span>
                                            {latestYear && scored.length > 0 && (
                                                <em>{numberFormat.format(band.count)} assemblies · {formatPercent(band.share)} in {latestYear}</em>
                                            )}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        <div className="dpat-guide-chart pt-card">
                            <div className="dpat-guide-chart__head">
                                <div>
                                    <h3>How {latestYear || 'the latest'} Final Scores are distributed</h3>
                                    <p>Number of published assemblies in each five-point Final Score range, coloured by outcome band.</p>
                                </div>
                                {scored.length > 0 && (
                                    <dl className="dpat-guide-stats">
                                        <div><dt>National average</dt><dd>{formatPercent(average)}</dd></div>
                                        <div><dt>Median</dt><dd>{formatPercent(medianScore)}</dd></div>
                                        <div><dt>Published</dt><dd>{numberFormat.format(scored.length)}</dd></div>
                                    </dl>
                                )}
                            </div>
                            {scoresState.isLoading ? <Loading label="Loading Final Scores…" /> : scored.length > 0 ? (
                                <Histogram
                                    bins={bins}
                                    markers={Number.isFinite(average) ? [{ label: `Average ${formatPercent(average)}`, value: average }] : []}
                                    ariaLabel={`Histogram of ${latestYear} DPAT Final Scores`}
                                    renderTooltip={(bin) => (
                                        <>
                                            <strong>Final Score {bin.start}–{bin.end === 100 ? 100 : `${bin.end - 0.1}`}</strong>
                                            <span>Assemblies<b>{numberFormat.format(bin.count)}</b></span>
                                        </>
                                    )}
                                />
                            ) : <Loading label="Final Scores are not available right now." />}
                        </div>
                    </div>
                </section>

                <section className="pt-section pt-section--tint pt-section--compact" aria-labelledby="dpat-guide-relation">
                    <div className="pt-container">
                        <div className="pt-section-head">
                            <div>
                                <span className="section-kicker">Reading the two indices</span>
                                <h2 id="dpat-guide-relation">Service delivery and performance together</h2>
                                <p>Each dot is a published assembly, placed by the share of available points it earned on each index. Assemblies in the shaded area are above the national average on both.</p>
                            </div>
                        </div>
                        <div className="dpat-guide-relation">
                            <div className="dpat-guide-chart pt-card">
                                {scoresState.isLoading ? <Loading label="Loading Final Scores…" /> : scatterPoints.length > 0 ? (
                                    <ScatterPlot
                                        points={scatterPoints}
                                        xLabel="Service Delivery Index (% of points)"
                                        yLabel="Performance Index (% of points)"
                                        xMax={100}
                                        yMax={100}
                                        xRef={avgSdi}
                                        yRef={avgPi}
                                        labelCount={0}
                                        height={440}
                                        ariaLabel={`Scatter plot of ${latestYear} Service Delivery Index against Performance Index for each assembly`}
                                        onSelect={(point) => navigate(districtPath(point.key, latestYear))}
                                        renderTooltip={(point) => (
                                            <>
                                                <strong>{point.label}</strong>
                                                <span>{point.district.regionName}</span>
                                                <span>Final Score<b>{formatPercent(point.district.finalPercent)}</b></span>
                                                <span>Final Outcome<b>{point.district.classification}</b></span>
                                                <span>SDI<b>{formatPercent(point.x)}</b></span>
                                                <span>PI<b>{formatPercent(point.y)}</b></span>
                                            </>
                                        )}
                                    />
                                ) : <Loading label="Final Scores are not available right now." />}
                                <ul className="pc-legend">
                                    {bands.slice().reverse().map((band) => <li key={band.label}><i style={{ background: band.color }} />{band.label}</li>)}
                                </ul>
                            </div>
                            <aside className="dpat-guide-insights">
                                <div className="pt-card">
                                    <span>Average SDI</span>
                                    <strong>{formatPercent(avgSdi)}</strong>
                                    <p>of service delivery points earned</p>
                                </div>
                                <div className="pt-card">
                                    <span>Average PI</span>
                                    <strong>{formatPercent(avgPi)}</strong>
                                    <p>of performance points earned</p>
                                </div>
                                <div className="pt-card">
                                    <span>Above average on both</span>
                                    <strong>{scatterPoints.length ? numberFormat.format(aboveBoth) : '—'}</strong>
                                    <p>{scatterPoints.length ? `of ${numberFormat.format(scatterPoints.length)} published assemblies` : 'published assemblies'}</p>
                                </div>
                                <p className="dpat-guide-note">Select a dot to open that assembly&apos;s scorecard.</p>
                            </aside>
                        </div>
                    </div>
                </section>

                <section className="pt-section pt-section--compact" aria-labelledby="dpat-guide-cycles">
                    <div className="pt-container">
                        <div className="pt-section-head">
                            <div>
                                <span className="section-kicker">Across cycles</span>
                                <h2 id="dpat-guide-cycles">How results have moved between years</h2>
                                <p>The national average and median Final Score, and how assemblies were spread across outcome bands, for every published assessment year.</p>
                            </div>
                        </div>
                        <div className="dpat-guide-cycles">
                            <div className="dpat-guide-chart pt-card">
                                {seriesState.isLoading ? <Loading label="Loading published years…" /> : trend.rows.length > 0 ? (
                                    <LineChart
                                        xValues={trend.years}
                                        yMax={100}
                                        formatY={(value) => formatPercent(value)}
                                        yTickFormat={(value) => `${value}%`}
                                        ariaLabel="Line chart of national DPAT averages by year"
                                        series={[
                                            { key: 'average', label: 'National average Final Score', color: '#16325a', values: trend.rows.map((row) => row.average) },
                                            { key: 'median', label: 'Median Final Score', color: '#c49a3c', dashed: true, values: trend.rows.map((row) => row.median) },
                                        ]}
                                        height={250}
                                    />
                                ) : <Loading label="Published years are not available right now." />}
                                {trend.rows.length > 0 && bands.length > 0 && (
                                    <div className="dpat-guide-mix">
                                        <h3>Final Outcome mix by year</h3>
                                        {trend.rows.slice().reverse().map((row) => (
                                            <div className="dpat-guide-mix__row" key={row.year}>
                                                <span>{row.year}</span>
                                                <div className="dpat-guide-mix__bar" aria-label={`${row.year}: ${bands.map((band) => `${band.label} ${formatPercent(row.bandShares[band.label])}`).join(', ')}`}>
                                                    {bands.map((band) => row.bandShares[band.label] > 0 && (
                                                        <i
                                                            key={band.label}
                                                            style={{ width: `${row.bandShares[band.label]}%`, background: band.color }}
                                                            title={`${band.label}: ${formatPercent(row.bandShares[band.label])}`}
                                                        >
                                                            {row.bandShares[band.label] >= 8 ? `${Math.round(row.bandShares[band.label])}%` : ''}
                                                        </i>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                        <ul className="pc-legend">
                                            {bands.map((band) => <li key={band.label}><i style={{ background: band.color }} />{band.label}</li>)}
                                        </ul>
                                    </div>
                                )}
                            </div>
                            <ul className="dpat-guide-years">
                                {trend.rows.slice().reverse().map((row) => (
                                    <li className="pt-card" key={row.year}>
                                        <header>
                                            <strong>{row.year}</strong>
                                            <Link className="pt-link" to={`${RESULTS_PATH}?year=${row.year}`}>Results {ARROW}</Link>
                                        </header>
                                        <dl>
                                            <div><dt>Average</dt><dd>{formatPercent(row.average)}</dd></div>
                                            <div><dt>Published</dt><dd>{row.assessed != null ? numberFormat.format(row.assessed) : '—'}</dd></div>
                                            <div><dt>Good or better</dt><dd>{formatPercent(row.goodOrBetter)}</dd></div>
                                        </dl>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </section>

                <section className="pt-section pt-section--tint pt-section--compact" aria-labelledby="dpat-guide-reading">
                    <div className="pt-container">
                        <div className="pt-section-head">
                            <div>
                                <span className="section-kicker">Reading the results</span>
                                <h2 id="dpat-guide-reading">Four things to know before comparing</h2>
                            </div>
                        </div>
                        <div className="dpat-guide-reading">
                            {READING.map((item) => (
                                <article className="pt-card" key={item.title}>
                                    <h3>{item.title}</h3>
                                    <p>{item.text}</p>
                                </article>
                            ))}
                        </div>
                    </div>
                </section>

                <section className="pt-section pt-section--compact" aria-labelledby="dpat-guide-faq">
                    <div className="pt-container dpat-guide-faq">
                        <div>
                            <span className="section-kicker">Questions</span>
                            <h2 id="dpat-guide-faq" className="pt-heading">Frequently asked</h2>
                            <p className="dpat-guide-lead">Answers to common questions about how DPAT results are produced and published.</p>
                        </div>
                        <div className="dpat-guide-faq__list">
                            {FAQ.map((item) => (
                                <details key={item.q}>
                                    <summary>{item.q}</summary>
                                    <p>{item.a}</p>
                                </details>
                            ))}
                        </div>
                    </div>
                </section>
            </main>
            <PublicFooter />
        </div>
    )
}

export default DpatAssessmentGuide
