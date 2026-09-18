import { useEffect, useMemo, useState } from 'react'
import { loadPublicRegionalSummaries } from '../services/publicDataService'

const useRegionalSummaries = ({ enabled = true, year } = {}) => {
    const [data, setData] = useState(null)
    const [isLoading, setIsLoading] = useState(enabled)

    useEffect(() => {
        if (!enabled || !Number.isInteger(year)) {
            setData(null)
            setIsLoading(false)
            return undefined
        }

        let active = true
        setData(null)
        setIsLoading(true)

        loadPublicRegionalSummaries({ year })
            .then((result) => active && setData(result))
            .catch(() => undefined)
            .finally(() => active && setIsLoading(false))

        return () => {
            active = false
        }
    }, [enabled, year])

    const summariesBySlug = useMemo(() => new Map(
        (data?.regions || []).map((region) => [region.slug, region]),
    ), [data])

    return {
        summariesBySlug,
        regionalSummaries: data?.regions || [],
        nationalSummary: data?.national || null,
        isLoading,
        year,
        meta: data?.meta || null,
    }
}

export default useRegionalSummaries
