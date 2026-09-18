import React from 'react'
import CroudFundingImage1 from '../../static/images/img/croud-funding1.jpg'
import CroudFundingImage2 from '../../static/images/img/croud-funding2.jpg'
import StoryPage from './StoryPage'

const relatedStories = [
    { path: '/capacity-building', text: 'Capacity building on the utilization of ACCAF' },
    { path: '/training', text: 'Training for the local ACE districts' },
    { path: '/district-development', text: 'District Development Data Platform User’s Forum' },
    { path: '/vulnerability', text: 'Vulnerability assessment and crowdfunding workshop' },
]

const CroudFunding = () => (
    <StoryPage
        category="Training"
        title="Crowdfunding training for climate-resilient infrastructure"
        summary="Introducing district officers to alternative finance strategies for resilient public investment."
        images={[
            { src: CroudFundingImage1, alt: 'Crowdfunding training participants' },
            { src: CroudFundingImage2, alt: 'Climate-resilient infrastructure financing workshop' },
        ]}
        related={relatedStories}
    >
        <p>
            Expanding local fiscal capability is a key objective for UNCDF and, by extension, the GrEEn Project. In this context, the concept of crowdfunding as a funding source for resilient infrastructure development was introduced to selected participants in May 2023.
        </p>
        <p>
            This capacity-building event trained 68 district assembly officers on the crowdfunding platform, in collaboration with Chango, a partner with Result 3 under the GrEEn Project. During the training, district assembly officers were acquainted with strategies to solicit funds by initiating and managing active campaigns on the Chango platform.
        </p>
        <p>
            In June 2023, further support was provided through an interactive working session designed to deepen the knowledge of the focal persons appointed to lead these campaigns. This positioned participating district assemblies to secure financing from the diaspora and other sources for climate-resilient public investments through the PBCRG mechanism.
        </p>
    </StoryPage>
)

export default CroudFunding
