import React from 'react'
import civilServiceLogo from '../static/images/img/feedback-civil-service.png'
import ministryLogo from '../static/images/img/feedback-MLGDRD.png'
import ndpcLogo from '../static/images/img/feedback-NDPC.png'
import './Feedback.css'

const institutions = [
    { name: 'Civil Service', role: 'Public-sector coordination', image: civilServiceLogo },
    { name: 'Local Government', role: 'District planning and delivery', image: ministryLogo },
    { name: 'NDPC', role: 'National development planning', image: ndpcLogo },
]

const Feedback = () => (
    <section className="institutions-section" aria-labelledby="institutions-title">
        <div className="institutions-section__inner">
            <div className="institutions-section__content">
                <span className="section-kicker section-kicker--light">Connected institutions</span>
                <h2 id="institutions-title">Better decisions begin with shared information.</h2>
                <p>
                    DDDP creates a common data environment for national institutions, district assemblies and development partners.
                </p>
                <a href="/about">Learn how DDDP works <span aria-hidden="true">→</span></a>
            </div>

            <div className="institutions-list">
                {institutions.map((institution, index) => (
                    <article key={institution.name}>
                        <span className="institutions-list__number">0{index + 1}</span>
                        <span className="institutions-list__logo">
                            <img src={institution.image} alt={`${institution.name} logo`} />
                        </span>
                        <div><h3>{institution.name}</h3><p>{institution.role}</p></div>
                    </article>
                ))}
            </div>
        </div>
    </section>
)

export default Feedback
