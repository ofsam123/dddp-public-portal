import React from 'react'
import {
    AgricultureIcon,
    ServicesIcon,
    FinanceIcon,
    RegulationIcon,
    ProgrammeIcon,
    InvestmentIcon,
} from '../shared/PortalIcons'
import './Service.css'

const audiences = [
    { title: 'Agriculture actors', icon: <AgricultureIcon />, description: 'Understand producers, value chains and the services that support local agriculture.' },
    { title: 'Service providers', icon: <ServicesIcon />, description: 'Find the organisations and facilities delivering essential district services.' },
    { title: 'Finance & markets', icon: <FinanceIcon />, description: 'Connect local opportunity with financial, market and enterprise information.' },
    { title: 'Regulators', icon: <RegulationIcon />, description: 'Use shared evidence to guide oversight, standards and public accountability.' },
    { title: 'Government programmes', icon: <ProgrammeIcon />, description: 'Track how flagship initiatives connect to district priorities and outcomes.' },
    { title: 'Investors & partners', icon: <InvestmentIcon />, description: 'Identify local needs, opportunities and areas for meaningful collaboration.' },
]

const Service = () => (
    <section className="audiences-section" aria-labelledby="audiences-title">
        <div className="audiences-section__heading">
            <span className="section-kicker">Built for collaboration</span>
            <h2 id="audiences-title">Useful data for everyone shaping district development.</h2>
        </div>

        <div className="audiences-grid">
            {audiences.map((audience) => (
                <article className="audience-card" key={audience.title}>
                    <span className="audience-card__icon">{audience.icon}</span>
                    <div>
                        <h3>{audience.title}</h3>
                        <p>{audience.description}</p>
                    </div>
                </article>
            ))}
        </div>
    </section>
)

export default Service
