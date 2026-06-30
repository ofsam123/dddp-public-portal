import React, { useEffect, useState } from 'react'
import NavBar from '../../../header/NavBar';
import iconImage2 from '../../images/icon-umberella.png'
import iconImage3 from '../../images/icon-wind.png'
import iconImage4 from '../../images/icon-compass.png'
import bannerImage1 from '../../images/wheather-banner.jpg'
import { getAllCities, getAllForecast, getForecastsByCityAndDate } from '../../service/forcast.service';
import { Button, DatePicker, Space, Select, notification, Table } from 'antd';
import { DownloadOutlined, SearchOutlined } from '@ant-design/icons';
import LisaFooter from '../../footer/LisaFooter';
import exportFromJSON from 'export-from-json'
import './TodayForecast.css'
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



const AllForecast = () => {
    const [weather, setWeather] = useState([])
    const [searchResult, setSearchResult] = useState(null);
    const [selectedDate, setSelectedDate] = useState(null);
    const [selectedCity, setSelectedCity] = useState(null);
    const [dataGridSearchResult, setDataGridSearchResult] = useState(null);
    const [cities, setCities] = useState([]);

    const currentDate = weather && weather.data && weather.data.date ? weather.data.date : [1970, 1, 1, 0, 0];
    const date = new Date(currentDate[0], currentDate[1] - 1, currentDate[2], currentDate[3], currentDate[4]);

    const formatDate = (date) => {
        if (!date) {
            return;
        }
        const options = { day: 'numeric', month: 'long' };
        return new Date(date[0], date[1] - 1, date[2], date[3], date[4]).toLocaleDateString('en-US', options);
    };

    const getDayOfWeek = (date) => {
        if (!date) {
            return;
        }
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        return days[new Date(date[0], date[1] - 1, date[2], date[3], date[4]).getDay()];
    };

    const formatDate1 = (date) => {
        if (!date) {
            return;
        }
        const options = { day: 'numeric', month: 'long' };
        return date.toLocaleDateString('en-US', options);
    };

    const getDayOfWeek1 = (date) => {
        if (!date) {
            return;
        }
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        return days[date.getDay()];
    };

    const getYesterday = () => {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        yesterday.setHours(0, 0, 0, 0);
        return yesterday;
    }

    const getForcastData = () => {
        getAllForecast()
            .then((res) => {
                console.log('All Forcast data', res.data)
                setWeather(res.data)
            })
            .catch((error) => {
                console.log(error)
            })
        getAllCities()
            .then((res) => {
                setCities(res.data)
            })
            .catch((error) => {
                console.log(error)
            })
    }

    const currentTime = new Date()
    const hours = currentTime.getHours()

    useEffect(() => {
        getForcastData()
        console.log("Weather", weather)
    }, [])

    const onSearch = () => {
        if (selectedCity && selectedDate) {
            getForecastsByCityAndDate(selectedCity, selectedDate)
                .then((res) => {
                    if (res.data.length === '') {
                        notification.error({
                            message: 'No data found',
                            description: 'No data found for the selected city and date',
                        });
                    }
                    setSearchResult(res.data)
                })
                .catch((error) => {
                    console.log(error)
                })
        }
    };

    const onSearchDataGrid = () => {
        if (selectedCity && selectedDate) {
            getForecastsByCityAndDate(selectedCity, selectedDate)
                .then((res) => {
                    if (res.data.length === '') {
                        notification.error({
                            message: 'No data found',
                            description: 'No data found for the selected city and date',
                        });
                    }
                    setDataGridSearchResult(res.data)
                })
                .catch((error) => {
                    console.log(error)
                })
        }
    };

    const clearSearch = () => {
        setSearchResult(null);
    };

    const clearSearchDataGrid = () => {
        setDataGridSearchResult(null);
    };

    const handleExport = () => {
        const fileName = 'weather-data';
        const exportType = exportFromJSON.types.csv
        const dataToBeExportedTemp = [];
        flattenedWeather.forEach(report => {
            const currentReport = {
                City: report.city,
                Date: formatDate1(new Date(...report.date)),
                MorningTemp: report.morningTemperatureValue,
                AfternoonTemp: report.afternoonTemperatureValue,
                EveningTemp: report.eveningTemperatureValue
            };

            dataToBeExportedTemp.push(currentReport);
        });

        exportFromJSON({ data: dataToBeExportedTemp, fileName, exportType })
    }

    const flattenedWeather = weather.flat().filter(Boolean);
    const dataToDisplay = searchResult || weather.slice(0, 14);
    // const renderData = searchResult || weather;
    console.log('Data to display', dataToDisplay)
    return (
        <div>
            <NavBar />
            <div>
                <div className="hero" style={{ backgroundImage: `url(${bannerImage1})`, }}></div>
                <div className='meteo-desc'>
                    <h1 style={{ color: '#0B6000', marginTop: '4rem', fontSize: '3.5rem', fontFamily: 'sans-serif' }}>Ghana Meteorological Agency Historical Forecast</h1>
                    {weather.length > 0 &&
                        <p style={{ fontSize: '1.5rem', fontFamily: 'sans-serif' }}>
                            {weather[0]?.summary?.content}
                        </p>
                    }
                </div>
                <div style={{ color: "#fff" }}>
                    <div className="all-container">
                        <div className="all-forecast-container" style={{ display: 'flex', flexDirection: 'column' }}>
                            <div style={{ marginBottom: '1rem', color: '#000', display: 'flex', flexDirection: 'row', justifyContent: 'center' }}>
                                <h4 style={{ marginRight: '1rem', color: '#0B6000' }}>Search forecast for a city</h4>
                                <Select
                                    showSearch
                                    style={{
                                        width: 200,
                                    }}
                                    placeholder="Select a City"
                                    optionFilterProp="children"
                                    filterOption={(input, option) => (option?.label ?? '').includes(input)}
                                    filterSort={(optionA, optionB) =>
                                        (optionA?.label ?? '').toLowerCase().localeCompare((optionB?.label ?? '').toLowerCase())
                                    }
                                    options={cities.map(city => ({
                                        value: city.id,
                                        label: city.city,
                                    }))}
                                    onChange={(value) => {
                                        setSelectedCity(value);
                                        if (value === null || value === undefined) {
                                            clearSearch();
                                        }
                                    }}
                                    allowClear
                                />
                                <Space direction="vertical" style={{ marginLeft: '0.5rem' }}>
                                    <DatePicker onChange={(date, dateString) => {
                                        setSelectedDate(dateString);
                                        if (date === null || dateString === '') {
                                            clearSearch();
                                        }
                                    }} />
                                </Space>
                                <Button type="primary" style={{ marginLeft: '0.5rem' }} icon={<SearchOutlined />} onClick={onSearch}>
                                    Search
                                </Button>
                            </div>
                            <div>
                                {searchResult && searchResult.length > 0 ? (
                                    <div style={{ marginBottom: '5rem', marginTop: '5rem', display: 'flex', flexDirection: 'row', justifyContent: 'center', flexWrap: 'wrap' }}>
                                        {/* Search section start */}
                                        {dataToDisplay.map((data, index) => {
                                            if (!data) {
                                                return null;
                                            }
                                            return (
                                                <React.Fragment key={index}>
                                                    <div className="all-today all-forecast">
                                                        <div className="all-forecast-header">
                                                            <div className="all-day">{data.date ? getDayOfWeek(data.date) : 'N/A'}</div>
                                                            <div className="all-date">{data.date ? formatDate(data.date) : 'N/A'}</div>
                                                        </div>
                                                        <div className="all-forecast-content" style={{ margin: '0 auto' }}>
                                                            <div className="all-location">{data.city}</div>
                                                            <div className="all-degree" style={{ display: 'flex', flexDirection: 'column', }}>
                                                                <div>{data.morningTemperatureValue}<sup>o</sup>C</div>
                                                                <div className="all-forecast-icon mb-5" style={{ margin: '0 auto' }} >
                                                                    <img src={data.morningWeatherConditionIcon} alt="" width="90" />
                                                                </div>
                                                            </div>
                                                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                                                <div style={{ fontSize: '0.8rem', display: 'flex', flexDirection: 'row', marginBottom: '10px', marginLeft: '15px' }}>
                                                                    <img src={iconImage2} width={15} height={20} alt=""/>
                                                                    <div style={{ marginLeft: '1rem', fontSize: '1rem',}}>
                                                                        {data.date ? formatDate(data.date) : 'N/A'}
                                                                        <span style={{ marginLeft: '0.5rem' }}></span>Morning : {data.morningTemperatureValue}
                                                                    </div>
                                                                </div>
                                                                <div style={{ fontSize: '0.8rem', display: 'flex', flexDirection: 'row', marginBottom: '9px', marginLeft: '0.6rem' }}>
                                                                    <img src={iconImage3} width={15} height={20} alt="" />
                                                                    <div style={{ marginLeft: '20px', fontSize: '1rem' }}>
                                                                       {data.date ? formatDate(data.date) : 'N/A'}
                                                                        <span style={{ marginLeft: '0.5rem' }}></span>Afternoon : {data.afternoonTemperatureValue}
                                                                    </div>
                                                                </div>
                                                                <div style={{ fontSize: '0.8rem', display: 'flex', flexDirection: 'row', marginLeft: '0.6rem' }}>
                                                                    <img src={iconImage4} width={18} height={18} alt="" />
                                                                    <div style={{ marginLeft: '15px', fontSize: '1rem' }}>
                                                                        {data.date ? formatDate(data.date) : 'N/A'}
                                                                        <span style={{ marginLeft: '0.5rem' }}></span>Evening : {data.eveningTemperatureValue}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </React.Fragment>
                                            );
                                        })}
                                        {/* End search section */}
                                    </div>
                                ) : (
                                    <div style={{ marginBottom: '5rem', marginTop: '5rem', display: 'flex', flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', paddingLeft: '2rem' }}>
                                        {dataToDisplay && dataToDisplay.map((subArray, index) => (
                                            <React.Fragment key={index}>
                                                {subArray.map((data, subIndex) => (
                                                    <div className="all-today all-forecast" key={`${index}-${subIndex}`}>
                                                        <div className="all-forecast-header">
                                                            <div className="all-day">{data.date ? getDayOfWeek(data.date) : 'N/A'}</div>
                                                            <div className="all-date">{data.date ? formatDate(data.date) : 'N/A'}</div>
                                                        </div>
                                                        <div className="all-forecast-content">
                                                            <div className="all-location">{data.city}</div>
                                                            <div className="all-degree" style={{ display: 'flex', flexDirection: 'column', }}>
                                                                <div>{data.morningTemperatureValue}<sup>o</sup>C</div>
                                                                <div className="all-forecast-icon mb-5" style={{ margin: '0 auto' }} >
                                                                    <img src={data.morningWeatherConditionIcon} alt="" width="90" />
                                                                </div>
                                                            </div>
                                                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                                                <div style={{ fontSize: '0.8rem', display: 'flex', flexDirection: 'row', marginBottom: '10px', marginLeft: '15px' }}>
                                                                    <img src={iconImage2} width={15} height={20} alt=""/>
                                                                    <div style={{ marginLeft: '1rem', fontSize: '1rem',}}>
                                                                        {data.date ? formatDate(data.date) : 'N/A'}
                                                                        <span style={{ marginLeft: '0.5rem' }}></span>Morning : {data.morningTemperatureValue}
                                                                    </div>
                                                                </div>
                                                                <div style={{ fontSize: '0.8rem', display: 'flex', flexDirection: 'row', marginBottom: '9px', marginLeft: '0.6rem' }}>
                                                                    <img src={iconImage3} width={15} height={20} alt="" />
                                                                    <div style={{ marginLeft: '20px', fontSize: '1rem' }}>
                                                                       {data.date ? formatDate(data.date) : 'N/A'}
                                                                        <span style={{ marginLeft: '0.5rem' }}></span>Afternoon : {data.afternoonTemperatureValue}
                                                                    </div>
                                                                </div>
                                                                <div style={{ fontSize: '0.8rem', display: 'flex', flexDirection: 'row', marginLeft: '0.6rem' }}>
                                                                    <img src={iconImage4} width={18} height={18} alt="" />
                                                                    <div style={{ marginLeft: '15px', fontSize: '1rem' }}>
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
                                                ))}
                                            </React.Fragment>
                                        ))}
                                    </div>

                                )}
                            </div>
                            <div style={{ width: '60%', margin: '0 auto' }}>
                                <h2 style={{ textAlign: 'center', marginBottom: '1rem', color: '#0B6000' }}>Forecast Grid Table</h2>
                                <div style={{ marginBottom: '2rem', color: '#000', display: 'flex', flexDirection: 'row', justifyContent: 'center' }}>
                                    <h4 style={{ marginRight: '1rem', color: '#0B6000' }}>Search forecast</h4>

                                    <Select
                                        showSearch
                                        style={{
                                            width: 200,
                                        }}
                                        placeholder="Select a City"
                                        optionFilterProp="children"
                                        filterOption={(input, option) => (option?.label ?? '').includes(input)}
                                        filterSort={(optionA, optionB) =>
                                            (optionA?.label ?? '').toLowerCase().localeCompare((optionB?.label ?? '').toLowerCase())
                                        }
                                        options={cities.map(city => ({
                                            value: city.id,
                                            label: city.city,
                                        }))}
                                        onChange={(value) => {
                                            setSelectedCity(value);
                                            if (value === null || value === undefined) {
                                                clearSearch();
                                            }
                                        }}
                                        allowClear
                                    />
                                    <Space direction="vertical">
                                        <DatePicker style={{ marginLeft: '0.3rem' }} onChange={(date, dateString) => {
                                            setSelectedDate(dateString);
                                            if (date === null || dateString === '') {
                                                clearSearchDataGrid();
                                            }
                                        }} />
                                    </Space>
                                    <Button type="primary" style={{ marginLeft: '0.3rem' }} icon={<SearchOutlined />} onClick={onSearchDataGrid}>
                                        Search
                                    </Button>
                                    <Button type="primary" style={{ marginLeft: '0.3rem' }} onClick={handleExport} icon={<DownloadOutlined />} size={'middle'}>
                                        Download
                                    </Button>
                                </div>
                                <Table
                                    columns={[
                                        {
                                            title: 'No.',
                                            dataIndex: 'key',
                                            key: 'key',
                                            render: (text, record, index) => index + 1,
                                        },
                                        {
                                            title: 'City',
                                            dataIndex: 'city',
                                            key: 'city',
                                        },
                                        {
                                            title: 'Date',
                                            dataIndex: 'date',
                                            key: 'date',
                                            render: (date) => {
                                                const adjustedDate = [...date];
                                                adjustedDate[1] -= 1;
                                                return formatDate1(new Date(...adjustedDate));
                                            },
                                        },

                                        {
                                            title: 'Morning Temp',
                                            dataIndex: 'morningTemperatureValue',
                                            key: 'morningTemperatureValue',
                                        },
                                        {
                                            title: 'Afternoon Temp',
                                            dataIndex: 'afternoonTemperatureValue',
                                            key: 'afternoonTemperatureValue',
                                        },
                                        {
                                            title: 'Evening Temp',
                                            dataIndex: 'eveningTemperatureValue',
                                            key: 'eveningTemperatureValue',
                                        },
                                    ]}
                                    // dataSource={dataGridSearchResult || flattenedWeather}
                                    dataSource={dataGridSearchResult ? dataGridSearchResult.slice(0, 10) : flattenedWeather.slice(0, 10)}
                                    pagination={false}
                                    bordered={true}
                                    size={'middle'}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div style={{ marginTop: '1px !important' }}>
                <LisaFooter />
            </div>
        </div>
    )
}

export default AllForecast