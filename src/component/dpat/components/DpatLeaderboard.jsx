import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { CompositionBar } from './DpatCharts'
import { DPAT_COLORS, classificationColor, districtPath, formatDelta, formatPercent, shortDistrictName } from '../dpatFormat'

const deltaTone = (value) => (!Number.isFinite(value) || Math.abs(value) < 0.05 ? 'is-flat' : value > 0 ? 'is-up' : 'is-down')

const DpatLeaderboard = ({ scored, movers, nationalAverage, scale, year }) => {
    const tabs = [
        { key: 'top', label: 'Top 10', rows: scored.slice(0, 10) },
        { key: 'bottom', label: 'Bottom 10', rows: scored.slice(-10).reverse() },
        ...(movers ? [
            { key: 'improved', label: 'Most improved', rows: movers.improved },
            { key: 'declined', label: 'Biggest declines', rows: movers.declined },
        ] : []),
    ]
    const [tabKey, setTabKey] = useState('top')
    const tab = tabs.find((item) => item.key === tabKey) || tabs[0]
    const showChange = tab.key === 'improved' || tab.key === 'declined'

    return (
        <div className="dpat-card dpat-leaderboard">
            <div className="dpat-leaderboard__head">
                <div className="dpat-segmented dpat-segmented--light" role="tablist" aria-label="Leaderboard views">
                    {tabs.map((item) => (
                        <button
                            type="button"
                            role="tab"
                            key={item.key}
                            aria-selected={item.key === tab.key}
                            className={item.key === tab.key ? 'is-active' : undefined}
                            onClick={() => setTabKey(item.key)}
                        >
                            {item.label}
                        </button>
                    ))}
                </div>
                <ul className="dpat-inline-legend" aria-hidden="true">
                    <li><i style={{ background: DPAT_COLORS.navy }} />SDI points</li>
                    <li><i style={{ background: DPAT_COLORS.brass }} />PI points</li>
                    <li><i className="is-marker" />National average</li>
                </ul>
            </div>

            <div role="tabpanel" aria-label={tab.label}>
                <div className="dpat-lb-row dpat-lb-row--head" aria-hidden="true">
                    <span>Rank</span>
                    <span>District</span>
                    <span>Score composition</span>
                    <span className="is-numeric">CI met</span>
                    <span className="is-numeric">Final score</span>
                    <span className="is-numeric">{showChange ? `Change since ${movers?.previousYear}` : 'vs national'}</span>
                    <span>Outcome</span>
                </div>
                <ol className="dpat-lb-list">
                    {tab.rows.map((district) => {
                        const medal = tab.key === 'top' && district.nationalRank <= 3 ? ` is-medal is-medal-${district.nationalRank}` : ''
                        const delta = showChange ? district.change : district.finalPercent - nationalAverage
                        const color = classificationColor(district.classification, scale)
                        return (
                            <li className="dpat-lb-row" key={district.districtId}>
                                <span className={`dpat-lb-rank${medal}`}>{district.nationalRank ?? '—'}</span>
                                <span className="dpat-lb-name">
                                    <Link to={districtPath(district.districtId, year)}>{shortDistrictName(district.districtName)}</Link>
                                    <small>{district.regionName}{district.regionalRank ? ` · #${district.regionalRank} in region` : ''}</small>
                                </span>
                                <span className="dpat-lb-bar">
                                    <CompositionBar sdi={district.sdiFinal} pi={district.piFinal} max={district.maxScore || 100} marker={nationalAverage} />
                                    <small>SDI {district.sdiFinal}/{district.sdiMax} · PI {district.piFinal}/{district.piMax}</small>
                                </span>
                                <span className="dpat-lb-ci is-numeric">{district.ciFulfilled}<small>/{district.ciTotal}</small></span>
                                <b className="dpat-lb-score is-numeric">{formatPercent(district.finalPercent)}</b>
                                <span className={`dpat-lb-delta is-numeric ${deltaTone(delta)}`}>
                                    {formatDelta(delta)}
                                    {showChange && <small>from {formatPercent(district.previousPercent)}</small>}
                                </span>
                                <span><span className="dpat-pill" style={{ '--pill-color': color }}>{district.classification}</span></span>
                            </li>
                        )
                    })}
                </ol>
                {tab.rows.length === 0 && <p className="dpat-empty">No comparable districts for this view.</p>}
            </div>
        </div>
    )
}

export default DpatLeaderboard
