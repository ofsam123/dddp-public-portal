require('dotenv').config({ quiet: true })

const http = require('http')
const fs = require('fs')
const path = require('path')
const zlib = require('zlib')
const { createDddpGeographyContextAdapter } = require('./publicGeography')
const {
    createActivitySeriesLoader,
    createDddpNationalBreakdownsAdapter,
} = require('./publicAggregates')
const {
    createAvailableYearsLoader,
    createDddpSummaryAdapter,
    createRegionalSummaryLoader,
    PublicSummaryError,
} = require('./publicSummary')

const PORT = Number(process.env.PORT || 3001)
const BUILD_DIR = path.resolve(__dirname, '..', 'build')
const CACHE_TTL_MS = Number(process.env.PUBLIC_GEOGRAPHY_CACHE_TTL_MS || 15 * 60 * 1000)
const AVAILABLE_YEARS_CACHE_TTL_MS = Number(process.env.PUBLIC_AVAILABLE_YEARS_CACHE_TTL_MS || 6 * 60 * 60 * 1000)
const CONTENT_TYPES = {
    '.css': 'text/css; charset=utf-8',
    '.html': 'text/html; charset=utf-8',
    '.ico': 'image/x-icon',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.js': 'text/javascript; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.png': 'image/png',
    '.svg': 'image/svg+xml',
    '.txt': 'text/plain; charset=utf-8',
    '.webp': 'image/webp',
}
const COMPRESSIBLE_EXTENSIONS = new Set(['.css', '.html', '.js', '.json', '.svg', '.txt'])

let geographyCache = null
let geographyPending = null
let geographyAdapter = null
let summaryAdapter = null
let regionalSummaryLoader = null
let availableYearsLoader = null
let availableYearsCache = null
let availableYearsPending = null
let nationalBreakdownsAdapter = null
let activitySeriesLoader = null
const summaryCache = new Map()
const summaryPending = new Map()
const regionalSummaryCache = new Map()
const regionalSummaryPending = new Map()
const nationalBreakdownsCache = new Map()
const nationalBreakdownsPending = new Map()
const activitySeriesCache = new Map()
const activitySeriesPending = new Map()

const sendJson = (response, statusCode, body) => {
    response.writeHead(statusCode, {
        'Cache-Control': statusCode === 200 ? 'public, max-age=300, stale-while-revalidate=600' : 'no-store',
        'Content-Type': 'application/json; charset=utf-8',
        'X-Content-Type-Options': 'nosniff',
    })
    response.end(JSON.stringify(body))
}

const getGeographyAdapter = () => {
    if (!geographyAdapter) {
        geographyAdapter = createDddpGeographyContextAdapter({
            baseURL: process.env.DDDP_API_BASE_URL,
            username: process.env.DDDP_API_USERNAME,
            password: process.env.DDDP_API_PASSWORD,
        })
    }
    return geographyAdapter
}

const loadGeographyContext = async () => {
    if (geographyCache && Date.now() - geographyCache.createdAt < CACHE_TTL_MS) return geographyCache.value
    if (geographyPending) return geographyPending

    geographyPending = getGeographyAdapter()()
        .then((value) => {
            geographyCache = { createdAt: Date.now(), value }
            return value
        })
        .finally(() => {
            geographyPending = null
        })
    return geographyPending
}

const getSummaryAdapter = () => {
    if (!summaryAdapter) {
        summaryAdapter = createDddpSummaryAdapter({
            baseURL: process.env.DDDP_API_BASE_URL,
            username: process.env.DDDP_API_USERNAME,
            password: process.env.DDDP_API_PASSWORD,
            loadGeographyContext,
        })
    }
    return summaryAdapter
}

const loadPublicSummary = async (input) => {
    const cacheKey = `${input.year || ''}|${input.regionSlug || ''}|${input.districtSlug || ''}`
    const cached = summaryCache.get(cacheKey)
    if (cached && Date.now() - cached.createdAt < CACHE_TTL_MS) return cached.value
    if (summaryPending.has(cacheKey)) return summaryPending.get(cacheKey)

    const pending = getSummaryAdapter()(input)
        .then((value) => {
            summaryCache.set(cacheKey, { createdAt: Date.now(), value })
            return value
        })
        .finally(() => {
            summaryPending.delete(cacheKey)
        })
    summaryPending.set(cacheKey, pending)
    return pending
}

const getRegionalSummaryLoader = () => {
    if (!regionalSummaryLoader) {
        regionalSummaryLoader = createRegionalSummaryLoader({
            loadGeographyContext,
            loadSummary: loadPublicSummary,
        })
    }
    return regionalSummaryLoader
}

const getAvailableYearsLoader = () => {
    if (!availableYearsLoader) {
        availableYearsLoader = createAvailableYearsLoader({
            baseURL: process.env.DDDP_API_BASE_URL,
            username: process.env.DDDP_API_USERNAME,
            password: process.env.DDDP_API_PASSWORD,
            loadGeographyContext,
        })
    }
    return availableYearsLoader
}

