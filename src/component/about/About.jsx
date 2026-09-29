import React from 'react'
import { Link } from 'react-router-dom'
import NavBar from '../header/NavBar'
import PublicFooter from '../footer/PublicFooter'
import ExploreBreadcrumbs from '../explore/components/ExploreBreadcrumbs'
import {
    CommunityIcon,
    EconomicIcon,
    ExternalArrowIcon,
    GovernanceIcon,
    InvestmentIcon,
    MonitoringIcon,
    ServicesIcon,
} from '../shared/PortalIcons'
import { PublicMotionItem, PublicMotionSection } from '../shared/PublicMotion'
import HeroBackdrop from '../shared/HeroBackdrop'
import './About.css'

const ArrowIcon = () => (
    <svg viewBox="0 0 16 16" aria-hidden="true"><path d="M3 8h10M9 4l4 4-4 4" /></svg>
)

const principles = [
    { number: '01', title: 'One shared view', description: 'District development information in one place, so institutions work from the same picture.' },
    { number: '02', title: 'Local context', description: 'District realities stay visible in national planning, reporting and development conversations.' },
    { number: '03', title: 'Useful reporting', description: 'Information that is organised, reviewed and used, not merely collected.' },
    { number: '04', title: 'Connected action', description: 'Districts, institutions and partners coordinating around evidence and shared priorities.' },
]

const flowStages = [
    { number: '01', title: 'Data', text: 'Assemblies report and organise', icon: <MonitoringIcon /> },
    { number: '02', title: 'Insight', text: 'Progress becomes visible', icon: <EconomicIcon /> },
    { number: '03', title: 'Action', text: 'Plans respond together', icon: <CommunityIcon /> },
]

const ecosystem = [
    {
        label: 'Public data',
        title: 'Explore data',
        description: 'National, regional and district indicators for projects, programmes and meetings.',
        cta: 'Explore data',
        to: '/explore',
        icon: <MonitoringIcon />,
    },
    {
        label: 'Performance',
        title: 'DPAT results',
        description: 'Final District Performance Assessment Tool scores, rankings and outcomes.',
        cta: 'See DPAT results',
        to: '/dpat/performance-analysis',
        icon: <EconomicIcon />,
    },
    {
        label: 'Climate resilience',
        title: 'LISA',
        description: 'Local forecasts, climate products and adaptation information for districts.',
        cta: 'Explore LISA',
        to: '/lisa',
        icon: <CommunityIcon />,
    },
    {
        label: 'Reporting',
        title: 'District reporting tool',
        description: 'Where assemblies submit, manage and review development reports.',
        cta: 'Open tool',
        href: 'https://dddp.gov.gh/',
        icon: <GovernanceIcon />,
    },
]

const audiences = [
    { title: 'District assemblies', description: 'Local planning, reporting and monitoring.', icon: <CommunityIcon /> },
    { title: 'National institutions', description: 'Coordination, oversight and policy insight.', icon: <GovernanceIcon /> },
    { title: 'Development partners', description: 'Aligned support and informed collaboration.', icon: <InvestmentIcon /> },
    { title: 'Citizens and service stakeholders', description: 'Understanding local systems, services and needs.', icon: <ServicesIcon /> },
]

const EcosystemCard = ({ item }) => {
    const body = (
        <>
            <span className="about-ecosystem__icon pt-icon" aria-hidden="true">{item.icon}</span>
            <small>{item.label}</small>
            <h3>{item.title}</h3>
            <p>{item.description}</p>
            <strong className="pt-link">{item.cta} {item.href ? <ExternalArrowIcon /> : <ArrowIcon />}</strong>
        </>
    )

    return item.href ? (
        <a className="about-ecosystem__card" href={item.href} target="_blank" rel="noopener noreferrer">{body}</a>
    ) : (
        <Link className="about-ecosystem__card" to={item.to}>{body}</Link>
    )
}

