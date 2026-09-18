import axios from 'axios';

const instanceDDDP = axios.create({
    baseURL: 'https://dddp.gov.gh/api',
    headers: {
        'Content-Type': 'application/json',
    }
});

export default instanceDDDP;
