const axios = require('axios')

const ROUTE_PREFIX = '/api/public/climate'
const PROGRAM_ID = 'k5Lg8ikNUCh'
const ROOT_ORG_UNIT = 'rHkDRHKXIdP'
const DEFAULT_EXCLUDED_REGIONS = ['BNvzSyfV6JK']

const DATA_ELEMENTS = {
    affectedPersons: 'UNnbpQMikK5',
    recordedValue: 'DAHtXO5hLw2',
    riskLevel: 'Efous4MOrza',
    remarks: 'rltHa1VipBI',
    coordinates: 'L0JvYCSg7nO',
}
const PHOTO_ELEMENTS = ['hO2QxM62IeC', 'GS1CkiTNZQn', 'V15hHhNVs4Z', 'M1EGcCp1VH4', 'PVB1oKJ9sfD', 'yHTZ3xJ1BJg']
const ATTRIBUTES = {
    name: 'wca7mlI2exE',
    description: 'fGfO0hrRRgq',
    date: 'YfoGKu8N6An',
    type: 'PqM8DtgTAMK',
    livelihood: 'nxtTasvydC4',
    distanceKm: 'PiXNmSkj8wK',
}
const RISK_LEVELS = new Set(['High', 'Medium', 'Low'])
const PUBLISHED_EVENT_STATUSES = new Set(['ACTIVE', 'COMPLETED'])
const UID = /^[A-Za-z][A-Za-z0-9]{10}$/
const MAX_PHOTO_CACHE = 80

class LisaClimateError extends Error {
    constructor(message, statusCode) {
        super(message)
        this.statusCode = statusCode
    }
}

const text = (value, max = 2000) => {
    if (typeof value !== 'string') return null
    const trimmed = value.replace(/\s+/g, ' ').trim()
    return trimmed ? trimmed.slice(0, max) : null
}

const number = (value) => {
    if (value === null || value === undefined || value === '') return null
    const parsed = Number(value)
    return Number.isFinite(parsed) ? parsed : null
}

const isoDate = (value) => (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}/.test(value) ? value.slice(0, 10) : null)

const coordinates = (value) => {
    try {
        const parsed = JSON.parse(value)
        if (!Array.isArray(parsed) || parsed.length < 2) return null
        const [lng, lat] = parsed.map(Number)
        if (!Number.isFinite(lng) || !Number.isFinite(lat) || Math.abs(lat) > 90 || Math.abs(lng) > 180) return null
        return [Number(lng.toFixed(5)), Number(lat.toFixed(5))]
    } catch (error) {
        return null
    }
}

const valueMap = (items, key) => new Map((items || []).map((item) => [item[key], item.value]))

const toRecord = (event) => {
    const values = valueMap(event.dataValues, 'dataElement')
    const level = text(values.get(DATA_ELEMENTS.riskLevel), 20)
    return {
        id: event.event,
        placeId: event.orgUnit,
        riskId: event.trackedEntity || null,
        date: isoDate(event.occurredAt),
        affectedPersons: number(values.get(DATA_ELEMENTS.affectedPersons)),
        recordedValue: number(values.get(DATA_ELEMENTS.recordedValue)),
        riskLevel: RISK_LEVELS.has(level) ? level : null,
        remarks: text(values.get(DATA_ELEMENTS.remarks)),
        coordinates: coordinates(values.get(DATA_ELEMENTS.coordinates)),
        photos: PHOTO_ELEMENTS.filter((id) => values.get(id)),
    }
}

const toRisk = (trackedEntity) => {
    const values = valueMap(trackedEntity.attributes, 'attribute')
    return {
        id: trackedEntity.trackedEntity,
        placeId: trackedEntity.orgUnit,
        name: text(values.get(ATTRIBUTES.name), 200),
        type: text(values.get(ATTRIBUTES.type), 120),
        description: text(values.get(ATTRIBUTES.description)),
        date: isoDate(values.get(ATTRIBUTES.date)),
        livelihood: text(values.get(ATTRIBUTES.livelihood), 200),
        distanceKm: number(values.get(ATTRIBUTES.distanceKm)),
    }
}

const toPlace = (unit) => {
    const isDistrict = unit.level === 3
    const district = isDistrict ? unit : unit.parent
    const region = isDistrict ? unit.parent : unit.parent?.parent
    return {
        id: unit.id,
        name: text(unit.displayName, 200),
        level: unit.level,
        districtId: district?.id || null,
        districtName: text(district?.displayName, 200),
        regionId: region?.id || null,
        regionName: text(region?.displayName, 200),
    }
}

