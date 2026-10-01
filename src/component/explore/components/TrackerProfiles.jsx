import React, { useState } from 'react'
import PublicState from './PublicState'
import { ChildBars, IgfSourceBars, MetricPicker, Placeholder } from './ExploreDepth'
import { useDeliverySummary, useSchoolProfile } from '../hooks/useScopedResource'
import { formatCedis, formatCedisFull, formatCount, formatShare } from '../services/formatters'
import './ExploreDepth.css'

const childHref = (geography, withYear) => (item) => (geography.level === 'national'
    ? withYear(`/explore/regions/${item.slug}`)
    : withYear(`/explore/regions/${geography.slug}/districts/${item.slug}`))

const Tiles = ({ tiles }) => (
    <div className="xd-tiles">
        {tiles.map((tile) => (
            <article className={`xd-tile xd-tile--${tile.tone || 'projects'}`} key={tile.label}>
                <span>{tile.label}</span>
                <strong>{tile.value}</strong>
                <small>{tile.note}</small>
            </article>
        ))}
    </div>
)

const ShareBars = ({ rows, total, format = formatCount }) => {
    const max = Math.max(0, ...rows.map((row) => row.value))
    return (
        <ol className="xd-sector-bars">
            {rows.map((row) => (
                <li key={row.label}>
                    <span className="xd-sector-bars__name">{row.label}</span>
                    <span className="xd-sector-bars__track" aria-hidden="true"><i className={row.tone || 'is-projects'} style={{ width: `${max ? (row.value / max) * 100 : 0}%` }} /></span>
                    <b>{format(row.value)}</b>
                    <small>{row.share ?? formatShare(row.value, total)}</small>
                </li>
            ))}
        </ol>
    )
}

const IGF_METRICS = [
    { key: 'igfCollected', label: 'IGF collected', get: (metrics) => metrics.igf.collected, format: formatCedis },
    { key: 'igfBudgeted', label: 'IGF budgeted', get: (metrics) => metrics.igf.budgeted, format: formatCedis },
    { key: 'igfReleased', label: 'IGF released', get: (metrics) => metrics.igf.released, format: formatCedis },
    { key: 'igfRecords', label: 'Collection records', get: (metrics) => metrics.igf.records, format: formatCount },
]

export const IgfSummary = ({ geography, region, year, withYear }) => {
    const [metricKey, setMetricKey] = useState(IGF_METRICS[0].key)
    const { data, isLoading } = useDeliverySummary({ geography, regionSlug: region?.slug, year })
    if (isLoading) return <PublicState status="loading" title="Loading Internally Generated Fund data" />
    if (!data) return <PublicState status="unavailable" title="Internally Generated Fund data is unavailable" />
    const { igf, igfSources } = data.metrics
    const collectionRate = igf.budgeted > 0 ? formatShare(igf.collected, igf.budgeted) : null
    const metric = IGF_METRICS.find((item) => item.key === metricKey)

    return (
        <div className="xd-section">
            <Tiles tiles={[
                { label: 'IGF collected', value: formatCedis(igf.collected), note: formatCedisFull(igf.collected), tone: 'igf-collected' },
                { label: 'IGF budgeted', value: formatCedis(igf.budgeted), note: collectionRate ? `${collectionRate} of budget collected` : 'Budget not recorded', tone: 'projects' },
                { label: 'IGF released', value: formatCedis(igf.released), note: `${formatCount(igf.releasedRecords)} capital expenditure records`, tone: 'igf-released' },
                { label: 'Reporting assemblies', value: formatCount(igf.reportingAssemblies), note: `${formatCount(igf.records)} collection records in ${year}`, tone: 'aap' },
            ]} />
            <div className="xd-profile-grid">
                <div className="xd-card">
                    <h4>IGF collected by source</h4>
                    <IgfSourceBars sources={igfSources} total={igf.collected} />
                </div>
                <div className="xd-card">
                    <h4>Collected, budgeted and released</h4>
                    <ShareBars
                        format={formatCedis}
                        rows={[
                            { label: 'Budgeted', value: igf.budgeted, tone: 'is-programmes', share: '' },
                            { label: 'Collected', value: igf.collected, tone: 'is-igf', share: collectionRate || '' },
                            { label: 'Released for capital expenditure', value: igf.released, tone: 'is-projects', share: formatShare(igf.released, igf.collected) },
                        ]}
                    />
                    <p className="xd-note">IGF released comes from the Expenditure Tracker and is reported by fewer assemblies than collections, so compare the two with care.</p>
                </div>
            </div>
            {data.children.length > 0 && (
                <div className="xd-card">
                    <div className="xd-card__head">
                        <h3>{geography.level === 'national' ? 'Regions' : 'Districts'} compared</h3>
                        <MetricPicker value={metricKey} onChange={setMetricKey} options={IGF_METRICS} />
                    </div>
                    <ChildBars items={data.children} metric={metric} hrefFor={childHref(geography, withYear)} limit={16} />
                </div>
            )}
        </div>
    )
}

const SCHOOL_METRICS = [
    { key: 'schools', label: 'Schools registered', get: (child) => child.schools, format: formatCount },
    { key: 'feedingEnrolled', label: 'Schools on School Feeding', get: (child) => child.feedingEnrolled, format: formatCount },
    { key: 'feedingPupils', label: 'School Feeding beneficiaries', get: (child) => child.feedingPupils, format: formatCount },
    { key: 'pupils', label: 'Pupils enrolled', get: (child) => child.pupils, format: formatCount },
    { key: 'teachers', label: 'Teachers', get: (child) => child.teachers, format: formatCount },
]

