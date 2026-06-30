import React, { useEffect } from 'react'
import NavBar from './NavBar'
import Platform from '../platform/Platform'
import Dimensions from '../dimensions/Dimensions'
import Service from '../service/Service'
import Feedback from '../feedback/Feedback'
import News from '../lisa-platform/news/News'
import Partner from '../partner/Partner'
import LisaFooter from '../lisa-platform/footer/LisaFooter'
import Insight from '../insight/Insight'
import Header from './Header'
import ClimateChange from '../lisa-platform/climate/ClimateChange'


const Home = () => {

    // Load the ClimateChange component when the Home component is mounted
    useEffect(() => {
        // import('../lisa-platform/climate/ClimateChange')
        <ClimateChange />
    }, [])


    return (
        <div>
            <NavBar />
            <Header />
            {/* <Feature /> */}
            <Platform />
            <Dimensions />
            <Insight />
            <Service />
            <Feedback />
            <News />
            <Partner />
            <LisaFooter />
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