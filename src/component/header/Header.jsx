import React from 'react'
import { ExternalArrowIcon } from '../shared/PortalIcons'
import './Header.css'

const Header = () => {
    return (
        <section className="portal-hero" aria-labelledby="portal-hero-title">
            <div className="portal-hero__glow portal-hero__glow--one" />
            <div className="portal-hero__glow portal-hero__glow--two" />

            <div className="portal-hero__inner">
                <div className="portal-hero__content">
                    <span className="portal-hero__eyebrow">
                        <span aria-hidden="true" /> Ghana's district data gateway
                    </span>
                    <h1 id="portal-hero-title">
                        Turning district data into <em>better decisions.</em>
                    </h1>
                    <p>
                        Explore trusted development information, understand local progress and connect to the tools that support planning across Ghana.
                    </p>
                    <div className="portal-hero__actions">
                        <a className="portal-button portal-button--primary" href="#platforms">
                            Explore the platforms <span aria-hidden="true">→</span>
                        </a>
                        <a
                            className="portal-button portal-button--secondary"
                            href="https://dddp.gov.gh/"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            Open reporting tool
                            <span className="portal-button__icon"><ExternalArrowIcon /></span>
                        </a>
                    </div>
                    <div className="portal-hero__trust">
                        <div className="portal-hero__avatars" aria-hidden="true">
                            <span>DA</span><span>ND</span><span>LG</span>
                        </div>
                        <p><strong>One connected platform</strong><br />for districts, institutions and partners</p>
                    </div>
                </div>

                <div className="portal-hero__visual" aria-label="Illustrative district data dashboard">
                    <div className="data-window">
                        <div className="data-window__topbar">
                            <div>
                                <span className="data-window__label">District snapshot</span>
                                <strong>Development overview</strong>
                            </div>
                            <span className="data-window__status"><i /> Live data</span>
                        </div>

                        <div className="data-window__metrics">
                            <div><span>Districts</span><strong>261</strong><small>Nationwide</small></div>
                            <div><span>Data areas</span><strong>06</strong><small>Connected</small></div>
                            <div><span>Reporting</span><strong>24/7</strong><small>Access</small></div>
                        </div>

                        <div className="data-window__chart">
                            <div className="data-window__chart-heading">
                                <div><span>District reporting activity</span><strong>Growing participation</strong></div>
                                <span>Jan — Jun</span>
                            </div>
                            <div className="data-window__bars" aria-hidden="true">
                                {[42, 58, 49, 70, 78, 91].map((height, index) => (
                                    <div key={index}><span style={{ height: `${height}%` }} /></div>
                                ))}
                            </div>
                            <div className="data-window__months" aria-hidden="true">
                                <span>Jan</span><span>Feb</span><span>Mar</span><span>Apr</span><span>May</span><span>Jun</span>
                            </div>
                        </div>
                    </div>

                    <div className="data-float data-float--top">
                        <span className="data-float__icon">✓</span>
                        <div><strong>Reports updated</strong><small>District submissions</small></div>
                    </div>
                    <div className="data-float data-float--bottom">
                        <span className="data-float__pulse" />
                        <div><strong>National coverage</strong><small>Across all 16 regions</small></div>
                    </div>
                </div>
            </div>
        </section>
    )
}

export default Header
