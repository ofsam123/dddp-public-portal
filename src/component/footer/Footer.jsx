import React from 'react'
import 'bootstrap/dist/css/bootstrap.min.css'
import '../static/css/style.css'
import FooterImage1 from '../static/images/img/gallery-1.jpg'
import FooterImage2 from '../static/images/img/gallery-2.jpg'
import FooterImage3 from '../static/images/img/gallery-3.jpg'
import FooterImage4 from '../static/images/img/gallery-4.jpg'
import FooterImage5 from '../static/images/img/gallery-5.jpg'
import FooterImage6 from '../static/images/img/gallery-6.jpg'


const Footer = () => {
  return (
    <div className="container-fluid bg-dark text-body footer mt-5 pt-5 wow fadeIn" data-wow-delay="0.1s">
        <div className="container py-5">
            <div className="row g-5" style={{color: '#9b9b9b', textAlign: 'left'}}>
                <div className="col-lg-3 col-md-6">
                    <h5 className="text-white mb-4">Address</h5>
                    <p className="mb-2"><i className="fa fa-map-marker-alt me-3"></i>123 Street, New York, USA</p>
                    <p className="mb-2"><i className="fa fa-phone-alt me-3"></i>+012 345 67890</p>
                    <p className="mb-2"><i className="fa fa-envelope me-3"></i>info@example.com</p>
                    <div className="d-flex pt-2">
                        <a className="btn btn-square btn-outline-light btn-social" href="#"><i className="fab fa-twitter"></i></a>
                        <a className="btn btn-square btn-outline-light btn-social" href="#"><i className="fab fa-facebook-f"></i></a>
                        <a className="btn btn-square btn-outline-light btn-social" href="#"><i className="fab fa-youtube"></i></a>
                        <a className="btn btn-square btn-outline-light btn-social" href="#"><i className="fab fa-linkedin-in"></i></a>
                    </div>
                </div>
                <div className="col-lg-3 col-md-6">
                    <h5 className="text-white mb-4">Quick Links</h5>
                    <a className="btn btn-link" href="/about" style={{textDecoration: 'none'}}>About Us</a>
                    <a className="btn btn-link" href="#" style={{textDecoration: 'none'}}>Contact Us</a>
                    <a className="btn btn-link" href="#" style={{textDecoration: 'none'}}>Our Services</a>
                    <a className="btn btn-link" href="#" style={{textDecoration: 'none'}}>Terms & Condition</a>
                    <a className="btn btn-link" href="#" style={{textDecoration: 'none'}}>Support</a>
                </div>
                <div className="col-lg-3 col-md-6">
                    <h5 className="text-white mb-4">Project Gallery</h5>
                    <div className="row g-2">
                        <div className="col-4">
                            <img className="img-fluid rounded" src={FooterImage1} alt="" />
                        </div>
                        <div className="col-4">
                            <img className="img-fluid rounded" src={FooterImage2} alt="" />
                        </div>
                        <div className="col-4">
                            <img className="img-fluid rounded" src={FooterImage3} alt="" />
                        </div>
                        <div className="col-4">
                            <img className="img-fluid rounded" src={FooterImage4} alt="" />
                        </div>
                        <div className="col-4">
                            <img className="img-fluid rounded" src={FooterImage5} alt="" />
                        </div>
                        <div className="col-4">
                            <img className="img-fluid rounded" src={FooterImage6} alt="" />
                        </div>
                    </div>
                </div>
                <div className="col-lg-3 col-md-6">
                    <h5 className="text-white mb-4">Newsletter</h5>
                    <p>Dolor amet sit justo amet elitr clita ipsum elitr est.</p>
                    <div className="position-relative mx-auto" style={{maxWidth: '400px'}}>
                        <input className="form-control border-0 w-100 py-3 ps-4 pe-5" type="text" placeholder="Your email" />
                        <button type="button" className="btn py-2 position-absolute top-0 end-0 mt-2 me-2" style={{backgroundColor: '#32C36C', color: '#fff'}}>SignUp</button>
                    </div>
                </div>
            </div>
        </div>
        <div className="container">
            <div className="copyright">
                <div className="row">
                    <div className="col-md-6 text-center text-md-start mb-3 mb-md-0" style={{color: '#9b9b9b'}}>
                        &copy; <a href="#" style={{textDecoration: 'none'}}>AO Holdings</a>, All Right Reserved.
                    </div>
                </div>
            </div>
        </div>
    </div>
  )
}

export default Footer