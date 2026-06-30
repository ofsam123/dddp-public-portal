import React from 'react'
import './Feedback.css'
import { Carousel } from 'react-responsive-carousel';
import "react-responsive-carousel/lib/styles/carousel.min.css";

import feebackImage1 from '../static/images/img/feedback-civil-service.png'
import feebackImage2 from '../static/images/img/feedback-MLGDRD.png'
import feebackImage3 from '../static/images/img/feedback-NDPC.png'


const Feedback = () => {
    const newsData = [
        { title: 'Civil Service', description: 'They bring to you a host of beautifully created infographics that contains the latest digital marketing.', image: feebackImage1, rating: 5 },
        { title: 'MLGDRD', description: 'They bring to you a host of beautifully created infographics that contains the latest digital marketing.', image: feebackImage2, rating: 5 },
        { title: 'NDPC', description: 'They bring to you a host of beautifully created infographics that contains the latest digital marketing.', image: feebackImage3, rating: 5 },
    ];

    const cards = newsData.map((news, i) => (
        <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#fff', height: '200px', width: '60%', margin: '2.5%' }}>
            <div style={{ display: 'flex', flexDirection: 'row', marginLeft: '-50px' }}>
                <img src={news.image} alt='' style={{ width: '100px', height: 'auto', backgroundColor: 'transparent' }} />
            </div>
            <div>
                <div style={{ paddingLeft: '2rem', paddingRight: '2rem', textAlign: 'left' }}>
                    <div style={{ display: 'flex', flexDirection: 'row', color: 'green' }}>
                        {Array(news.rating).fill().map((_, i) =>
                            <svg key={i} xmlns="http://www.w3.org/2000/svg" fill="currentColor" className="bi bi-star-fill" viewBox="0 0 16 16" style={{ width: '1em', height: '1em' }}>
                                <path d="M3.612 15.443c-.386.198-.824-.149-.746-.592l.83-4.73L.173 6.765c-.329-.314-.158-.888.283-.95l4.898-.696L7.538.792c.197-.39.73-.39.927 0l2.184 4.327 4.898.696c.441.062.612.636.283.95l-3.523 3.356.83 4.73c.078.443-.36.79-.746.592L8 13.187l-4.389 2.256z" />
                            </svg>
                        )}
                    </div>
                    <div style={{ color: '#95A5A6', fontSize: '1rem', marginTop: '1rem' }}>
                        {news.description}
                    </div>
                    <div style={{ marginTop: '1.5rem', fontWeight: 'bold' }}>{news.title}</div>
                </div>
            </div>
        </div>
    ));

    return (
        <div className='feedback-main'>
            <p style={{ marginLeft: '10rem' }}>Stakeholders Feedback</p>
            <div className='news-main' style={{ width: '80%', margin: '0 auto', marginBottom: '10rem' }}>
                <Carousel autoPlay transitionTime={1000} infiniteLoop showThumbs={false} showStatus={false} showIndicators={false} dynamicHeight={false} centerMode centerSlidePercentage={50} emulateTouch>
                    {cards}
                </Carousel>
            </div>
        </div>
    )
}


export default Feedback