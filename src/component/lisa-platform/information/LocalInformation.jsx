import React from 'react'
import { Link } from 'react-router-dom';
import './LocalInformation.css';
import DailyForeCastImage from '../../static/images/img/Daily Forecast.jpg';
import AgrometorologicalImage from '../../static/images/img/Agrometeorological.jpg';
import ClimateImage from '../../static/images/img/Climate.jpg';
import DroughtImage from '../../static/images/img/Drought.jpg';
import MarineForecastsImage from '../../static/images/img/Marine.jpg';
import SeasonalImage from '../../static/images/img/Seasonal Forecast.jpg';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye } from '@fortawesome/free-solid-svg-icons';
import { faShare } from '@fortawesome/free-solid-svg-icons/faShare';
import { notification } from 'antd';
import { useGetProductCategories } from '../service/home.service';


const cardData = [
    {
        title: 'Daily Forecast ',
        imgSrc: DailyForeCastImage,
        href: '/daily-forecast',
    },
    {
        title: 'Agrometeorological Bulletins',
        imgSrc: AgrometorologicalImage,
        href: '/agrometeo'
    },
    {
        title: 'Climate Bulletins',
        imgSrc: ClimateImage,
        href: '/climate-product'
    },
    {
        title: 'Drought and Flood Monitoring Bulletins',
        imgSrc: DroughtImage,
        href: '/Drought'
    },
    {
        title: 'Marine Forecasts',
        imgSrc: MarineForecastsImage,
        href: '/marine'
    },
    {
        title: 'Seasonal Forecasts',
        imgSrc: SeasonalImage,
        href: '/seasonal'
    },
];

const LocalInformation = () => {

    const { data: productCateogries, isLoading: categoryLoading} = useGetProductCategories();

    const getUrl = async (url, event) => {
        event.preventDefault(); // Prevent the default behavior
        event.stopPropagation(); // Stop the event from bubbling up
        const fullUrl = `${window.location.origin}${url}`;
        try {
            await navigator.clipboard.writeText(fullUrl);
            notification.success({
                message: 'Link copied to clipboard! You can now share it.',
                placement: 'topRight',
            }, 3000);
        } catch (err) {
            notification.error({
                message: 'Failed to copy link.',
                placement: 'topRight',
            }, 3000);
        }
    };


    return (
        <div style={{ marginTop: '8rem', marginBottom: '5rem' }}>
            <h1 style={{ color: '#0B6000', textAlign: 'center' }}>Ghana Meteorological Agency Products</h1>
            <div className="container" style={{ marginTop: '5rem', width: '80%' }}>
                <div className="row">
                    {Array.isArray(productCateogries?.data) && (productCateogries?.data || []).map((card, index) => (
                        <div className="col-md-4" key={index} style={{ marginBottom: '2rem' }}>
                            <Link to={'/product-details'} state={{ category: card }} style={{ textDecoration: 'none' }}>
                                <div className="card card-style" style={{ position: 'relative', width: '330px', height: '300px', boxShadow: 'rgba(0, 0, 0, 0.1) 0px 20px 25px -5px, rgba(0, 0, 0, 0.04) 0px 10px 10px -5px', border: '1px solid white' }}>
                                    <div className="card-content" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', width: '100%', height: '100%' }}>
                                        <img src={card.categoryImage} alt={card.category} className="card-img-top" style={{ width: '80%', height: 'auto' }} />
                                        <div className="card-body" style={{ display: 'flex', color: '#0B6000', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                                            <h5 className="card-title" style={{ marginRight: '2rem' }}>{card.category}</h5>
                                        </div>
                                    </div>
                                    <div className="icon-container">
                                        <div className="read-more-icon">
                                            <FontAwesomeIcon icon={faEye} />
                                            <div className="tooltip">More...</div>
                                        </div>
                                        <div className="share-icon" onClick={(e) => getUrl(card.href, e)}>
                                            <FontAwesomeIcon icon={faShare} />
                                            <div className="tooltip">Share</div>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default LocalInformation;