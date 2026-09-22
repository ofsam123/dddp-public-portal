import { useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import { DEFAULT_PUBLIC_DATASET, getPublicDataset, isPublicDatasetKey } from '../data/publicDatasets'

const usePublicDataset = () => {
    const [searchParams, setSearchParams] = useSearchParams()
    const requestedKey = searchParams.get('dataset')
    const key = isPublicDatasetKey(requestedKey) ? requestedKey : DEFAULT_PUBLIC_DATASET

    const setDataset = useCallback((nextKey) => {
        if (!isPublicDatasetKey(nextKey)) return
        const next = new URLSearchParams(searchParams)
        if (nextKey === DEFAULT_PUBLIC_DATASET) next.delete('dataset')
        else next.set('dataset', nextKey)
        setSearchParams(next)
    }, [searchParams, setSearchParams])

    return { dataset: getPublicDataset(key), key, setDataset }
}

export default usePublicDataset
