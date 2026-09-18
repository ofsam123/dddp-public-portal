import React, { useEffect, useMemo, useState } from 'react'
import { Button, DatePicker, Select, Table, notification } from 'antd'
import { DownloadOutlined, SearchOutlined } from '@ant-design/icons'
import {
    FacebookIcon,
    FacebookShareButton,
    TelegramIcon,
    TelegramShareButton,
    TwitterIcon,
    TwitterShareButton,
    WhatsappIcon,
    WhatsappShareButton,
} from 'react-share'
import exportFromJSON from 'export-from-json'
import NavBar from '../../../header/NavBar'
import PublicFooter from '../../../footer/PublicFooter'
import iconImage2 from '../../images/icon-umberella.png'
import iconImage3 from '../../images/icon-wind.png'
import iconImage4 from '../../images/icon-compass.png'
import { getAllCities, getAllForecast, getForecastsByCityAndDate } from '../../service/forcast.service'
import './AllForecast.css'

const getDateObject = (date) => {
    if (!Array.isArray(date)) return null
    return new Date(date[0], date[1] - 1, date[2], date[3] || 0, date[4] || 0)
}

const formatDate = (date) => {
    const dateObject = getDateObject(date)
    if (!dateObject) return 'N/A'
    return dateObject.toLocaleDateString('en-US', { day: 'numeric', month: 'long' })
}

const getDayOfWeek = (date) => {
    const dateObject = getDateObject(date)
    if (!dateObject) return 'N/A'
    return dateObject.toLocaleDateString('en-US', { weekday: 'long' })
}

const formatExportDate = (date) => {
    const dateObject = getDateObject(date)
    if (!dateObject) return 'N/A'
    return dateObject.toLocaleDateString('en-US', { day: 'numeric', month: 'long' })
}

const ForecastMetric = ({ icon, label, value }) => (
    <div className="forecast-history-card__metric">
        <img src={icon} alt="" />
        <span>{label}</span>
        <strong>{value || 'N/A'}</strong>
    </div>
)

const ForecastCard = ({ forecast }) => {
    const shareText = `The weather in ${forecast.city} is ${forecast.morningTemperatureValue} in the morning, ${forecast.afternoonTemperatureValue} in the afternoon, and ${forecast.eveningTemperatureValue} in the evening.`

    return (
        <article className="forecast-history-card">
            <div className="forecast-history-card__top">
                <span>{getDayOfWeek(forecast.date)}</span>
                <span>{formatDate(forecast.date)}</span>
            </div>

            <div className="forecast-history-card__body">
                <div>
                    <span className="forecast-history-card__city">{forecast.city}</span>
                    <div className="forecast-history-card__temp">
                        {forecast.morningTemperatureValue || 'N/A'}<sup>°C</sup>
                    </div>
                </div>

                {forecast.morningWeatherConditionIcon ? (
                    <img className="forecast-history-card__weather-icon" src={forecast.morningWeatherConditionIcon} alt="" />
                ) : null}

                <div className="forecast-history-card__metrics">
                    <ForecastMetric icon={iconImage2} label="Morning" value={forecast.morningTemperatureValue} />
                    <ForecastMetric icon={iconImage3} label="Afternoon" value={forecast.afternoonTemperatureValue} />
                    <ForecastMetric icon={iconImage4} label="Evening" value={forecast.eveningTemperatureValue} />
                </div>
            </div>

            <div className="forecast-history-card__share" aria-label={`Share forecast for ${forecast.city}`}>
                <FacebookShareButton url={window.location.href} quote={shareText} hashtag="#weatherForecast">
                    <FacebookIcon size={22} round />
                </FacebookShareButton>
                <TwitterShareButton url={window.location.href} title={shareText} hashtags={['weatherForecast']}>
                    <TwitterIcon size={22} round />
                </TwitterShareButton>
                <WhatsappShareButton url={window.location.href} title={shareText}>
                    <WhatsappIcon size={22} round />
                </WhatsappShareButton>
                <TelegramShareButton url={window.location.href} title={shareText}>
                    <TelegramIcon size={22} round />
                </TelegramShareButton>
            </div>
        </article>
    )
}

