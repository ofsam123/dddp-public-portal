import { useCallback, useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { loadPublicAvailableYears } from '../services/publicDataService'

const parseQueryYear = (value) => {
    if (!/^\d{4}$/.test(value || '')) return null
    return Number(value)
}

const usePublicYear = () => {
    const [searchParams, setSearchParams] = useSearchParams()
    const [availability, setAvailability] = useState(null)
    const [isLoading, setIsLoading] = useState(true)
    const queryYear = parseQueryYear(searchParams.get('year'))

    useEffect(() => {
        let active = true
        loadPublicAvailableYears()
            .then((value) => active && setAvailability(value))
            .catch(() => undefined)
            .finally(() => active && setIsLoading(false))
        return () => {
            active = false
        }
    }, [])

    const years = useMemo(() => availability?.years || [], [availability])
    const year = years.includes(queryYear) ? queryYear : availability?.latestYear || null

    useEffect(() => {
        if (!year || queryYear === year) return
        const next = new URLSearchParams(searchParams)
        next.set('year', String(year))
        setSearchParams(next, { replace: true })
    }, [queryYear, searchParams, setSearchParams, year])

    const setYear = useCallback((nextYear) => {
        const parsedYear = Number(nextYear)
        if (!years.includes(parsedYear)) return
        const next = new URLSearchParams(searchParams)
        next.set('year', String(parsedYear))
        setSearchParams(next)
    }, [searchParams, setSearchParams, years])

    const withYear = useCallback((destination) => {
        if (!year) return destination
        const [pathname, query = ''] = destination.split('?')
        const params = new URLSearchParams(query)
        params.set('year', String(year))
        return `${pathname}?${params.toString()}`
    }, [year])

    return { availability, isLoading, setYear, withYear, year, years }
}

export default usePublicYear
