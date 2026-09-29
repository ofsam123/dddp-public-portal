import { useEffect, useMemo, useState } from 'react'
import { getNationalGeography, loadPublicNationalBreakdowns, loadPublicSummary } from '../services/publicDataService'

const loadSeries = (years, loader) => Promise.all(years.map((year) => loader(year).catch(() => null)))

const useNationalTrend = ({ year, years = [], span = 8 } = {}) => {
    const windowYears = useMemo(
        () => (Number.isInteger(year) ? years.filter((item) => item <= year).slice(-span) : []),
        [span, year, years],
    )
    const key = windowYears.join(',')
    const [summaries, setSummaries] = useState({ key: null, rows: [] })
    const [pipeline, setPipeline] = useState({ key: null, rows: [] })

    useEffect(() => {
        if (!key) return undefined
        let active = true
        const list = key.split(',').map(Number)
        loadSeries(list, (item) => loadPublicSummary({ geography: getNationalGeography(), year: item }))
            .then((rows) => active && setSummaries({ key, rows: rows.map((row, index) => (row ? { year: list[index], ...row.kpis } : null)) }))
        loadSeries(list, (item) => loadPublicNationalBreakdowns({ year: item }))
            .then((rows) => active && setPipeline({ key, rows: rows.map((row, index) => (row ? { year: list[index], ...row.plannedProjectActivity } : null)) }))
        return () => {
            active = false
        }
    }, [key])

    return {
        years: windowYears,
        summaries: summaries.key === key ? summaries.rows : [],
        pipeline: pipeline.key === key ? pipeline.rows : [],
        isLoading: Boolean(key) && summaries.key !== key,
        isPipelineLoading: Boolean(key) && pipeline.key !== key,
    }
}

export default useNationalTrend
