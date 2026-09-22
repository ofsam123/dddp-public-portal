import { useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'

export const PROJECT_PROGRAMME_VIEWS = [
    { key: 'combined', indicatorKey: 'projectsProgrammesTotal', label: 'Combined' },
    { key: 'projects', indicatorKey: 'projects', label: 'Projects' },
    { key: 'programmes', indicatorKey: 'programmes', label: 'Programmes' },
]

const DEFAULT_VIEW = 'combined'
const isValidView = (value) => PROJECT_PROGRAMME_VIEWS.some((view) => view.key === value)

const useProjectProgrammeView = () => {
    const [searchParams, setSearchParams] = useSearchParams()
    const requestedView = searchParams.get('view')
    const view = isValidView(requestedView) ? requestedView : DEFAULT_VIEW

    const setView = useCallback((nextView) => {
        if (!isValidView(nextView)) return
        const next = new URLSearchParams(searchParams)
        if (nextView === DEFAULT_VIEW) next.delete('view')
        else next.set('view', nextView)
        setSearchParams(next)
    }, [searchParams, setSearchParams])

    return { view, setView }
}

export default useProjectProgrammeView
