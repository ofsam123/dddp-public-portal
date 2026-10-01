import React from 'react'
import { Link, useParams } from 'react-router-dom'
import NavBar from '../header/NavBar'
import PublicFooter from '../footer/PublicFooter'
import DataPageHeader from './components/DataPageHeader'
import GeographyBrowser from './components/GeographyBrowser'
import DatasetSummary from './components/DatasetSummary'
import PublicState from './components/PublicState'
import usePublicDataset from './hooks/usePublicDataset'
import usePublicGeography from './hooks/usePublicGeography'
import usePublicSummary from './hooks/usePublicSummary'
import usePublicYear from './hooks/usePublicYear'
import useProjectProgrammeView from './hooks/useProjectProgrammeView'
import useRegionalSummaries from './hooks/useRegionalSummaries'
import useNationalTrend from './hooks/useNationalTrend'
import { useDeliverySeries } from './hooks/useScopedResource'
import { ExploreNext, ExploreRegionalPlots, ExploreTrends } from './components/ExploreInsights'
import { DrillDownExplorer, GeographyDepth } from './components/ExploreDepth'
import {
    getDistrictBySlug,
    getDistricts,
    getNationalGeography,
    getPublicSummary,
    getRegionBySlug,
    getRegions,
} from './services/publicDataService'
import { getRegionComparisons } from './services/regionalInsights'
import './Explore.css'

const geographyLabel = {
    national: 'National overview',
    region: 'Region overview',
    district: 'District / MMDA overview',
}

const PageShell = ({ children }) => (
    <>
        <NavBar />
        <main className="explore-page">{children}</main>
        <PublicFooter />
    </>
)

const buildBreadcrumbs = ({ region, district, withYear }) => {
    const items = [
        { label: 'Home', href: withYear('/') },
        { label: 'Explore Data', href: withYear('/explore') },
        { label: 'Ghana', href: withYear('/explore/ghana') },
    ]

    if (region) items.push({ label: region.name, href: withYear(`/explore/regions/${region.slug}`) })
    if (district) items.push({ label: district.name })

    return items
}

const GeographyTemplate = ({ geography, geographyData, region, district, districts, publicDataset, publicYear }) => {
    const projectProgrammeView = useProjectProgrammeView()
    const { summaryData, isLoading } = usePublicSummary({
        geography: ['projects-programmes', 'meetings'].includes(publicDataset.key) ? geography : null,
        regionSlug: region?.slug,
        year: publicYear.year,
    })
    const { regionalSummaries, nationalSummary } = useRegionalSummaries({
        enabled: publicDataset.key === 'projects-programmes' && geography.level === 'region',
        year: publicYear.year,
    })
    const summary = getPublicSummary(geography, summaryData)
    const comparisons = geography.level === 'region' && summaryData
        ? getRegionComparisons({
            regionSlug: geography.slug,
            regions: regionalSummaries,
            nationalSummary,
        })
        : null
    const hasBackActions = Boolean(region || district)

    return (
        <>
            <DataPageHeader
                breadcrumbs={buildBreadcrumbs({ region, district, withYear: publicYear.withYear })}
                eyebrow={geographyLabel[geography.level]}
                title={geography.name}
                description={
                    geography.level === 'national'
                        ? 'Ghana-wide totals for the selected year, with every region ready to compare and explore.'
                        : geography.level === 'region'
                            ? `Recorded development activity for ${geography.name}, how it compares with other regions, and every district within it.`
                            : `Recorded development activity for ${geography.name} in ${region?.name || 'its region'}, for the selected tracker and year.`
                }
                actions={hasBackActions ? (
                    <>
                        {region && <Link className="pt-button pt-button--secondary" to={publicYear.withYear('/explore/ghana')}>Back to Ghana</Link>}
                        {district && <Link className="pt-button pt-button--secondary" to={publicYear.withYear(`/explore/regions/${region.slug}`)}>Back to {region.name}</Link>}
                    </>
                ) : null}
                publicDataset={publicDataset}
                publicYear={publicYear}
                source={summaryData?.meta.source}
                retrievedAt={summaryData?.meta.retrievedAt}
            />

            <section className="explore-section">
                <div className="explore-section__heading">
                    <span className="section-kicker">Key indicators</span>
                    <h2>{geography.name} at a glance</h2>
                    <p>{publicDataset.key === 'projects-programmes' ? 'Projects and programmes whose expected implementation period overlaps the selected year.' : publicDataset.dataset.label + ' for this geography and selected year.'}</p>
                </div>
                <DatasetSummary dataset={publicDataset.dataset} geography={geography} region={region} year={publicYear.year} projectSummary={summary} comparisons={comparisons} isProjectLoading={isLoading} withYear={publicYear.withYear} />
            </section>

            <GeographyDepth geography={geography} region={region} year={publicYear.year} withYear={publicYear.withYear} />

            {geography.level === 'national' && (
                <GeographyBrowser
                    title="Compare Ghana's regions"
                    description="Hover the map or the region index to compare, then select a region to see its districts."
                    regions={getRegions(geographyData)}
                    year={publicYear.year}
                    withYear={publicYear.withYear}
                    trackerKey={publicDataset.key}
                    projectProgrammeView={projectProgrammeView.view}
                    onProjectProgrammeViewChange={projectProgrammeView.setView}
                />
            )}

            {geography.level === 'region' && (
                <GeographyBrowser
                    title={`Districts in ${geography.name}`}
                    description="Open a District / MMDA profile for its local indicators."
                    activeRegion={geography}
                    districts={districts}
                    year={publicYear.year}
                    withYear={publicYear.withYear}
                    trackerKey={publicDataset.key}
                    projectProgrammeView={projectProgrammeView.view}
                    onProjectProgrammeViewChange={projectProgrammeView.setView}
                />
            )}

            {geography.level === 'district' && (
                <DistrictNextSteps district={district} region={region} districts={districts} withYear={publicYear.withYear} />
            )}
        </>
    )
}

