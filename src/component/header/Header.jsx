import React from 'react'
import { Link } from 'react-router-dom'
import { ExternalArrowIcon } from '../shared/PortalIcons'
import HeroGeoVisual from './HeroGeoVisual'
import './Header.css'

const Header = ({ exploreHref = '/explore' }) => {
    return (
        <section className="portal-hero" aria-labelledby="portal-hero-title">
            <div className="portal-hero__inner">
                <div className="portal-hero__content">
                    <span className="portal-hero__eyebrow">
                        <span className="portal-hero__badge-dot" aria-hidden="true" /> Public DDDP portal
                    </span>
                    <h1 id="portal-hero-title">
                        Understand development across Ghana's districts.
                    </h1>
                    <p>
                        Explore public development information across Ghana, from national trends to regional and district-level activity.
                    </p>
                    <div className="portal-hero__actions">
                        <Link className="portal-button portal-button--primary" to={exploreHref}>
                            Explore public information <span aria-hidden="true">-&gt;</span>
                        </Link>
                        <a
                            className="portal-button portal-button--secondary"
                            href="https://dddp.gov.gh/"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            Open reporting platform
                            <span className="portal-button__icon" aria-hidden="true"><ExternalArrowIcon /></span>
                        </a>
                    </div>
                </div>

                <div className="portal-hero__visual">
                    <HeroGeoVisual />
                </div>
            </div>
        </section>
    )
}

export default Header
