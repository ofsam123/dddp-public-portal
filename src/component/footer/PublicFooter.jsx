import React from 'react'
import { Link } from 'react-router-dom'
import { ExternalArrowIcon } from '../shared/PortalIcons'
import PortalLogo from '../shared/PortalLogo'
import './PublicFooter.css'

const PublicFooter = ({ withYear = (path) => path }) => (
    <footer className="public-footer">
        <div className="public-footer__main">
            <div className="public-footer__brand">
                <PortalLogo variant="footer" />
                <p>A public gateway to district development information, LISA climate content, updates and approved resources across Ghana.</p>
            </div>
            <div className="public-footer__column">
                <h3>Public data</h3>
                <Link to={withYear('/explore')}>Explore Data</Link>
                <Link to={withYear('/explore/ghana')}>Ghana overview</Link>
                <a href="/#reports-resources">Reports &amp; Resources</a>
                <Link to="/updates">Updates</Link>
            </div>
            <div className="public-footer__column">
                <h3>Services</h3>
                <Link to="/lisa">LISA climate information</Link>
                <Link to="/all-forcast">Forecast history</Link>
                <a href="https://dddp.gov.gh/" target="_blank" rel="noopener noreferrer">
                    Reporting platform <span aria-hidden="true"><ExternalArrowIcon /></span>
                </a>
            </div>
            <div className="public-footer__column">
                <h3>About</h3>
                <Link to="/about">About DDDP</Link>
                <p>Ministries, Accra<br />Ghana</p>
            </div>
        </div>

        <div className="public-footer__bottom">
            <span>&copy; {new Date().getFullYear()} District Development Data Platform</span>
            <a href="#top">Back to top <span aria-hidden="true">&uarr;</span></a>
        </div>
    </footer>
)

export default PublicFooter
