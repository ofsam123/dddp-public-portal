import { useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import {
    fetchDpatDistrict,
    fetchDpatIndicators,
    fetchDpatRegionScores,
    fetchDpatScores,
    fetchDpatThematicAreas,
    fetchDpatYears,
} from '../services/dpatService'

const idleState = { data: null, error: null, isLoading: false }

const useDpatResource = (key, loader) => {
    const loaderRef = useRef(loader)
    loaderRef.current = loader
    const [state, setState] = useState(key ? { ...idleState, isLoading: true } : idleState)

    useEffect(() => {
        if (!key) {
            setState(idleState)
            return undefined
        }
        let active = true
        setState({ data: null, error: null, isLoading: true })
        loaderRef.current()
            .then((data) => active && setState({ data, error: null, isLoading: false }))
            .catch((error) => active && setState({ data: null, error, isLoading: false }))
        return () => {
            active = false
        }
    }, [key])

    return state
}

export const useDpatYears = () => useDpatResource('years', fetchDpatYears)

export const useDpatScores = (year) => useDpatResource(year ? `scores|${year}` : null, () => fetchDpatScores(year))

export const useDpatRegionScores = (year) => useDpatResource(year ? `regions|${year}` : null, () => fetchDpatRegionScores(year))

export const useDpatThematicAreas = (year) => useDpatResource(year ? `thematic|${year}` : null, () => fetchDpatThematicAreas(year))

export const useDpatIndicators = (year) => useDpatResource(year ? `indicators|${year}` : null, () => fetchDpatIndicators(year))

export const useDpatDistrict = (year, districtId) => useDpatResource(
    year && districtId ? `district|${year}|${districtId}` : null,
    () => fetchDpatDistrict(year, districtId),
)

export const useDpatDistrictTrend = (years, districtId) => useDpatResource(
    years?.length && districtId ? `trend|${years.join(',')}|${districtId}` : null,
    () => Promise.all(years.map((year) => fetchDpatScores(year).then(
        (scores) => {
            const district = scores.districts.find((item) => item.districtId === districtId)
            return {
                year,
                finalPercent: district?.finalPercent ?? null,
                nationalRank: district?.nationalRank ?? null,
                nationalAverage: scores.nationalAverage,
                assessedCount: scores.assessedCount,
            }
        },
        () => ({ year, finalPercent: null, nationalRank: null, nationalAverage: null, assessedCount: null }),
    ))),
)

export const useDpatYearSeries = (years) => useDpatResource(
    years?.length ? `series|${years.join(',')}` : null,
    () => Promise.all(years.map((year) => fetchDpatScores(year).catch(() => null))),
)

export const useDpatSearchUpdater = () => {
    const [searchParams, setSearchParams] = useSearchParams()
    return (updates, { replace = false } = {}) => {
        const params = new URLSearchParams(searchParams)
        Object.entries(updates).forEach(([name, next]) => {
            if (next === null || next === undefined || next === '') params.delete(name)
            else params.set(name, String(next))
        })
        setSearchParams(params, { replace })
    }
}

export const useDpatSearchParam = (name) => {
    const [searchParams] = useSearchParams()
    const update = useDpatSearchUpdater()
    return [searchParams.get(name), (next, options) => update({ [name]: next }, options)]
}

export const useDpatYear = (yearsData) => {
    const [requested, setRequested] = useDpatSearchParam('year')
    const requestedYear = Number(requested)
    const year = yearsData?.years?.includes(requestedYear) ? requestedYear : yearsData?.latestYear ?? null
    return [year, (next) => setRequested(next)]
}
