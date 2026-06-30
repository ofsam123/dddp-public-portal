import React from 'react';
import { Tabs } from 'antd';

import insight1 from '../static/images/img/insight1.png';
import insight2 from '../static/images/img/Insight2.png';
import insight3 from '../static/images/img/insight3.png';
import insight4 from '../static/images/img/insight4.png';
import insight5 from '../static/images/img/Insight5.png';
import agricultureData from '../static/images/img/agriculture-data.png';
import educationData from '../static/images/img/education-data.png';
import healthData from '../static/images/img/health-data.png';
import commerceData from '../static/images/img/technology-data.png';
import infrastructureData from '../static/images/img/inftrastructure-data.png';
import './Insight.css';

const { TabPane } = Tabs;

const Insight = () => {
    return (
        <div>
            <h1 style={{}} className="insight-main">Insights & More</h1>

            <Tabs defaultActiveKey="1" centered className="custom-tabs">
                <TabPane tab={<><img src={insight1} alt="Agriculture" style={{ marginBottom: '0.5rem' }} /><br /> Agriculture</>} key="1">
                    <div className="d-flex" style={{ width: '80%', marginTop: '3rem' }}>
                        <div style={{ textAlign: 'left', marginLeft: '10rem', marginTop: '2rem', color: '#0B6000' }}>
                            <p style={{ fontSize: '1rem' }}>01</p>
                            <h1>Agriculture Data</h1>
                            <p style={{ fontSize: '1rem' }}>
                                Database of agriculture value chain actors segregated by gender; farmers, agro-input
                                dealers, marketers, transporters, processors (registered and unregistered), commodity Associations,
                                FBOs (e.g. numbers, commodity, scale of operation (acreage / population / tonnage/ volume), etc.)
                            </p>
                            <div className="col-md-6 w-100" >
                                <div className="d-flex flex-row" style={{ display: 'flex', flexDirection: 'row', justifyContent: 'flex-start' }} >
                                    <div className="col-md-6 mt-3">
                                        <div style={{ marginBottom: '1.5rem', color: '#0B6000' }}>
                                            <input type="checkbox" id="advice" name="advice" checked />
                                            <label htmlFor="advice">Women in Agriculture %78</label>
                                        </div>
                                        <div style={{ marginBottom: '1.5rem', color: '#0B6000' }}>
                                            <input type="checkbox" id="consult" name="consult" checked />
                                            <label for="consult">Average crops produced in a year %58</label>
                                        </div>
                                        <div style={{ marginBottom: '1.5rem', color: '#0B6000' }}>
                                            <input type="checkbox" id="support" name="support" checked />
                                            <label for="support">Total Revenue made by peasant farmers %37</label>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="insight-image">
                            <img src={agricultureData} alt="Agriculture Data" width={400} />
                        </div>
                    </div>
                </TabPane>
                <TabPane tab={<><img src={insight2} alt="Education" style={{ marginBottom: '0.5rem' }} /><br /> Education</>} key="2">
                    <div className="d-flex" style={{ width: '80%', marginTop: '3rem' }}>
                        <div className="insight-image" style={{ marginLeft: '10rem' }}>
                            <img src={educationData} alt="Agriculture Data" width={400} />
                        </div>
                        <div style={{ textAlign: 'left', marginLeft: '10rem', marginTop: '2rem', color: '#0B6000' }}>
                            <p style={{ fontSize: '1rem' }}>02</p>
                            <h1>Accurate Educational Data</h1>
                            <p style={{ fontSize: '1rem' }}>
                                Database of agriculture value chain actors segregated by gender; farmers, agro-input
                                dealers, marketers, transporters, processors (registered and unregistered), commodity Associations,
                                FBOs (e.g. numbers, commodity, scale of operation (acreage / population / tonnage/ volume), etc.)
                            </p>
                            <div className="col-md-6 w-100" >
                                <div className="d-flex flex-row" style={{ display: 'flex', flexDirection: 'row', justifyContent: 'flex-start' }} >
                                    <div className="col-md-6 mt-3">
                                        <div style={{ marginBottom: '1.5rem', color: '#0B6000' }}>
                                            <input type="checkbox" id="advice" name="advice" checked />
                                            <label htmlFor="advice">Women in Agriculture %78</label>
                                        </div>
                                        <div style={{ marginBottom: '1.5rem', color: '#0B6000' }}>
                                            <input type="checkbox" id="consult" name="consult" checked />
                                            <label for="consult">Average crops produced in a year %58</label>
                                        </div>
                                        <div style={{ marginBottom: '1.5rem', color: '#0B6000' }}>
                                            <input type="checkbox" id="support" name="support" checked />
                                            <label for="support">Total Revenue made by peasant farmers %37</label>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </TabPane>
                <TabPane tab={<><img src={insight3} alt="Health" style={{ marginBottom: '0.5rem' }} /><br /> Health</>} key="3">
                    <div className="d-flex" style={{ width: '80%', marginTop: '3rem' }}>
                        <div style={{ textAlign: 'left', marginLeft: '10rem', marginTop: '2rem', color: '#0B6000' }}>
                            <p style={{ fontSize: '1rem' }}>03</p>
                            <h1>Health Data</h1>
                            <p style={{ fontSize: '1rem' }}>
                                Under the NHIS, members can access healthcare services from accredited healthcare providers, including public and private hospitals, clinics, and health centers. These providers must meet certain quality standards and be registered with the NHIS.
                            </p>
                            <div className="col-md-6 w-100" >
                                <div className="d-flex flex-row" style={{ display: 'flex', flexDirection: 'row', justifyContent: 'flex-start' }} >
                                    <div className="col-md-6 mt-3">
                                        <div style={{ marginBottom: '1.5rem', color: '#0B6000' }}>
                                            <input type="checkbox" id="advice" name="advice" checked />
                                            <label htmlFor="advice">Reforms & Improvements %78</label>
                                        </div>
                                        <div style={{ marginBottom: '1.5rem', color: '#0B6000' }}>
                                            <input type="checkbox" id="consult" name="consult" checked />
                                            <label for="consult">NHIS Coverage %58</label>
                                        </div>
                                        <div style={{ marginBottom: '1.5rem', color: '#0B6000' }}>
                                            <input type="checkbox" id="support" name="support" checked />
                                            <label for="support">Service Delivery %37</label>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="insight-image">
                            <img src={healthData} alt="Agriculture Data" width={400} />
                        </div>
                    </div>
                </TabPane>
                <TabPane tab={<><img src={insight4} alt="Commerce" style={{ marginBottom: '0.5rem' }} /><br /> Commerce</>} key="4">
                    <div className="d-flex" style={{ width: '80%', marginTop: '3rem' }}>
                        <div className="insight-image" style={{ marginLeft: '10rem' }}>
                            <img src={commerceData} alt="Agriculture Data" width={400} />
                        </div>
                        <div style={{ textAlign: 'left', marginLeft: '10rem', marginTop: '2rem', color: '#0B6000' }}>
                            <p style={{ fontSize: '1rem' }}>04</p>
                            <h1>Commerce & Technology Data</h1>
                            <p style={{ fontSize: '1rem' }}>
                                Ghana’s technology sector has seen the emergence of startups and innovative solutions in various
                                fields, including fintech, agritech, healthtech, and e-commerce. The government has been supportive
                                of these initiatives to promote technology-driven entrepreneurship.
                            </p>
                            <div className="col-md-6 w-100" >
                                <div className="d-flex flex-row" style={{ display: 'flex', flexDirection: 'row', justifyContent: 'flex-start' }} >
                                    <div className="col-md-6 mt-3">
                                        <div style={{ marginBottom: '1.5rem', color: '#0B6000' }}>
                                            <input type="checkbox" id="advice" name="advice" checked />
                                            <label htmlFor="advice">Hong vhregre %78</label>
                                        </div>
                                        <div style={{ marginBottom: '1.5rem', color: '#0B6000' }}>
                                            <input type="checkbox" id="consult" name="consult" checked />
                                            <label for="consult">Mangalone da vhregre %58</label>
                                        </div>
                                        <div style={{ marginBottom: '1.5rem', color: '#0B6000' }}>
                                            <input type="checkbox" id="support" name="support" checked />
                                            <label for="support">Inistipal lylencias %37</label>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </TabPane>
                <TabPane tab={<><img src={insight5} alt="Infrastructure & Technology" style={{ marginBottom: '0.5rem' }} /><br /> Infrastructure & Technology</>} key="5">
                    <div className="d-flex" style={{ width: '80%', marginTop: '3rem' }}>
                        <div style={{ textAlign: 'left', marginLeft: '10rem', marginTop: '2rem', color: '#0B6000' }}>
                            <p style={{ fontSize: '1rem' }}>05</p>
                            <h1>Infrastructure & Environmental Data</h1>
                            <p style={{ fontSize: '1rem' }}>
                                Efforts have been made to improve information and communication technology (ICT) infrastructure in Ghana.
                                This includes expanding broadband connectivity, promoting ICT education, and increasing access to digital
                                services.
                            </p>
                            <div className="col-md-6 w-100" >
                                <div className="d-flex flex-row" style={{ display: 'flex', flexDirection: 'row', justifyContent: 'flex-start' }} >
                                    <div className="col-md-6 mt-3">
                                        <div style={{ marginBottom: '1.5rem', color: '#0B6000' }}>
                                            <input type="checkbox" id="advice" name="advice" checked />
                                            <label htmlFor="advice">Hong vhregre %78</label>
                                        </div>
                                        <div style={{ marginBottom: '1.5rem', color: '#0B6000' }}>
                                            <input type="checkbox" id="consult" name="consult" checked />
                                            <label for="consult">Mangalone da vhregre %58</label>
                                        </div>
                                        <div style={{ marginBottom: '1.5rem', color: '#0B6000' }}>
                                            <input type="checkbox" id="support" name="support" checked />
                                            <label for="support">Inistipal lylencias %37</label>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="insight-image">
                            <img src={infrastructureData} alt="Agriculture Data" width={400} />
                        </div>
                    </div>
                </TabPane>
            </Tabs>
        </div>
    );
}

export default Insight;