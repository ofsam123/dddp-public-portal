import React from 'react'
import { Link } from 'react-router-dom'
import DDDPlogo from '../static/images/img/dddp-clean-logo.png'
import { ExternalArrowIcon } from '../shared/PortalIcons'
import './PublicFooter.css'

const PublicFooter = () => (
    <footer className="public-footer">
        <div className="public-footer__cta">
            <div><span>Ready to work with district data?</span><h2>Turn information into better local decisions.</h2></div>
            <a href="https://dddp.gov.gh/" target="_blank" rel="noopener noreferrer">
                Open reporting tool <span className="public-footer__cta-icon"><ExternalArrowIcon /></span>
            </a>
        </div>

        <div className="public-footer__main">
            <div className="public-footer__brand">
                <Link className="public-footer__logo" to="/" aria-label="DDDP home">
                    <img src={DDDPlogo} alt="District Development Data Platform" />
                </Link>
                <p>A shared gateway to district development information, planning tools and public reporting across Ghana.</p>
            </div>
            <div className="public-footer__column">
                <h3>Explore</h3>
                <a href="/#platforms">Platforms</a><a href="/#development">Development areas</a><a href="/#insights">Insights</a><Link to="/lisa">LISA</Link>
            </div>
            <div className="public-footer__column">
                <h3>Platforms</h3>
                <a href="https://dddp.gov.gh/" target="_blank" rel="noopener noreferrer">Reporting tool</a>
                <a href="https://dpat.aoinnovations.org/" target="_blank" rel="noopener noreferrer">DPAT</a>
                <Link to="/climate">Climate information</Link>
            </div>
            <div className="public-footer__column">
                <h3>Contact</h3>
                <p>Ministries, Accra<br />Ghana</p>
                <Link to="/about">About DDDP</Link>
            </div>
        </div>

        <div className="public-footer__bottom">
            <span>&copy; {new Date().getFullYear()} District Development Data Platform</span>
            <a href="#top">Back to top <span aria-hidden="true">&uarr;</span></a>
        </div>
    </footer>
)

export default PublicFooter
