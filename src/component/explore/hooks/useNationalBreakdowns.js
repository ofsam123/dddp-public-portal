import { useEffect, useState } from 'react'
import { loadPublicNationalBreakdowns } from '../services/publicDataService'

const useNationalBreakdowns = ({ year, isYearLoading = false } = {}) => {
    const [breakdownsData, setBreakdownsData] = useState(null)
    const [isLoading, setIsLoading] = useState(isYearLoading || Number.isInteger(year))

    useEffect(() => {
        if (!Number.isInteger(year)) {
            setBreakdownsData(null)
            setIsLoading(isYearLoading)
            return undefined
        }

        let active = true
        setBreakdownsData(null)
        setIsLoading(true)

        loadPublicNationalBreakdowns({ year })
            .then((data) => active && setBreakdownsData(data))
            .catch(() => undefined)
            .finally(() => active && setIsLoading(false))

        return () => {
            active = false
        }
    }, [isYearLoading, year])

    return { breakdownsData, isLoading, year }
}

export default useNationalBreakdowns
