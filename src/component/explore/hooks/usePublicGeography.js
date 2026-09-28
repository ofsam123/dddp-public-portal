import { useEffect, useState } from 'react'
import { getLocalPublicGeography, loadPublicGeography } from '../services/publicDataService'

const usePublicGeography = () => {
    const [geographyData, setGeographyData] = useState(getLocalPublicGeography)
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        let active = true

        loadPublicGeography()
            .then((data) => active && setGeographyData(data))
            .catch(() => undefined)
            .finally(() => active && setIsLoading(false))

        return () => {
            active = false
        }
    }, [])

    return { geographyData, isLoading }
}

export default usePublicGeography
