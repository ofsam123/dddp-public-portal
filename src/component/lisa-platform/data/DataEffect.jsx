import React from 'react'
import dataEffectImage from '../../static/images/img/dataEffect.png'
import './DataEffect.css'

const DataEffect = () => {

    return (
        <div className="container-fluid" style={{ marginTop: '7rem' }}>
            <div className="row" style={{ backgroundColor: '#fff', height: '60vh' }}>
                <div className="col-md-6 d-flex flex-column" style={{ textAlign: 'left', paddingLeft: '10rem' }}>
                    <h1 style={{ color: '#0b6000', textWrap: 'wrap', fontSize: '3.5rem', marginBottom: '1rem' }}>
                        Climate Change Data, Effect, & Adaptation
                    </h1>
                    <p className="lead" style={{ marginBottom: '2rem' }}>
                        Faff about only a quid blower I don't want no agro bleeding chimney pot burke tosser cras nice one boot fanny.!
                    </p>
                    <div className="col-md-6 w-100" style={{ alignItems: 'flex-start' }}>
                        <div className="d-flex flex-row" >
                            <div className="col-md-6">
                                <div style={{ marginBottom: '15px' }}>
                                    <input type="checkbox" id="seo" name="seo" checked />
                                    <label htmlFor="seo">Boost SEO Ranking</label>
                                </div>
                                <div style={{ marginBottom: '15px' }}>
                                    <input type="checkbox" id="sharing" name="sharing" checked />
                                    <label for="sharing">Social Sharing</label>
                                </div>
                                <div style={{ marginBottom: '15px' }}>
                                    <input type="checkbox" id="marketing" name="marketing" checked />
                                    <label for="marketing">Marketing</label>
                                </div>
                            </div>
                            <div className="col-md-6">
                                <div style={{ marginBottom: '15px' }}>
                                    <input type="checkbox" id="retention" name="retention" checked />
                                    <label for="retention">Retention</label>
                                </div>
                                <div style={{ marginBottom: '15px' }}>
                                    <input type="checkbox" id="visualReviews" name="visualReviews" checked />
                                    <label for="visualReviews">Visual Reviews</label>
                                </div>
                                <div style={{ marginBottom: '15px' }}>
                                    <input type="checkbox" id="reviewsGeneration" name="reviewsGeneration" checked />
                                    <label for="reviewsGeneration">Reviews Generation</label>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="col-md-6">
                    <img src={dataEffectImage} alt="Lisa Home" className="img-fluid" width={400} />
                </div>
            </div>
        </div>
    )
}

export default DataEffect