import React from 'react'
import TrainingImage1 from '../../static/images/img/training1.jpg'
import TrainingImage2 from '../../static/images/img/training2.jpg'
import TrainingImage3 from '../../static/images/img/training3.jpg'
import StoryPage from './StoryPage'

const relatedStories = [
    { path: '/capacity-building', text: 'Capacity building on the utilization of ACCAF' },
    { path: '/district-development', text: 'District Development Data Platform User’s Forum' },
    { path: '/crowdfunding', text: 'Crowdfunding training for climate-resilient infrastructure' },
    { path: '/vulnerability', text: 'Vulnerability assessment and crowdfunding workshop' },
]

const Training = () => (
    <StoryPage
        category="Training"
        title="Training for the local ACE districts"
        summary="A practical workshop helping LoCAL-ACE district staff capture climate events, identify interventions and manage project information digitally."
        images={[
            { src: TrainingImage1, alt: 'Local ACE district training session' },
            { src: TrainingImage2, alt: 'Participants during the LISA training workshop' },
            { src: TrainingImage3, alt: 'District officers reviewing LISA platform information' },
        ]}
        related={relatedStories}
    >
        <p>
            UNCDF in collaboration with MLGDRD organised a subsequent training workshop for the three LoCAL-ACE Districts, which took place from the 26th–27th March at the Pempamsie Hotel in Cape Coast.
        </p>
        <p>
            The workshop was to build further the capacity of staff of the LoCAL-ACE M/DAs on the Local Information System for Climate Change Adaptation (LISA) and the Electronic Daily Attendance Sheet (E-DASH). The goal was to help districts capture project information digitally and prepare to document local climate events and identify interventions.
        </p>
        <p>
            The session also provided an opportunity for participants to review and confirm their communities uploaded into the LISA system.
        </p>
    </StoryPage>
)

export default Training
