import React, { useEffect, useState } from 'react'
import './Forcast.css'
import bannerImage1 from '../images/wheather-banner.jpg'
import iconImage1 from '../images/icons/icon-1.svg'
import iconImage2 from '../images/icon-umberella.png'
import iconImage3 from '../images/icon-wind.png'
import iconImage4 from '../images/icon-compass.png'
import iconImage5 from '../images/icons/icon-3.svg'
import iconImage6 from '../images/icons/icon-5.svg'
import iconImage7 from '../images/icons/icon-7.svg'
import { getAllCities, getForcast } from '../service/forcast.service'
import { DoubleRightOutlined } from '@ant-design/icons'
import { notification } from 'antd';
import Select from 'react-select';
import { FacebookIcon, FacebookShareButton, TelegramIcon, TelegramShareButton, TwitterIcon, TwitterShareButton, WhatsappIcon, WhatsappShareButton } from 'react-share'


const Forcast = () => {
    const [weather, setWeather] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [cities, setCities] = useState([]);
    const [selectedCity, setSelectedCity] = useState(null);
    const [searchResult, setSearchResult] = useState(null);


    const defaultCity = weather.find(data => data.city.toLowerCase() === 'accra');

    // Filter data based on search term
    let filteredData = weather.filter(data => searchTerm ? data.city.toLowerCase().includes(searchTerm.toLowerCase()) : data.city.toLowerCase() === 'accra');
    if (filteredData.length === 0 && weather.length > 0) {
        filteredData = defaultCity ? [defaultCity] : [];
    }

    const handleSearch = (city) => {
        if (!city) {
            return;
        }

        setSearchTerm(city);
        const cityData = weather.some(data => data.city.toLowerCase() === city.toLowerCase());

        if (!cityData) {
            notification.error({
                message: 'Forecast Not Available',
                description: `The city "${city}" does not have any forecast data available.`,
            });
        }
    };

    const formatDate = (date) => {
        const options = { day: 'numeric', month: 'long' };
        return date.toLocaleDateString('en-US', options);
    };

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

    const getCitiesData = () => {
        getAllCities().then((res) => {
            setCities(res.data)
        }).catch((error) => {
            notification.error({
                message: 'Error',
                description: 'An error occurred while fetching cities data.',
            });
        })
    }

    const options = cities.map(city => ({
        value: city.id,
        label: city.city,
    }));

    const currentTime = new Date()
    const hours = currentTime.getHours()

    const clearSearch = () => {
        setSearchResult(null);
        setSearchTerm('');
    };

    useEffect(() => {
        getForcastData()
        getCitiesData()
    }, [])

    return (
        <div style={{ color: "#fff" }}>
            <div className="hero" style={{ backgroundImage: `url(${bannerImage1})` }}>
                <div className="container">
                    <div style={{ color: "#000", backgroundColor: '#fecece' }}>
                        <Select
                            options={options} isClearable isSearchable="true"
                            styles={{ control: (provided) => ({ ...provided, width: '100', height: 50 }) }}
                            onChange={(selectedOption) => {
                                const name = selectedOption ? selectedOption.label : null;
                                setSelectedCity(name);
                                if (name === null || name === undefined) {
                                    clearSearch();
                                } else {
                                    handleSearch(name);
                                }
                            }}
                            placeholder="Select Your City"
                        />
                    </div>
                </div>
            </div>
            <div className="forecast-table">
                <div className="container">
                    <div className="forecast-container">
                        {filteredData.length > 0 ? filteredData.map((data, index) => (
                            <React.Fragment key={index}>
                                <div className="today forecast">
                                    <div className="forecast-header">
                                        <div className="day">{dayOfWeek}</div>
                                        <div className="date">{ }</div>
                                    </div>
                                    <div className="forecast-content">
                                        <div className="location">{data.city}</div>
                                        <div className="degree">
                                            <div className="num">
                                                {hours < 12 ? data.morningTemperatureValue :
                                                    (hours >= 12 && hours < 17) ? data.afternoonTemperatureValue :
                                                        data.eveningTemperatureValue
                                                }
                                                <sup>o</sup>C
                                            </div>
                                            <div className="forecast-icon">
                                                <img src={iconImage1} alt="" width="90" />
                                            </div>
                                        </div>
                                        <span><img src={iconImage2} alt="" />Morning: {data.morningTemperatureValue}</span>
                                        <span><img src={iconImage3} alt="" />Afternoon: {data.afternoonTemperatureValue}</span>
                                        <span><img src={iconImage4} alt="" />Evening: {data.eveningTemperatureValue}</span>
                                    </div>
                                    <div className="share-buttons mb-2">
                                        <FacebookShareButton
                                            style={{ marginRight: '5px', marginLeft: '20px' }}
                                            url={window.location.href}
                                            quote={`The weather in ${data.city} is ${data.morningTemperatureValue} <sup>o</sup>C in the morning, ${data.afternoonTemperatureValue} in the afternoon, and ${data.eveningTemperatureValue} in the evening.`}
                                            hashtag="#weatherForecast">
                                            <FacebookIcon size={32} round={true} />
                                        </FacebookShareButton>
                                        <TwitterShareButton
                                            style={{ marginRight: '5px' }}
                                            url={window.location.href}
                                            title={`The weather in ${data.city} is ${data.morningTemperatureValue} in the morning, ${data.afternoonTemperatureValue} in the afternoon, and ${data.eveningTemperatureValue} in the evening.`}
                                            hashtags={["weatherForecast"]}>
                                            <TwitterIcon size={32} round={true} />
                                        </TwitterShareButton>
                                        <WhatsappShareButton
                                            style={{ marginRight: '5px' }}
                                            url={window.location.href}
                                            title={`The weather in ${data.city} is ${data.morningTemperatureValue} in the morning, ${data.afternoonTemperatureValue} in the afternoon, and ${data.eveningTemperatureValue} in the evening.`}>
                                            <WhatsappIcon size={32} round={true} />
                                        </WhatsappShareButton>
                                        <TelegramShareButton
                                            style={{ marginRight: '5px' }}
                                            url={window.location.href}
                                            title={`The weather in ${data.city} is ${data.morningTemperatureValue} in the morning, ${data.afternoonTemperatureValue} in the afternoon, and ${data.eveningTemperatureValue} in the evening.`}>
                                            <TelegramIcon size={32} round={true} />
                                        </TelegramShareButton>
                                    </div>
                                </div>
                                <div className="forecast">
                                    <div className="forecast-header">
                                        <div className="day">{data.morningSessionZone}</div>
                                    </div>
                                    <div className="forecast-content">
                                        <div className="forecast-icon">
                                            <img src={iconImage5} alt="" width="48" />
                                        </div>
                                        {
                                            new Date(data.morningForecastDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                                        } <br />
                                        <div className="degree mt-2">{data.morningTemperatureValue}<sup>o</sup>C</div>
                                    </div>
                                </div>
                                <div className="forecast">
                                    <div className="forecast-header">
                                        <div className="day">{data.afternoonSessionZone}</div>
                                    </div>
                                    <div className="forecast-content">
                                        <div className="forecast-icon">
                                            <img src={iconImage6} alt="" width="48" />
                                        </div>
                                        {
                                            new Date(data.afternoonForecastDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                                        } <br />
                                        <div className="degree mt-2">{data.afternoonTemperatureValue}<sup>o</sup>C</div>
                                    </div>
                                </div>
                                <div className="forecast">
                                    <div className="forecast-header">
                                        <div className="day">{data.eveningSessionZone}</div>
                                    </div>
                                    <div className="forecast-content">
                                        <div className="forecast-icon">
                                            <img src={iconImage7} alt="" width="48" />
                                        </div>
                                        {
                                            new Date(data.eveningForecastDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                                        } <br />
                                        <div className="degree mt-2">{data.eveningTemperatureValue}<sup>o</sup>C</div>
                                    </div>
                                </div>
                            </React.Fragment>
                        )) : (
                            <div className="today forecast">
                                <div className="forecast-header">
                                    <div className="day">No data</div>
                                    <div className="date">0</div>
                                </div>
                                <div className="forecast-content">
                                    <div className="location">No data</div>
                                    <div className="degree">
                                        <div className="num">0<sup>o</sup>C</div>
                                        <div className="forecast-icon">
                                            <img src={iconImage1} alt="" width="90" />
                                        </div>
                                    </div>
                                    <span><img src={iconImage2} alt="" />0%</span>
                                    <span><img src={iconImage3} alt="" />0km/h</span>
                                    <span><img src={iconImage4} alt="" />No data</span>
                                </div>
                            </div>
                        )}

                    </div>
                    {weather.length > 0 ? (<div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'flex-end', }}>
                        <a href="/today-forcast" style={{ textDecoration: 'none', backgroundColor: '#21B1DB', padding: '10px 15px', width: '10rem', color: '#fff', textAlign: 'center', display: 'block', marginTop: '2rem', }}>
                            View More
                            <DoubleRightOutlined className='icon' style={{ marginLeft: '0.3rem', }} />
                        </a>
                    </div>
                    ) : null}
                </div>
            </div>
        </div >
    )
}

export default Forcast