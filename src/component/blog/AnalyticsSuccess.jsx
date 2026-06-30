import React from 'react'
import analyticSuccess from '../static/images/img/news4.png'
import './AnalyticsSuccess.css'
import { CalendarOutlined } from '@ant-design/icons'
import statistics1 from '../static/images/img/analytics1.jpg'
import statistics2 from '../static/images/img/analytics2.jpg'
import LisaFooter from '../lisa-platform/footer/LisaFooter'
import Navbar from '../header/NavBar'

const AnalyticsSuccess = () => {
    return (
        <div>
            <Navbar />
            <div className="container-fluid" style={{ marginTop: '7rem', marginBottom: '5rem' }}>
                <div className="row" style={{ height: '60vh' }}>
                    <div className="col-md-9" style={{ width: '70%' }}>
                        <img src={analyticSuccess} alt="Lisa Home" className="img-fluid" width={900} height={200} style={{ backgroundColor: '#EFF1FE' }} />
                        <h6 className='headling'>PROJECT & BUDJECT</h6>
                        <div style={{ marginTop: '2rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', marginLeft: '6rem' }}>
                            <CalendarOutlined style={{ color: '#0B6000', marginRight: '0.5rem' }} />
                            <h6 style={{ color: '#00910E', margin: '0' }}>February 26, 2023</h6>
                        </div>
                        <p className="lead" style={{ marginLeft: '6rem', marginRight: '6rem', textJustify: 'inter-word', textAlign: 'justify' }}>
                            Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod temporincididunt ut labore et dolore magnaaliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi utaliquip ex ea commodo consequat.Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiatnulla pariatur. Excepteur sintoccaecat cupidatat non proident, sunt in culpa qui officia deserunt.
                            <ul className="mt-3" style={{ color: '#0B6000', fontSize: '1.1rem' }}>
                                <li style={{ marginBottom: '0.5rem' }}>The Ultimate Guide to DDDP Portal</li>
                                <li style={{ marginBottom: '0.5rem' }}>Best Data analytics</li>
                                <li style={{ marginBottom: '0.5rem' }}>Why Analytics Succeeds</li>
                                <li style={{ marginBottom: '0.5rem' }}>Content Marketing</li>
                                <li style={{ paddingBottom: '2rem' }}>Build Construction</li>
                            </ul>
                        </p>
                        <h3 style={{ color: '#0B6000', marginBFottom: '2rem', marginLeft: '6rem', marginRight: '6rem', textJustify: 'inter-word', textAlign: 'justify' }}>
                            The Rutrum Ullamcorper Mattis
                        </h3>
                        <p style={{ marginLeft: '6rem', marginRight: '6rem', textJustify: 'inter-word', textAlign: 'justify' }}>
                            Content is an essential aspect of any digital marketing campaign. The Content Marketing Institute offers some of the best advice around in terms of how content can help your brand. From industry trends to best practices, their posts offer helpful advice on how to create the best strategies for your business and how your content marketing should play a role in the “bigger picture.
                        </p>
                        <h3 className='mt-4' style={{ color: '#0B6000', marginBFottom: '2rem', marginLeft: '6rem', marginRight: '6rem', textJustify: 'inter-word', textAlign: 'justify' }}>
                            The Stand Lorem Ipsum Passage
                        </h3>
                        <p style={{ marginLeft: '6rem', marginRight: '6rem', textJustify: 'inter-word', textAlign: 'justify' }}>
                            Curabitur pulvinar mi in lacinia convallis. Nulla sagittis urna hendrerit metus maximus luctus. Phasellus ac condimentum lacus. Mauris efficitur ultrices augue ut interdum. Aliquam placerat finibus ultrices. Nam pretium fermentum ante, porta luctus eros sodales et. Ut sollicitudin semper elit, vel efficitur justo ultrices quis. Etiam vel tortor rhoncus, malesuada ligula tempus, pulvinar nisi. Cras mi odio, efficitur pharetra lacinia vel, cursus at dolor.
                        </p>
                        <div>
                            <img src={statistics1} alt="Lisa Home" className="img-fluid" width={400} style={{ backgroundColor: '#EFF1FE', marginTop: '2rem', marginRight: '2rem' }} />
                            <img src={statistics2} alt="Lisa Home" className="img-fluid" width={400} style={{ backgroundColor: '#EFF1FE', marginTop: '2rem' }} />

                        </div>
                        <h3 className='mt-4' style={{ color: '#0B6000', marginBFottom: '2rem', marginLeft: '6rem', marginRight: '6rem', textJustify: 'inter-word', textAlign: 'justify' }}>
                            Integer Sollicitudin Libero Quam
                        </h3>
                        <p style={{ marginLeft: '6rem', marginRight: '6rem', textJustify: 'inter-word', textAlign: 'justify' }}>
                            This live blog allowed people, who may not have been able to make it to the actual event, stay informed and become a part of the discussion even though they were not in attendance. Their blog lets you interact with various industry leaders while providing their audience with content that is engaging and educational.
                        </p>
                        <h3 className='mt-4' style={{ color: '#0B6000', marginBFottom: '2rem', marginLeft: '6rem', marginRight: '6rem', textJustify: 'inter-word', textAlign: 'justify' }}>
                            Pellentesque Ultriciesdictum
                        </h3>
                        <p style={{ marginLeft: '6rem', marginRight: '6rem', textJustify: 'inter-word', textAlign: 'justify' }}>
                            Nullam commodo sem id mollis pretium. Duis sed aliquam quam, rutrum placerat massa. Etiam nec hendrerit purus, ut laoreet libero. Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Donec bibendum cursus mi, in dignissim enim posuere quis. Integer sollicitudin libero quam, id eleifend arcu malesuada vel. Cras justo tortor, mollis eget dapibus in, egestas sed enim. Donec bibendum neque lorem, eget commodo nulla finibus sed. Aliquam erat volutpat. Nullam sed euismod libero, lobortis rutrum urna. Donec et urna tellus.
                        </p>

                    </div>
                    <div className="col-md-3 d-flex flex-column" style={{ textAlign: 'left', width: '22%', }}>
                        <div style={{ height: '33vh', textAlign: 'left', backgroundColor: '#EFF1FE', marginBottom: '3rem', padding: '0 1rem 1rem 1rem' }}>
                            <h1 style={{ color: '#0b6000', textWrap: 'wrap', fontSize: '1.5rem', marginBottom: '1rem', marginTop: '1rem', marginLeft: '1rem' }}>
                                Recent Posts
                            </h1>
                            <ul style={{ color: '#0B6000', fontSize: '1.1rem' }}>
                                <li style={{ marginBottom: '0.5rem' }}>The Ultimate Guide to DDDP Portal</li>
                                <li style={{ marginBottom: '0.5rem' }}>Best Data analytics</li>
                                <li style={{ marginBottom: '0.5rem' }}>Why Analytics Succeeds</li>
                                <li style={{ marginBottom: '0.5rem' }}>Content Marketing</li>
                                <li style={{ paddingBottom: '2rem' }}>Build Construction</li>
                            </ul>
                        </div>

                        <div style={{ height: '25vh', textAlign: 'left', backgroundColor: '#EFF1FE', padding: '0 1rem 1rem 1rem' }}>
                            <h1 style={{ color: '#0b6000', textWrap: 'wrap', fontSize: '1.5rem', marginBottom: '1rem', marginTop: '1rem', marginLeft: '1rem' }}>
                                Categories
                            </h1>
                            <ul style={{ color: '#0B6000', fontSize: '1.1rem' }}>
                                <li style={{ marginBottom: '0.5rem' }}>Manufacturing</li>
                                <li style={{ marginBottom: '0.5rem' }}>Projects and Budget</li>
                                <li style={{ marginBottom: '0.5rem' }}>Science and Technology</li>
                                <li style={{ marginBottom: '0.5rem' }}>Uncategorized</li>
                            </ul>
                        </div>
                    </div>
                </div>
                <LisaFooter />
            </div>
        </div>
    )
}

export default AnalyticsSuccess