import React from 'react'
import 'bootstrap/dist/css/bootstrap.min.css'
import '../../static/css/style.css'
import LisaLogo from '../../static/images/img/lisa-logo.png'
import NewsLetter from '../newsletter/NewsLetter'


const LisaFooter = () => {
    return (
        <div className="container-fluid text-body footer mt-5 pt-5 wow fadeIn" style={{ backgroundColor: '#EFF1FE' }} data-wow-delay="0.1s">
            {/* <NewsLetter /> */}
            <div className="container py-5">
                <div className="row g-5" style={{ color: '#9b9b9b', textAlign: 'left' }}>
                    <div className='col-lg-3 col-md-6'>
                        <img src={LisaLogo} alt='Lisa Log' width={150} style={{ marginBottom: '2rem' }} />
                        <p style={{ color: '#245912' }}>We ensure better services and better quality at every product you might invest in and we shall help grow better</p>
                        <div className="d-flex pt-2">
                            <a className="btn btn-square btn-outline-light" href="#" style={{ color: '#00910E', borderRadius: '38px', marginRight: '5px', border: '1px solid #00910E', transition: '.3s' }}><i className="fab fa-twitter"></i></a>
                            <a className="btn btn-square btn-outline-light" href="#" style={{ color: '#00910E', borderRadius: '38px', marginRight: '5px', border: '1px solid #00910E', transition: '.3s' }} ><i className="fab fa-facebook-f"></i></a>
                            <a className="btn btn-square btn-outline-light" href="#" style={{ color: '#00910E', borderRadius: '38px', marginRight: '5px', border: '1px solid #00910E', transition: '.3s' }} ><i className="fab fa-linkedin-in"></i></a>
                        </div>
                    </div>
                    <div className="col-lg-3 col-md-6">
                        <h5 className="mb-4" style={{ color: '#2E7728', fontSize: '1.5rem', fontWeight: 'bold' }}>Links</h5>
                        <a className="mb-2 btn btn-link" href="#" style={{ textDecoration: 'none', color: '#245912' }}>HELPDESK</a>
                        <a className="mb-2 btn btn-link" href="#" style={{ textDecoration: 'none', color: '#245912' }}>LED Platform</a>
                        <a className="mb-2 btn btn-link" href="#" style={{ textDecoration: 'none', color: '#245912' }}>NDPC</a>
                        <a className="mb-2 btn btn-link" href="#" style={{ textDecoration: 'none', color: '#245912' }}>MLGDRD</a>
                        <a className="mb-2 btn btn-link" href="#" style={{ textDecoration: 'none', color: '#245912' }}>Civil Service</a>
                        <a className="mb-2 btn btn-link" href="#" style={{ textDecoration: 'none', color: '#245912' }}>Ministry of Finance</a>
                        <a className="mb-2 btn btn-link" href="#" style={{ textDecoration: 'none', color: '#245912' }}>Ministry of Agriculture</a>
                        <a className="btn btn-link" href="#" style={{ textDecoration: 'none', color: '#245912' }}>ICT Service Providers</a>
                    </div>
                    <div className="col-lg-3 col-md-6">
                        <h5 className="mb-4" style={{ color: '#2E7728', fontSize: '1.5rem', fontWeight: 'bold' }}>Quick Links</h5>
                        <a className="mb-2 btn btn-link" href="/about" style={{ textDecoration: 'none', color: '#245912' }}>About Us</a>
                        <a className="mb-2 btn btn-link" href="#" style={{ textDecoration: 'none', color: '#245912' }}>Contact Us</a>
                        <a className="mb-2 btn btn-link" href="#" style={{ textDecoration: 'none', color: '#245912' }}>Our Services</a>
                        <a className="mb-2 btn btn-link" href="#" style={{ textDecoration: 'none', color: '#245912' }}>Terms & Condition</a>
                        <a className="btn btn-link" href="#" style={{ textDecoration: 'none', color: '#245912' }}>Support</a>
                    </div>
                    <div className="col-lg-3 col-md-6">
                        <h5 className="mb-4" style={{ color: '#2E7728', fontSize: '1.5rem', fontWeight: 'bold' }}>Contact Us</h5>
                        <p className="mb-2" style={{ color: '#245912' }}><i className="fa fa-map-marker-alt me-3"></i>MLGDRD, Ministries - Accra Ghana</p>
                        <p className="mb-2" style={{ color: '#245912' }}><i className="fa fa-envelope me-3"></i>info@example.com</p>
                        <p className="mb-2" style={{ color: '#245912' }}><i className="fa fa-phone-alt me-3"></i>+012 345 67890</p>
                    </div>

                </div>
                <a href="#" className="btn btn-lg btn-primary btn-lg-square rounded-circle back-to-top"><i className="bi bi-arrow-up"></i></a>
            </div>
            <div className="">
                <div className="copyright">
                    <div className="row" style={{ margin: '0 auto !important' }}>
                        <div className="col-md-12 text-center text-md-start mb-3 mb-md-0" style={{ color: '#9b9b9b' }}>
                            <a href="#" style={{ textDecoration: 'none' }} />Copyright © 2024 - AO Holdings | Synergy Centre. All Rights Reserved.
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default LisaFooter