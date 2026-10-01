import {
    buildClimateIndex,
    keyFindings,
    plausibleAffected,
    regionBreakdown,
    shortDistrict,
    summarise,
    topPlaces,
    typeLevelMatrix,
    validCoordinates,
} from './climateData'

const data = {
    places: [
        { id: 'c1', name: 'Abennieso', level: 4, districtId: 'd1', districtName: 'Wassa Amenfi East Municipal Assembly', regionId: 'r1', regionName: 'Western Region' },
        { id: 'd2', name: 'Ada East District Assembly', level: 3, districtId: 'd2', districtName: 'Ada East District Assembly', regionId: 'r2', regionName: 'Greater Accra Region' },
    ],
    risks: [
        { id: 't1', placeId: 'c1', name: 'FLASH FLOOD AT ABENNIESO', type: 'Flooding', description: null },
    ],
    records: [
        { id: 'e1', placeId: 'c1', riskId: 't1', date: '2024-06-01', affectedPersons: 400, recordedValue: null, riskLevel: 'High', remarks: 'THE VICTIMS NEED SUPPORT', coordinates: null, photos: ['p1'] },
        { id: 'e2', placeId: 'd2', riskId: 'missing', date: '2025-01-10', affectedPersons: 343434343, recordedValue: 5, riskLevel: 'Low', remarks: null, coordinates: [-2, 5], photos: [] },
        { id: 'e3', placeId: 'unknown', riskId: 't1', date: '2025-01-10', affectedPersons: 5, riskLevel: 'Low', photos: [] },
    ],
}

describe('climateData', () => {
    it('shortens assembly names', () => {
        expect(shortDistrict('Ada East District Assembly')).toBe('Ada East')
        expect(shortDistrict('Wassa Amenfi East Municipal Assembly')).toBe('Wassa Amenfi East Municipal')
    })

    it('treats implausible affected counts as unverified', () => {
        expect(plausibleAffected(400)).toBe(400)
        expect(plausibleAffected(343434343)).toBeNull()
    })

    it('joins records to places and risks, dropping unknown places', () => {
        const { rows, tree } = buildClimateIndex(data)
        expect(rows.map((row) => row.id)).toEqual(['e1', 'e2'])
        expect(rows[0]).toMatchObject({ type: 'Flooding', title: 'Flash flood at abennieso', remarks: 'The victims need support', affected: 400 })
        expect(rows[1]).toMatchObject({ type: 'Unclassified', affected: null, affectedUnverified: true })
        expect(rows[1].place.isDistrictWide).toBe(true)
        expect(tree.map((region) => region.name)).toEqual(['Greater Accra Region', 'Western Region'])
        expect(tree[1].districts[0]).toMatchObject({ name: 'Wassa Amenfi East Municipal', count: 1 })
        expect(tree[0].districts[0].communities).toEqual([])
    })

    it('summarises totals without unverified figures', () => {
        const summary = summarise(buildClimateIndex(data).rows)
        expect(summary).toMatchObject({ records: 2, communities: 1, districts: 2, affected: 400, unverified: 1, withPhotos: 1 })
        expect(summary.levels.map((level) => level.total)).toEqual([1, 0, 1])
        expect(summary.years).toEqual([{ year: 2024, total: 1 }, { year: 2025, total: 1 }])
        expect(summary.months.find((item) => item.month === 6).total).toBe(1)
        expect(summary.months.find((item) => item.month === 1).total).toBe(1)
    })

    it('keeps only coordinates inside Ghana', () => {
        expect(validCoordinates([-2.03, 5.87])).toEqual([-2.03, 5.87])
        expect(validCoordinates([0.901, 0.00033])).toBeNull()
        expect(validCoordinates(null)).toBeNull()
    })

    it('builds regional, place and severity breakdowns', () => {
        const { rows } = buildClimateIndex(data)
        expect(regionBreakdown(rows).map((region) => [region.name, region.records, region.high])).toEqual([
            ['Greater Accra Region', 1, 0],
            ['Western Region', 1, 1],
        ])
        expect(topPlaces(rows)[0]).toMatchObject({ name: 'Abennieso', records: 1, affected: 400, topType: 'Flooding' })
        const matrix = typeLevelMatrix(rows)
        expect(matrix.columns).toEqual(['High', 'Medium', 'Low', null])
        expect(matrix.types.find((type) => type.name === 'Flooding').cells[0].total).toBe(1)
        const findings = keyFindings(rows, summarise(rows))
        expect(findings.map((item) => item.key)).toEqual(['type', 'month', 'region', 'high'])
        expect(findings.find((item) => item.key === 'high').value).toBe('50%')
    })
})
