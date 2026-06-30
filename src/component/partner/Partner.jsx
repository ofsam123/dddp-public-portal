import React from 'react'
import { Carousel } from 'react-responsive-carousel';
import "react-responsive-carousel/lib/styles/carousel.min.css";

import kfw from '../static/images/img/KFW.png'
import giz from '../static/images/img/giz.jpg'
import green from '../static/images/img/green.png'
import modernized from '../static/images/img/modernized.png'
import german from '../static/images/img/german-cooperation.jpg'



const Partner = () => {

    const newsData = [
        { image: kfw },
        { image: giz },
        { image: green },
        { image: modernized },
        { image: german },
    ];

    const cards = newsData.map((news, i) => (
        <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '2.5%' }}>
            <div style={{ display: 'flex', flexDirection: 'row', gap: '20px' }}>
                <img src={news.image} alt='' style={{ width: '150px', height: 'auto', backgroundColor: 'transparent', marginRight: '2rem' }} />
            </div>
        </div>
    ));
    return (
        <div>
            <p style={{fontSize: '4rem', color: '#0B6000', marginBottom: '5rem', marginLeft: '10rem'}}>Partners</p>
            <div style={{ width: '80%', margin: '0 auto', marginBottom: '10rem' }}>
                <Carousel autoPlay transitionTime={1000} infiniteLoop showThumbs={false} showStatus={false} showIndicators={false} dynamicHeight={false} centerMode centerSlidePercentage={25} emulateTouch>
                    {cards}
                </Carousel>
            </div>
        </div>
    )
}

export default Partner