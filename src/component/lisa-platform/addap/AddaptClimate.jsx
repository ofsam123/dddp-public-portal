import React from 'react'
import addaptClimateImage from '../../static/images/img/addapt-climate.png'
import { Button } from 'reactstrap'


const AddaptClimate = () => {
    return (
        <div>
            <div className="container-fluid" style={{ marginTop: '7rem', marginBottom: '5rem' }}>
                <div className="row" style={{ backgroundColor: '#fff', height: '60vh' }}>
                    <div className="col-md-6">
                        <img src={addaptClimateImage} alt="Lisa Home" className="img-fluid" width={500} />
                    </div>
                    <div className="col-md-6 d-flex flex-column" style={{ textAlign: 'left', paddingRight: '5rem' }}>
                        <h1 style={{ color: '#0b6000', textWrap: 'wrap', fontSize: '3.5rem', marginBottom: '1rem' }}>
                            Climate Change Data, Effect, & Adaptation
                        </h1>
                        <p className="lead" style={{ marginBottom: '2rem' }}>
                            It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout.
                        </p>
                        <div className="col-md-6 w-100" >
                            <div className="d-flex flex-row" style={{ display: 'flex', flexDirection: 'row', justifyContent: 'flex-start' }} >
                                <div className="col-md-6">
                                    <div style={{ marginBottom: '1.5rem', color: '#0B6000' }}>
                                        <input type="checkbox" id="advice" name="advice" checked />
                                        <label htmlFor="advice">Advance Advisory Team</label>
                                    </div>
                                    <div style={{ marginBottom: '1.5rem', color: '#0B6000' }}>
                                        <input type="checkbox" id="consult" name="consult" checked />
                                        <label for="consult">Professional Consulting Services</label>
                                    </div>
                                    <div style={{ marginBottom: '1.5rem', color: '#0B6000' }}>
                                        <input type="checkbox" id="support" name="support" checked />
                                        <label for="support">24/7 Support Help Center</label>
                                    </div>
                                    <div style={{ color: '#0B6000' }}>
                                        <input type="checkbox" id="customer" name="customer" checked />
                                        <label for="customer">Customer Service & Operations</label>
                                    </div>
                                    {/* <Button color="success" className="rounded-0 py-3 px-5 text-end" style={{ marginRight: '1rem' }}>
                                    VIEW DETAILS
                                </Button> */}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#3F7BE7', height: '25vh' }}>
                <div style={{ width: '80%', display: 'flex', flexDirection: 'row', justifyContent: 'space-around', backgroundColor: '#3F7BE7', color: '#fff' }}>
                    <h1 style={{ fontSize: '3rem' }}>Ready To Be Informed With <br /> Accurate Climate Analytics</h1>
                    <Button color="success" className="py-3 px-5 text-end" style={{ backgroundColor: '#fff', marginRight: '1rem', height: '4rem', marginTop: '1.5rem', borderRadius: '5px' }}>
                        <a href='https://dddp.gov.gh/dhis-web-commons/security/login.action' target="_blank" rel="noreferrer" style={{ textDecoration: 'none', color: '#437EEB' }}>LOGIN TO PORTAL</a>
                    </Button>
                </div>
            </div>
        </div>
    )
}

export default AddaptClimate