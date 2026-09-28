import React from 'react'
import NavBar from '../../header/NavBar'
import LocalInformation from '../information/LocalInformation'
import LisaForecastPreview from './LisaForecastPreview'
import HomeUpdates from '../../updates/HomeUpdates'
import PublicFooter from '../../footer/PublicFooter'
import UncdfLogo from '../../static/images/img/Uncdf.png'
import {
    AgricultureIcon,
    CommunityIcon,
    EmergencyIcon,
    ExternalArrowIcon,
    MonitoringIcon,
} from '../../shared/PortalIcons'
import './LisaHome.css'

const LisaHome = () => (
    <div className="lisa-page" id="top">
        <NavBar />

        <main>
            <section className="lisa-hero">
                <div className="lisa-hero__inner">
                    <div className="lisa-hero__content">
                        <span className="lisa-hero__kicker"><i /> Local climate intelligence</span>
                        <h1>Climate information built around <em>local decisions.</em></h1>
                        <p>
                            LISA helps communities and local authorities access practical forecasts and climate information for planning, adaptation and resilience.
                        </p>
                        <div className="lisa-hero__actions">
                            <a href="#forecast">Check local forecast <span aria-hidden="true">↓</span></a>
                            <a href="/lisa-overview">Discover LISA <span aria-hidden="true">→</span></a>
                        </div>
                        <div className="lisa-hero__note"><span>Built for local action</span><span>Powered by trusted climate information</span></div>
                    </div>

                    <div className="climate-window" aria-label="Climate information overview illustration">
                        <div className="climate-window__header"><span>Local climate outlook</span><i>Live information</i></div>
                        <div className="climate-window__signal">
                            <div className="climate-window__sun"><i /><span /></div>
                            <div><small>Climate signal</small><strong>Plan with confidence</strong><p>Forecasts and bulletins for local action</p></div>
                        </div>
                        <div className="climate-window__grid">
                            <article><span><AgricultureIcon /></span><small>Agriculture</small><strong>Seasonal insight</strong></article>
                            <article><span><EmergencyIcon /></span><small>Preparedness</small><strong>Risk awareness</strong></article>
                            <article><span><MonitoringIcon /></span><small>Planning</small><strong>Local evidence</strong></article>
                        </div>
                        <div className="climate-window__footer"><i /><span>Supporting climate-resilient communities</span></div>
                    </div>
                </div>
            </section>

            <LisaForecastPreview />

            <section className="lisa-story" aria-labelledby="lisa-story-title">
                <div className="lisa-story__content">
                    <span className="lisa-kicker">About LISA</span>
                    <h2 id="lisa-story-title">Turning climate knowledge into local resilience.</h2>
                    <p>
                        The Local-based Information System for climate change Adaptation makes climate information easier to access and use at the local level. It supports authorities and communities as they identify risks, plan investments and strengthen resilience.
                    </p>
                    <a href="/lisa-overview">Read the LISA overview <span aria-hidden="true">→</span></a>
                </div>
                <div className="lisa-story__features">
                    <article><span><CommunityIcon /></span><div><h3>Locally relevant</h3><p>Information organised around the places and communities making decisions.</p></div></article>
                    <article><span><AgricultureIcon /></span><div><h3>Practical climate insight</h3><p>Forecasts and bulletins that support livelihoods, services and local planning.</p></div></article>
                    <article><span><EmergencyIcon /></span><div><h3>Resilience focused</h3><p>Better awareness of climate risk and stronger preparation for local action.</p></div></article>
                </div>
            </section>

            <section className="local-facility" aria-labelledby="local-facility-title">
                <div className="local-facility__mark"><span>LoCAL</span><small>Climate adaptive living</small></div>
                <div className="local-facility__content">
                    <span className="lisa-kicker lisa-kicker--light">The wider programme</span>
                    <h2 id="local-facility-title">Connecting climate adaptation with local planning and finance.</h2>
                    <p>
                        The Local Climate Adaptive Living Facility helps integrate climate change into local planning and budgeting, strengthen local capacity and increase investment in climate-resilient communities.
                    </p>
                    <a href="/local-overview">Learn about LoCAL <span aria-hidden="true">→</span></a>
                </div>
            </section>

            <section className="uncdf-section" aria-labelledby="uncdf-title">
                <div className="uncdf-section__logo"><img src={UncdfLogo} alt="United Nations Capital Development Fund" /></div>
                <div>
                    <span className="lisa-kicker">Programme partner</span>
                    <h2 id="uncdf-title">UNCDF in Ghana</h2>
                    <p>
                        UNCDF uses finance and investment tools to support development where needs are greatest. In Ghana, its work includes local transformative finance and inclusive digital economies, helping create stronger pathways for sustainable local development.
                    </p>
                    <a href="/lisa-overview">Explore the partnership <span className="uncdf-section__link-icon"><ExternalArrowIcon /></span></a>
                </div>
            </section>

            <LocalInformation />
            <HomeUpdates />
        </main>

        <PublicFooter />
    </div>
)

export default LisaHome
