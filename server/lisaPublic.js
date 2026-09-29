const axios = require('axios')

const DEFAULT_BASE_URL = 'https://dddpcms.aoinnovations.org/liza/api/v1'
const ROUTE_PREFIX = '/api/public/lisa'

// The upstream CORS allow-list rejects browser origins, so the portal fetches
// these public, read-only endpoints server-side. Nothing outside this list is forwarded.
const ALLOWED_PATHS = [
    /^\/cities$/,
    /^\/categories$/,
    /^\/products\/category\/[^/]+$/,
    /^\/forecasts\/filters$/,
    /^\/forecasts\/history$/,
    /^\/forecasts\/filter-by-city\/\d+$/,
    /^\/forecast-report\/type\/[^/]+$/,
    /^\/forecast-report\/product\/\d+$/,
]

const isValidDate = (value) => /^\d{4}-\d{2}-\d{2}$/.test(value)

class LisaPublicError extends Error {
    constructor(message, statusCode) {
        super(message)
        this.statusCode = statusCode
    }
}

const createLisaPublicService = ({ baseURL = DEFAULT_BASE_URL, ttlMs = 60 * 1000, httpClient = axios, now = Date.now } = {}) => {
    const client = httpClient.create({
        baseURL: baseURL.replace(/\/+$/, ''),
        timeout: 20000,
        headers: { Accept: 'application/json' },
    })
    const cache = new Map()
    const pending = new Map()

    const resolve = (requestUrl) => {
        const upstreamPath = requestUrl.pathname.slice(ROUTE_PREFIX.length)
        if (!ALLOWED_PATHS.some((pattern) => pattern.test(upstreamPath))) throw new LisaPublicError('Not found.', 404)
        const params = {}
        const date = requestUrl.searchParams.get('date')
        if (date !== null) {
            if (!isValidDate(date)) throw new LisaPublicError('Invalid date.', 400)
            params.date = date
        }
        return { upstreamPath, params }
    }

    const get = (requestUrl) => {
        const { upstreamPath, params } = resolve(requestUrl)
        const key = `${upstreamPath}?${new URLSearchParams(params).toString()}`
        const hit = cache.get(key)
        if (hit && now() - hit.createdAt < ttlMs) return Promise.resolve(hit.value)
        if (pending.has(key)) return pending.get(key)

        const request = client.get(upstreamPath, { params })
            .then((response) => {
                cache.set(key, { value: response.data, createdAt: now() })
                return response.data
            })
            .catch((error) => {
                if (hit) return hit.value
                const status = error.response?.status
                throw new LisaPublicError('Climate information is temporarily unavailable.', status === 404 ? 404 : 503)
            })
            .finally(() => pending.delete(key))
        pending.set(key, request)
        return request
    }

    return { get }
}

module.exports = { createLisaPublicService, LisaPublicError, LISA_ROUTE_PREFIX: ROUTE_PREFIX }