const About = () => (
    <div className="about-page" id="top">
        <NavBar />

        <main>
            <header className="pt-page-hero about-hero">
                <HeroBackdrop />
                <div className="pt-container">
                    <ExploreBreadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'About' }]} />
                    <div className="about-hero__grid">
                        <div className="about-hero__content">
                            <span className="pt-eyebrow"><i aria-hidden="true" /> About DDDP</span>
                            <h1>A shared foundation for better district decisions</h1>
                            <p className="pt-page-hero__lead">
                                The District Development Data Platform brings development data, reporting tools and local insight together, so everyone working on Ghana's districts can see the same picture.
                            </p>
                            <div className="pt-page-hero__actions">
                                <a className="pt-button pt-button--primary" href="#purpose">
                                    Why DDDP exists
                                    <svg viewBox="0 0 16 16" aria-hidden="true"><path d="M8 3v10M4 9l4 4 4-4" /></svg>
                                </a>
                                <Link className="pt-button pt-button--secondary" to="/explore">Explore the data</Link>
                            </div>
                        </div>

                        <div className="about-flow" aria-label="From data to action">
                            <div className="about-flow__top">
                                <span>District development cycle</span>
                                <span className="about-flow__status"><i aria-hidden="true" /> Connected</span>
                            </div>
                            <ol className="about-flow__stages">
                                {flowStages.map((stage) => (
                                    <li key={stage.title}>
                                        <span className="about-flow__icon pt-icon" aria-hidden="true">{stage.icon}</span>
                                        <div>
                                            <small>{stage.number}</small>
                                            <strong>{stage.title}</strong>
                                            <p>{stage.text}</p>
                                        </div>
                                    </li>
                                ))}
                            </ol>
                            <div className="about-flow__footer">
                                <div><span>Shared evidence</span><strong>Clearer priorities</strong></div>
                                <div className="about-flow__bars" aria-hidden="true"><i /><i /><i /><i /><i /></div>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            <PublicMotionSection className="pt-section about-purpose" id="purpose" aria-labelledby="purpose-title">
                <div className="pt-container about-purpose__grid">
                    <PublicMotionItem className="about-purpose__intro">
                        <span className="section-kicker">Why DDDP exists</span>
                        <h2 id="purpose-title">District information is most valuable when people can find it, understand it and act on it</h2>
                    </PublicMotionItem>
                    <PublicMotionItem className="about-purpose__copy">
                        <p>
                            Development information often sits across different institutions, programmes and systems. That makes it hard to see the full district picture, or to coordinate around the same priorities.
                        </p>
                        <p>
                            DDDP is a common digital gateway. It connects data, reporting and specialised platforms so local evidence can support planning, monitoring and collaboration.
                        </p>
                    </PublicMotionItem>
                </div>
            </PublicMotionSection>

            <PublicMotionSection className="pt-section pt-section--tint about-principles" aria-labelledby="principles-title">
                <div className="pt-container">
                    <PublicMotionItem className="pt-section-head">
                        <div>
                            <span className="section-kicker">What guides the platform</span>
                            <h2 id="principles-title">Designed around useful information</h2>
                        </div>
                    </PublicMotionItem>
                    <PublicMotionItem className="about-principles__grid">
                        {principles.map((principle) => (
                            <article className="about-principles__card" key={principle.title}>
                                <span>{principle.number}</span>
                                <h3>{principle.title}</h3>
                                <p>{principle.description}</p>
                            </article>
                        ))}
                    </PublicMotionItem>
                </div>
            </PublicMotionSection>

            <PublicMotionSection className="pt-section about-ecosystem" aria-labelledby="ecosystem-title">
                <div className="pt-container">
                    <PublicMotionItem className="pt-section-head">
                        <div>
                            <span className="section-kicker">The DDDP ecosystem</span>
                            <h2 id="ecosystem-title">Different tools, one development picture</h2>
                            <p>Each platform supports a distinct task while contributing to a more connected district information environment.</p>
                        </div>
                    </PublicMotionItem>
                    <PublicMotionItem className="about-ecosystem__grid">
                        {ecosystem.map((item) => <EcosystemCard key={item.title} item={item} />)}
                    </PublicMotionItem>
                </div>
            </PublicMotionSection>

            <PublicMotionSection className="pt-section pt-section--tint about-audiences" aria-labelledby="audiences-title">
                <div className="pt-container">
                    <PublicMotionItem className="pt-section-head">
                        <div>
                            <span className="section-kicker">Who it supports</span>
                            <h2 id="audiences-title">Built for the people shaping district development</h2>
                        </div>
                    </PublicMotionItem>
                    <PublicMotionItem className="about-audiences__grid">
                        {audiences.map((audience) => (
                            <article key={audience.title}>
                                <span className="pt-icon" aria-hidden="true">{audience.icon}</span>
                                <div><h3>{audience.title}</h3><p>{audience.description}</p></div>
                            </article>
                        ))}
                    </PublicMotionItem>
                </div>
            </PublicMotionSection>
        </main>

        <PublicFooter />
    </div>
)

export default About
