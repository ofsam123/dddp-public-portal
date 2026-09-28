import React from 'react'
import { Link } from 'react-router-dom'
import ministryLogo from '../static/images/img/feedback-MLGDRD.png'
import ndpcLogo from '../static/images/img/feedback-NDPC.png'
import gssLogo from '../static/images/img/GSS.jpg'
import ohlgsLogo from '../static/images/img/OHLGS.jpg'
import { ExternalArrowIcon } from '../shared/PortalIcons'
import { PublicMotionItem, PublicMotionSection } from '../shared/PublicMotion'
import './Feedback.css'

const institutions = [
    { name: 'Local Government', role: 'District planning and delivery', image: ministryLogo },
    { name: 'NDPC', role: 'National development planning', image: ndpcLogo },
    { name: 'GSS', role: 'Official statistics and data standards', image: gssLogo },
    { name: 'MMDAs', role: 'Local data collection and service delivery', acronym: 'MMDA' },
    { name: 'RCCs', role: 'Regional coordination and oversight', acronym: 'RCC' },
    { name: 'OHLGS', role: 'Local government service administration', image: ohlgsLogo },
]

const Feedback = () => (
    <PublicMotionSection className="institutions-section" aria-labelledby="institutions-title">
        <div className="institutions-section__inner">
            <PublicMotionItem className="institutions-section__content">
                <span className="section-kicker">Institutional context</span>
                <h2 id="institutions-title">Public information and operational reporting, clearly connected.</h2>
                <p>
                    The public portal presents approved aggregate information, while the DDDP reporting platform supports institutional data submission and review.
                </p>
                <div className="institutions-section__actions">
                    <Link to="/about">About DDDP <span aria-hidden="true">-&gt;</span></Link>
                    <a href="https://dddp.gov.gh/" target="_blank" rel="noopener noreferrer">
                        Reporting platform <span aria-hidden="true"><ExternalArrowIcon /></span>
                    </a>
                </div>
            </PublicMotionItem>

            <PublicMotionItem className="institutions-list" aria-label="Institutions connected through DDDP">
                {institutions.map((institution) => (
                    <article key={institution.name}>
                        <span className="institutions-list__logo">
                            {institution.image
                                ? <img src={institution.image} alt={`${institution.name} logo`} loading="lazy" decoding="async" />
                                : <span className="institutions-list__acronym" aria-hidden="true">{institution.acronym}</span>}
                        </span>
                        <div><h3>{institution.name}</h3><p>{institution.role}</p></div>
                    </article>
                ))}
            </PublicMotionItem>
        </div>
    </PublicMotionSection>
)

export default Feedback
