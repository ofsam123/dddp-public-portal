import React from 'react'
import kfw from '../static/images/img/KFW.png'
import giz from '../static/images/img/giz.jpg'
import green from '../static/images/img/green.png'
import modernized from '../static/images/img/modernized.png'
import uncdf from '../static/images/img/Uncdf.png'
import './PartnerAcknowledgement.css'

const partners = [
    { name: 'KfW', image: kfw, width: 216, height: 91, shape: 'standard' },
    { name: 'GIZ', image: giz, width: 473, height: 112, shape: 'wide' },
    { name: 'GrEEn', image: green, width: 388, height: 91, shape: 'wide' },
    { name: 'Modernizing Agriculture in Ghana', image: modernized, width: 235, height: 166, shape: 'portrait' },
    { name: 'UNCDF', image: uncdf, width: 404, height: 394, shape: 'square' },
]

const PartnerAcknowledgement = () => (
    <div className="partner-acknowledgement" aria-labelledby="partner-acknowledgement-title">
        <span id="partner-acknowledgement-title">In collaboration with</span>
        <div className="partner-acknowledgement__logos" role="list">
            {partners.map((partner) => (
                <div role="listitem" key={partner.name} className={`partner-acknowledgement__logo partner-acknowledgement__logo--${partner.shape}`}>
                    <img
                        src={partner.image}
                        alt={partner.name}
                        width={partner.width}
                        height={partner.height}
                        loading="lazy"
                        decoding="async"
                    />
                </div>
            ))}
        </div>
    </div>
)

export default PartnerAcknowledgement
