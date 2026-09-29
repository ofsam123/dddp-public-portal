import {
    cleanSummary,
    groupIssues,
    issueHighlights,
    normaliseForecasts,
    parseCondition,
    toPeriods,
} from './forecastData'

const forecast = (overrides = {}) => ({
    city: 'SEFWI BEKWAI',
    date: [2025, 5, 7, 11, 48],
    morningTemperatureValue: 22,
    afternoonTemperatureValue: 20,
    eveningTemperatureValue: 28,
    morningWeatherCondition: 'MIST (60%)',
    afternoonWeatherCondition: 'TSRA (40%)',
    eveningWeatherCondition: "P'CLOUDY",
    morningForecastDate: [2025, 5, 8],
    afternoonForecastDate: [2025, 5, 7],
    eveningForecastDate: [2025, 5, 7],
    summary: 'Wend 05/07/2025. Cloudy conditions\nare expected.',
    ...overrides,
})

describe('forecastData', () => {
    it('parses GMet condition codes and chances', () => {
        expect(parseCondition('TSRA (40%)')).toMatchObject({ code: 'TSRA', chance: 40, label: 'Thunderstorms with rain', isWet: true })
        expect(parseCondition("SL'T RAIN")).toMatchObject({ label: 'Slight rain', chance: null, tone: 'rain' })
        expect(parseCondition('V\u2019CLOUDY')).toMatchObject({ code: "V'CLOUDY", label: 'Very cloudy' })
        expect(parseCondition('UNKNOWN CODE')).toMatchObject({ label: 'Unknown Code', tone: 'cloud', isWet: false })
        expect(parseCondition(null)).toBeNull()
    })

    it('orders periods by the date they cover, so the next morning comes last', () => {
        expect(toPeriods(forecast()).map((period) => period.key)).toEqual(['afternoon', 'evening', 'morning'])
        expect(toPeriods(forecast({ morningTemperatureValue: null, morningWeatherCondition: null })).map((period) => period.key))
            .toEqual(['afternoon', 'evening'])
    })

    it('strips the date prefix and line breaks from the summary', () => {
        expect(cleanSummary(forecast().summary)).toBe('Cloudy conditions are expected.')
    })

    it('normalises city names, regions and highlights', () => {
        const rows = normaliseForecasts([forecast(), forecast({ city: 'ACCRA', morningTemperatureValue: 18, afternoonWeatherCondition: 'CLOUDY' })], [
            { city: 'ACCRA', region: { name: 'Greater Accra' } },
        ])
        expect(rows.map((row) => [row.city, row.region, row.min, row.max])).toEqual([
            ['Sefwi Bekwai', '', 20, 28],
            ['Accra', 'Greater Accra', 18, 28],
        ])
        const highlights = issueHighlights(rows)
        expect(highlights.coolest).toMatchObject({ city: 'Accra', temp: 18 })
        expect(highlights.wetCount).toBe(1)
        expect(highlights.stormCount).toBe(1)
    })

    it('groups history into bulletins, newest first', () => {
        const older = forecast({ date: [2025, 5, 6, 11, 0] })
        const issues = groupIssues([[older], [forecast()]])
        expect(issues).toHaveLength(2)
        expect(issues[0].issued.getDate()).toBe(7)
        expect(groupIssues([forecast()])).toHaveLength(1)
    })
})
