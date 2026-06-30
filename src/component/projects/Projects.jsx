import React from 'react'
import 'bootstrap/dist/css/bootstrap.min.css'
import '../static/css/style.css'
import Image6 from '../static/images/img/img-600x400-6.jpg'
import Image5 from '../static/images/img/img-600x400-5.jpg'
import Image4 from '../static/images/img/img-600x400-4.jpg'
import Image3 from '../static/images/img/img-600x400-3.jpg'
import Image2 from '../static/images/img/img-600x400-2.jpg'
import Image1 from '../static/images/img/img-600x400-1.jpg'


const Projects = () => {
  return (
    <div>
        <div className="container-xxl py-5">
        <div className="container">
            <div className="text-center mx-auto mb-5 wow fadeInUp" data-wow-delay="0.1s" style={{maxWidth: "600px"}}>
                <h6 style={{color: '#32C36C'}}>Our Projects</h6>
                <h1 className="mb-4">Visit Our Latest Solar And Renewable Energy Projects</h1>
            </div>
            <div className="row mt-n2 wow fadeInUp" data-wow-delay="0.3s">
                <div className="col-12 text-center">
                    <ul className="list-inline mb-5" id="portfolio-flters">
                        <li className="mx-2 active" data-filter="*">All</li>
                        <li className="mx-2" data-filter=".first">Solar Panels</li>
                        <li className="mx-2" data-filter=".second">Wind Turbines</li>
                        <li className="mx-2" data-filter=".third">Hydropower Plants</li>
                    </ul>
                </div>
            </div>
            <div className="row g-4 portfolio-container wow fadeInUp" data-wow-delay="0.5s">
                <div className="col-lg-4 col-md-6 portfolio-item first">
                    <div className="portfolio-img rounded overflow-hidden">
                        <img className="img-fluid" src={Image6} alt="" />
                        <div className="portfolio-btn">
                            <a className="btn btn-lg-square btn-outline-light rounded-circle mx-1" href="../static/images/img/img-600x400-6.jpg" data-lightbox="portfolio"><i className="fa fa-eye"></i></a>
                            <a className="btn btn-lg-square btn-outline-light rounded-circle mx-1" href="#"><i className="fa fa-link"></i></a>
                        </div>
                    </div>
                    <div className="pt-3">
                        <p className="mb-0" style={{color: '#32C36C', textAlign: 'left'}}>Solar Panels</p>
                        <hr className="w-25 my-2" style={{color: '#32C36C'}}/>
                        <h5 className="lh-base">We Are pioneers of solar & renewable energy industry</h5>
                    </div>
                </div>
                <div className="col-lg-4 col-md-6 portfolio-item second">
                    <div className="portfolio-img rounded overflow-hidden">
                        <img className="img-fluid" src={Image5} alt="" />
                        <div className="portfolio-btn">
                            <a className="btn btn-lg-square btn-outline-light rounded-circle mx-1" href="../static/images/img/img-600x400-5.jpg" data-lightbox="portfolio"><i className="fa fa-eye"></i></a>
                            <a className="btn btn-lg-square btn-outline-light rounded-circle mx-1" href="#"><i className="fa fa-link"></i></a>
                        </div>
                    </div>
                    <div className="pt-3">
                        <p className="mb-0" style={{color: '#32C36C', textAlign: 'left'}}>Wind Turbines</p>
                        <hr className="w-25 my-2" style={{color: '#32C36C'}}/>
                        <h5 className="lh-base">We Are pioneers of solar & renewable energy industry</h5>
                    </div>
                </div>
                <div className="col-lg-4 col-md-6 portfolio-item third">
                    <div className="portfolio-img rounded overflow-hidden">
                        <img className="img-fluid" src={Image4} alt="" />
                        <div className="portfolio-btn">
                            <a className="btn btn-lg-square btn-outline-light rounded-circle mx-1" href="../static/images/img/img-600x400-4.jpg" data-lightbox="portfolio"><i className="fa fa-eye"></i></a>
                            <a className="btn btn-lg-square btn-outline-light rounded-circle mx-1" href="#"><i className="fa fa-link"></i></a>
                        </div>
                    </div>
                    <div className="pt-3">
                        <p className="mb-0" style={{color: '#32C36C', textAlign: 'left'}}>Hydropower Plants</p>
                        <hr className="w-25 my-2" style={{color: '#32C36C'}}/>
                        <h5 className="lh-base">We Are pioneers of solar & renewable energy industry</h5>
                    </div>
                </div>
                <div className="col-lg-4 col-md-6 portfolio-item first">
                    <div className="portfolio-img rounded overflow-hidden">
                        <img className="img-fluid" src={Image3} alt="" />
                        <div className="portfolio-btn">
                            <a className="btn btn-lg-square btn-outline-light rounded-circle mx-1" href="../static/images/img/img-600x400-3.jpg" data-lightbox="portfolio"><i className="fa fa-eye"></i></a>
                            <a className="btn btn-lg-square btn-outline-light rounded-circle mx-1" href="#"><i className="fa fa-link"></i></a>
                        </div>
                    </div>
                    <div className="pt-3">
                        <p className="mb-0" style={{color: '#32C36C', textAlign: 'left'}}>Solar Panels</p>
                        <hr className="w-25 my-2" style={{color: '#32C36C'}} />
                        <h5 className="lh-base">We Are pioneers of solar & renewable energy industry</h5>
                    </div>
                </div>
                <div className="col-lg-4 col-md-6 portfolio-item second">
                    <div className="portfolio-img rounded overflow-hidden">
                        <img className="img-fluid" src={Image2} alt="" />
                        <div className="portfolio-btn">
                            <a className="btn btn-lg-square btn-outline-light rounded-circle mx-1" href="../static/images/img/img-600x400-2.jpg" data-lightbox="portfolio"><i className="fa fa-eye"></i></a>
                            <a className="btn btn-lg-square btn-outline-light rounded-circle mx-1" href="#"><i className="fa fa-link"></i></a>
                        </div>
                    </div>
                    <div className="pt-3">
                        <p className="mb-0" style={{color: '#32C36C', textAlign: 'left'}}>Wind Turbines</p>
                        <hr className="w-25 my-2" style={{color: '#32C36C'}} />
                        <h5 className="lh-base">We Are pioneers of solar & renewable energy industry</h5>
                    </div>
                </div>
                <div className="col-lg-4 col-md-6 portfolio-item third">
                    <div className="portfolio-img rounded overflow-hidden">
                        <img className="img-fluid" src={Image1} alt="" />
                        <div className="portfolio-btn">
                            <a className="btn btn-lg-square btn-outline-light rounded-circle mx-1" href="../static/images/img/img-600x400-1.jpg" data-lightbox="portfolio"><i className="fa fa-eye"></i></a>
                            <a className="btn btn-lg-square btn-outline-light rounded-circle mx-1" href="#"><i className="fa fa-link"></i></a>
                        </div>
                    </div>
                    <div className="pt-3">
                        <p className="mb-0" style={{color: '#32C36C', textAlign: 'left'}}>Hydropower Plants</p>
                        <hr className="w-25 my-2" style={{color: '#32C36C'}}/>
                        <h5 className="lh-base">We Are pioneers of solar & renewable energy industry</h5>
                    </div>
                </div>
            </div>
        </div>
    </div>
    </div>
  )
}

export default Projects