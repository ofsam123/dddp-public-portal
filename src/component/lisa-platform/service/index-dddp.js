import axios from 'axios';

const instanceDDDP = axios.create({
    baseURL: 'https://dddp.gov.gh/api',
    headers: {
        'Content-Type': 'application/json',
    }
});

instanceDDDP.interceptors.request.use(
    config => {
        const encodedCredentials = btoa(`msow:dpGhana@2022`);

        config.headers.Authorization = `Basic ${encodedCredentials}`;

        return config;
    }, error => {
        return Promise.reject(error);
    }
);

export default instanceDDDP;