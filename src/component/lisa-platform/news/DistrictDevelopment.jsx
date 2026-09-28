import React from 'react'
import DistrictDevelopmentImage from '../../static/images/img/district-development.jpg'
import StoryPage from './StoryPage'

const relatedStories = [
    { path: '/capacity-building', text: 'Capacity building on the utilization of ACCAF' },
    { path: '/training', text: 'Training for the local ACE districts' },
    { path: '/crowdfunding', text: 'Crowdfunding training for climate-resilient infrastructure' },
    { path: '/vulnerability', text: 'Vulnerability assessment and crowdfunding workshop' },
]

const DistrictDevelopment = () => (
    <StoryPage
        category="Forum"
        title="District Development Data Platform User’s Forum"
        summary="A convening focused on the value of high-quality district data for accountability, planning and better local decision-making."
        images={[{ src: DistrictDevelopmentImage, alt: 'District Development Data Platform forum' }]}
        related={relatedStories}
    >
        <p>
            This event underscored the importance of data in political decision-making and as a critical tool for tracking development progress and enhancing government accountability. High-quality, disaggregated, timely, reliable data are crucial, particularly given the growing demand for data to monitor and assess progress towards ambitious development targets in areas such as economic growth, human development and environmental protection.
        </p>
        <p>
            Having reliable climate change data at the community and district levels is crucial because local-level data directly affect citizens’ lives, but they are difficult to obtain. Lack of data at the district level limits the ability of district assemblies.
        </p>
        <p>
            To mitigate data management issues, the District Development Data Platform, a web-based system created to enhance M&E and data management capacities at the district level, was developed through a collaborative effort of GIZ&apos;s Governance for Inclusive Development and its partners: MLGDRD, the National Development Planning Commission and the Ghana Statistical Service.
        </p>
    </StoryPage>
)

export default DistrictDevelopment
