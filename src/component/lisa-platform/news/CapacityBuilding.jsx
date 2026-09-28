import React from 'react'
import CapacityBuildingImage1 from '../../static/images/img/capacity-building 1.jpg'
import CapacityBuildingImage2 from '../../static/images/img/capacity-building 2.jpg'
import StoryPage from './StoryPage'

const relatedStories = [
    { path: '/training', text: 'Training for the local ACE districts' },
    { path: '/district-development', text: 'District Development Data Platform User’s Forum' },
    { path: '/crowdfunding', text: 'Crowdfunding training for climate-resilient infrastructure' },
    { path: '/vulnerability', text: 'Vulnerability assessment and crowdfunding workshop' },
]

const CapacityBuilding = () => (
    <StoryPage
        category="Capacity building"
        title="Capacity building on the utilization of ACCAF"
        summary="Supporting district officers to use climate adaptation data and tools more confidently in local planning."
        images={[
            { src: CapacityBuildingImage1, alt: 'Capacity building workshop participants' },
            { src: CapacityBuildingImage2, alt: 'Capacity building session on climate adaptation tools' },
        ]}
        related={relatedStories}
    >
        <p>
            Efforts to enhance the LISA platform as a more robust system for district assemblies was further continued in the reporting year. The platform’s primary function is to supply essential climate data for planning purposes.
        </p>
        <p>
            Through a continuous and consistent engagement, the platform’s development has seen increased collaboration with the government, particularly through partnerships with the Ghana Meteorological Agency, the Ghana Statistical Service, and development partners such as Switzerland, KfW, and Deutsche Gesellschaft für Internationale Zusammenarbeit GmbH (GIZ).
        </p>
        <p>
            After the LISA platform was introduced in all district assemblies participating in the LoCAL ACE Project in November 2023, continued support was offered through the first half of 2024 through capacity-building activities designed to help selected officers use the platform effectively.
        </p>
    </StoryPage>
)

export default CapacityBuilding
