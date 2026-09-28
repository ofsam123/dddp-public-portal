import React, { useEffect, useId, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDpatRegionScores, useDpatScores, useDpatYears } from '../hooks/useDpat'
import { classificationColor, districtPath, formatPercent, ordinal } from '../dpatFormat'

const MAX_REGIONS = 4
const MAX_DISTRICTS = 8

const normalize = (value = '') => value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()

const matchRank = (name, query) => {
    const text = normalize(name)
    if (text.startsWith(query)) return 0
    if (text.includes(` ${query}`)) return 1
    if (text.includes(query)) return 2
    return query.split(' ').every((token) => text.includes(token)) ? 3 : null
}

const isTypingTarget = (target) => {
    const tag = target?.tagName
    return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || target?.isContentEditable
}

const Highlight = ({ text, query }) => {
    const needle = query.trim().toLowerCase()
    const index = needle ? text.toLowerCase().indexOf(needle) : -1
    if (index < 0) return text
    return (
        <>
            {text.slice(0, index)}
            <mark>{text.slice(index, index + needle.length)}</mark>
            {text.slice(index + needle.length)}
        </>
    )
}

const RegionIcon = () => (
    <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 21s-7-6.1-7-11.5A7 7 0 0 1 19 9.5C19 14.9 12 21 12 21Z" /><circle cx="12" cy="9.5" r="2.5" /></svg>
)

const DistrictIcon = () => (
    <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 21V9l8-5 8 5v12" /><path d="M9 21v-6h6v6" /></svg>
)

