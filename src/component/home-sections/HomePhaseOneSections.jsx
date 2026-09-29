import React from 'react'
import { Link } from 'react-router-dom'
import LisaImage from '../static/images/img/lisa-home-1200.png'
import { ExternalArrowIcon, FinanceIcon, MonitoringIcon, RegulationIcon } from '../shared/PortalIcons'
import { PublicMotionItem, PublicMotionSection } from '../shared/PublicMotion'
import './HomePhaseOneSections.css'

const RESOURCES = [
    {
        title: 'Annual progress reports',
        text: 'MMDA and RCC annual progress reports on plan implementation.',
        to: '/apr/mmda',
        icon: <RegulationIcon />,
    },
    {
        title: 'Forecast history',
        text: 'Past seasonal and local forecasts published through LISA.',
        to: '/all-forcast',
        icon: <MonitoringIcon />,
    },
    {
        title: 'Operational reporting platform',
        text: 'Where assemblies submit and review development data.',
        href: 'https://dddp.gov.gh/',
        icon: <FinanceIcon />,
    },
]

const ResourceCard = ({ resource }) => {
    const body = (
        <>
            <span className="home-resources__icon pt-icon" aria-hidden="true">{resource.icon}</span>
            <span className="home-resources__text">
                <strong>{resource.title}</strong>
                <span>{resource.text}</span>
            </span>
            <span className="home-resources__arrow" aria-hidden="true">
                {resource.href ? <ExternalArrowIcon /> : <svg viewBox="0 0 16 16"><path d="M3 8h10M9 4l4 4-4 4" /></svg>}
            </span>
        </>
    )

    return resource.href ? (
        <a className="home-resources__card" href={resource.href} target="_blank" rel="noopener noreferrer">{body}</a>
    ) : (
        <Link className="home-resources__card" to={resource.to}>{body}</Link>
    )
}

export const ClimateResourcesSection = () => (
    <PublicMotionSection className="pt-section pt-section--tint home-resources" id="reports-resources" aria-labelledby="home-lisa-title">
        <div className="pt-container home-resources__grid">
            <PublicMotionItem className="home-resources__lisa">
                <div className="home-resources__lisa-copy">
                    <span className="section-kicker">LISA climate information</span>
                    <h2 id="home-lisa-title">Climate information for local planning</h2>
                    <p>
                        LISA gives district planners and citizens local forecasts, climate products and adaptation guidance, so plans can respond to changing conditions.
                    </p>
                    <div className="home-resources__actions">
                        <Link className="pt-button pt-button--primary" to="/lisa">
                            Explore LISA
                            <svg viewBox="0 0 16 16" aria-hidden="true"><path d="M3 8h10M9 4l4 4-4 4" /></svg>
                        </Link>
                        <Link className="pt-link" to="/climate">Climate change <svg viewBox="0 0 16 16" aria-hidden="true"><path d="M3 8h10M9 4l4 4-4 4" /></svg></Link>
                    </div>
                </div>
                <div className="home-resources__lisa-media">
                    <img src={LisaImage} alt="Preview of the LISA climate information service" loading="lazy" decoding="async" />
                </div>
            </PublicMotionItem>

            <PublicMotionItem className="home-resources__list" aria-labelledby="home-reports-title">
                <span className="section-kicker">Reports & resources</span>
                <h3 id="home-reports-title">Publications and tools</h3>
                <div className="home-resources__cards">
                    {RESOURCES.map((resource) => <ResourceCard key={resource.title} resource={resource} />)}
                </div>
            </PublicMotionItem>
        </div>
    </PublicMotionSection>
)
