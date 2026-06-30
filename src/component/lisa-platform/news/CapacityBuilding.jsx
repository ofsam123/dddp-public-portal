import React from 'react'
import NavBar from '../../header/NavBar'
import CapacityBuildingImage1 from '../../static/images/img/capacity-building 1.jpg'
import CapacityBuildingImage2 from '../../static/images/img/capacity-building 2.jpg'
import Footer from '../footer/LisaFooter'
import RelatedNews from './RelatedNews'

const CapacityBuilding = () => {
    return (
        <div>
            <NavBar />
            <div style={{ width: '70%', margin: '0 auto', textAlign: 'justify', marginTop: '5rem', marginBottom: '8rem' }}>
                <h2 style={{ color: '#0B6000', textAlign: 'center', marginTop: '8rem', width: '70%', margin: '0 auto', marginBottom: '2rem' }}>
                    Capacity building on the utilization of the Assessing Climate Change Adaptation Framework (ACCAF)
                </h2>
                <p style={{ fontSize: '1.3rem' }}>
                    Efforts to enhance the LISA platform as a more robust system for district assemblies was further continued in the reporting year.  The platform’s primary function is to supply essential climate data for planning purposes. Through a continuous and consistent engagement, the platform’s development has seen increased collaboration with the government, particularly through partnerships with the Ghana Meteorological Agency; the Ghana Statistical Service; and development partners such as Switzerland, KfW, and Deutsche Gesellschaft für Internationale Zusammenarbeit GmbH (GIZ). These collaborations have focused on increasing the visibility and use of the LISA platform, which is based on the GIZ-developed District Development Data Platform.
                </p>
                <p style={{ fontSize: '1.3rem' }}>
                    After the LISA platform was introduced in all district assemblies participating in the LoCAL ACE Project in November 2023, continued support was offered through the first half of 2024 through capacity-building activities designed to help selected officers use the platform effectively.
                </p>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '5rem' }}>
                    <img src={CapacityBuildingImage1} width={450} alt='Capacity Build' />
                    <img src={CapacityBuildingImage2} width={450} alt='Capacity Build' />
                </div>
            </div>
            <RelatedNews newsItems={[
                { path: '/training', text: 'Training for the local ACE districts' },
                { path: '/district-development', text: 'District Development Data Platform User’s Forum' },
                { path: '/crowdfunding', text: 'Crowdfunding training for climate-resilient infrastructure ' },
                { path: '/vulnerability', text: 'Vulnerability assessment and crowdfunding workshop' }
            ]} />
            <Footer />
        </div>
    )
}

export default CapacityBuilding