export const SchoolSummary = ({ geography, region, year, withYear }) => {
    const [metricKey, setMetricKey] = useState(SCHOOL_METRICS[0].key)
    const { data, isLoading } = useSchoolProfile({ geography, regionSlug: region?.slug, year })
    if (isLoading) return <PublicState status="loading" title="Loading School Profile Tracker data" />
    if (!data) return <PublicState status="unavailable" title="School Profile Tracker data is unavailable" />
    const metrics = data.metrics
    const feeding = metrics.feeding
    const beneficiaries = feeding.boys + feeding.girls
    const pupils = metrics.enrolment.male + metrics.enrolment.female
    const metric = SCHOOL_METRICS.find((item) => item.key === metricKey)
    const children = data.children.map((child) => ({ slug: child.slug, name: child.name, metrics: child }))

    return (
        <div className="xd-section">
            <Tiles tiles={[
                { label: 'Schools registered', value: formatCount(metrics.schools), note: `${formatCount(metrics.profiled)} with a profile update by ${year}` },
                { label: 'On School Feeding Programme', value: formatCount(feeding.enrolledSchools), note: feeding.answered ? `${formatShare(feeding.enrolledSchools, feeding.answered)} of schools that answered` : 'Not yet reported', tone: 'completed' },
                { label: 'Feeding beneficiaries', value: formatCount(beneficiaries), note: `${formatCount(feeding.reportingSchools)} schools reported in ${year}`, tone: 'programmes' },
                { label: 'Pupils enrolled', value: formatCount(pupils), note: `${formatCount(metrics.enrolment.reportingSchools)} schools reporting`, tone: 'aap' },
                { label: 'Teachers', value: formatCount(metrics.teachers), note: `${formatCount(metrics.classrooms)} classrooms`, tone: 'meetings' },
                { label: 'Scholarships', value: formatCount(metrics.scholarships), note: `${formatCount(metrics.enrolment.pwd)} pupils with disabilities`, tone: 'igf-collected' },
            ]} />

            <div className="xd-profile-grid">
                <div className="xd-card">
                    <h4>School Feeding Programme</h4>
                    <ShareBars
                        total={beneficiaries}
                        rows={[
                            { label: 'Boys fed', value: feeding.boys, tone: 'is-projects' },
                            { label: 'Girls fed', value: feeding.girls, tone: 'is-programmes' },
                        ]}
                    />
                    <div className="xd-gap" />
                    <ShareBars
                        total={feeding.answered}
                        rows={[
                            { label: 'Schools enrolled', value: feeding.enrolledSchools, tone: 'is-igf' },
                            { label: 'Schools not enrolled', value: Math.max(0, feeding.answered - feeding.enrolledSchools), tone: 'is-projects' },
                        ]}
                    />
                    <p className="xd-note">Beneficiaries come from each school's latest feeding report in {year}; enrolment status comes from its latest profile update.</p>
                </div>
                <div className="xd-card">
                    <h4>Facilities</h4>
                    <ShareBars
                        rows={metrics.facilities.map((facility) => ({
                            label: facility.label,
                            value: facility.yes,
                            share: facility.answered ? formatShare(facility.yes, facility.answered) : '—',
                            tone: facility.key === 'underTrees' ? 'is-programmes' : 'is-igf',
                        }))}
                    />
                    <p className="xd-note">Percentages are of schools that answered each question. {formatCount(metrics.girlsChangingRooms)} schools have changing rooms for girls.</p>
                </div>
                <div className="xd-card">
                    <h4>Ownership and level</h4>
                    <ShareBars total={metrics.schools} rows={metrics.types.map((item) => ({ label: item.label, value: item.count }))} />
                    <div className="xd-gap" />
                    <ShareBars total={metrics.schools} rows={metrics.levels.map((item) => ({ label: item.label, value: item.count, tone: 'is-programmes' }))} />
                    <p className="xd-note">{formatCount(metrics.faithBased)} faith-based schools.</p>
                </div>
                <div className="xd-card">
                    <h4>Categories offered and enrolment</h4>
                    <ShareBars total={metrics.schools} rows={metrics.categories.map((item) => ({ label: item.label, value: item.count, tone: 'is-igf' }))} />
                    <div className="xd-gap" />
                    <ShareBars
                        total={pupils}
                        rows={[
                            { label: 'Boys enrolled', value: metrics.enrolment.male, tone: 'is-projects' },
                            { label: 'Girls enrolled', value: metrics.enrolment.female, tone: 'is-programmes' },
                        ]}
                    />
                </div>
            </div>

            {children.length > 0 ? (
                <div className="xd-card">
                    <div className="xd-card__head">
                        <h3>{geography.level === 'national' ? 'Regions' : 'Districts'} compared</h3>
                        <MetricPicker value={metricKey} onChange={setMetricKey} options={SCHOOL_METRICS} />
                    </div>
                    <ChildBars items={children} metric={metric} hrefFor={childHref(geography, withYear)} limit={16} />
                </div>
            ) : geography.level === 'district' && <Placeholder>Schools are registered at district level, the most detailed level with published data.</Placeholder>}
        </div>
    )
}
