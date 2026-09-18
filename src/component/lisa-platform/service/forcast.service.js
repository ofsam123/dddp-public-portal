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

export const getClimatesByRegion = async () => {
    try {
        const response = await axios.get('https://dddp.gov.gh/api/organisationUnits?level=2')
        return response.data
    } catch (error) {
        return console.error(error)
    }
}

export const getClimatesByDistrictIdAndRegion = async (regionId) => {
    try {
        const response = await axios.get(`https://dddp.gov.gh/api/organisationUnits/${regionId}`)
        return response.data
    } catch (error) {
        return console.error(error)
    }
}



export const getAllClimatesByRegion = async () => {
    try {
        const response = await axios.get('https://dddp.gov.gh/api/organisationUnits?level=3&paging=false')
        return response.data
    } catch (error) {
        return console.error(error)
    }
}

export const getReportByDistrictId = async (districtId) => {
    console.log("Selected District id", districtId)
    try {
        const response = await axios.get(`https://dddp.gov.gh/api/tracker/events?program=k5Lg8ikNUCh&orgUnit=${districtId}`)
        return response.data
    } catch (error) {
        return console.error(error)
    }
}

export const getReportByDistrictidAndDate = async (districtId, startDate, endDate) => {
    return axios.get(`http://dddp.gov.gh/api/events.json?program=k5Lg8ikNUCh&orgUnit=${districtId}&startDate=${startDate}&endDate=${endDate}`)
    .then(response => response.data)
    .catch(error => console.error(error));
}

export const getAllTrackedInstancesByOrgUnit = async (districtId) => {
    return axios.get(`https://dddp.gov.gh/api/tracker/trackedEntities?orgUnit=${districtId}&program=k5Lg8ikNUCh&paging=false`)
    .then(response => response.data)
    .catch(error => console.error(error));
}
