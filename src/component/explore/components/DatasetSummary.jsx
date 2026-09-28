import React from 'react'
import KpiGrid from './KpiGrid'
import PublicState from './PublicState'
import useAapSummary from '../hooks/useAapSummary'

const AapDistribution = ({ title, distribution }) => (
    <article className="dataset-distribution">
        <h3>{title}</h3>
        <ul>{distribution.categories.map((item) => <li key={item.code}><span>{item.label}</span><strong>{item.count.toLocaleString('en-GH')}</strong></li>)}</ul>
        <p>{distribution.unclassified.toLocaleString('en-GH')} unclassified</p>
    </article>
)

const DatasetSummary = ({ dataset, geography, region, year, projectSummary, comparisons, isProjectLoading }) => {
    const { data: aap, isLoading: isAapLoading } = useAapSummary({ enabled: dataset.key === 'aap', geography, regionSlug: region?.slug, year })
    if (dataset.key === 'projects-programmes') return <KpiGrid items={projectSummary.kpis} context={projectSummary.kpiContext} comparisons={comparisons} isLoading={isProjectLoading} />
    if (dataset.key === 'meetings') {
        const meeting = projectSummary.kpis.filter((item) => item.id === 'meetings')
        return <KpiGrid items={meeting} context={projectSummary.kpiContext} isLoading={isProjectLoading} />
    }
    if (dataset.key === 'aap') {
        if (isAapLoading) return <PublicState status="loading" title="Loading Annual Action Plan data" />
        if (!aap) return <PublicState status="unavailable" title="Annual Action Plan data is unavailable" />
        return <div className="dataset-summary"><KpiGrid items={[{ id: 'recorded-activities', label: 'Recorded activities', value: aap.metrics.recordedActivities, status: 'available' }]} context={{ geography: aap.geography.name, year: aap.period.year, source: aap.meta.source, retrievedAt: aap.meta.retrievedAt }} /><div className="dataset-distributions"><AapDistribution title="Approval classification" distribution={aap.distributions.approval} /><AapDistribution title="Activity state" distribution={aap.distributions.activityStates} /><AapDistribution title="Activity type" distribution={aap.distributions.activityTypes} /><AapDistribution title="Sector" distribution={aap.distributions.sectors} /><AapDistribution title="Development dimension" distribution={aap.distributions.developmentDimensions} /></div></div>
    }
    const message = dataset.key === 'igf' ? 'Financial aggregates are awaiting confirmation of the IGF reporting structure.' : 'Programme reporting-year semantics must be confirmed before this dataset can be published by year.'
    return <PublicState status="unavailable" title={`${dataset.label} is not yet available`}>{message}</PublicState>
}

export default DatasetSummary
