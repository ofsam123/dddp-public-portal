import React, { useState } from 'react'
import { Carousel, CarouselItem, CarouselControl, CarouselIndicators } from 'reactstrap';
import ImageCarousel1 from '../static/images/img/carousel-1.jpg'
import ImageCarousel2 from '../static/images/img/carousel-2.jpg'
import ImageCarousel3 from '../static/images/img/carousel-3.jpg'

const items = [
    {
        src: ImageCarousel1,
    },
    {
        src: ImageCarousel2,
    },
    {
        src: ImageCarousel3,
    }
];

const Header = () => {
    const [activeIndex, setActiveIndex] = useState(0);
    const [animating, setAnimating] = useState(false);

    const next = () => {
        if (animating) return;
        const nextIndex = activeIndex === items.length - 1 ? 0 : activeIndex + 1;
        setActiveIndex(nextIndex);
    }

    const previous = () => {
        if (animating) return;
        const nextIndex = activeIndex === 0 ? items.length - 1 : activeIndex - 1;
        setActiveIndex(nextIndex);
    }

    const goToIndex = (newIndex) => {
        if (animating) return;
        setActiveIndex(newIndex);
    }

    const slides = items.map((item) => {
        return (
            <CarouselItem
                onExiting={() => setAnimating(true)}
                onExited={() => setAnimating(false)}
                key={item.src}
                style={{ height: '50vh' }}
            >
                <img src={item.src} alt={item.altText} style={{ height: 500, width: '100%', objectFit: 'cover' }} />
            </CarouselItem>
        );
    });
  return (
    <div>
        <Carousel
                activeIndex={activeIndex}
                next={next}
                previous={previous}
                className="carousel-container"
            >
                <CarouselIndicators items={items} activeIndex={activeIndex} onClickHandler={goToIndex} />
                {slides}
                <CarouselControl direction="prev" directionText="Previous" onClickHandler={previous} />
                <CarouselControl direction="next" directionText="Next" onClickHandler={next} />
            </Carousel>
    </div>
  )
}

export default Header