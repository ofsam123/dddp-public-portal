import { useEffect, useState } from 'react'
import { loadDeliverySeries, loadDeliverySummary, loadSchoolProfile } from '../services/datasetDataService'

const useResource = (key, loader) => {
    const [state, setState] = useState({ key: null, data: null })

    useEffect(() => {
        if (!key) return undefined
        let active = true
        loader()
            .catch(() => null)
            .then((data) => active && setState({ key, data }))
        return () => {
            active = false
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [key])

    return {
        data: state.key === key ? state.data : null,
        isLoading: Boolean(key) && state.key !== key,
    }
}

const scopeKey = ({ enabled = true, geography, regionSlug, year }) => (
    enabled && geography && Number.isInteger(year) ? `${year}|${geography.level}|${regionSlug || ''}|${geography.slug}` : null
)

export const useDeliverySummary = (input) => useResource(
    scopeKey(input) && `delivery|${scopeKey(input)}`,
    () => loadDeliverySummary(input),
)

export const useSchoolProfile = (input) => useResource(
    scopeKey(input) && `schools|${scopeKey(input)}`,
    () => loadSchoolProfile(input),
)

export const useDeliverySeries = ({ years = [], enabled = true }) => {
    const from = years[0]
    const to = years[years.length - 1]
    return useResource(
        enabled && Number.isInteger(from) && Number.isInteger(to) ? `delivery-series|${from}|${to}` : null,
        () => loadDeliverySeries({ from, to }),
    )
}