const DpatGlobalSearch = ({ year }) => {
    const navigate = useNavigate()
    const listId = useId()
    const inputRef = useRef(null)
    const [query, setQuery] = useState('')
    const [focused, setFocused] = useState(false)
    const [active, setActive] = useState(0)
    const years = useDpatYears()
    const scores = useDpatScores(year)
    const regions = useDpatRegionScores(year)
    const scale = years.data?.classificationScale || []

    useEffect(() => {
        const onKeyDown = (event) => {
            const shortcut = (event.key === '/' && !isTypingTarget(event.target))
                || ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k')
            if (!shortcut) return
            event.preventDefault()
            inputRef.current?.focus()
        }
        window.addEventListener('keydown', onKeyDown)
        return () => window.removeEventListener('keydown', onKeyDown)
    }, [])

    const results = useMemo(() => {
        const needle = normalize(query)
        if (!needle) return []
        const regionItems = (regions.data || [])
            .map((region) => ({ region, rank: matchRank(region.regionName, needle) }))
            .filter((hit) => hit.rank !== null)
            .sort((a, b) => a.rank - b.rank || a.region.regionName.localeCompare(b.region.regionName))
            .slice(0, MAX_REGIONS)
            .map(({ region }) => ({
                type: 'region',
                key: `region-${region.regionId}`,
                name: `${region.regionName} Region`,
                meta: `${region.assessedCount} of ${region.districtCount} districts published`,
                value: region.averagePercent,
                rank: region.rank,
                classification: region.classification,
                to: `/dpat/performance-analysis?year=${year}&view=regions&region=${region.regionId}`,
            }))
        const districtItems = (scores.data?.districts || [])
            .map((district) => {
                const own = matchRank(district.districtName, needle)
                const viaRegion = own === null && matchRank(district.regionName, needle) !== null ? 4 : null
                return { district, rank: own ?? viaRegion }
            })
            .filter((hit) => hit.rank !== null)
            .sort((a, b) => a.rank - b.rank
                || (a.district.nationalRank ?? Infinity) - (b.district.nationalRank ?? Infinity)
                || a.district.districtName.localeCompare(b.district.districtName))
            .slice(0, MAX_DISTRICTS)
            .map(({ district }) => ({
                type: 'district',
                key: `district-${district.districtId}`,
                name: district.districtName,
                meta: `${district.regionName} Region`,
                value: district.finalPercent,
                rank: district.nationalRank,
                classification: district.classification,
                to: districtPath(district.districtId, year),
            }))
        return [...regionItems, ...districtItems]
    }, [query, regions.data, scores.data, year])

    useEffect(() => setActive(0), [query])

    const open = focused && query.trim().length > 0
    const loading = scores.isLoading || regions.isLoading

    const choose = (item) => {
        if (!item) return
        setQuery('')
        inputRef.current?.blur()
        navigate(item.to)
    }

    const onKeyDown = (event) => {
        if (event.key === 'Escape') {
            if (query) setQuery('')
            else inputRef.current?.blur()
            return
        }
        if (!results.length) return
        if (event.key === 'ArrowDown') {
            event.preventDefault()
            setActive((index) => (index + 1) % results.length)
        } else if (event.key === 'ArrowUp') {
            event.preventDefault()
            setActive((index) => (index - 1 + results.length) % results.length)
        } else if (event.key === 'Enter') {
            event.preventDefault()
            choose(results[active])
        }
    }

    const renderGroup = (type, label) => {
        const items = results.map((item, index) => ({ item, index })).filter(({ item }) => item.type === type)
        if (!items.length) return null
        return (
            <ul role="group" aria-label={label}>
                <li role="presentation" className="dpat-search__group">{label}</li>
                {items.map(({ item, index }) => (
                    <li
                        key={item.key}
                        id={`${listId}-${index}`}
                        role="option"
                        aria-selected={index === active}
                        className={`dpat-search__option${index === active ? ' is-active' : ''}`}
                        onMouseDown={(event) => event.preventDefault()}
                        onMouseEnter={() => setActive(index)}
                        onClick={() => choose(item)}
                    >
                        <span className={`dpat-search__icon dpat-search__icon--${item.type}`}>{item.type === 'region' ? <RegionIcon /> : <DistrictIcon />}</span>
                        <span className="dpat-search__text">
                            <strong><Highlight text={item.name} query={query} /></strong>
                            <small>{item.meta}</small>
                        </span>
                        <span className="dpat-search__score">
                            {Number.isFinite(item.value) ? (
                                <>
                                    <b style={{ color: classificationColor(item.classification, scale) }}>{formatPercent(item.value)}</b>
                                    <small>{item.rank ? `${ordinal(item.rank)} ${item.type === 'region' ? 'of regions' : 'nationally'}` : ''}</small>
                                </>
                            ) : <small>Assessment in progress</small>}
                        </span>
                    </li>
                ))}
            </ul>
        )
    }

    return (
        <div className={`dpat-search${open ? ' is-open' : ''}`}>
            <label className="dpat-search__field">
                <span className="dpat-sr-only">Search districts and regions</span>
                <svg className="dpat-search__glass" viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="7" /><path d="M20 20l-3.5-3.5" /></svg>
                <input
                    ref={inputRef}
                    type="text"
                    role="combobox"
                    aria-expanded={open}
                    aria-controls={listId}
                    aria-autocomplete="list"
                    aria-activedescendant={open && results.length ? `${listId}-${active}` : undefined}
                    autoComplete="off"
                    spellCheck="false"
                    placeholder="Search any district or region"
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    onFocus={() => setFocused(true)}
                    onBlur={() => setFocused(false)}
                    onKeyDown={onKeyDown}
                />
                {query ? (
                    <button type="button" className="dpat-search__clear" aria-label="Clear search" onMouseDown={(event) => event.preventDefault()} onClick={() => setQuery('')}>×</button>
                ) : (
                    <kbd aria-hidden="true">/</kbd>
                )}
            </label>
            {open && (
                <div className="dpat-search__panel">
                    {results.length > 0 ? (
                        <div role="listbox" id={listId} aria-label="Search results">
                            {renderGroup('region', 'Regions')}
                            {renderGroup('district', 'Districts')}
                        </div>
                    ) : (
                        <p className="dpat-search__empty" id={listId}>
                            {loading ? 'Loading districts and regions…' : `No district or region matches “${query.trim()}”.`}
                        </p>
                    )}
                    <div className="dpat-search__footer" aria-hidden="true">
                        <span><kbd>↑</kbd><kbd>↓</kbd> to move</span>
                        <span><kbd>Enter</kbd> to open</span>
                        <span><kbd>Esc</kbd> to close</span>
                    </div>
                </div>
            )}
        </div>
    )
}

export default DpatGlobalSearch
