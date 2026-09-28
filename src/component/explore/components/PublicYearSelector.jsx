import React from 'react'
import './PublicYearSelector.css'

const PublicYearSelector = ({ year, years = [], isLoading = false, onChange }) => (
    <label className="public-year-selector">
        <span>Viewing data for</span>
        <select
            aria-label="Viewing data for year"
            disabled={isLoading || !year || years.length === 0}
            value={year || ''}
            onChange={(event) => onChange(Number(event.target.value))}
        >
            {!year && <option value="">Unavailable</option>}
            {[...years].reverse().map((availableYear) => (
                <option value={availableYear} key={availableYear}>{availableYear}</option>
            ))}
        </select>
    </label>
)

export default PublicYearSelector
