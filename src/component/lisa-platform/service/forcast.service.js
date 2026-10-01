import axios from './index'

export const getForcast = () => {
    return axios.get('/forecasts/filters')
}

export const getAllForecast = () => {
    return axios.get('/forecasts/history')
}
export const getForecastByDate = (date) => {
    return axios.get(`/forecasts/filters`, { params: { date: date } });
}

export const getForecastsByCityAndDate = (cityId, date) => {
    return axios.get(`/forecasts/filter-by-city/${cityId}`, { params: { date: date } });
}

export const getForcastReport = (type) => {
    return axios.get(`/forecast-report/type/${encodeURIComponent(type)}`);
}

export const getReportFiles = (productId) => {
    return axios.get(`/forecast-report/product/${productId}`);
}

export const getAllCities = () => {
    return axios.get('/cities')
}
