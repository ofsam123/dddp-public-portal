import React, { useState } from 'react'
import TestimonyImage1 from '../static/images/img/testimonial-1.jpg'
import TestimonyImage2 from '../static/images/img/testimonial-2.jpg'
import TestimonyImage3 from '../static/images/img/testimonial-3.jpg'

// const items = [
//     {
//         src: TestimonyImage1,
//     },
//     {
//         src: TestimonyImage2,
//     },
//     {
//         src: TestimonyImage3,
//     }
// ];

const Testimonial = () => {
    // const [activeIndex, setActiveIndex] = useState(0);
    // const [animating, setAnimating] = useState(false);

    // const next = () => {
    //     if (animating) return;
    //     const nextIndex = activeIndex === items.length - 1 ? 0 : activeIndex + 1;
    //     setActiveIndex(nextIndex);
    // }

    // const previous = () => {
    //     if (animating) return;
    //     const nextIndex = activeIndex === 0 ? items.length - 1 : activeIndex - 1;
    //     setActiveIndex(nextIndex);
    // }

    // const goToIndex = (newIndex) => {
    //     if (animating) return;
    //     setActiveIndex(newIndex);
    // }

    // const slides = items.map((item) => {
    //     return (
    //         <CarouselItem
    //             onExiting={() => setAnimating(true)}
    //             onExited={() => setAnimating(false)}
    //             key={item.src}
    //             style={{height: '50vh'}}
    //         >
    //             <img src={item.src} alt={item.altText} style={{height: 500, width: '100%', objectFit: 'cover'}}/>
    //             <CarouselCaption captionText={item.caption} captionHeader={item.caption} />
    //         </CarouselItem>
    //     );
    // });


    return (
        <div class="container-xxl py-5">
            <div class="container">
                <div class="text-center mx-auto mb-5 wow fadeInUp" data-wow-delay="0.1s" style={{ maxWidth: '600px' }}>
                    <h6 class="text-primary">Testimonial</h6>
                    <h1 class="mb-4">What Our Clients Say!</h1>
                </div>
                <div class="owl-carousel testimonial-carousel wow fadeInUp" data-wow-delay="0.1s">
                    <div class="testimonial-item text-center">
                        <div class="testimonial-img position-relative">
                            <img class="img-fluid rounded-circle mx-auto mb-5" src={TestimonyImage1} alt='Testimonial' />
                            <div class="btn-square bg-primary rounded-circle">
                                <i class="fa fa-quote-left text-white"></i>
                            </div>
                        </div>
                        <div class="testimonial-text text-center rounded p-4">
                            <p>Clita clita tempor justo dolor ipsum amet kasd amet duo justo duo duo labore sed sed. Magna ut diam sit et amet stet eos sed clita erat magna elitr erat sit sit erat at rebum justo sea clita.</p>
                            <h5 class="mb-1">Client Name</h5>
                            <span class="fst-italic">Profession</span>
                        </div>
                    </div>
                    <div class="testimonial-item text-center">
                        <div class="testimonial-img position-relative">
                            <img class="img-fluid rounded-circle mx-auto mb-5" src={TestimonyImage2} alt='Testimonial' />
                            <div class="btn-square bg-primary rounded-circle">
                                <i class="fa fa-quote-left text-white"></i>
                            </div>
                        </div>
                        <div class="testimonial-text text-center rounded p-4">
                            <p>Clita clita tempor justo dolor ipsum amet kasd amet duo justo duo duo labore sed sed. Magna ut diam sit et amet stet eos sed clita erat magna elitr erat sit sit erat at rebum justo sea clita.</p>
                            <h5 class="mb-1">Client Name</h5>
                            <span class="fst-italic">Profession</span>
                        </div>
                    </div>
                    <div class="testimonial-item text-center">
                        <div class="testimonial-img position-relative">
                            <img class="img-fluid rounded-circle mx-auto mb-5" src={TestimonyImage3} alt='Testimonial' />
                            <div class="btn-square bg-primary rounded-circle">
                                <i class="fa fa-quote-left text-white"></i>
                            </div>
                        </div>
                        <div class="testimonial-text text-center rounded p-4">
                            <p>Clita clita tempor justo dolor ipsum amet kasd amet duo justo duo duo labore sed sed. Magna ut diam sit et amet stet eos sed clita erat magna elitr erat sit sit erat at rebum justo sea clita.</p>
                            <h5 class="mb-1">Client Name</h5>
                            <span class="fst-italic">Profession</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        // <div className="container-xxl py-5">
        //     <div className="container">
        //         <div className="text-center mx-auto mb-5 wow fadeInUp" data-wow-delay="0.1s" style={{ maxWidth: '600px' }}>
        //             <h6 className="text-primary">Testimonial</h6>
        //             <h1 className="mb-4">What Our Clients Say!</h1>
        //         </div>
        //         <Carousel
        //             activeIndex={activeIndex}
        //             next={next}
        //             previous={previous}
        //         >
        //             <CarouselIndicators items={items} activeIndex={activeIndex} onClickHandler={goToIndex} />
        //             {slides}
        //             <CarouselControl direction="prev" directionText="Previous" onClickHandler={previous} />
        //             <CarouselControl direction="next" directionText="Next" onClickHandler={next} />
        //         </Carousel>
        //     </div>
        // </div>
    )
}

export default Testimonial