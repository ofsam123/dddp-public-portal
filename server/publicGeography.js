const axios = require('axios')

const PUBLIC_REGIONS = [
    ['Ahafo', 'ahafo'],
    ['Ashanti', 'ashanti'],
    ['Bono', 'bono'],
    ['Bono East', 'bono-east'],
    ['Central', 'central'],
    ['Eastern', 'eastern'],
    ['Greater Accra', 'greater-accra'],
    ['North East', 'north-east'],
    ['Northern', 'northern'],
    ['Oti', 'oti'],
    ['Savannah', 'savannah'],
    ['Upper East', 'upper-east'],
    ['Upper West', 'upper-west'],
    ['Volta', 'volta'],
    ['Western', 'western'],
    ['Western North', 'western-north'],
].map(([name, slug]) => ({ name, slug }))

const normalizeName = (value = '') => value
    .trim()
    .toLowerCase()
    .replace(/\s+region$/, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()

const slugify = (value = '') => normalizeName(value).replace(/\s+/g, '-')

const publicRegionByName = new Map(PUBLIC_REGIONS.map((region) => [normalizeName(region.name), region]))

const buildGeographyContext = ({ rawRegions, rawDistricts, regionDetails, retrievedAt }) => {
    const districtsByPrivateId = new Map(
        rawDistricts
            .filter((district) => district && district.id && district.displayName)
            .map((district) => [district.id, district])
    )

    const matchedRegions = rawRegions.reduce((result, rawRegion) => {
        const publicRegion = publicRegionByName.get(normalizeName(rawRegion.displayName))
        if (!publicRegion || !rawRegion.id || result.some((item) => item.slug === publicRegion.slug)) return result

        const childIds = (regionDetails.get(rawRegion.id)?.children || []).map((child) => child.id)
        const seenDistrictSlugs = new Set()
        const regionDistricts = childIds.reduce((districts, childId) => {
            const rawDistrict = districtsByPrivateId.get(childId)
            if (!rawDistrict) return districts

            const slug = slugify(rawDistrict.displayName)
            if (!slug || seenDistrictSlugs.has(slug)) return districts
            seenDistrictSlugs.add(slug)

            districts.push({
                id: `district-${publicRegion.slug}-${slug}`,
                name: rawDistrict.displayName.trim(),
                slug,
                regionSlug: publicRegion.slug,
                privateOrgUnitId: childId,
            })
            return districts
        }, [])

        result.push({
            id: `region-${publicRegion.slug}`,
            name: publicRegion.name,
            slug: publicRegion.slug,
            districtCount: regionDistricts.length,
            districts: regionDistricts,
            privateOrgUnitId: rawRegion.id,
        })
        return result
    }, [])

    const order = new Map(PUBLIC_REGIONS.map((region, index) => [region.slug, index]))
    matchedRegions.sort((a, b) => order.get(a.slug) - order.get(b.slug))
    const districts = matchedRegions.flatMap(({ districts: regionDistricts }) => regionDistricts)

    return {
        publicGeography: {
            regions: matchedRegions.map((region) => ({
                id: region.id,
                name: region.name,
                slug: region.slug,
                districtCount: region.districtCount,
            })),
            districts: districts.map((district) => ({
                id: district.id,
                name: district.name,
                slug: district.slug,
                regionSlug: district.regionSlug,
            })),
            meta: {
                source: 'DDDP',
                retrievedAt,
                regionCount: matchedRegions.length,
                districtCount: districts.length,
            },
        },
        privateIndex: {
            regionOrgUnitIds: matchedRegions.map((region) => region.privateOrgUnitId),
            regionsBySlug: new Map(matchedRegions.map((region) => [region.slug, {
                orgUnitId: region.privateOrgUnitId,
                districtOrgUnitIds: region.districts.map((district) => district.privateOrgUnitId),
            }])),
            districtsByRoute: new Map(districts.map((district) => [`${district.regionSlug}/${district.slug}`, {
                orgUnitId: district.privateOrgUnitId,
            }])),
        },
    }
}

const normalizeGeography = (input) => buildGeographyContext(input).publicGeography

const createDddpGeographyContextAdapter = ({ baseURL, username, password, httpClient = axios }) => {
    if (!baseURL || !username || !password) {
        throw new Error('DDDP geography bridge configuration is incomplete')
    }

    const normalizedBaseURL = baseURL.replace(/\/+$/, '')
    const request = (path) => httpClient.get(`${normalizedBaseURL}${path}`, {
        auth: { username, password },
        timeout: 15000,
        headers: { Accept: 'application/json' },
    })

    return async () => {
        const [regionResponse, districtResponse] = await Promise.all([
            request('/organisationUnits?level=2&paging=false'),
            request('/organisationUnits?level=3&paging=false'),
        ])

        const rawRegions = regionResponse.data?.organisationUnits || []
        const rawDistricts = districtResponse.data?.organisationUnits || []
        const mappedRawRegions = rawRegions.filter((region) => publicRegionByName.has(normalizeName(region.displayName)))
        const details = await Promise.all(mappedRawRegions.map((region) => request(`/organisationUnits/${encodeURIComponent(region.id)}`)))
        const regionDetails = new Map(mappedRawRegions.map((region, index) => [region.id, details[index].data || {}]))

        return buildGeographyContext({
            rawRegions,
            rawDistricts,
            regionDetails,
            retrievedAt: new Date().toISOString(),
        })
    }
}

const createDddpGeographyAdapter = (options) => {
    const loadContext = createDddpGeographyContextAdapter(options)
    return async () => (await loadContext()).publicGeography
}

module.exports = {
    PUBLIC_REGIONS,
    buildGeographyContext,
    createDddpGeographyAdapter,
    createDddpGeographyContextAdapter,
    normalizeGeography,
    normalizeName,
    slugify,
}
