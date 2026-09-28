import React from 'react'

const stateLabels = {
    loading: 'Loading public information',
    unavailable: 'No published data',
    'not-yet-published': 'Not yet published',
    error: 'Information unavailable',
    'future-ready': 'Planned',
}

const PublicState = ({ status = 'not-yet-published', title, children }) => (
    <div className={`public-state public-state--${status}`} role={status === 'error' ? 'alert' : 'status'}>
        <span>{stateLabels[status] || stateLabels['not-yet-published']}</span>
        {title && <strong>{title}</strong>}
        {children && <p>{children}</p>}
    </div>
)

export default PublicState