const ARROW = <svg viewBox="0 0 16 16" aria-hidden="true"><path d="M3 8h10M9 4l4 4-4 4" /></svg>
const SIBLING_LIMIT = 8

const DistrictNextSteps = ({ district, region, districts = [], withYear }) => {
    const siblings = [...districts]
        .filter((item) => item.slug !== district.slug)
        .sort((a, b) => a.name.localeCompare(b.name))
    const links = [
        {
            label: `${region.name} overview`,
            text: `Compare ${region.name} with other regions and browse all its districts.`,
            href: withYear(`/explore/regions/${region.slug}`),
        },
        {
            label: "Compare Ghana's regions",
            text: 'See where recorded activity is concentrated across the country.',
            href: withYear('/explore/ghana'),
        },
        {
            label: 'District performance (DPAT)',
            text: 'Official final DPAT scores, rankings and district scorecards.',
            href: '/dpat/performance-analysis',
        },
    ]

    return (
        <section className="explore-section district-next" aria-labelledby="district-next-title">
            <div className="explore-section__heading">
                <span className="section-kicker">Keep exploring</span>
                <h2 id="district-next-title">More around {district.name}</h2>
            </div>
            <div className="district-next__grid">
                <div className="district-next__links">
                    {links.map((link) => (
                        <Link className="district-next__link" to={link.href} key={link.label}>
                            <strong>{link.label}</strong>
                            <span>{link.text}</span>
                            <i>{ARROW}</i>
                        </Link>
                    ))}
                </div>
                {siblings.length > 0 && (
                    <nav className="district-next__siblings" aria-label={`Other districts in ${region.name}`}>
                        <h3>Other districts in {region.name}</h3>
                        <ul>
                            {siblings.slice(0, SIBLING_LIMIT).map((item) => (
                                <li key={item.id}>
                                    <Link to={withYear(`/explore/regions/${region.slug}/districts/${item.slug}`)}>{item.name}</Link>
                                </li>
                            ))}
                        </ul>
                        {siblings.length > SIBLING_LIMIT && (
                            <Link className="pt-link" to={withYear(`/explore/regions/${region.slug}`)}>
                                View all {districts.length} districts {ARROW}
                            </Link>
                        )}
                    </nav>
                )}
            </div>
        </section>
    )
}

