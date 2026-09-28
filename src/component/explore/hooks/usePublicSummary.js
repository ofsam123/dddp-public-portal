import { useEffect, useState } from 'react'
import { loadPublicSummary } from '../services/publicDataService'

const usePublicSummary = ({ geography, regionSlug, year } = {}) => {
    const [summaryData, setSummaryData] = useState(null)
    const [isLoading, setIsLoading] = useState(Boolean(geography))

    useEffect(() => {
        if (!geography || !Number.isInteger(year)) {
            setSummaryData(null)
            setIsLoading(false)
            return undefined
        }

        let active = true
        setSummaryData(null)
        setIsLoading(true)

        loadPublicSummary({ geography, regionSlug, year })
            .then((data) => active && setSummaryData(data))
            .catch(() => undefined)
            .finally(() => active && setIsLoading(false))

        return () => {
            active = false
        }
    }, [geography, geography?.level, geography?.slug, regionSlug, year])

    return { summaryData, isLoading, year }
}

export default usePublicSummary
