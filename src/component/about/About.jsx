import React from 'react'
import AboutImage from '../static/images/img/about.jpg'
import 'bootstrap/dist/css/bootstrap.min.css'
import '../static/css/style.css'
import NavBar from '../header/NavBar'
import LisaFooter from '../lisa-platform/footer/LisaFooter'
import Feature from '../feature/Feature'
import Header from '../header/Header'
import hamisImage from '../static/images/img/hamis-about.jpeg'

const About = () => {
    return (
        <div>
            <NavBar />
            <Header />
            <Feature />
            <div className="container-fluid bg-light overflow-hidden my-5 px-lg-0">
                <div className="container about px-lg-0" style={{textAlign: 'left', textJustify: 'inter-word'}}>
                    <div className="row g-0 mx-lg-0 px-1">
                        <div className="col-lg-6 ps-lg-0 wow fadeIn" data-wow-delay="0.1s">
                            <div className="position-relative">
                                <img className="img-fluid" src={hamisImage} style={{ maxWidth: '85%', height: 'auto'}} alt="" />
                            </div>
                        </div>
                        <div className="col-lg-6 about-text py-5 wow fadeIn" data-wow-delay="0.5s" style={{paddingRight: '1rem'}}>
                            <div className="p-lg-5 pe-lg-0">
                                <h6 style={{color: '#32C36C'}}>About Us</h6>
                                <h1 className="mb-4">25+ Years Experience In Solar & Renewable Energy Industry</h1>
                                <p>Tempor erat elitr rebum at clita. Diam dolor diam ipsum sit. Aliqu diam amet diam et eos. Clita erat ipsum et lorem et sit, sed stet lorem sit clita duo justo erat amet</p>
                                <p><i className="fa fa-check-circle me-3" style={{color: '#32C36C'}}></i>Diam dolor diam ipsum</p>
                                <p><i className="fa fa-check-circle me-3" style={{color: '#32C36C'}}></i>Aliqu diam amet diam et eos</p>
                                <p><i className="fa fa-check-circle me-3" style={{color: '#32C36C'}}></i>Tempor erat elitr rebum at clita</p>
                                <a href="#" className="btn rounded-pill py-3 px-5 mt-3" style={{backgroundColor: '#32C36C', color: '#fff'}}>Explore More</a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <LisaFooter />
        </div>
    )
}

export default About