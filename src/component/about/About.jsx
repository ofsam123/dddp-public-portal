import React from 'react'
import NavBar from '../header/NavBar'
import PublicFooter from '../footer/PublicFooter'
import {
    CommunityIcon,
    EconomicIcon,
    ExternalArrowIcon,
    GovernanceIcon,
    InvestmentIcon,
    MonitoringIcon,
    ServicesIcon,
} from '../shared/PortalIcons'
import './About.css'

const principles = [
    { number: '01', title: 'One shared view', description: 'Bring district development information together so institutions can work from a clearer common picture.' },
    { number: '02', title: 'Local context', description: 'Keep district realities visible within national planning, reporting and development conversations.' },
    { number: '03', title: 'Useful reporting', description: 'Make it easier to organise, review and use development information—not merely collect it.' },
    { number: '04', title: 'Connected action', description: 'Help districts, institutions and partners coordinate around evidence and shared priorities.' },
]

const audiences = [
    { title: 'District assemblies', description: 'For local planning, reporting and monitoring.', icon: <CommunityIcon /> },
    { title: 'National institutions', description: 'For coordination, oversight and policy insight.', icon: <GovernanceIcon /> },
    { title: 'Development partners', description: 'For aligned support and informed collaboration.', icon: <InvestmentIcon /> },
    { title: 'Service stakeholders', description: 'For understanding local systems and needs.', icon: <ServicesIcon /> },
]

const About = () => (
    <div className="about-page" id="top">
        <NavBar />

        <main>
            <section className="about-hero">
                <div className="about-hero__inner">
                    <div className="about-hero__content">
                        <span className="about-hero__kicker"><i /> About DDDP</span>
                        <h1>A shared foundation for <em>better district decisions.</em></h1>
                        <p>
                            The District Development Data Platform connects development information, reporting tools and local insight in one accessible ecosystem.
                        </p>
                        <div className="about-hero__actions">
                            <a href="#purpose">Discover our purpose <span aria-hidden="true">↓</span></a>
                            <a href="https://dddp.gov.gh/" target="_blank" rel="noopener noreferrer">
                                Open reporting tool <span className="about-link-icon"><ExternalArrowIcon /></span>
                            </a>
                        </div>
                    </div>

                    <div className="about-data-flow" aria-label="Data to action process illustration">
                        <div className="about-data-flow__top">
                            <span>District development</span><span className="about-data-flow__status"><i /> Connected</span>
                        </div>
                        <div className="about-data-flow__stages">
                            <article><span><MonitoringIcon /></span><small>01</small><strong>Data</strong><p>Report and organise</p></article>
                            <div className="about-data-flow__line"><i /></div>
                            <article><span><EconomicIcon /></span><small>02</small><strong>Insight</strong><p>Understand progress</p></article>
                            <div className="about-data-flow__line"><i /></div>
                            <article><span><CommunityIcon /></span><small>03</small><strong>Action</strong><p>Plan together</p></article>
                        </div>
                        <div className="about-data-flow__footer">
                            <div><span>Shared evidence</span><strong>Clearer priorities</strong></div>
                            <div className="about-data-flow__mini-chart" aria-hidden="true"><i /><i /><i /><i /><i /></div>
                        </div>
                    </div>
                </div>
            </section>

            <section className="about-purpose" id="purpose" aria-labelledby="purpose-title">
                <div className="about-purpose__intro">
                    <span className="section-kicker">Why DDDP exists</span>
                    <h2 id="purpose-title">District information is most valuable when people can find it, understand it and act on it.</h2>
                </div>
                <div className="about-purpose__copy">
                    <p>
                        Development information often sits across different institutions, programmes and systems. That makes it harder to see the full district picture or coordinate around the same priorities.
                    </p>
                    <p>
                        DDDP provides a common digital gateway—connecting data, reporting and specialised platforms so local evidence can support planning, monitoring and collaboration.
                    </p>
                </div>
            </section>

            <section className="about-principles" aria-labelledby="principles-title">
                <div className="about-principles__heading">
                    <span className="section-kicker">What guides the platform</span>
                    <h2 id="principles-title">Designed around useful information.</h2>
                </div>
                <div className="about-principles__grid">
                    {principles.map((principle) => (
                        <article key={principle.title}>
                            <span>{principle.number}</span>
                            <h3>{principle.title}</h3>
                            <p>{principle.description}</p>
                        </article>
                    ))}
                </div>
            </section>

            <section className="about-ecosystem" aria-labelledby="ecosystem-title">
                <div className="about-ecosystem__heading">
                    <span className="section-kicker section-kicker--light">The DDDP ecosystem</span>
                    <h2 id="ecosystem-title">Different tools. One development picture.</h2>
                    <p>Each platform supports a distinct task while contributing to a more connected district information environment.</p>
                </div>
                <div className="about-ecosystem__grid">
                    <a href="https://dddp.gov.gh/" target="_blank" rel="noopener noreferrer">
                        <span className="about-ecosystem__icon"><MonitoringIcon /></span>
                        <small>Reporting</small><h3>District reporting tool</h3><p>Submit, manage and review development reports.</p>
                        <strong>Open tool <ExternalArrowIcon /></strong>
                    </a>
                    <a href="https://dpat.aoinnovations.org/" target="_blank" rel="noopener noreferrer">
                        <span className="about-ecosystem__icon"><EconomicIcon /></span>
                        <small>Planning & analysis</small><h3>DPAT</h3><p>Explore performance and planning information.</p>
                        <strong>Explore DPAT <ExternalArrowIcon /></strong>
                    </a>
                    <a href="/lisa">
                        <span className="about-ecosystem__icon"><CommunityIcon /></span>
                        <small>Climate resilience</small><h3>LISA</h3><p>Access local forecasts and climate information.</p>
                        <strong>Explore LISA <span aria-hidden="true">→</span></strong>
                    </a>
                </div>
            </section>

            <section className="about-audiences" aria-labelledby="audiences-title">
                <div className="about-audiences__heading">
                    <span className="section-kicker">Who it supports</span>
                    <h2 id="audiences-title">Built for the people shaping district development.</h2>
                </div>
                <div className="about-audiences__grid">
                    {audiences.map((audience) => (
                        <article key={audience.title}>
                            <span>{audience.icon}</span>
                            <div><h3>{audience.title}</h3><p>{audience.description}</p></div>
                        </article>
                    ))}
                </div>
            </section>
        </main>

        <PublicFooter />
    </div>
)

export default About
