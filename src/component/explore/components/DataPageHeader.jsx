import React from 'react'
import ExploreBreadcrumbs from './ExploreBreadcrumbs'
import PublicYearSelector from './PublicYearSelector'
import PublicDatasetSelector from './PublicDatasetSelector'
import HeroBackdrop from '../../shared/HeroBackdrop'

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
        <header className="explore-data-header pt-page-hero">
            <HeroBackdrop />
            <div className="pt-container">
                <ExploreBreadcrumbs items={breadcrumbs} />
                <div className="explore-data-header__grid">
                    <div className="explore-data-header__content">
                        <span className="pt-eyebrow explore-data-header__eyebrow"><i aria-hidden="true" />{eyebrow}</span>
                        <h1>{title}</h1>
                        <p className="pt-page-hero__lead">{description}</p>
                        {actions && <div className="pt-page-hero__actions explore-data-header__actions">{actions}</div>}
                    </div>
                    <div className="explore-data-header__context" role="group" aria-label="Data filters">
                        <span className="explore-data-header__context-title">Data filters</span>
                        {publicDataset && <PublicDatasetSelector value={publicDataset.key} onChange={publicDataset.setDataset} />}
                        <PublicYearSelector
                            year={publicYear.year}
                            years={publicYear.years}
                            isLoading={publicYear.isLoading}
                            onChange={publicYear.setYear}
                        />
                        <div className="explore-data-header__source" aria-label="Data source context">
                            <span>{source ? `Source: ${source}` : 'Public aggregate data'}</span>
                            {formattedRetrievedAt && <span>Retrieved {formattedRetrievedAt}</span>}
                        </div>
                    </div>
                </div>
            </div>
        </header>
    )
}

export default DataPageHeader
