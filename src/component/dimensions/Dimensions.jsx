import React from 'react'
import {
    EconomicIcon,
    CommunityIcon,
    InfrastructureIcon,
    GovernanceIcon,
    EmergencyIcon,
    MonitoringIcon,
} from '../shared/PortalIcons'
import './Dimensions.css'

const dimensions = [
    { number: '01', title: 'Economic development', description: 'Track local growth, employment, enterprise and economic opportunity.', icon: <EconomicIcon /> },
    { number: '02', title: 'Social development', description: 'Understand progress in health, education, inclusion and social services.', icon: <CommunityIcon /> },
    { number: '03', title: 'Environment & infrastructure', description: 'Explore infrastructure, human settlements and environmental resilience.', icon: <InfrastructureIcon /> },
    { number: '04', title: 'Governance & administration', description: 'Support transparent institutions, public administration and accountability.', icon: <GovernanceIcon /> },
    { number: '05', title: 'Emergency preparedness', description: 'Strengthen local readiness, risk planning and coordinated response.', icon: <EmergencyIcon /> },
    { number: '06', title: 'Monitoring & evaluation', description: 'Follow implementation, coordination and development outcomes over time.', icon: <MonitoringIcon /> },
]

const Dimensions = () => (
    <section className="dimensions-section" aria-labelledby="dimensions-title">
        <div className="dimensions-section__heading">
            <div>
                <span className="section-kicker">Development framework</span>
                <h2 id="dimensions-title">One view across every development dimension.</h2>
            </div>
            <p>
                DDDP brings district information together so progress can be understood across the areas that shape everyday life.
            </p>
        </div>

        <div className="dimensions-grid">
            {dimensions.map((dimension) => (
                <article className="dimension-card" key={dimension.title}>
                    <div className="dimension-card__topline">
                        <span>{dimension.number}</span>
                        <span className="dimension-card__icon">{dimension.icon}</span>
                    </div>
                    <h3>{dimension.title}</h3>
                    <p>{dimension.description}</p>
                </article>
            ))}
        </div>
    </section>
)

export default Dimensions
