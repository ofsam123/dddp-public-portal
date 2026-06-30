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
    const username = 'msow';
    const password = 'dpGhana@2022';
    const encodedCredentials = btoa(`${username}:${password}`);

    try {
        const response = await axios.get('https://dddp.gov.gh/api/organisationUnits?level=2', {
            headers: {
                'Authorization': `Basic ${encodedCredentials}`
            }
        })
        return response.data
    } catch (error) {
        return console.error(error)
    }
}

export const getClimatesByDistrictIdAndRegion = async (regionId) => {
    const username = 'msow';
    const password = 'dpGhana@2022';
    const encodedCredentials = btoa(`${username}:${password}`);

    try {
        const response = await axios.get(`https://dddp.gov.gh/api/organisationUnits/${regionId}`, {
            headers: {
                'Authorization': `Basic ${encodedCredentials}`
            }
        })
        return response.data
    } catch (error) {
        return console.error(error)
    }
}



export const getAllClimatesByRegion = async () => {
    const username = 'msow';
    const password = 'dpGhana@2022';
    const encodedCredentials = btoa(`${username}:${password}`);

    try {
        const response = await axios.get('https://dddp.gov.gh/api/organisationUnits?level=3&paging=false', {
            headers: {
                'Authorization': `Basic ${encodedCredentials}`
            }
        })
        return response.data
    } catch (error) {
        return console.error(error)
    }
}

export const getReportByDistrictId = async (districtId) => {
    console.log("Selected District id", districtId)
    const username = 'msow';
    const password = 'dpGhana@2022';
    const encodedCredentials = btoa(`${username}:${password}`);

    try {
        const response = await axios.get(`https://dddp.gov.gh/api/tracker/events?program=k5Lg8ikNUCh&orgUnit=${districtId}`, {
            headers: {
                'Authorization': `Basic ${encodedCredentials}`
            }
        })
        return response.data
    } catch (error) {
        return console.error(error)
    }
}

export const getReportByDistrictidAndDate = async (districtId, startDate, endDate) => {
    const username = 'msow';
    const password = 'dpGhana@2022';
    const encodedCredentials = btoa(`${username}:${password}`);

    return axios.get(`http://dddp.gov.gh/api/events.json?program=k5Lg8ikNUCh&orgUnit=${districtId}&startDate=${startDate}&endDate=${endDate}`, {
        headers: {
            'Authorization': `Basic ${encodedCredentials}`
        }
    })
    .then(response => response.data)
    .catch(error => console.error(error));
}

export const getAllTrackedInstancesByOrgUnit = async (districtId) => {
    const username = 'msow';
    const password = 'dpGhana@2022';
    const encodedCredentials = btoa(`${username}:${password}`);

    return axios.get(`https://dddp.gov.gh/api/tracker/trackedEntities?orgUnit=${districtId}&program=k5Lg8ikNUCh&paging=false`, {
        headers: {
            'Authorization': `Basic ${encodedCredentials}`
        }
    })
    .then(response => response.data)
    .catch(error => console.error(error));
}