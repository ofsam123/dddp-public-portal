import React from 'react'
import economicImage from '../static/images/img/economic.png'
import socialImage from '../static/images/img/social.png'
import infrastructureImage from '../static/images/img/infrastructure.png'
import governanceImage from '../static/images/img/governance.png'
import emergencyImage from '../static/images/img/emergency.png'
import monitoringImage from '../static/images/img/monitoring.png'
import './Dimensions.css'

const cardData = [
    { title: 'Econimic Development', imgSrc: economicImage },
    { title: 'Social Development', imgSrc: socialImage, },
    { title: 'Environmental, Infrstructure & Human Settlement', imgSrc: infrastructureImage, },
    { title: 'Governance, Corruption & Public Administration', imgSrc: governanceImage },
    { title: 'Emergency Planning & Preparedness', imgSrc: emergencyImage, },
    { title: 'Implementation, Coordination, Monitoring & Evaluation', imgSrc: monitoringImage },
];

const Dimensions = () => {
    return (
        <div style={{ width: '80%', margin: '0 auto', marginTop: '5rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', color: '#0B6000' }}>
                <p style={{ padding: '5px 15px', fontWeight: '500', background: 'linear-gradient(to left, #fff 2.23%, #eff1fd 97.21%)' }}>DIMENSIONS</p>
                <h1>Development Dimensions</h1>
                <p style={{fontSize: '1.3rem'}}>
                    Bleeding about only a quid blower I don't want no agro bleeding chimney pot burke
                    tosser cras nice one boot fanny.!
                </p>
            </div>

            <div className="container" style={{ marginTop: '3rem', width: '100%' }}>
                <div className="row">
                    {cardData.map((card, index) => (
                        <div className="col-md-4" key={index} style={{ marginBottom: '2rem' }}>
                            <div className="card dimension-card" style={{
                                display: 'flex', flexDirection: 'column', alignItems: 'flex-start', padding: '1rem 0 0 2rem', width: '330px', height: '150px',
                                boxShadow: 'rgba(100, 100, 111, 0.2) 0px 7px 29px 0px', border: '1px solid white'
                            }}>
                                <h5 className="card-title dimension-card-title" style={{ marginBottom: '1.5rem' }}>{card.title}</h5>
                                <img src={card.imgSrc} alt={card.title} className="card-img-top"
                                    style={{ width: '12%', height: 'auto' }} />
                            </div>
                        </div>

                    ))}
                </div>
            </div>
        </div>
    )
}

export default Dimensions