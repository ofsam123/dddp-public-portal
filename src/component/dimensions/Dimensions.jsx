import React from 'react'
import {
    EconomicIcon,
    InfrastructureIcon,
    EmergencyIcon,
    MonitoringIcon,
} from '../shared/PortalIcons'
import { PublicMotionItem, PublicMotionSection } from '../shared/PublicMotion'
import './Dimensions.css'

const dimensions = [
    { number: '01', title: 'Development & planning', description: 'Approved planning summaries and development priorities.', icon: <MonitoringIcon /> },
    { number: '02', title: 'Projects & programmes', description: 'High-level public summaries of local projects and programmes.', icon: <EconomicIcon /> },
    { number: '03', title: 'Infrastructure & services', description: 'Public information about facilities, services and local infrastructure where approved.', icon: <InfrastructureIcon /> },
    { number: '04', title: 'Climate & environment', description: 'LISA forecasts, climate products and public climate resources.', icon: <EmergencyIcon /> },
]

const Dimensions = () => (
    <PublicMotionSection className="dimensions-section" id="explore-themes" aria-labelledby="dimensions-title">
        <PublicMotionItem className="dimensions-section__heading">
            <div>
                <span className="section-kicker">Explore by theme</span>
                <h2 id="dimensions-title">Explore by subject, not only by place.</h2>
            </div>
            <p>Browse public topics that can grow as approved information is published.</p>
        </PublicMotionItem>

        <PublicMotionItem className="dimensions-index">
            {dimensions.map((dimension) => (
                <article className="dimension-row" key={dimension.title}>
                    <span className="dimension-row__number">{dimension.number}</span>
                    <div className="dimension-row__content">
                        <span className="dimension-row__icon">{dimension.icon}</span>
                        <div>
                            <h3>{dimension.title}</h3>
                            <p>{dimension.description}</p>
                        </div>
                    </div>
                    <span className="dimension-row__arrow" aria-hidden="true">-&gt;</span>
                </article>
            ))}
        </PublicMotionItem>
    </PublicMotionSection>
)

export default Dimensions
