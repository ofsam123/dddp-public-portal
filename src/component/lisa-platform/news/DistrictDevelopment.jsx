import React from 'react'
import NavBar from '../../header/NavBar'
import DistrictDevelopmentImage from '../../static/images/img/district-development.jpg'
import Footer from '../footer/LisaFooter'
import RelatedNews from './RelatedNews'

const DistrictDevelopment = () => {
    return (
        <div>
            <NavBar />
            <div style={{ width: '70%', margin: '0 auto', textAlign: 'justify', marginTop: '5rem', marginBottom: '8rem' }}>
                <h2 style={{ color: '#0B6000', textAlign: 'center', marginTop: '8rem', width: '70%', margin: '0 auto', marginBottom: '2rem' }}>
                    District Development Data Platform User’s Forum
                </h2>
                <p style={{ fontSize: '1.3rem' }}>
                    This event underscored the importance of data in political decision-making and as a critical tool for tracking development progress and enhancing government accountability. High-quality, disaggregated, timely, reliable data are crucial, particularly given the growing demand for data to monitor and assess progress towards ambitious development targets in areas such as economic growth, human development and environmental protection. Having reliable climate change data at the community and district levels is crucial because local-level data directly affect citizens’ lives, but they are difficult to obtain. Lack of data at the district level limits the ability of district assemblies. To mitigate data management issues, the District Development Data Platform, a web-based system created to enhance M&E and data management capacities at the district level, was developed through a collaborative effort of GIZ's Governance for Inclusive Development and its partners: MLGDRD, the National Development Planning Commission and the Ghana Statistical Service.
                </p>
                <div style={{ marginTop: '5rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <img src={DistrictDevelopmentImage} width={600} alt='District Development' />
                </div>
            </div>
            <RelatedNews newsItems={[
                { path: '/capacity-building', text: 'Capacity building on the utilization of the Assessing Climate Change Adaptation Framework (ACCAF)' },
                { path: '/training', text: 'Training for the local ACE districts' },
                { path: '/crowdfunding', text: 'Crowdfunding training for climate-resilient infrastructure ' },
                { path: '/vulnerability', text: 'Vulnerability assessment and crowdfunding workshop' }
            ]} />
            <Footer />
        </div>
    )
}

export default DistrictDevelopment