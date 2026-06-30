import React from 'react'
import 'bootstrap/dist/css/bootstrap.min.css'
import '../static/css/style.css'
import ImageFeature from '../static/images/img/feature.jpg'


const WhyChooseUs = () => {
    return (
        <div className="container-fluid bg-light overflow-hidden my-5 px-lg-0" style={{ textAlign: 'left', textJustify: 'inter-word' }}>
            <div className="container feature px-lg-0">
                <div className="row g-0 mx-lg-0">
                    <div className="col-lg-6 feature-text py-5 wow fadeIn order-lg-2" data-wow-delay="0.1s">
                        <div className="p-lg-5 ps-lg-0">
                            <h6 style={{color: '#32C36C'}}>Why Choose Us!</h6>
                            <h1 className="mb-4">Complete Commercial & Residential Solar Systems</h1>
                            <p className="mb-4 pb-2">Tempor erat elitr rebum at clita. Diam dolor diam ipsum sit. Aliqu diam amet diam et eos. Clita erat ipsum et lorem et sit, sed stet lorem sit clita duo justo erat amet</p>
                            <div className="row g-4">
                                <div className="col-6">
                                    <div className="d-flex align-items-center">
                                        <div className="btn-lg-square rounded-circle" style={{backgroundColor: '#32C36C'}}>
                                            <i className="fa fa-check text-white"></i>
                                        </div>
                                        <div className="ms-4">
                                            <p className="mb-0">Quality</p>
                                            <h5 className="mb-0">Services</h5>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-6">
                                    <div className="d-flex align-items-center">
                                        <div className="btn-lg-square rounded-circle" style={{backgroundColor: '#32C36C'}}>
                                            <i className="fa fa-user-check text-white"></i>
                                        </div>
                                        <div className="ms-4">
                                            <p className="mb-0">Expert</p>
                                            <h5 className="mb-0">Workers</h5>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-6">
                                    <div className="d-flex align-items-center">
                                        <div className="btn-lg-square rounded-circle" style={{backgroundColor: '#32C36C'}}>
                                            <i className="fa fa-drafting-compass text-white"></i>
                                        </div>
                                        <div className="ms-4">
                                            <p className="mb-0">Free</p>
                                            <h5 className="mb-0">Consultation</h5>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-6">
                                    <div className="d-flex align-items-center">
                                        <div className="btn-lg-square rounded-circle" style={{backgroundColor: '#32C36C'}}>
                                            <i className="fa fa-headphones text-white"></i>
                                        </div>
                                        <div className="ms-4">
                                            <p className="mb-0">Customer</p>
                                            <h5 className="mb-0">Support</h5>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="col-lg-6 pe-lg-0 wow fadeIn order-lg-1" data-wow-delay="0.5s">
                        <div className="position-relative">
                            <img className="img-fluid" src={ImageFeature} alt="" style={{ maxWidth: '85%', height: 'auto' }} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default WhyChooseUs