const loadAvailableYears = async () => {
    if (availableYearsCache && Date.now() - availableYearsCache.createdAt < AVAILABLE_YEARS_CACHE_TTL_MS) {
        return availableYearsCache.value
    }
    if (availableYearsPending) return availableYearsPending

    availableYearsPending = getAvailableYearsLoader()()
        .then((value) => {
            availableYearsCache = { createdAt: Date.now(), value }
            return value
        })
        .finally(() => {
            availableYearsPending = null
        })
    return availableYearsPending
}

const getNationalBreakdownsAdapter = () => {
    if (!nationalBreakdownsAdapter) {
        nationalBreakdownsAdapter = createDddpNationalBreakdownsAdapter({
            baseURL: process.env.DDDP_API_BASE_URL,
            username: process.env.DDDP_API_USERNAME,
            password: process.env.DDDP_API_PASSWORD,
            loadGeographyContext,
        })
    }
    return nationalBreakdownsAdapter
}

const loadNationalBreakdowns = async ({ year }) => {
    const cacheKey = String(year || '')
    const cached = nationalBreakdownsCache.get(cacheKey)
    if (cached && Date.now() - cached.createdAt < CACHE_TTL_MS) return cached.value
    if (nationalBreakdownsPending.has(cacheKey)) return nationalBreakdownsPending.get(cacheKey)

    const pending = getNationalBreakdownsAdapter()({ year })
        .then((value) => {
            nationalBreakdownsCache.set(cacheKey, { createdAt: Date.now(), value })
            return value
        })
        .finally(() => nationalBreakdownsPending.delete(cacheKey))
    nationalBreakdownsPending.set(cacheKey, pending)
    return pending
}

const getActivitySeriesLoader = () => {
    if (!activitySeriesLoader) activitySeriesLoader = createActivitySeriesLoader({ loadSummary: loadPublicSummary })
    return activitySeriesLoader
}

const loadActivitySeries = async ({ from, to }) => {
    const cacheKey = `${from || ''}|${to || ''}`
    const cached = activitySeriesCache.get(cacheKey)
    if (cached && Date.now() - cached.createdAt < CACHE_TTL_MS) return cached.value
    if (activitySeriesPending.has(cacheKey)) return activitySeriesPending.get(cacheKey)

    const pending = getActivitySeriesLoader()({ from, to })
        .then((value) => {
            activitySeriesCache.set(cacheKey, { createdAt: Date.now(), value })
            return value
        })
        .finally(() => activitySeriesPending.delete(cacheKey))
    activitySeriesPending.set(cacheKey, pending)
    return pending
}

const handlePublicGeography = async (response) => {
    try {
        const value = await loadGeographyContext()
        sendJson(response, 200, value.publicGeography)
    } catch (error) {
        console.error(`Public geography refresh failed (${error.code || error.name || 'request-error'})`)
        sendJson(response, 503, { error: 'Public geography is temporarily unavailable.' })
    }
}

const handlePublicSummary = async (requestUrl, response) => {
    const input = {
        year: requestUrl.searchParams.get('year'),
        regionSlug: requestUrl.searchParams.get('regionSlug') || undefined,
        districtSlug: requestUrl.searchParams.get('districtSlug') || undefined,
    }
    try {
        const value = await loadPublicSummary(input)
        sendJson(response, 200, value)
    } catch (error) {
        if (error instanceof PublicSummaryError) {
            sendJson(response, error.statusCode, { error: error.message })
            return
        }
        console.error(`Public summary refresh failed (${error.code || error.name || 'request-error'})`)
        sendJson(response, 503, { error: 'Public summary is temporarily unavailable.' })
    }
}

const handlePublicAvailableYears = async (response) => {
    try {
        sendJson(response, 200, await loadAvailableYears())
    } catch (error) {
        console.error(`Public year discovery failed (${error.code || error.name || 'request-error'})`)
        sendJson(response, 503, { error: 'Public data years are temporarily unavailable.' })
    }
}

const handlePublicRegionalSummaries = async (requestUrl, response) => {
    const year = requestUrl.searchParams.get('year')
    const cached = regionalSummaryCache.get(year)
    if (cached && Date.now() - cached.createdAt < CACHE_TTL_MS) {
        sendJson(response, 200, cached.value)
        return
    }

    try {
        let pending = regionalSummaryPending.get(year)
        if (!pending) {
            pending = getRegionalSummaryLoader()({ year })
                .then((value) => {
                    regionalSummaryCache.set(year, { createdAt: Date.now(), value })
                    return value
                })
                .finally(() => {
                    regionalSummaryPending.delete(year)
                })
            regionalSummaryPending.set(year, pending)
        }
        const value = await pending
        sendJson(response, 200, value)
    } catch (error) {
        if (error instanceof PublicSummaryError) {
            sendJson(response, error.statusCode, { error: error.message })
            return
        }
        console.error(`Public regional summaries refresh failed (${error.code || error.name || 'request-error'})`)
        sendJson(response, 503, { error: 'Public regional summaries are temporarily unavailable.' })
    }
}

