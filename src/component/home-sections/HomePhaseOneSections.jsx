import React from 'react'
import { Link } from 'react-router-dom'
import LisaImage from '../static/images/img/lisa-home-1200.png'
import { ExternalArrowIcon } from '../shared/PortalIcons'
import { PublicMotionItem, PublicMotionSection } from '../shared/PublicMotion'
import './HomePhaseOneSections.css'

export const LisaClimateSection = () => (
    <PublicMotionSection className="home-feature-section home-feature-section--lisa" aria-labelledby="home-lisa-title">
        <PublicMotionItem className="home-feature-section__content">
            <span className="section-kicker">LISA / Climate</span>
            <h2 id="home-lisa-title">Climate information for local planning.</h2>
            <p>
                LISA connects district planners and the public with local forecasts, climate products and adaptation information.
            </p>
            <div className="home-feature-section__actions">
                <Link to="/lisa">Explore LISA <span aria-hidden="true">-&gt;</span></Link>
            </div>
        </PublicMotionItem>
        <PublicMotionItem className="home-feature-section__visual">
            <img src={LisaImage} alt="LISA climate information preview" loading="lazy" decoding="async" />
        </PublicMotionItem>
    </PublicMotionSection>
)

export const ReportsResourcesSection = () => (
    <PublicMotionSection className="home-feature-section home-feature-section--reports" id="reports-resources" aria-labelledby="home-reports-title">
        <PublicMotionItem className="home-feature-section__content">
            <span className="section-kicker">Reports & Resources</span>
            <h2 id="home-reports-title">Find current climate resources and reporting tools.</h2>
            <p>
                Available publications remain within LISA, while operational data submission and review continue through the reporting platform.
            </p>
            <div className="home-feature-section__actions">
                <Link to="/lisa">Browse LISA resources <span aria-hidden="true">-&gt;</span></Link>
                <a href="https://dddp.gov.gh/" target="_blank" rel="noopener noreferrer">
                    Operational reporting platform
                    <span className="home-feature-section__icon" aria-hidden="true"><ExternalArrowIcon /></span>
                </a>
            </div>
        </PublicMotionItem>
    </PublicMotionSection>
)
