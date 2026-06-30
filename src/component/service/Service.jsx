import React from 'react'
import './Service.css'

import serviceImage1 from '../static/images/img/service1.png'
import serviceImage2 from '../static/images/img/service2.png'
import serviceImage3 from '../static/images/img/service3.png'
import serviceImage4 from '../static/images/img/service4.png'
import serviceImage5 from '../static/images/img/service5.png'
import serviceImage6 from '../static/images/img/service6.png'


const cardData = [
    { title: 'Agriculture Value Chain Actors', imgSrc: serviceImage1, description: 'Excepteur sint occaecat cupidatat non proident, lorem ispun dolor amet lorem ipsum dolor' },
    { title: 'Service Providers', imgSrc: serviceImage2, description: 'Excepteur sint occaecat cupidatat non proident, lorem ispun dolor amet lorem ipsum dolor' },
    { title: 'Financial & Marketing Services', imgSrc: serviceImage3, description: 'Excepteur sint occaecat cupidatat non proident, lorem ispun dolor amet lorem ipsum dolor' },
    { title: 'Regulators', imgSrc: serviceImage4, description: 'Excepteur sint occaecat cupidatat non proident, lorem ispun dolor amet lorem ipsum dolor' },
    { title: 'Government Flagship Program', imgSrc: serviceImage5, description: 'Excepteur sint occaecat cupidatat non proident, lorem ispun dolor amet lorem ipsum dolor' },
    { title: 'Investment Opportunity', imgSrc: serviceImage6, description: 'Excepteur sint occaecat cupidatat non proident, lorem ispun dolor amet lorem ipsum dolor' },
];

const Service = () => {
    return (
        <div style={{ marginTop: '10rem' }}>
            <div className="container" style={{ marginTop: '3rem', width: '80%' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', color: '#0B6000', marginBottom: '4rem' }}>
                    <p style={{ padding: '5px 15px', fontWeight: '500', background: 'linear-gradient(to left, #fff 2.23%, #eff1fd 97.21%)' }}>OUR SERVICES</p>
                    <h1>OUR SERVICES</h1>
                </div>
                <div className="row">
                    {cardData.map((card, index) => (
                        <div className="col-md-4" key={index} style={{ marginBottom: '2rem' }}>
                            <div className="card card-style" style={{
                                position: 'relative', display: 'flex', flexDirection: 'column', width: '350px', height: '250px',
                                boxShadow: 'rgba(100, 100, 111, 0.2) 0px 7px 29px 0px',
                                
                            }}>
                                <img src={card.imgSrc} alt={card.title} className="card-img-top" style={{ position: 'absolute', top: '0', left: '0', width: '25%', height: 'auto' }} />
                                <div className="card-body" style={{ display: 'flex', color: '#0B6000', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', marginTop: '2rem' }}>
                                    <h3 className="card-title">{card.title}</h3>
                                    <p className="card-text">{card.description}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

export default Service