const handlePublicNationalBreakdowns = async (requestUrl, response) => {
    try {
        const value = await loadNationalBreakdowns({ year: requestUrl.searchParams.get('year') })
        sendJson(response, 200, value)
    } catch (error) {
        if (error instanceof PublicSummaryError) {
            sendJson(response, error.statusCode, { error: error.message })
            return
        }
        console.error(`Public national breakdown refresh failed (${error.code || error.name || 'request-error'})`)
        sendJson(response, 503, { error: 'Public national breakdowns are temporarily unavailable.' })
    }
}

const handlePublicActivitySeries = async (requestUrl, response) => {
    try {
        const value = await loadActivitySeries({
            from: requestUrl.searchParams.get('from'),
            to: requestUrl.searchParams.get('to'),
        })
        sendJson(response, 200, value)
    } catch (error) {
        if (error instanceof PublicSummaryError) {
            sendJson(response, error.statusCode, { error: error.message })
            return
        }
        console.error(`Public activity series refresh failed (${error.code || error.name || 'request-error'})`)
        sendJson(response, 503, { error: 'Public activity series is temporarily unavailable.' })
    }
}

const sendStaticFile = (request, requestPath, response) => {
    const requestedFile = requestPath === '/' ? 'index.html' : requestPath.replace(/^\/+/, '')
    const resolvedFile = path.resolve(BUILD_DIR, requestedFile)
    const safeFile = resolvedFile.startsWith(`${BUILD_DIR}${path.sep}`) ? resolvedFile : path.join(BUILD_DIR, 'index.html')
    const file = fs.existsSync(safeFile) && fs.statSync(safeFile).isFile() ? safeFile : path.join(BUILD_DIR, 'index.html')

    const extension = path.extname(file).toLowerCase()
    const isIndex = path.basename(file) === 'index.html'
    const isHashedAsset = requestPath.startsWith('/static/')
    const isPublicData = requestPath.startsWith('/data/')
    const acceptsGzip = /\bgzip\b/.test(request.headers['accept-encoding'] || '')
    const shouldCompress = acceptsGzip && COMPRESSIBLE_EXTENSIONS.has(extension)
    const headers = {
        'Cache-Control': isIndex
            ? 'no-cache'
            : isHashedAsset ? 'public, max-age=31536000, immutable'
            : isPublicData ? 'public, max-age=86400'
            : 'public, max-age=3600',
        'Content-Type': CONTENT_TYPES[extension] || 'application/octet-stream',
        'X-Content-Type-Options': 'nosniff',
    }
    if (shouldCompress) {
        headers['Content-Encoding'] = 'gzip'
        headers.Vary = 'Accept-Encoding'
    }

    response.writeHead(200, headers)
    if (request.method === 'HEAD') {
        response.end()
        return
    }

    const source = fs.createReadStream(file)
    source.on('error', () => response.destroy())
    if (shouldCompress) {
        source.pipe(zlib.createGzip()).pipe(response)
    } else {
        source.pipe(response)
    }
}

const server = http.createServer(async (request, response) => {
    const requestUrl = new URL(request.url, `http://${request.headers.host || 'localhost'}`)

    if (request.method === 'GET' && requestUrl.pathname === '/api/public/geography') {
        await handlePublicGeography(response)
        return
    }

    if (request.method === 'GET' && requestUrl.pathname === '/api/public/available-years') {
        await handlePublicAvailableYears(response)
        return
    }

    if (request.method === 'GET' && requestUrl.pathname === '/api/public/summary') {
        await handlePublicSummary(requestUrl, response)
        return
    }

    if (request.method === 'GET' && requestUrl.pathname === '/api/public/regional-summaries') {
        await handlePublicRegionalSummaries(requestUrl, response)
        return
    }

    if (request.method === 'GET' && requestUrl.pathname === '/api/public/national-breakdowns') {
        await handlePublicNationalBreakdowns(requestUrl, response)
        return
    }

    if (request.method === 'GET' && requestUrl.pathname === '/api/public/activity-series') {
        await handlePublicActivitySeries(requestUrl, response)
        return
    }

    if (request.method !== 'GET' && request.method !== 'HEAD') {
        sendJson(response, 405, { error: 'Method not allowed.' })
        return
    }

    sendStaticFile(request, requestUrl.pathname, response)
})

if (require.main === module) {
    server.listen(PORT, () => console.log(`Public portal listening on port ${PORT}`))
}

module.exports = {
    handlePublicAvailableYears,
    handlePublicGeography,
    handlePublicActivitySeries,
    handlePublicNationalBreakdowns,
    handlePublicRegionalSummaries,
    handlePublicSummary,
    server,
}
