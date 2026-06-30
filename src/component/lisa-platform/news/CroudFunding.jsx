import React from 'react'
import NavBar from '../../header/NavBar'
import CroudFundingImage1 from '../../static/images/img/croud-funding1.jpg'
import CroudFundingImage2 from '../../static/images/img/croud-funding2.jpg'
import Footer from '../footer/LisaFooter'
import RelatedNews from './RelatedNews'


const CroudFunding = () => {
    return (
        <div>
            <NavBar />
            <div style={{ width: '70%', margin: '0 auto', textAlign: 'justify', marginTop: '5rem', marginBottom: '8rem' }}>
                <h2 style={{ color: '#0B6000', textAlign: 'center', marginTop: '8rem', width: '70%', margin: '0 auto', marginBottom: '2rem' }}>
                    Crowdfunding training for climate-resilient infrastructure
                </h2>
                <p style={{ fontSize: '1.3rem' }}>
                    Expanding local fiscal capability is a key objective for UNCDF and, by extension, the GrEEn Project. In this context, the concept of crowdfunding as a funding source for resilient infrastructure development was introduced to selected participants in May 2023. This capacity-building event trained 68 (58 male, 10 female) from district assembly officers on the crowdfunding platform, in collaboration with Chango, a partner with Result 3 under the GrEEn Project. During the training, district assembly officers were acquainted with strategies to solicit funds by initiating and managing active campaigns on the Chango platform.
                </p>
                <p style={{ fontSize: '1.3rem' }}>
                    In June 2023, further support was provided through an interactive working session designed to deepen the knowledge of the focal persons (budget officers) appointed to lead these campaigns
                    for the participating district assemblies. This session equipped the district assemblies with enhanced skills and knowledge, positioning them to secure financing from the diaspora and other sources for implementing climate-resilient public investments through the PBCRG mechanism.
                </p>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '5rem' }}>
                    <img src={CroudFundingImage1} width={450} height={400} alt='Croud FundingImage' />
                    <img src={CroudFundingImage2} width={450} alt='Croud FundingImage' />
                </div>
            </div>
            <RelatedNews newsItems={[
                { path: '/capacity-building', text: 'Capacity building on the utilization of the Assessing Climate Change Adaptation Framework (ACCAF)' },
                { path: '/training', text: 'Training for the local ACE districts' },
                { path: '/district-development', text: 'District Development Data Platform User’s Forum' },
                { path: '/vulnerability', text: 'Vulnerability assessment and crowdfunding workshop' }
            ]} />
            <Footer />
        </div>
    )
}

export default CroudFunding