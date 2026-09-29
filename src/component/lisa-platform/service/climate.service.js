import axios from 'axios'

const BASE = '/api/public/climate'

export const getClimateOverview = () => axios.get(`${BASE}/overview`)

export const climatePhotoUrl = (recordId, photoId) => `${BASE}/photos/${recordId}/${photoId}`
