import React, { useMemo } from 'react'
import { PUBLIC_INDICATORS, getSharePercent } from '../services/regionalInsights'

const numberFormatter = new Intl.NumberFormat('en-GH')
const percentFormatter = new Intl.NumberFormat('en-GH', { maximumFractionDigits: 1 })

const RegionalActivityRanking = ({
    regions = [],
    nationalSummary,
    isLoading,
    year,
    indicatorKey,
    onIndicatorChange,
}) => {
    const indicator = PUBLIC_INDICATORS.find((item) => item.key === indicatorKey) || PUBLIC_INDICATORS[0]
    const rankedRegions = useMemo(() => (
        regions
            .filter((region) => Number.isInteger(region.kpis?.[indicator.key]))
            .slice()
            .sort((first, second) => (
                second.kpis[indicator.key] - first.kpis[indicator.key]
                || first.name.localeCompare(second.name)
            ))
    ), [indicator.key, regions])
    const maximum = rankedRegions[0]?.kpis?.[indicator.key] || 0
    const nationalTotal = nationalSummary?.kpis?.[indicator.key]

    return (
        <article className="regional-activity-ranking" aria-labelledby="regional-activity-ranking-title">
            <div className="regional-activity-ranking__heading">
                <div>
                    <span className="section-kicker">Regional comparison</span>
                    <h3 id="regional-activity-ranking-title">Regional Activity Ranking</h3>
                    <p>Compare reported activity across Ghana's regions in {year || 'the selected year'}.</p>
                </div>
                <div className="regional-activity-ranking__indicators" aria-label="Regional ranking indicator">
                    {PUBLIC_INDICATORS.map((item) => (
                        <button
                            type="button"
                            className={item.key === indicator.key ? 'is-active' : undefined}
                            aria-pressed={item.key === indicator.key}
                            key={item.key}
                            onClick={() => onIndicatorChange(item.key)}
                        >
                            {item.label}
                        </button>
                    ))}
                </div>
            </div>

            {rankedRegions.length > 0 ? (
                <ol className="regional-activity-ranking__list">
                    {rankedRegions.map((region, index) => {
                        const value = region.kpis[indicator.key]
                        const share = getSharePercent(value, nationalTotal)
                        return (
                            <li key={region.slug}>
                                <span className="regional-activity-ranking__position">{String(index + 1).padStart(2, '0')}</span>
                                <strong>{region.name}</strong>
                                <span className="regional-activity-ranking__track" aria-hidden="true">
                                    <span
                                        className={value === 0 ? 'is-zero' : undefined}
                                        style={{ width: `${maximum > 0 ? (value / maximum) * 100 : 0}%` }}
                                    />
                                </span>
                                <b>{numberFormatter.format(value)}</b>
                                <small>{share === null ? 'Share unavailable' : `${percentFormatter.format(share)}% of Ghana`}</small>
                            </li>
                        )
                    })}
                </ol>
            ) : isLoading ? (
                <p className="regional-activity-ranking__state" aria-live="polite">Loading regional activity</p>
            ) : (
                <p className="regional-activity-ranking__state">Regional activity unavailable</p>
            )}
        </article>
    )
}

export default RegionalActivityRanking
