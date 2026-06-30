import React from 'react'
import 'bootstrap/dist/css/bootstrap.min.css'
import '../static/css/style.css'
import quote from '../static/images/img/quote.jpg'

const FreeQuote = () => {
  return (
        <div className="container-fluid bg-light overflow-hidden my-5 px-lg-0" style={{ textAlign: 'left', textJustify: 'inter-word' }}>
        <div className="container quote px-lg-0">
            <div className="row g-0 mx-lg-0">
                <div className="col-lg-6 ps-lg-0 wow fadeIn" data-wow-delay="0.1s">
                    <div className="position-relative">
                        <img className="img-fluid" src={quote} style={{maxWidth: '85%', height: 'auto' }} alt="" />
                    </div>
                </div>
                <div className="col-lg-6 quote-text py-5 wow fadeIn" data-wow-delay="0.5s" style={{paddingRight: '3rem'}}>
                    <div className="p-lg-5 pe-lg-0">
                        <h6 style={{color: '#32C36C'}}>Free Quote</h6>
                        <h1 className="mb-4">Get A Free Quote</h1>
                        <p className="mb-4 pb-2">Tempor erat elitr rebum at clita. Diam dolor diam ipsum sit. Aliqu diam amet diam et eos. Clita erat ipsum et lorem et sit, sed stet lorem sit clita duo justo erat amet</p>
                        <form>
                            <div className="row g-3">
                                <div className="col-12 col-sm-6">
                                    <input type="text" className="form-control border-0" placeholder="Your Name" style={{height: '55px'}} />
                                </div>
                                <div className="col-12 col-sm-6">
                                    <input type="email" className="form-control border-0" placeholder="Your Email" style={{height: '55px'}} />
                                </div>
                                <div className="col-12 col-sm-6">
                                    <input type="text" className="form-control border-0" placeholder="Your Mobile" style={{height: '55px'}} />
                                </div>
                                <div className="col-12 col-sm-6">
                                    <select className="form-select border-0" style={{height: '55px'}}>
                                        <option selected>Select A Service</option>
                                        <option value="1">Service 1</option>
                                        <option value="2">Service 2</option>
                                        <option value="3">Service 3</option>
                                    </select>
                                </div>
                                <div className="col-12">
                                    <textarea className="form-control border-0" placeholder="Special Note"></textarea>
                                </div>
                                <div className="col-12">
                                    <button className="btn rounded-pill py-3 px-5" type="submit" style={{backgroundColor: '#32C36C', color: '#fff'}}>Submit</button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    </div>
  )
}

export default FreeQuote