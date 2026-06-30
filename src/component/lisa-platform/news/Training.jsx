import React from 'react'
import NavBar from '../../header/NavBar'
import TrainingImage1 from '../../static/images/img/training1.jpg'
import TrainingImage2 from '../../static/images/img/training2.jpg'
import TrainingImage3 from '../../static/images/img/training3.jpg'
import Footer from '../footer/LisaFooter'
import RelatedNews from './RelatedNews'


const Training = () => {
    return (
        <div>
            <NavBar />
            <div style={{ width: '70%', margin: '0 auto', textAlign: 'justify', marginTop: '5rem', marginBottom: '8rem' }}>
                <h2 style={{ color: '#0B6000', textAlign: 'center', marginTop: '8rem', width: '70%', margin: '0 auto', marginBottom: '2rem' }}>
                    Training for the local ACE districts
                </h2>
                <p style={{ fontSize: '1.3rem' }}>
                    UNCDF in collaboration with MLGDRD organised a subsequent training workshop for the three LoCAL-ACE Districts, which took place from the 26th-27th March at the Pempamsie Hotel in Cape Coast. The workshop was to build further the capacity of staff of the LoCAL-ACE M/DAs on the Local Information System for Climate Change Adaptation (LISA) and the Electronic Daily Attendance Sheet (E-DASH) to primarily in this instance, capture the project information digitally in the various Districts. The LISA tool, therefore, was to adequately prepare the M/DAs to start capturing their local climate events identify interventions, whilst also utilizing necessary climate data, in preparation for their projects and to improve on how their sub-project-related information will be managed electronically, using the E-DASH system. The workshop was also to provide the opportunity for the participants to review and confirm their communities uploaded into the LISA system.
                </p>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '5rem' }}>
                    <img src={TrainingImage1} width={300} alt='Training' />
                    <img src={TrainingImage2} width={300} alt='Training' />
                    <img src={TrainingImage3} width={300} alt='Training' />
                </div>
            </div>
            <RelatedNews newsItems={[
                { path: '/capacity-building', text: 'Capacity building on the utilization of the Assessing Climate Change Adaptation Framework (ACCAF)' },
                { path: '/district-development', text: 'District Development Data Platform User’s Forum' },
                { path: '/crowdfunding', text: 'Crowdfunding training for climate-resilient infrastructure ' },
                { path: '/vulnerability', text: 'Vulnerability assessment and crowdfunding workshop' }
            ]} />
            <Footer />
        </div>
    )
}

export default Training