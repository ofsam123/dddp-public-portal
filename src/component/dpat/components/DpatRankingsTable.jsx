import React, { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import exportFromJSON from 'export-from-json'
import { classificationColor, districtPath, formatPercent, formatScore } from '../dpatFormat'

const PAGE_SIZE = 25

const COLUMNS = [
    { key: 'nationalRank', label: 'Rank', numeric: true, defaultDir: 'asc' },
    { key: 'districtName', label: 'District / MMDA', defaultDir: 'asc' },
    { key: 'regionName', label: 'Region', defaultDir: 'asc' },
    { key: 'finalPercent', label: 'Final score', numeric: true, defaultDir: 'desc' },
    { key: 'sdiFinal', label: 'SDI', numeric: true, defaultDir: 'desc' },
    { key: 'piFinal', label: 'PI', numeric: true, defaultDir: 'desc' },
    { key: 'ciFulfilled', label: 'CI met', numeric: true, defaultDir: 'desc' },
    { key: 'classification', label: 'Final outcome', defaultDir: 'asc' },
]

const compareValues = (a, b, key, direction, scaleOrder) => {
    const pick = (item) => (key === 'classification' ? scaleOrder.get(item.classification) : item[key])
    const left = pick(a)
    const right = pick(b)
    const leftMissing = left === null || left === undefined
    const rightMissing = right === null || right === undefined
    if (leftMissing || rightMissing) return leftMissing === rightMissing ? 0 : leftMissing ? 1 : -1
    const result = typeof left === 'string' ? left.localeCompare(right) : left - right
    return direction === 'asc' ? result : -result
}

const DpatRankingsTable = ({ districts, regions = [], scale = [], year, lockedRegionId = null, title = 'District rankings' }) => {
    const [query, setQuery] = useState('')
    const [regionId, setRegionId] = useState('')
    const [classification, setClassification] = useState('')
    const [showInProgress, setShowInProgress] = useState(true)
    const [sort, setSort] = useState({ key: 'nationalRank', dir: 'asc' })
    const [visible, setVisible] = useState(PAGE_SIZE)
    const scaleOrder = useMemo(() => new Map(scale.map((band, index) => [band.label, index])), [scale])
    const activeRegion = lockedRegionId || regionId

    const rows = useMemo(() => {
        const needle = query.trim().toLowerCase()
        return districts
            .filter((district) => !activeRegion || district.regionId === activeRegion)
            .filter((district) => !classification || district.classification === classification)
            .filter((district) => showInProgress || Number.isFinite(district.finalPercent))
            .filter((district) => !needle || `${district.districtName} ${district.regionName}`.toLowerCase().includes(needle))
            .sort((a, b) => compareValues(a, b, sort.key, sort.dir, scaleOrder) || a.districtName.localeCompare(b.districtName))
    }, [districts, activeRegion, classification, showInProgress, query, sort, scaleOrder])

    const updateFilter = (setter) => (event) => {
        setter(event.target.type === 'checkbox' ? event.target.checked : event.target.value)
        setVisible(PAGE_SIZE)
    }

    const toggleSort = (column) => setSort((current) => (current.key === column.key
        ? { key: column.key, dir: current.dir === 'asc' ? 'desc' : 'asc' }
        : { key: column.key, dir: column.defaultDir }))

    const downloadCsv = () => exportFromJSON({
        data: rows.map((district) => ({
            'National rank': district.nationalRank ?? '',
            'Regional rank': district.regionalRank ?? '',
            District: district.districtName,
            Region: district.regionName,
            Status: district.status,
            'Final score': district.finalScore ?? '',
            'Max score': district.maxScore ?? '',
            'Final score (%)': district.finalPercent ?? '',
            'SDI final': district.sdiFinal ?? '',
            'SDI max': district.sdiMax ?? '',
            'PI final': district.piFinal ?? '',
            'PI max': district.piMax ?? '',
            'CI fulfilled': district.ciFulfilled ?? '',
            'Final outcome': district.classification ?? '',
        })),
        fileName: `dpat-final-scores-${year}${activeRegion ? `-${(regions.find((region) => region.regionId === activeRegion)?.regionName || 'region').toLowerCase().replace(/\s+/g, '-')}` : ''}`,
        exportType: exportFromJSON.types.csv,
    })

    const shown = rows.slice(0, visible)

    return (
        <div className="dpat-table-card">
            <div className="dpat-table-toolbar">
                <label className="dpat-field dpat-field--search">
                    <span>Search</span>
                    <input type="search" value={query} onChange={updateFilter(setQuery)} placeholder="District or region" />
                </label>
                {!lockedRegionId && (
                    <label className="dpat-field">
                        <span>Region</span>
                        <select value={regionId} onChange={updateFilter(setRegionId)}>
                            <option value="">All regions</option>
                            {regions.map((region) => <option key={region.regionId} value={region.regionId}>{region.regionName}</option>)}
                        </select>
                    </label>
                )}
                <label className="dpat-field">
                    <span>Final outcome</span>
                    <select value={classification} onChange={updateFilter(setClassification)}>
                        <option value="">All outcomes</option>
                        {scale.map((band) => <option key={band.label} value={band.label}>{band.label}</option>)}
                    </select>
                </label>
                <label className="dpat-check">
                    <input type="checkbox" checked={showInProgress} onChange={updateFilter(setShowInProgress)} />
                    <span>Include assessments in progress</span>
                </label>
                <button type="button" className="dpat-button dpat-button--ghost" onClick={downloadCsv} disabled={!rows.length}>
                    Download CSV
                </button>
            </div>

            <div className="dpat-table-scroll">
                <table className="dpat-table">
                    <caption>{title}, {year}. {rows.length} {rows.length === 1 ? 'district' : 'districts'} shown. Select a column heading to sort.</caption>
                    <thead>
                        <tr>
                            {COLUMNS.map((column) => (
                                <th
                                    key={column.key}
                                    scope="col"
                                    className={column.numeric ? 'is-numeric' : undefined}
                                    aria-sort={sort.key === column.key ? (sort.dir === 'asc' ? 'ascending' : 'descending') : 'none'}
                                >
                                    <button type="button" onClick={() => toggleSort(column)}>
                                        {column.label}
                                        <span aria-hidden="true">{sort.key === column.key ? (sort.dir === 'asc' ? '▲' : '▼') : '↕'}</span>
                                    </button>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {shown.map((district) => {
                            const released = Number.isFinite(district.finalPercent)
                            const color = classificationColor(district.classification, scale)
                            return (
                                <tr key={district.districtId} className={released ? undefined : 'is-pending'}>
                                    <td className="is-numeric dpat-table__rank">{district.nationalRank ?? '—'}</td>
                                    <th scope="row">
                                        <Link to={districtPath(district.districtId, year)}>{district.districtName}</Link>
                                        {released && <small>{district.regionalRank ? `#${district.regionalRank} in region` : ''}</small>}
                                    </th>
                                    <td>{district.regionName}</td>
                                    {released ? (
                                        <>
                                            <td className="is-numeric">
                                                <div className="dpat-table__score">
                                                    <span className="dpat-table__bar" aria-hidden="true"><i style={{ width: `${district.finalPercent}%`, background: color }} /></span>
                                                    <b>{formatPercent(district.finalPercent)}</b>
                                                </div>
                                            </td>
                                            <td className="is-numeric">{formatScore(district.sdiFinal)}<small>/{district.sdiMax}</small></td>
                                            <td className="is-numeric">{formatScore(district.piFinal)}<small>/{district.piMax}</small></td>
                                            <td className="is-numeric">{district.ciFulfilled}<small>/{district.ciTotal}</small></td>
                                            <td><span className="dpat-pill" style={{ '--pill-color': color }}>{district.classification}</span></td>
                                        </>
                                    ) : (
                                        <td colSpan={5} className="dpat-table__pending">Assessment in progress · {district.status}</td>
                                    )}
                                </tr>
                            )
                        })}
                        {!shown.length && (
                            <tr><td colSpan={COLUMNS.length} className="dpat-table__empty">No districts match these filters.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>

            {rows.length > visible && (
                <div className="dpat-table-more">
                    <span>Showing {shown.length} of {rows.length}</span>
                    <button type="button" className="dpat-button dpat-button--ghost" onClick={() => setVisible((count) => count + PAGE_SIZE)}>Show {Math.min(PAGE_SIZE, rows.length - visible)} more</button>
                    <button type="button" className="dpat-button dpat-button--text" onClick={() => setVisible(rows.length)}>Show all</button>
                </div>
            )}
        </div>
    )
}

export default DpatRankingsTable
