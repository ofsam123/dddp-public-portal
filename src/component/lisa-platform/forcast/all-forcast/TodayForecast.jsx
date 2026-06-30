import React, { useEffect, useState } from 'react'
import '../all-forcast/TodayForecast.css'
import { getForcast } from '../../service/forcast.service';
import Navbar from '../../../header/NavBar'
import LisaFooter from '../../footer/LisaFooter';

import iconImage1 from '../../images/icons/icon-1.svg'
import iconImage2 from '../../images/icon-umberella.png'
import iconImage3 from '../../images/icon-wind.png'
import iconImage4 from '../../images/icon-compass.png'
import bannerImage1 from '../../images/wheather-banner.jpg'
import DownloadPDF from '../../downloadPDF/DownloadPDF';
import {
    FacebookIcon,
    FacebookShareButton,
    TwitterShareButton,
    InstapaperIcon,
    LinkedinIcon,
    TelegramIcon,
    TwitterIcon,
    WhatsappIcon,
    WhatsappShareButton,
    TelegramShareButton,

} from "react-share";
import { Table } from 'antd';


const TodayForecast = () => {
    const [weather, setWeather] = useState([])
    const [dataGridSearchResult, setDataGridSearchResult] = useState(null);

    // const formatDate = (date) => {
    //     const options = { day: 'numeric', month: 'long' };
    //     return date.toLocaleDateString('en-US', options);
    // };
    const formatDate = (date) => {
        if (!date) {
            return;
        }
        const options = { day: 'numeric', month: 'long' };
        return new Date(date[0], date[1] - 1, date[2], date[3], date[4]).toLocaleDateString('en-US', options);
    };

    const today = new Date();
    const formattedDateTable = today.toISOString().split('T')[0];

    const getDayOfWeek = (date) => {
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        return days[date.getDay()];
    };

    const currentDate = weather && weather.data && weather.data.date ? weather.data.date : [1970, 1, 1, 0, 0];
    const date = new Date(currentDate[0], currentDate[1] - 1, currentDate[2], currentDate[3], currentDate[4]);
    const formattedDate = formatDate(date);
    const dayOfWeek = getDayOfWeek(date);

    const getForcastData = () => {
        getForcast()
            .then((res) => {
                setWeather(res.data)
            })
            .catch((error) => {
                console.log(error)
            })
    }

    const formatDate1 = (date) => {
        if (!date) {
            return;
        }
        const options = { day: 'numeric', month: 'long' };
        return date.toLocaleDateString('en-US', options);
    };

    const currentTime = new Date()
    const hours = currentTime.getHours()

    useEffect(() => {
        getForcastData()
    }, [])

    const flattenedWeather = weather.flat().filter(Boolean);

    return (
        <div>
            <Navbar />
            <div style={{ marginBottom: '10rem' }}>
                <div className="hero" style={{ backgroundImage: `url(${bannerImage1})`, }}>
                </div>
                <div className='meteo-desc'>
                    <h1 style={{ color: '#0B6000', marginTop: '4rem', fontSize: '3.5rem', fontFamily: 'sans-serif' }}>Ghana Meteorological Agency</h1>
                    {weather.length > 0 &&
                        <p style={{ fontSize: '1.5rem', fontFamily: 'sans-serif', }}>
                            <span style={{ fontWeight: 'bold' }}>SUMMARY:</span> {weather[0].summary}
                        </p>
                    }
                </div>
                <div style={{ color: "#fff" }}>
                    <div className="all-container">
                        <div className="all-forecast-container">
                            {weather.map((data, index) => (
                                <React.Fragment key={index}>
                                    <div className="all-today all-forecast">
                                        <div className="all-forecast-header">
                                            <div className="all-day">{dayOfWeek}</div>
                                            <div className="all-date">{ }</div>
                                        </div>
                                        <div className="all-forecast-content">
                                            <div className="all-location">{data.city}</div>
                                            <div className="all-degree" style={{ display: 'flex', flexDirection: 'column', margin: '0 auto' }}>
                                                <div // className="all-num"
                                                >
                                                    {hours < 12 ? data.morningTemperatureValue :
                                                        (hours >= 12 && hours < 17) ? data.afternoonTemperatureValue :
                                                            data.eveningTemperatureValue}
                                                    <sup>o</sup>C
                                                </div>
                                                <div className="all-forecast-icon" style={{ margin: '0 auto', marginBottom: ' 10px', marginTop: '10px' }}>
                                                    <img src={iconImage1} alt="" width="50" />
                                                </div>
                                            </div>
                                            {/* <div style={{ display: 'flex', flexDirection: 'column' }}>
                                                <span style={{ fontSize: '0.8rem', display: 'flex', flexDirection: 'row', marginBottom: '10px' }}>
                                                    <img src={iconImage2} width={20} height={25} alt="" />
                                                    <div style={{ marginLeft: '0.2rem' }}>
                                                        {
                                                            new Date(data.morningForecastDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                                                        } <br />
                                                        Morning : {data.morningTemperatureValue}
                                                    </div>
                                                </span>
                                                <span style={{ fontSize: '0.8rem', display: 'flex', flexDirection: 'row', marginBottom: '10px' }}>
                                                    <img src={iconImage3} width={23} height={25} alt="" />
                                                    <div style={{ marginLeft: '0.2rem' }}>
                                                        {
                                                            new Date(data.afternoonForecastDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                                                        } <br />
                                                        Afternoon : {data.afternoonTemperatureValue}
                                                    </div>
                                                </span>
                                                <span style={{ fontSize: '0.8rem', display: 'flex', flexDirection: 'row' }}>
                                                    <img src={iconImage4} width={23} height={25} alt="" />
                                                    <div>
                                                        {
                                                            new Date(data.eveningForecastDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                                                        } <br />
                                                        Evening : {data.eveningTemperatureValue}
                                                    </div>
                                                </span>
                                            </div> */}
                                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                                <div style={{ fontSize: '0.8rem', display: 'flex', flexDirection: 'row', marginBottom: '11px', marginLeft: '15px' }}>
                                                    <img src={iconImage2} width={15} height={20} alt="" />
                                                    <div style={{ marginLeft: '20px', fontSize: '1rem'}}>
                                                        {data.date ? formatDate(data.date) : 'N/A'}
                                                        <span style={{ marginLeft: '0.5rem' }}></span>Morning : {data.morningTemperatureValue}
                                                    </div>
                                                </div>
                                                <div style={{ fontSize: '0.8rem', display: 'flex', flexDirection: 'row', marginBottom: '9px', marginLeft: '1rem' }}>
                                                    <img src={iconImage3} width={15} height={20} alt="" />
                                                    <div style={{ marginLeft: '20px', fontSize: '1rem' }}>
                                                        {data.date ? formatDate(data.date) : 'N/A'}
                                                        <span style={{ marginLeft: '0.5rem' }}></span>Afternoon : {data.afternoonTemperatureValue}
                                                    </div>
                                                </div>
                                                <div style={{ fontSize: '0.8rem', display: 'flex', flexDirection: 'row', marginLeft: '1rem' }}>
                                                    <img src={iconImage4} width={18} height={18} alt="" />
                                                    <div style={{ marginLeft: '17px', fontSize: '1rem' }}>
                                                        {data.date ? formatDate(data.date) : 'N/A'}
                                                        <span style={{ marginLeft: '0.5rem' }}></span>Evening : {data.eveningTemperatureValue}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="share-buttons mb-2" style={{ display: 'flex', flexDirection: 'row', margin: '0 auto' }}>
                                            <FacebookShareButton
                                                style={{ marginRight: '5px' }}
                                                url={window.location.href}
                                                quote={`The weather in ${data.city} is ${data.morningTemperatureValue} in the morning, ${data.afternoonTemperatureValue} in the afternoon, and ${data.eveningTemperatureValue} in the evening.`}
                                                hashtag="#weatherForecast">
                                                <FacebookIcon size={20} round={true} />
                                            </FacebookShareButton>
                                            <TwitterShareButton
                                                style={{ marginRight: '5px' }}
                                                url={window.location.href}
                                                title={`The weather in ${data.city} is ${data.morningTemperatureValue} in the morning, ${data.afternoonTemperatureValue} in the afternoon, and ${data.eveningTemperatureValue} in the evening.`}
                                                hashtags={["weatherForecast"]}>
                                                <TwitterIcon size={20} round={true} />
                                            </TwitterShareButton>
                                            <WhatsappShareButton
                                                style={{ marginRight: '5px' }}
                                                url={window.location.href}
                                                title={`The weather in ${data.city} is ${data.morningTemperatureValue} in the morning, ${data.afternoonTemperatureValue} in the afternoon, and ${data.eveningTemperatureValue} in the evening.`}>
                                                <WhatsappIcon size={20} round={true} />
                                            </WhatsappShareButton>
                                            <TelegramShareButton
                                                style={{ marginRight: '5px' }}
                                                url={window.location.href}
                                                title={`The weather in ${data.city} is ${data.morningTemperatureValue} in the morning, ${data.afternoonTemperatureValue} in the afternoon, and ${data.eveningTemperatureValue} in the evening.`}>
                                                <TelegramIcon size={20} round={true} />
                                            </TelegramShareButton>
                                        </div>
                                    </div>
                                </React.Fragment>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <div style={{
                display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', marginTop: '3rem',
                backgroundColor: '#F5F7FE', minHeight: '50vh', width: '100%', paddingBottom: '5rem', paddingTop: '3rem'
            }}
            >
                <h2 style={{ marginBottom: '2rem', color: '#0B6000', textAlign: 'center' }}>DAILY WEATHER FORECAST</h2>
                <Table
                    columns={[
                        {
                            title: 'CITIES',
                            dataIndex: 'city',
                            key: 'city',
                        },
                        {
                            title: `WEATHER BRIEF (${formattedDateTable})`,
                            children: [
                                {
                                    title: 'MORNING',
                                    dataIndex: 'morningWeatherCondition',
                                    key: 'morningWeatherCondition',
                                },
                                {
                                    title: 'TEMP (°C)',
                                    dataIndex: 'morningTemperatureValue',
                                    key: 'morningTemperatureValue',
                                },
                                {
                                    title: 'AFTERNOON',
                                    dataIndex: 'afternoonWeatherCondition',
                                    key: 'afternoonWeatherCondition',
                                },
                                {
                                    title: 'TEMP (°C)',
                                    dataIndex: 'afternoonTemperatureValue',
                                    key: 'afternoonTemperatureValue',
                                },
                                {
                                    title: 'EVENING',
                                    dataIndex: 'eveningWeatherCondition',
                                    key: 'eveningWeatherCondition',
                                },
                                {
                                    title: 'TEMP (°C)',
                                    dataIndex: 'eveningTemperatureValue',
                                    key: 'eveningTemperatureValue',
                                },
                            ],
                        },
                    ]}
                    // dataSource={dataGridSearchResult || flattenedWeather}
                    dataSource={dataGridSearchResult ? dataGridSearchResult.slice(0, 10) : flattenedWeather.slice(0, 10)}
                    pagination={false}
                    bordered={true}
                    size={'middle'}
                    style={{ width: '70%', margin: '0 auto', marginTop: '2rem' }}
                />
            </div>
            <DownloadPDF />
            <div style={{ marginTop: '1px !important' }}>
                <LisaFooter />
            </div>

        </div>
    )
}

export default TodayForecast