const ForecastFilters = ({
    title,
    cities,
    onCityChange,
    onDateChange,
    onSearch,
    extraAction,
}) => (
    <div className="forecast-filter">
        <div>
            <span className="forecast-filter__eyebrow">Filter</span>
            <h2>{title}</h2>
        </div>
        <div className="forecast-filter__controls">
            <Select
                showSearch
                className="forecast-filter__select"
                placeholder="Select a city"
                optionFilterProp="children"
                filterOption={(input, option) => (option?.label ?? '').toLowerCase().includes(input.toLowerCase())}
                filterSort={(optionA, optionB) =>
                    (optionA?.label ?? '').toLowerCase().localeCompare((optionB?.label ?? '').toLowerCase())
                }
                options={cities.map((city) => ({
                    value: city.id,
                    label: city.city,
                }))}
                onChange={onCityChange}
                allowClear
            />
            <DatePicker className="forecast-filter__date" onChange={onDateChange} />
            <Button type="primary" icon={<SearchOutlined />} onClick={onSearch}>
                Search
            </Button>
            {extraAction}
        </div>
    </div>
)

const AllForecast = () => {
    const [weather, setWeather] = useState([])
    const [searchResult, setSearchResult] = useState(null)
    const [selectedDate, setSelectedDate] = useState(null)
    const [selectedCity, setSelectedCity] = useState(null)
    const [dataGridSearchResult, setDataGridSearchResult] = useState(null)
    const [cities, setCities] = useState([])

    useEffect(() => {
        getAllForecast()
            .then((res) => setWeather(res.data || []))
            .catch(() => {
                notification.error({
                    message: 'Forecast unavailable',
                    description: 'Unable to load forecast history at the moment.',
                })
            })

        getAllCities()
            .then((res) => setCities(res.data || []))
            .catch(() => {
                notification.error({
                    message: 'Cities unavailable',
                    description: 'Unable to load the city list at the moment.',
                })
            })
    }, [])

    const flattenedWeather = useMemo(() => weather.flat().filter(Boolean), [weather])
    const summary = weather[0]?.summary?.content || weather[0]?.summary
    const forecastCards = searchResult || weather.slice(0, 14).flat().filter(Boolean)
    const tableData = dataGridSearchResult || flattenedWeather

    const handleMissingFilters = () => {
        notification.warning({
            message: 'Choose a city and date',
            description: 'Select both fields before searching the forecast history.',
        })
    }

    const onSearch = () => {
        if (!selectedCity || !selectedDate) {
            handleMissingFilters()
            return
        }

        getForecastsByCityAndDate(selectedCity, selectedDate)
            .then((res) => {
                const result = res.data || []
                if (!result.length) {
                    notification.error({
                        message: 'No data found',
                        description: 'No forecast was found for the selected city and date.',
                    })
                }
                setSearchResult(result)
            })
            .catch(() => {
                notification.error({
                    message: 'Search failed',
                    description: 'Unable to search forecast history at the moment.',
                })
            })
    }

    const onSearchDataGrid = () => {
        if (!selectedCity || !selectedDate) {
            handleMissingFilters()
            return
        }

        getForecastsByCityAndDate(selectedCity, selectedDate)
            .then((res) => {
                const result = res.data || []
                if (!result.length) {
                    notification.error({
                        message: 'No data found',
                        description: 'No table records were found for the selected city and date.',
                    })
                }
                setDataGridSearchResult(result)
            })
            .catch(() => {
                notification.error({
                    message: 'Search failed',
                    description: 'Unable to search table records at the moment.',
                })
            })
    }

    const handleExport = () => {
        const dataToBeExported = tableData.map((report) => ({
            City: report.city,
            Date: formatExportDate(report.date),
            MorningTemp: report.morningTemperatureValue,
            AfternoonTemp: report.afternoonTemperatureValue,
            EveningTemp: report.eveningTemperatureValue,
        }))

        exportFromJSON({
            data: dataToBeExported,
            fileName: 'weather-data',
            exportType: exportFromJSON.types.csv,
        })
    }

    const clearForecastSearch = () => {
        setSearchResult(null)
        setSelectedCity(null)
    }

    const clearTableSearch = () => {
        setDataGridSearchResult(null)
        setSelectedCity(null)
    }

    const columns = [
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
            render: formatExportDate,
        },
        {
            title: 'Morning temp',
            dataIndex: 'morningTemperatureValue',
            key: 'morningTemperatureValue',
        },
        {
            title: 'Afternoon temp',
            dataIndex: 'afternoonTemperatureValue',
            key: 'afternoonTemperatureValue',
        },
        {
            title: 'Evening temp',
            dataIndex: 'eveningTemperatureValue',
            key: 'eveningTemperatureValue',
        },
    ]

    return (
        <main className="forecast-history-page">
            <NavBar />

            <section className="forecast-history-hero">
                <div>
                    <span className="section-kicker">Forecast archive</span>
                    <h1>Ghana Meteorological Agency historical forecast.</h1>
                    <p>
                        {summary || 'Search and review historical city-level forecasts to support planning, monitoring and climate-informed local decisions.'}
                    </p>
                </div>
            </section>

            <section className="forecast-history-section" aria-labelledby="forecast-cards-title">
                <ForecastFilters
                    title="Search forecast cards"
                    cities={cities}
                    onCityChange={(value) => {
                        setSelectedCity(value)
                        if (!value) clearForecastSearch()
                    }}
                    onDateChange={(date, dateString) => {
                        setSelectedDate(dateString)
                        if (!date || !dateString) setSearchResult(null)
                    }}
                    onSearch={onSearch}
                />

                <div className="forecast-history-section__heading">
                    <h2 id="forecast-cards-title">{searchResult ? 'Search results' : 'Recent forecast history'}</h2>
                    <p>{forecastCards.length} records shown</p>
                </div>

                <div className="forecast-history-grid">
                    {forecastCards.map((forecast, index) => (
                        <ForecastCard forecast={forecast} key={`${forecast.city}-${forecast.date?.join('-') || index}`} />
                    ))}
                </div>
            </section>

            <section className="forecast-history-table-section" aria-labelledby="forecast-table-title">
                <ForecastFilters
                    title="Search forecast table"
                    cities={cities}
                    onCityChange={(value) => {
                        setSelectedCity(value)
                        if (!value) clearTableSearch()
                    }}
                    onDateChange={(date, dateString) => {
                        setSelectedDate(dateString)
                        if (!date || !dateString) setDataGridSearchResult(null)
                    }}
                    onSearch={onSearchDataGrid}
                    extraAction={(
                        <Button type="primary" icon={<DownloadOutlined />} onClick={handleExport}>
                            Download
                        </Button>
                    )}
                />

                <div className="forecast-history-table-card">
                    <div className="forecast-history-table-card__heading">
                        <div>
                            <span className="forecast-filter__eyebrow">Data table</span>
                            <h2 id="forecast-table-title">Forecast grid table</h2>
                        </div>
                        <p>{tableData.length} available records</p>
                    </div>

                    <Table
                        columns={columns}
                        dataSource={tableData.slice(0, 10)}
                        pagination={false}
                        bordered
                        size="middle"
                        rowKey={(record, index) => `${record.city}-${record.date?.join('-') || index}`}
                        scroll={{ x: 760 }}
                    />
                </div>
            </section>

            <PublicFooter />
        </main>
    )
}

export default AllForecast
