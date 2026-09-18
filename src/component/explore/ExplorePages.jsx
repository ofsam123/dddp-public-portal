import React from 'react'
import { Link, useParams } from 'react-router-dom'
import NavBar from '../header/NavBar'
import PublicFooter from '../footer/PublicFooter'
import DataPageHeader from './components/DataPageHeader'
import GeographyBrowser from './components/GeographyBrowser'
import KpiGrid from './components/KpiGrid'
import PublicState from './components/PublicState'
import usePublicGeography from './hooks/usePublicGeography'
import usePublicSummary from './hooks/usePublicSummary'
import usePublicYear from './hooks/usePublicYear'
import useRegionalSummaries from './hooks/useRegionalSummaries'
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

const GeographyTemplate = ({ geography, geographyData, region, district, districts, publicYear }) => {
    const { summaryData, isLoading } = usePublicSummary({
        geography,
        regionSlug: region?.slug,
        year: publicYear.year,
    })
    const { regionalSummaries, nationalSummary } = useRegionalSummaries({
        enabled: geography.level === 'region',
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
                        ? 'Review Ghana-wide public indicators, then move into regions and districts.'
                        : `Explore public DDDP information for ${geography.name}.`
                }
                actions={hasBackActions ? (
                    <>
                        {region && <Link className="explore-button explore-button--secondary" to={publicYear.withYear('/explore/ghana')}>Back to Ghana</Link>}
                        {district && <Link className="explore-button explore-button--secondary" to={publicYear.withYear(`/explore/regions/${region.slug}`)}>Back to {region.name}</Link>}
                    </>
                ) : null}
                publicYear={publicYear}
                source={summaryData?.meta.source}
                retrievedAt={summaryData?.meta.retrievedAt}
            />

            <section className="explore-section">
                <div className="explore-section__heading">
                    <span className="section-kicker">Public indicators</span>
                    <h2>{geography.name} at a glance</h2>
                    <p>Current DDDP project, programme and meeting counts for this geography.</p>
                </div>
                <KpiGrid items={summary.kpis} context={summary.kpiContext} comparisons={comparisons} isLoading={isLoading} />
            </section>

            {geography.level === 'national' && (
                <GeographyBrowser
                    title="Browse Ghana's regions"
                    description="Choose a region to continue from the national view."
                    regions={getRegions(geographyData)}
                    year={publicYear.year}
                    withYear={publicYear.withYear}
                />
            )}

            {geography.level === 'region' && (
                <GeographyBrowser
                    title={`Browse districts in ${geography.name}`}
                    activeRegion={geography}
                    districts={districts}
                    year={publicYear.year}
                    withYear={publicYear.withYear}
                />
            )}

        </>
    )
}

export const ExploreLanding = () => {
    const { geographyData } = usePublicGeography()
    const publicYear = usePublicYear()

    return (
        <PageShell>
            <DataPageHeader
                breadcrumbs={[{ label: 'Home', href: publicYear.withYear('/') }, { label: 'Explore Data' }]}
                eyebrow="Explore Data"
                title="Explore public DDDP information by place."
                description="Start with Ghana, compare regions, then open district/MMDA pages for local public indicators."
                actions={<Link className="explore-button explore-button--primary" to={publicYear.withYear('/explore/ghana')}>Start with Ghana</Link>}
                publicYear={publicYear}
                source={publicYear.availability?.source}
                retrievedAt={publicYear.availability?.retrievedAt}
            />
            <GeographyBrowser
                title="Start by geography"
                description="Choose a region or begin with the national overview."
                regions={getRegions(geographyData)}
                year={publicYear.year}
                withYear={publicYear.withYear}
            />
        </PageShell>
    )
}

export const GhanaOverview = () => {
    const { geographyData } = usePublicGeography()
    const publicYear = usePublicYear()

    return (
        <PageShell>
            <GeographyTemplate geography={getNationalGeography()} geographyData={geographyData} publicYear={publicYear} />
        </PageShell>
    )
}

export const RegionPage = () => {
    const { regionSlug } = useParams()
    const { geographyData } = usePublicGeography()
    const publicYear = usePublicYear()
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
                    title="We could not find that region."
                    description="The link may be outdated, or that region may not be available here yet."
                    actions={<Link className="explore-button explore-button--primary" to={publicYear.withYear('/explore/ghana')}>Browse Ghana regions</Link>}
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
                publicYear={publicYear}
            />
        </PageShell>
    )
}

export const DistrictPage = () => {
    const { regionSlug, districtSlug } = useParams()
    const { geographyData, isLoading } = usePublicGeography()
    const publicYear = usePublicYear()
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
                    title="We could not find that district/MMDA."
                    description="The link may be outdated, or that district/MMDA may not be available here yet."
                    actions={<Link className="explore-button explore-button--primary" to={publicYear.withYear('/explore/ghana')}>Browse Ghana regions</Link>}
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
                publicYear={publicYear}
            />
        </PageShell>
    )
}
