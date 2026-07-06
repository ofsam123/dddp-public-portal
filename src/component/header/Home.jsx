import React from 'react'
import NavBar from './NavBar'
import Platform from '../platform/Platform'
import Dimensions from '../dimensions/Dimensions'
import Feedback from '../feedback/Feedback'
import Partner from '../partner/Partner'
import HomeUpdates from '../updates/HomeUpdates'
import PublicFooter from '../footer/PublicFooter'
import Insight from '../insight/Insight'
import Header from './Header'


const Home = () => {

    return (
        <div id="top">
            <NavBar />
            <Header />
            <Platform />
            <div id="development"><Dimensions /></div>
            <div id="insights"><Insight /></div>
            <Feedback />
            <HomeUpdates />
            <Partner />
            <PublicFooter />
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
