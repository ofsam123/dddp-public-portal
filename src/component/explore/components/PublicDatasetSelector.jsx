import React from 'react'
import { PUBLIC_DATASETS } from '../data/publicDatasets'
import './PublicDatasetSelector.css'

const PublicDatasetSelector = ({ value, onChange }) => (
    <label className="public-dataset-selector">
        <span>Tracker</span>
        <select aria-label="Public tracker" value={value} onChange={(event) => onChange(event.target.value)}>
            {PUBLIC_DATASETS.map((dataset) => <option key={dataset.key} value={dataset.key}>{dataset.label}</option>)}
        </select>
    </label>
)

export default PublicDatasetSelector
