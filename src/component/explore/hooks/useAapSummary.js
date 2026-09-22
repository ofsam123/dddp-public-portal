import { useEffect, useState } from 'react'
import { loadAapSummary } from '../services/datasetDataService'

const useAapSummary = ({ enabled, geography, regionSlug, year }) => {
    const [data, setData] = useState(null)
    const [isLoading, setIsLoading] = useState(Boolean(enabled))
    useEffect(() => {
        if (!enabled || !geography || !Number.isInteger(year)) { setData(null); setIsLoading(false); return undefined }
        let active = true
        setData(null); setIsLoading(true)
        loadAapSummary({ geography, regionSlug, year }).then((value) => active && setData(value)).catch(() => undefined).finally(() => active && setIsLoading(false))
        return () => { active = false }
    }, [enabled, geography, geography?.level, geography?.slug, regionSlug, year])
    return { data, isLoading }
}

export default useAapSummary
