import React, { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useDpatScores, useDpatYears } from '../dpat/hooks/useDpat'
import { classificationColor, districtPath, formatPercent, scoredDistricts, shortDistrictName } from '../dpat/dpatFormat'
import { PublicMotionItem, PublicMotionSection } from '../shared/PublicMotion'
import './HomeDpatHighlight.css'

const HomeDpatHighlight = () => {
    const years = useDpatYears()
    const year = years.data?.latestYear
    const scale = years.data?.classificationScale
    const scores = useDpatScores(year)

    const summary = useMemo(() => {
        if (!scores.data || !scale) return null
        const districts = scoredDistricts(scores.data)
            .sort((a, b) => (a.nationalRank - b.nationalRank) || a.districtName.localeCompare(b.districtName))
        if (districts.length === 0) return null
        const finals = districts.map((district) => district.finalPercent).filter(Number.isFinite).sort((a, b) => a - b)
        const middle = Math.floor(finals.length / 2)
        return {
            districts,
            median: finals.length % 2 ? finals[middle] : (finals[middle - 1] + finals[middle]) / 2,
            highest: finals[finals.length - 1],
            lowest: finals[0],
            top: districts.slice(0, 5),
            bands: scale.map((band) => ({
                label: band.label,
                color: classificationColor(band.label, scale),
                count: districts.filter((district) => district.classification === band.label).length,
            })),
        }
    }, [scores.data, scale])

    if (years.error || scores.error) return null

    const nationalAverage = scores.data?.nationalAverage
    const nationalBand = scale && Number.isFinite(nationalAverage)
        ? (scale.find((band) => nationalAverage >= band.min) || scale[scale.length - 1])
        : null

    return (
        <PublicMotionSection className="pt-section home-dpat" aria-labelledby="home-dpat-title">
            <div className="pt-container">
                <PublicMotionItem className="pt-section-head">
                    <div>
                        <span className="section-kicker">District performance</span>
                        <h2 id="home-dpat-title">How districts performed{year ? ` in ${year}` : ''}</h2>
                        <p>Official final results from the District Performance Assessment Tool (DPAT), published for every assessed district.</p>
                    </div>
                    <Link className="pt-button pt-button--secondary" to="/dpat/performance-analysis">Full DPAT analysis</Link>
                </PublicMotionItem>

                <PublicMotionItem className="home-dpat__grid">
                    <article className="pt-card home-dpat__headline">
                        <span className="home-dpat__label">National average final score</span>
                        <strong className="home-dpat__value">{summary ? formatPercent(nationalAverage) : '…'}</strong>
                        {nationalBand && (
                            <span className="home-dpat__pill" style={{ '--band': classificationColor(nationalBand.label, scale) }}>{nationalBand.label}</span>
                        )}
                        <p>
                            {summary
                                ? `Mean of ${summary.districts.length} published district final scores.`
                                : 'Loading the latest published results.'}
                        </p>
                        {summary && (
                            <>
                                <dl className="home-dpat__facts">
                                    <div><dt>Median</dt><dd>{formatPercent(summary.median)}</dd></div>
                                    <div><dt>Highest</dt><dd>{formatPercent(summary.highest)}</dd></div>
                                    <div><dt>Lowest</dt><dd>{formatPercent(summary.lowest)}</dd></div>
                                </dl>
                                <span className="home-dpat__bar-label">Districts by final outcome</span>
                                <div className="home-dpat__bar" role="img" aria-label={summary.bands.map((band) => `${band.label} ${band.count}`).join(', ')}>
                                    {summary.bands.filter((band) => band.count > 0).map((band) => (
                                        <i key={band.label} style={{ flexGrow: band.count, background: band.color }} />
                                    ))}
                                </div>
                                <ul className="home-dpat__bands">
                                    {summary.bands.map((band) => (
                                        <li key={band.label}>
                                            <i style={{ background: band.color }} aria-hidden="true" />
                                            <span>{band.label}</span>
                                            <b>{band.count}</b>
                                        </li>
                                    ))}
                                </ul>
                            </>
                        )}
                    </article>

                    <article className="pt-card home-dpat__leaders">
                        <div className="home-dpat__leaders-head">
                            <h3>Top performing districts</h3>
                            <span>Final score</span>
                        </div>
                        {summary ? (
                            <ol>
                                {summary.top.map((district) => (
                                    <li key={district.districtId}>
                                        <span className={`home-dpat__rank${district.nationalRank <= 3 ? ` is-medal-${district.nationalRank}` : ''}`}>{district.nationalRank}</span>
                                        <span className="home-dpat__district">
                                            <Link to={districtPath(district.districtId, year)}>{shortDistrictName(district.districtName)}</Link>
                                            <small>{district.regionName} Region</small>
                                        </span>
                                        <span className="home-dpat__track" aria-hidden="true">
                                            <i style={{ width: `${district.finalPercent}%`, background: classificationColor(district.classification, scale) }} />
                                        </span>
                                        <b>{formatPercent(district.finalPercent)}</b>
                                    </li>
                                ))}
                            </ol>
                        ) : (
                            <div className="home-dpat__loading" aria-label="Loading DPAT results">
                                {Array.from({ length: 5 }, (_, index) => <span key={index} />)}
                            </div>
                        )}
                        <Link className="pt-link" to="/dpat/performance-analysis?view=rankings">
                            See all district rankings
                            <svg viewBox="0 0 16 16" aria-hidden="true"><path d="M3 8h10M9 4l4 4-4 4" /></svg>
                        </Link>
                    </article>
                </PublicMotionItem>
            </div>
        </PublicMotionSection>
    )
}

export default HomeDpatHighlight
