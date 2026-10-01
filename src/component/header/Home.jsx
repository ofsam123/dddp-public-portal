import React, { useMemo } from 'react'
import NavBar from './NavBar'
import Platform from '../platform/Platform'
import HomeUpdates from '../updates/HomeUpdates'
import PublicFooter from '../footer/PublicFooter'
import Header from './Header'
import HomeGateways from '../home-sections/HomeGateways'
import HomeDpatHighlight from '../home-sections/HomeDpatHighlight'
import { ClimateResourcesSection } from '../home-sections/HomePhaseOneSections'
import ExploreGeographyEntry from '../home-sections/ExploreGeographyEntry'
import NationalDataVisualizations from '../home-sections/NationalDataVisualizations'
import useNationalBreakdowns from '../explore/hooks/useNationalBreakdowns'
import usePublicGeography from '../explore/hooks/usePublicGeography'
import usePublicSummary from '../explore/hooks/usePublicSummary'
import usePublicYear from '../explore/hooks/usePublicYear'
import useRegionalSummaries from '../explore/hooks/useRegionalSummaries'
import { useDeliverySummary } from '../explore/hooks/useScopedResource'
import { getNationalGeography } from '../explore/services/publicDataService'

const NATIONAL = getNationalGeography()

const Home = () => {
    const publicYear = usePublicYear()
    const { geographyData, isLoading: isGeographyLoading } = usePublicGeography()
    const { summaryData, isLoading: isSummaryLoading } = usePublicSummary({
        geography: getNationalGeography(),
        year: publicYear.year,
    })
    const { breakdownsData, isLoading: isBreakdownsLoading } = useNationalBreakdowns({
        year: publicYear.year,
        isYearLoading: publicYear.isLoading,
    })
    const { summariesBySlug, isLoading: isRegionalLoading } = useRegionalSummaries({ year: publicYear.year })
    const delivery = useDeliverySummary({ geography: NATIONAL, year: publicYear.year })
    const deliveryBySlug = useMemo(
        () => new Map((delivery.data?.children || []).map((child) => [child.slug, child.metrics])),
        [delivery.data],
    )

    return (
        <div id="top" className="portal-page">
            <NavBar />
            <Header
                exploreHref={publicYear.withYear('/explore')}
                year={publicYear.year}
                summaryData={summaryData}
                geographyData={geographyData}
                isLoading={isSummaryLoading || isGeographyLoading}
                summariesBySlug={summariesBySlug}
                isRegionalLoading={isRegionalLoading || publicYear.isLoading}
                deliveryBySlug={deliveryBySlug}
                isDeliveryLoading={delivery.isLoading || publicYear.isLoading}
                withYear={publicYear.withYear}
            />
            <HomeGateways withYear={publicYear.withYear} />
            <Platform
                geographyData={geographyData}
                isGeographyLoading={isGeographyLoading}
                isLoading={isSummaryLoading}
                publicYear={publicYear}
                summaryData={summaryData}
            />
            <HomeDpatHighlight />
            <NationalDataVisualizations
                breakdownsData={breakdownsData}
                isLoading={isBreakdownsLoading}
                year={publicYear.year}
            />
            <ExploreGeographyEntry
                geographyData={geographyData}
                isLoading={isGeographyLoading}
                withYear={publicYear.withYear}
            />
            <ClimateResourcesSection />
            <HomeUpdates />
            <PublicFooter withYear={publicYear.withYear} />
        </div>
    )
}

export default Home
