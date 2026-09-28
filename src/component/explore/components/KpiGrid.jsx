import React from 'react'

const numberFormatter = new Intl.NumberFormat('en-GH')

const formatRetrievedAt = (value) => {
    if (!value) return null
    const date = new Date(value)
    if (Number.isNaN(date.getTime())) return null
    return new Intl.DateTimeFormat('en-GH', { dateStyle: 'medium', timeStyle: 'short' }).format(date)
}

const percentFormatter = new Intl.NumberFormat('en-GH', { maximumFractionDigits: 1 })

const KpiGrid = ({ items = [], context, comparisons, isLoading = false }) => {
    const retrievedAt = formatRetrievedAt(context?.retrievedAt)

    return (
        <div className="explore-kpi-summary">
            {context && (
                <div className="explore-kpi-summary__context" aria-label="Indicator context">
                    <strong>{context.geography}</strong>
                    <span>{context.year}</span>
                    <span>Source: {context.source}</span>
                    {retrievedAt && <span>Retrieved {retrievedAt}</span>}
                </div>
            )}
            <div className={`explore-kpi-band explore-kpi-band--${Math.min(items.length, 4)}`} aria-label="Public KPI summary">
                {items.map((item) => (
                    <article className="explore-kpi-item" key={item.id || item.label}>
                        {item.status === 'available' ? (
                            <div className="explore-kpi-item__value">
                                {numberFormatter.format(item.value)}{item.unit && <small>{item.unit}</small>}
                            </div>
                        ) : (
                            <div className="explore-kpi-item__unavailable">{isLoading ? 'Loading' : 'Unavailable'}</div>
                        )}
                        <h3>{item.label}</h3>
                        {item.context && <p>{item.context}</p>}
                        {item.status === 'available' && Number.isFinite(comparisons?.[item.id]?.sharePercent) && (
                            <div className="explore-kpi-item__comparison">
                                <div className="explore-kpi-item__track" aria-hidden="true">
                                    <span style={{ width: `${Math.min(comparisons[item.id].sharePercent, 100)}%` }} />
                                </div>
                                <p>
                                    <strong>{percentFormatter.format(comparisons[item.id].sharePercent)}%</strong> of Ghana total
                                </p>
                                {comparisons[item.id].rank && (
                                    <small>
                                        Rank {comparisons[item.id].rank.position} of {comparisons[item.id].rank.total} regions
                                    </small>
                                )}
                            </div>
                        )}
                    </article>
                ))}
            </div>
        </div>
    )
}

export default KpiGrid
