import React from 'react'
import kfw from '../static/images/img/KFW.png'
import giz from '../static/images/img/giz.jpg'
import green from '../static/images/img/green.png'
import modernized from '../static/images/img/modernized.png'
import german from '../static/images/img/german-cooperation.jpg'
import './Partner.css'

const partners = [
    { name: 'KfW', image: kfw },
    { name: 'GIZ', image: giz },
    { name: 'GrEEn', image: green },
    { name: 'Modernizing Agriculture in Ghana', image: modernized },
    { name: 'German Cooperation', image: german },
]

const Partner = () => (
    <section className="partners-section" aria-labelledby="partners-title">
        <div className="partners-section__heading">
            <span className="section-kicker">Working together</span>
            <h2 id="partners-title">Development partners</h2>
        </div>
        <div className="partners-row">
            {partners.map((partner) => (
                <div className="partner-logo" key={partner.name}>
                    <img src={partner.image} alt={partner.name} />
                </div>
            ))}
        </div>
    </section>
)

export default Partner
