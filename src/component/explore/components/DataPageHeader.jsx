import React from 'react'
import ExploreBreadcrumbs from './ExploreBreadcrumbs'
import PublicYearSelector from './PublicYearSelector'
import PublicDatasetSelector from './PublicDatasetSelector'

const formatRetrievedAt = (value) => {
    if (!value) return null
    const date = new Date(value)
    if (Number.isNaN(date.getTime())) return null
    return new Intl.DateTimeFormat('en-GH', { dateStyle: 'medium', timeStyle: 'short' }).format(date)
}

const DataPageHeader = ({
    actions,
    breadcrumbs,
    description,
    eyebrow,
    publicDataset,
    publicYear,
    retrievedAt,
    source,
    title,
}) => {
    const formattedRetrievedAt = formatRetrievedAt(retrievedAt)

    return (
        <header className="explore-data-header">
            <ExploreBreadcrumbs items={breadcrumbs} />
            <div className="explore-data-header__grid">
                <div className="explore-data-header__content">
                    <span className="explore-data-header__eyebrow">{eyebrow}</span>
                    <h1>{title}</h1>
                    <p>{description}</p>
                    {actions && <div className="explore-data-header__actions">{actions}</div>}
                </div>
                <div className="explore-data-header__context">
                    {publicDataset && <PublicDatasetSelector value={publicDataset.key} onChange={publicDataset.setDataset} />}
                    <PublicYearSelector
                        year={publicYear.year}
                        years={publicYear.years}
                        isLoading={publicYear.isLoading}
                        onChange={publicYear.setYear}
                    />
                    <div aria-label="Data source context">
                        <span>{source ? `Source: ${source}` : 'Public aggregate data'}</span>
                        {formattedRetrievedAt && <span>Retrieved {formattedRetrievedAt}</span>}
                    </div>
                </div>
            </div>
        </header>
    )
}

export default DataPageHeader
