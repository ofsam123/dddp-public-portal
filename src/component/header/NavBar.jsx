import React from 'react'
import 'bootstrap/dist/css/bootstrap.min.css'
//Fix this
// import 'bootstrap/dist/js/bootstrap.bundle.min';
import '../static/css/style.css'
import DDDPlogo from '../static/images/img/dddp-clean-logo.png'
import { Link } from 'react-router-dom';
import { Button } from 'antd';

const linkStyle = {
    color: '#fff',
    textDecoration: 'none'
}

const NavBar = () => {
    return (
        <div>
            {/* Topbar Start */}
            {/* <div className="container-fluid p-3 bg-white">
                <div className="row gx-0 d-none d-lg-flex ">
                    <div className="col-lg-4 px-5 text-start d-lg-flex justify-content-center align-items-center" style={{ backgroundColor: '#198754', height: '3.5rem' }}>
                        <div className="d-inline-flex align-items-center me-4">
                            <small className="fa fa-phone-alt me-2" style={{ color: '#fff' }}></small>
                            <small style={{ color: '#fff', fontSize: '1rem' }}>+233 024 000 00</small>
                        </div>
                        <div className="d-inline-flex align-items-center me-4">
                            <small className="fa fa-envelope me-2" style={{ color: '#fff' }}></small>
                            <small style={{ color: '#fff', fontSize: '1rem' }}>support@dddp.gov.gh</small>
                        </div>
                    </div>
                    <div className='col-lg-8 px-5 text-end d-inline-flex align-items-center'>
                        <Button color="success" className="rounded-0 py-3 px-5 text-end" style={{ marginRight: '1rem' }}>
                            <a href='#' style={linkStyle}> LOGIN TO DDDP</a>
                        </Button>
                        <Button color="success" className="rounded-0 py-3 px-5 text-end">
                            <a href='https://dddphelpdesk.aoholdings.net/' style={linkStyle}> HELP DESK</a>
                        </Button>
                    </div>
                </div>
            </div> */}
            {/* Topbar End */}

            <nav className="navbar navbar-expand-lg bg-white navbar-light sticky-top p-0">
                <a href="/" className="navbar-brand d-flex align-items-center border-end px-4 px-lg-5">
                    <img src={DDDPlogo} alt='DDDP Portal' height={95} />
                </a>
                <button type="button" className="navbar-toggler me-4" data-bs-toggle="collapse" data-bs-target="#navbarCollapse">
                    <span className="navbar-toggler-icon"></span>
                </button>
                <div className="collapse navbar-collapse" id="navbarCollapse">
                    <div className="navbar-nav ms-auto p-4 p-lg-0">
                        <div className="nav-item dropdown">
                            <a href="/lisa" className="nav-link dropdown-toggle" data-bs-toggle="dropdown">LISA Platform</a>
                            <div className="dropdown-menu bg-light m-0">
                                <a href="/all-forcast" className="dropdown-item ">Forecast History</a>
                                <a href="/climate" className="dropdown-item ">Climate Change</a>
                                {/* <a href="http://publicportal.aoholdings.net:8086/login" target='_blank' rel="noreferrer" className="dropdown-item ">Login to GMet</a> */}
                            </div>
                        </div>
                        <a
                            href="https://dpat.aoinnovations.org/"
                            className="nav-item nav-link"
                            target="_blank"
                            rel="noopener noreferrer"
                        >DPAT Platform</a>
                        <a href="#" className="nav-item nav-link">DCACT Platform</a>
                        <a href="#" className="nav-item nav-link">LED Platform</a>
                        {/* <a href="/about" className="nav-item nav-link">About</a>
                        <a href="#" className="nav-item nav-link">HELPDESK</a>
                        <a href="/" className="nav-item nav-link active">Home</a>
                        <a href="service.html" className="nav-item nav-link">Service</a>
                        <a href="project.html" className="nav-item nav-link">Project</a> */}

                        {/* <div className="nav-item dropdown">
                            <a href="#" className="nav-link dropdown-toggle" data-bs-toggle="dropdown">DPAT Platform</a>
                            <div className="dropdown-menu bg-light m-0">
                                <a href="feature.html" className="dropdown-item">Feature</a>
                                <a href="quote.html" className="dropdown-item">Free Quote</a>
                                <a href="team.html" className="dropdown-item">Our Team</a>
                                <a href="testimonial.html" className="dropdown-item">Testimonial</a>
                            </div>
                        </div> */}
                        {/* <div className="nav-item dropdown">
                            <a href="#" className="nav-link dropdown-toggle" data-bs-toggle="dropdown">LED Platform</a>
                            <div className="dropdown-menu bg-light m-0">
                                <a href="feature.html" className="dropdown-item">Feature</a>
                                <a href="quote.html" className="dropdown-item">Free Quote</a>
                                <a href="team.html" className="dropdown-item">Our Team</a>
                                <a href="testimonial.html" className="dropdown-item">Testimonial</a>
                            </div>
                        </div> */}
                        {/* <div className="nav-item dropdown">
                            <a href="/lisa" className="nav-link dropdown-toggle" data-bs-toggle="dropdown">LISA Platform</a>
                            <div className="dropdown-menu bg-light m-0">
                                <a href="feature.html" className="dropdown-item">Feature</a>
                                <a href="quote.html" className="dropdown-item">Free Quote</a>
                                <a href="team.html" className="dropdown-item">Our Team</a>
                                <a href="testimonial.html" className="dropdown-item">Testimonial</a>
                            </div>
                        </div> */}

                    </div>
                    <a href="https://dddp.gov.gh/" className="btn btn-success rounded-0 py-4 px-lg-5 d-none d-lg-block">LOGIN TO DDDP<i className="fa fa-arrow-right ms-3"></i></a>
                </div>
            </nav>
        </div>
    )
}

export default NavBar