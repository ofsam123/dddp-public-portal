import React, { useEffect } from 'react'
import NavBar from '../../header/NavBar'
import LocalInformation from '../information/LocalInformation'
import News from '../news/News'
import Footer from '../footer/LisaFooter'
import Forcast from '../forcast/Forcast'

import LisaHomeImage from '../../static/images/img/lisa-home.png'
import LocalOverviewHome from '../overview/LocalOverviewHome'
import ClimateChange from '../climate/ClimateChange'
import OverviewUndpc from '../overview/OverviewUndpc'


const LisaHome = () => {

    // Load the ClimateChange component when the Home component is mounted
    useEffect(() => {
        // import('../climate/ClimateChange')
        <ClimateChange />
    }, [])
    
    return (
        <div>
            <NavBar />
            <div className="container-fluid">
                <div className="row" style={{ backgroundColor: '#EEF0FD', height: '80vh' }}>
                    <div className="col-md-6 d-flex align-items-center justify-content-center flex-column" style={{ textAlign: 'left', paddingLeft: '10rem' }}>
                        <h1 style={{ color: '#0b6000', textWrap: 'wrap', fontSize: '3.5rem', }}>
                            Local-based Information
                            System for climate change
                            Adaptation (LISA)
                        </h1>
                        <p className="lead">
                            The United Nations Capital Development Fund (UNCDF) makes public and private finance work for the poor in the world's 46 least developed countries.
                        </p>
                        <div style={{ alignSelf: 'flex-start' }}>
                            <button className="btn btn-lg btn-primary" style={{ backgroundColor: '#0b6000', border: '#0b6000' }}>
                                <a href="/lisa-overview" style={{ textDecoration: 'none', color: '#fff' }}>Learn More</a>
                            </button>
                        </div>
                    </div>
                    <div className="col-md-6">
                        <img src={LisaHomeImage} alt="Lisa Home" className="img-fluid" />
                    </div>
                </div>
            </div>
            <div className='mb-5'>
                <Forcast />
            </div>
            <OverviewUndpc />
            <LocalOverviewHome />
            <LocalInformation />
            {/* <DataEffect />
            <AddaptClimate /> */}
            <News />
            <Footer />
        </div>
    )
}

export default LisaHome