const createLisaClimateService = ({
    baseURL,
    username,
    password,
    ttlMs = 15 * 60 * 1000,
    excludedRegions = DEFAULT_EXCLUDED_REGIONS,
    httpClient = axios,
    now = Date.now,
} = {}) => {
    if (!baseURL || !username || !password) throw new Error('DHIS2 credentials are not configured')
    const client = httpClient.create({
        baseURL: baseURL.replace(/\/+$/, ''),
        auth: { username, password },
        timeout: 60000,
        headers: { Accept: 'application/json' },
    })
    const excluded = new Set(excludedRegions)
    let cache = null
    let pending = null
    const photoCache = new Map()

    const fetchOverview = async () => {
        const scope = { program: PROGRAM_ID, orgUnit: ROOT_ORG_UNIT, ouMode: 'DESCENDANTS', skipPaging: true }
        const [eventsResponse, entitiesResponse] = await Promise.all([
            client.get('/tracker/events', { params: { ...scope, fields: 'event,orgUnit,trackedEntity,occurredAt,status,deleted,dataValues[dataElement,value]' } }),
            client.get('/tracker/trackedEntities', { params: { ...scope, fields: 'trackedEntity,orgUnit,deleted,attributes[attribute,value]' } }),
        ])
        const events = (eventsResponse.data?.instances || eventsResponse.data?.events || [])
            .filter((event) => !event.deleted && PUBLISHED_EVENT_STATUSES.has(event.status) && UID.test(event.event || ''))
        const entities = (entitiesResponse.data?.instances || entitiesResponse.data?.trackedEntities || [])
            .filter((entity) => !entity.deleted && UID.test(entity.trackedEntity || ''))

        const orgUnitIds = [...new Set([...events, ...entities].map((item) => item.orgUnit).filter((id) => UID.test(id || '')))]
        const units = []
        for (let index = 0; index < orgUnitIds.length; index += 150) {
            const { data } = await client.get('/organisationUnits', {
                params: {
                    filter: `id:in:[${orgUnitIds.slice(index, index + 150).join(',')}]`,
                    paging: false,
                    fields: 'id,displayName,level,parent[id,displayName,parent[id,displayName]]',
                },
            })
            units.push(...(data?.organisationUnits || []))
        }

        const places = units
            .filter((unit) => unit.level === 3 || unit.level === 4)
            .map(toPlace)
            .filter((place) => place.regionId && !excluded.has(place.regionId))
        const placeIds = new Set(places.map((place) => place.id))
        const records = events.map(toRecord).filter((record) => placeIds.has(record.placeId))
        const risks = entities.map(toRisk).filter((risk) => placeIds.has(risk.placeId))

        return {
            places: places.sort((a, b) => `${a.regionName}|${a.districtName}|${a.name}`.localeCompare(`${b.regionName}|${b.districtName}|${b.name}`)),
            risks,
            records: records.sort((a, b) => String(b.date || '').localeCompare(String(a.date || ''))),
            retrievedAt: new Date(now()).toISOString(),
        }
    }

    const getOverview = () => {
        if (cache && now() - cache.createdAt < ttlMs) return Promise.resolve(cache.value)
        if (pending) return pending
        pending = fetchOverview()
            .then((value) => {
                cache = { value, createdAt: now() }
                return value
            })
            .catch((error) => {
                if (cache) return cache.value
                throw error
            })
            .finally(() => { pending = null })
        return pending
    }

    const getPhoto = async (eventId, dataElementId) => {
        if (!UID.test(eventId) || !PHOTO_ELEMENTS.includes(dataElementId)) throw new LisaClimateError('Not found.', 404)
        const overview = await getOverview()
        const record = overview.records.find((item) => item.id === eventId)
        if (!record || !record.photos.includes(dataElementId)) throw new LisaClimateError('Not found.', 404)

        const key = `${eventId}/${dataElementId}`
        if (photoCache.has(key)) return photoCache.get(key)

        const response = await client.get('/events/files', {
            params: { eventUid: eventId, dataElementUid: dataElementId, dimension: 'medium' },
            responseType: 'arraybuffer',
        }).catch((error) => {
            throw new LisaClimateError('Photo unavailable.', error.response?.status === 404 ? 404 : 503)
        })
        const contentType = String(response.headers?.['content-type'] || '').split(';')[0].trim()
        if (!/^image\/(jpeg|png|webp|gif)$/.test(contentType)) throw new LisaClimateError('Photo unavailable.', 404)

        const photo = { contentType, body: Buffer.from(response.data) }
        photoCache.set(key, photo)
        if (photoCache.size > MAX_PHOTO_CACHE) photoCache.delete(photoCache.keys().next().value)
        return photo
    }

    return { getOverview, getPhoto }
}

module.exports = {
    createLisaClimateService,
    LisaClimateError,
    CLIMATE_ROUTE_PREFIX: ROUTE_PREFIX,
    PHOTO_ELEMENTS,
}
