import React from 'react'
import { Link } from 'react-router-dom'
import { ExternalArrowIcon } from '../shared/PortalIcons'
import PortalLogo from '../shared/PortalLogo'
import './PublicFooter.css'

const REPORTING_URL = 'https://dddp.gov.gh/'

const PublicFooter = ({ withYear = (path) => path, showCta = true }) => {
    const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' })

    return (
        <footer className="site-footer">
            {showCta && (
                <section className="site-footer__cta-wrap pt-container" aria-labelledby="site-footer-cta-title">
                    <div className="site-footer__cta">
                        <div>
                            <span className="section-kicker">Start exploring</span>
                            <h2 id="site-footer-cta-title">Put district development data to work</h2>
                            <p>Follow activity from the national picture down to every district, compare performance, and open the reporting platform when you need to submit or review data.</p>
                        </div>
                        <div className="site-footer__cta-actions">
                            <Link className="pt-button pt-button--primary" to={withYear('/explore')}>Explore data</Link>
                            <Link className="pt-button pt-button--secondary" to="/dpat/performance-analysis">DPAT Performance</Link>
                        </div>
                    </div>
                </section>
            )}

            <div className="site-footer__main pt-container">
                <div className="site-footer__brand">
                    <PortalLogo variant="footer" />
                    <p>The public gateway to district development information in Ghana: development activity, district performance, climate information and updates in one place.</p>
                    <address>Ministries, Accra, Ghana</address>
                </div>

                <nav className="site-footer__column" aria-label="Explore">
                    <h3>Explore</h3>
                    <Link to={withYear('/explore')}>Explore data</Link>
                    <Link to={withYear('/explore/ghana')}>Ghana overview</Link>
                    <Link to="/dpat/performance-analysis">DPAT performance analysis</Link>
                    <Link to="/data-statistics/development-dimension">Development dimension</Link>
                </nav>

                <nav className="site-footer__column" aria-label="Resources">
                    <h3>Resources</h3>
                    <Link to="/climate">LISA climate information</Link>
                    <Link to="/all-forcast">Forecast history</Link>
                    <Link to="/updates">Events</Link>
                    <Link to="/apr/mmda">Annual progress reports</Link>
                </nav>

                <nav className="site-footer__column" aria-label="Platform">
                    <h3>Platform</h3>
                    <Link to="/about">About DDDP</Link>
                    <Link to="/dpat/assessment">DPAT assessment</Link>
                    <a href={REPORTING_URL} target="_blank" rel="noopener noreferrer">
                        Reporting platform <ExternalArrowIcon />
                    </a>
                </nav>
            </div>

            <div className="site-footer__bottom">
                <div className="pt-container">
                    <span>&copy; {new Date().getFullYear()} District Development Data Platform. Republic of Ghana.</span>
                    
                    <span>&copy;  Developed by AO HOLDINGS</span>
                    <button type="button" onClick={scrollToTop}>
                        Back to top
                        <svg viewBox="0 0 12 12" aria-hidden="true"><path d="M6 10V2M2.5 5.5L6 2l3.5 3.5" /></svg>
                    </button>
                </div>
            </div>
        </footer>
    )
}

export default PublicFooter
