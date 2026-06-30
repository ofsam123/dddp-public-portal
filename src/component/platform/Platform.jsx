import React from 'react'
import dcatPlatformImage from '../static/images/img/dcact-platform.png'
import dpatPlatformImage from '../static/images/img/dpat-platform.png'
import lisaPlatformImage from '../static/images/img/lisa-platform.png'


const cardData = [
    { title: 'LISA PLATFORM', imgSrc: lisaPlatformImage, description: 'Boosting green employment and enterprise opportunities in Ghana (GrEEn) Project.' },
    { title: 'DPAT PLATFORM', imgSrc: dpatPlatformImage, description: 'Contrary to popular fact that a reader will be distracted by the readable when looking at its layout content of a page.' },
    { title: 'DCACT PLATFORM', imgSrc: dcatPlatformImage, description: 'There are established fact that a reader will be distracted by the readable content of a page when looking at its layout.' },
];

const Platform = () => {
    return (
        <div style={{marginTop: '10rem'}}>
            <div className="container" style={{marginTop: '3rem', width: '80%'}}>
                <div className="row">
                    {cardData.map((card, index) => (
                        <div className="col-md-4" key={index} style={{marginBottom: '2rem'}}>
                            <div className="card" style={{display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', width: '340px', height: '300px', boxShadow: 'rgba(0, 0, 0, 0.1) 0px 20px 25px -5px, rgba(0, 0, 0, 0.04) 0px 10px 10px -5px', border: '1px solid white'}}>
                                <img src={card.imgSrc} alt={card.title} className="card-img-top" style={{width: '40%', height: 'auto'}}/>
                                <div className="card-body" style={{display: 'flex', color: '#0B6000', flexDirection: 'column', justifyContent: 'center', alignItems: 'center'}}>
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

export default Platform