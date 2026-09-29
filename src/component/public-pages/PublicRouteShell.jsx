import React from 'react'
import { Link } from 'react-router-dom'
import NavBar from '../header/NavBar'
import PublicFooter from '../footer/PublicFooter'
import ExploreBreadcrumbs from '../explore/components/ExploreBreadcrumbs'
import { ExternalArrowIcon } from '../shared/PortalIcons'
import HeroBackdrop from '../shared/HeroBackdrop'
import './PublicRouteShell.css'

const REPORTING_PLATFORM = { label: 'Operational reporting platform', text: 'Where assemblies submit and review development data.', href: 'https://dddp.gov.gh/' }
const EXPLORE = { label: 'Explore data', text: 'National, regional and district indicators.', to: '/explore' }

const PAGES = {
    'mmda-apr': {
        section: 'Reports',
        title: 'MMDA annual progress reports',
        lead: 'Annual progress reports from Metropolitan, Municipal and District Assemblies on implementing their medium-term development plans. Public access to these reports is being prepared.',
        covers: [
            { title: 'Plan implementation', text: 'Progress on programmes and projects in each assembly\'s development plan.' },
            { title: 'Reports by year', text: 'Browse submitted reports by reporting year.' },
            { title: 'Reports by district', text: 'Find any District / MMDA\'s reports quickly.' },
        ],
        related: [
            { label: 'RCC annual progress reports', text: 'Regional consolidation of district progress.', to: '/apr/rcc' },
            REPORTING_PLATFORM,
        ],
    },
    'rcc-apr': {
        section: 'Reports',
        title: 'RCC annual progress reports',
        lead: 'Regional Coordinating Council reports that consolidate plan implementation across the districts in each region. Public access to these reports is being prepared.',
        covers: [
            { title: 'Regional consolidation', text: 'How each region\'s districts are progressing against their plans.' },
            { title: 'Reports by year', text: 'Browse regional reports by reporting year.' },
            { title: 'Reports by region', text: 'Open the reports for any of Ghana\'s regions.' },
        ],
        related: [
            { label: 'MMDA annual progress reports', text: 'District-level progress reports.', to: '/apr/mmda' },
            REPORTING_PLATFORM,
        ],
    },
}

const ArrowIcon = () => <svg viewBox="0 0 16 16" aria-hidden="true"><path d="M3 8h10M9 4l4 4-4 4" /></svg>

const RelatedCard = ({ item }) => {
    const body = (
        <>
            <span className="route-shell__related-text">
                <strong>{item.label}</strong>
                <span>{item.text}</span>
            </span>
            <span className="route-shell__related-arrow pt-icon" aria-hidden="true">{item.href ? <ExternalArrowIcon /> : <ArrowIcon />}</span>
        </>
    )

    return item.href ? (
        <a className="route-shell__related-card" href={item.href} target="_blank" rel="noopener noreferrer">{body}</a>
    ) : (
        <Link className="route-shell__related-card" to={item.to}>{body}</Link>
    )
}

const PublicRouteShell = ({ page, title }) => {
    const config = PAGES[page] || { section: 'DDDP', title, lead: 'This page is being prepared.', covers: [], related: [EXPLORE] }
    const [primary] = config.related

    return (
        <div className="route-shell">
            <NavBar />
            <main>
                <header className="pt-page-hero route-shell__hero">
                    <HeroBackdrop />
                    <div className="pt-container">
                        <ExploreBreadcrumbs items={[{ label: 'Home', href: '/' }, { label: config.section }, { label: config.title }]} />
                        <span className="pt-eyebrow route-shell__eyebrow"><i aria-hidden="true" /> In preparation</span>
                        <h1>{config.title}</h1>
                        <p className="pt-page-hero__lead">{config.lead}</p>
                        {primary && (
                            <div className="pt-page-hero__actions">
                                {primary.href ? (
                                    <a className="pt-button pt-button--primary" href={primary.href} target="_blank" rel="noopener noreferrer">{primary.label}</a>
                                ) : (
                                    <Link className="pt-button pt-button--primary" to={primary.to}>{primary.label} <ArrowIcon /></Link>
                                )}
                                <Link className="pt-button pt-button--secondary" to="/">Back to home</Link>
                            </div>
                        )}
                    </div>
                </header>

                <section className="pt-section pt-section--compact route-shell__body" aria-label={`${config.title} overview`}>
                    <div className="pt-container route-shell__grid">
                        {config.covers.length > 0 && (
                            <div className="route-shell__covers">
                                <span className="section-kicker">What this page will cover</span>
                                <ol>
                                    {config.covers.map((item, index) => (
                                        <li key={item.title}>
                                            <span aria-hidden="true">{String(index + 1).padStart(2, '0')}</span>
                                            <div>
                                                <h2>{item.title}</h2>
                                                <p>{item.text}</p>
                                            </div>
                                        </li>
                                    ))}
                                </ol>
                            </div>
                        )}
                        <aside className="route-shell__related" aria-label="Available now">
                            <span className="section-kicker">Available now</span>
                            <div className="route-shell__related-list">
                                {config.related.map((item) => <RelatedCard key={item.label} item={item} />)}
                            </div>
                        </aside>
                    </div>
                </section>
            </main>
            <PublicFooter />
        </div>
    )
}

export default PublicRouteShell
