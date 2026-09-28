import React, { useEffect, useMemo, useState } from 'react'
import { getAllCities, getForcast } from '../service/forcast.service'
import './LisaForecastPreview.css'

const WeatherMark = () => (
    <svg viewBox="0 0 64 64" aria-hidden="true">
        <circle cx="22" cy="21" r="10" />
        <path d="M22 5v5M22 32v5M6 21h5M33 21h5M10.7 9.7l3.6 3.6M29.7 28.7l3.6 3.6" />
        <path className="weather-cloud" d="M20 48h27a9 9 0 0 0 .8-18 13 13 0 0 0-24.5-4A11 11 0 0 0 20 48Z" />
    </svg>
)

const formatTemperature = (value) => value === null || value === undefined || value === '' ? '—' : `${value}°`

const LisaForecastPreview = () => {
    const [weather, setWeather] = useState([])
    const [cities, setCities] = useState([])
    const [selectedCity, setSelectedCity] = useState('Accra')
    const [loading, setLoading] = useState(true)
    const [hasError, setHasError] = useState(false)

    useEffect(() => {
        Promise.allSettled([getForcast(), getAllCities()]).then(([forecastResult, citiesResult]) => {
            if (forecastResult.status === 'fulfilled' && Array.isArray(forecastResult.value.data)) {
                setWeather(forecastResult.value.data)
            } else {
                setHasError(true)
            }

            if (citiesResult.status === 'fulfilled' && Array.isArray(citiesResult.value.data)) {
                setCities(citiesResult.value.data)
            }

            setLoading(false)
        })
    }, [])

    const cityNames = useMemo(() => {
        const names = cities.map((city) => city.city).filter(Boolean)
        if (names.length) return [...new Set(names)]
        return [...new Set(weather.map((item) => item.city).filter(Boolean))]
    }, [cities, weather])

    const forecast = weather.find((item) => item.city?.toLowerCase() === selectedCity.toLowerCase())
        || weather.find((item) => item.city?.toLowerCase() === 'accra')
        || weather[0]

    const currentHour = new Date().getHours()
    const currentTemperature = forecast
        ? currentHour < 12
            ? forecast.morningTemperatureValue
            : currentHour < 17
                ? forecast.afternoonTemperatureValue
                : forecast.eveningTemperatureValue
        : null

    const periods = forecast ? [
        { label: forecast.morningSessionZone || 'Morning', value: forecast.morningTemperatureValue },
        { label: forecast.afternoonSessionZone || 'Afternoon', value: forecast.afternoonTemperatureValue },
        { label: forecast.eveningSessionZone || 'Evening', value: forecast.eveningTemperatureValue },
    ] : []

    return (
        <section className="lisa-forecast" id="forecast" aria-labelledby="lisa-forecast-title">
            <div className="lisa-forecast__heading">
                <div>
                    <span className="lisa-kicker">Local forecast</span>
                    <h2 id="lisa-forecast-title">Weather information for local planning.</h2>
                </div>
                <label>
                    <span>Select a city</span>
                    <select value={selectedCity} onChange={(event) => setSelectedCity(event.target.value)}>
                        {cityNames.length ? cityNames.map((city) => <option key={city}>{city}</option>) : <option>Accra</option>}
                    </select>
                </label>
            </div>

            <div className="lisa-forecast__panel">
                {loading ? (
                    <div className="lisa-forecast__state"><i /> Loading current forecast…</div>
                ) : forecast ? (
                    <>
                        <div className="lisa-forecast__current">
                            <div>
                                <span>Current outlook</span>
                                <h3>{forecast.city}</h3>
                                <p>{new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
                            </div>
                            <div className="lisa-forecast__temperature">
                                <WeatherMark />
                                <strong>{formatTemperature(currentTemperature)}<small>C</small></strong>
                            </div>
                        </div>
                        <div className="lisa-forecast__periods">
                            {periods.map((period, index) => (
                                <article key={period.label}>
                                    <span>0{index + 1}</span>
                                    <div><p>{period.label}</p><strong>{formatTemperature(period.value)}C</strong></div>
                                    <i aria-hidden="true" />
                                </article>
                            ))}
                        </div>
                    </>
                ) : (
                    <div className="lisa-forecast__state lisa-forecast__state--error">
                        <strong>Forecast temporarily unavailable</strong>
                        <span>{hasError ? 'Please try again shortly.' : 'No forecast has been published for this city yet.'}</span>
                    </div>
                )}
            </div>

            <div className="lisa-forecast__footer">
                <p>Forecast information is provided through the LISA climate information service.</p>
                <a href="/all-forcast">View forecast history <span aria-hidden="true">→</span></a>
            </div>
        </section>
    )
}

export default LisaForecastPreview