export const ExploreLanding = () => {
    const { geographyData } = usePublicGeography()
    const publicYear = usePublicYear()
    const publicDataset = usePublicDataset()
    const projectProgrammeView = useProjectProgrammeView()
    const trend = useNationalTrend({ year: publicYear.year, years: publicYear.years })
    const deliverySeries = useDeliverySeries({ years: trend.years })
    const regional = useRegionalSummaries({ year: publicYear.year })

    return (
        <PageShell>
            <DataPageHeader
                breadcrumbs={[{ label: 'Home', href: publicYear.withYear('/') }, { label: 'Explore Data' }]}
                eyebrow="Explore data"
                title="Explore development data by place"
                description="Start with the national picture, compare Ghana's regions, then open any District / MMDA for local activity."
                actions={(
                    <>
                        <Link className="pt-button pt-button--primary" to={publicYear.withYear('/explore/ghana')}>
                            Start with Ghana
                            <svg viewBox="0 0 16 16" aria-hidden="true"><path d="M3 8h10M9 4l4 4-4 4" /></svg>
                        </Link>
                        <Link className="pt-button pt-button--secondary" to="/dpat/performance-analysis">District performance (DPAT)</Link>
                    </>
                )}
                publicDataset={publicDataset}
                publicYear={publicYear}
                source={publicYear.availability?.source}
                retrievedAt={publicYear.availability?.retrievedAt}
            />
            <ExploreTrends year={publicYear.year} trend={trend} delivery={deliverySeries} />
            <GeographyBrowser
                title="Choose where to start"
                description="Hover a region to preview its activity, or select it to go deeper."
                regions={getRegions(geographyData)}
                year={publicYear.year}
                withYear={publicYear.withYear}
                trackerKey={publicDataset.key}
                projectProgrammeView={projectProgrammeView.view}
                onProjectProgrammeViewChange={projectProgrammeView.setView}
            />
            <DrillDownExplorer year={publicYear.year} geographyData={geographyData} withYear={publicYear.withYear} />
            <ExploreRegionalPlots year={publicYear.year} regional={regional} trend={trend} withYear={publicYear.withYear} />
            <ExploreNext withYear={publicYear.withYear} />
        </PageShell>
    )
}

export const GhanaOverview = () => {
    const { geographyData } = usePublicGeography()
    const publicYear = usePublicYear()
    const publicDataset = usePublicDataset()

    return (
        <PageShell>
            <GeographyTemplate geography={getNationalGeography()} geographyData={geographyData} publicDataset={publicDataset} publicYear={publicYear} />
        </PageShell>
    )
}

export const RegionPage = () => {
    const { regionSlug } = useParams()
    const { geographyData } = usePublicGeography()
    const publicYear = usePublicYear()
    const publicDataset = usePublicDataset()
    const region = getRegionBySlug(regionSlug, geographyData)

    if (!region) {
        return (
            <PageShell>
                <DataPageHeader
                    breadcrumbs={[
                        { label: 'Home', href: publicYear.withYear('/') },
                        { label: 'Explore Data', href: publicYear.withYear('/explore') },
                        { label: 'Region not found' },
                    ]}
                    eyebrow="Region not found"
                    title="We could not find that region"
                    description="The link may be outdated, or that region may not be available here yet."
                    actions={<Link className="pt-button pt-button--primary" to={publicYear.withYear('/explore/ghana')}>Browse Ghana regions</Link>}
                    publicDataset={publicDataset}
                publicYear={publicYear}
                />
            </PageShell>
        )
    }

    return (
        <PageShell>
            <GeographyTemplate
                geography={region}
                geographyData={geographyData}
                region={region}
                districts={getDistricts(region.id, geographyData)}
                publicDataset={publicDataset}
                publicYear={publicYear}
            />
        </PageShell>
    )
}

export const DistrictPage = () => {
    const { regionSlug, districtSlug } = useParams()
    const { geographyData, isLoading } = usePublicGeography()
    const publicYear = usePublicYear()
    const publicDataset = usePublicDataset()
    const region = getRegionBySlug(regionSlug, geographyData)
    const district = region ? getDistrictBySlug(region.id, districtSlug, geographyData) : null

    if (isLoading && region && !district) {
        return (
            <PageShell>
                <DataPageHeader
                    breadcrumbs={[
                        { label: 'Home', href: publicYear.withYear('/') },
                        { label: 'Explore Data', href: publicYear.withYear('/explore') },
                        { label: 'Loading district' },
                    ]}
                    eyebrow="District / MMDA overview"
                    title="Loading district information"
                    description="Preparing the selected public geography and data context."
                    publicDataset={publicDataset}
                publicYear={publicYear}
                />
                <PublicState status="loading" title="Loading district information" />
            </PageShell>
        )
    }

    if (!region || !district) {
        return (
            <PageShell>
                <DataPageHeader
                    breadcrumbs={[
                        { label: 'Home', href: publicYear.withYear('/') },
                        { label: 'Explore Data', href: publicYear.withYear('/explore') },
                        { label: 'District not found' },
                    ]}
                    eyebrow="District not found"
                    title="We could not find that District / MMDA"
                    description="The link may be outdated, or that district/MMDA may not be available here yet."
                    actions={<Link className="pt-button pt-button--primary" to={publicYear.withYear('/explore/ghana')}>Browse Ghana regions</Link>}
                    publicDataset={publicDataset}
                publicYear={publicYear}
                />
            </PageShell>
        )
    }

    return (
        <PageShell>
            <GeographyTemplate
                geography={district}
                geographyData={geographyData}
                region={region}
                district={district}
                districts={getDistricts(region.id, geographyData)}
                publicDataset={publicDataset}
                publicYear={publicYear}
            />
        </PageShell>
    )
}
