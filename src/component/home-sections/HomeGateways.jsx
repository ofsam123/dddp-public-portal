import React from 'react'
import { Link } from 'react-router-dom'
import { PublicMotionItem, PublicMotionSection } from '../shared/PublicMotion'
import './HomeGateways.css'

const GATEWAY_ICONS = {
    map: <><path d="M9 4L3 6.5v13.5l6-2.5 6 2.5 6-2.5V4l-6 2.5L9 4Z" /><path d="M9 4v13.5" /><path d="M15 6.5V20" /></>,
    chart: <><path d="M4 20V10" /><path d="M10 20V4" /><path d="M16 20v-7" /><path d="M22 20H2" /></>,
    leaf: <><path d="M5 19c0-8 5-13 15-14-1 10-6 15-14 15" /><path d="M5 19l7-7" /></>,
    doc: <><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8l-5-5Z" /><path d="M14 3v5h5" /><path d="M9 13h6" /><path d="M9 17h4" /></>,
}

const HomeGateways = ({ withYear = (path) => path }) => {
    const gateways = [
        { key: 'explore', icon: 'map', tone: 'navy', title: 'Explore data', text: 'Follow projects, programmes and meetings from the national total down to each district.', href: withYear('/explore'), cta: 'Start exploring' },
        { key: 'dpat', icon: 'chart', tone: 'gold', title: 'DPAT performance', text: 'Official final DPAT scores, rankings, regional comparisons and district scorecards.', href: '/dpat/performance-analysis', cta: 'View results' },
        { key: 'lisa', icon: 'leaf', tone: 'green', title: 'LISA climate', text: 'Local forecasts and climate information to support planning in every district.', href: '/lisa', cta: 'Open LISA' },
        { key: 'reports', icon: 'doc', tone: 'slate', title: 'Progress reports', text: 'Annual progress reports from district assemblies and regional coordinating councils.', href: '/apr/mmda', cta: 'Browse reports' },
    ]

    return (
        <PublicMotionSection className="pt-section pt-section--compact home-gateways" aria-labelledby="home-gateways-title">
            <div className="pt-container">
                <PublicMotionItem className="pt-section-head">
                    <div>
                        <span className="section-kicker">One portal</span>
                        <h2 id="home-gateways-title">Everything about district development, in one place</h2>
                    </div>
                </PublicMotionItem>
                <PublicMotionItem className="home-gateways__grid">
                    {gateways.map((gateway) => (
                        <Link className={`home-gateway is-${gateway.tone}`} to={gateway.href} key={gateway.key}>
                            <span className="home-gateway__icon">
                                <svg viewBox="0 0 24 24" aria-hidden="true">{GATEWAY_ICONS[gateway.icon]}</svg>
                            </span>
                            <h3>{gateway.title}</h3>
                            <p>{gateway.text}</p>
                            <span className="home-gateway__cta">
                                {gateway.cta}
                                <svg viewBox="0 0 16 16" aria-hidden="true"><path d="M3 8h10M9 4l4 4-4 4" /></svg>
                            </span>
                        </Link>
                    ))}
                </PublicMotionItem>
            </div>
        </PublicMotionSection>
    )
}

export default HomeGateways
