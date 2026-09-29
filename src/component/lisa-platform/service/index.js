import axios from 'axios'

export default axios.create({
    baseURL: '/api/public/lisa'

    // 'http://publicportal.aoholdings.net:8086/liza/api/v1'
    // ? 'http://172.208.120.35:8086/liza/api/v1'
    // : 'http://localhost:8086/liza/api/v1',

    // baseURL:
    //     process.env.NODE_ENV === 'production'
    //         ? ''
    //         : 'http://localhost:8086/liza/api/v1',
})

