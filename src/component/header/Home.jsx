import React from 'react'
import NavBar from './NavBar'
import Platform from '../platform/Platform'
import HomeUpdates from '../updates/HomeUpdates'
import PublicFooter from '../footer/PublicFooter'
import Header from './Header'
import { LisaClimateSection, ReportsResourcesSection } from '../home-sections/HomePhaseOneSections'
import ExploreGeographyEntry from '../home-sections/ExploreGeographyEntry'
import NationalDataVisualizations from '../home-sections/NationalDataVisualizations'
import useNationalBreakdowns from '../explore/hooks/useNationalBreakdowns'
import usePublicGeography from '../explore/hooks/usePublicGeography'
import usePublicSummary from '../explore/hooks/usePublicSummary'
import usePublicYear from '../explore/hooks/usePublicYear'
import { getNationalGeography } from '../explore/services/publicDataService'


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

    return (
        <div id="top">
            <NavBar />
            <Header exploreHref={publicYear.withYear('/explore')} />
            <Platform
                geographyData={geographyData}
                isGeographyLoading={isGeographyLoading}
                isLoading={isSummaryLoading}
                publicYear={publicYear}
                summaryData={summaryData}
            />
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
            <LisaClimateSection />
            <ReportsResourcesSection />
            <HomeUpdates />
            <PublicFooter withYear={publicYear.withYear} />
            {/* <About /> */}
            {/* <Services /> */}
            {/* <WhyChooseUs />
            <Projects />
            <FreeQuote /> */}
            {/* <Footer /> */}
        </div>
    )
}

export default Home
