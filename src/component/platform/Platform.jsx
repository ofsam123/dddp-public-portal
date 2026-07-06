import React from 'react'
import './Platform.css'

const ReportIcon = () => (
    <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M7 3.5h8l3 3V20H7z" />
        <path d="M15 3.5V7h3M10 11h5M10 14h5M10 17h3" />
    </svg>
)

const DataIcon = () => (
    <svg viewBox="0 0 24 24" aria-hidden="true">
        <ellipse cx="12" cy="6" rx="7" ry="3" />
        <path d="M5 6v6c0 1.7 3.1 3 7 3s7-1.3 7-3V6M5 12v6c0 1.7 3.1 3 7 3s7-1.3 7-3v-6" />
    </svg>
)

const ClimateIcon = () => (
    <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M7.5 18.5h9.2a3.8 3.8 0 0 0 .3-7.6A5.5 5.5 0 0 0 6.7 9.1a4.8 4.8 0 0 0 .8 9.4Z" />
        <path d="M9 15h6" />
    </svg>
)

const platforms = [
    {
        title: 'District reporting tool',
        description: 'Submit, review and manage district development reports in one connected workspace.',
        href: 'https://dddp.gov.gh/',
        external: true,
        label: 'Open reporting tool',
        icon: <ReportIcon />,
    },
    {
        title: 'Planning and analytics',
        description: 'Explore district performance, planning information and decision-ready development data.',
        href: 'https://dpat.aoinnovations.org/',
        external: true,
        label: 'Explore DPAT',
        icon: <DataIcon />,
    },
    {
        title: 'Local climate insights',
        description: 'Access local forecasts and climate information designed to support resilient communities.',
        href: '/lisa',
        external: false,
        label: 'Explore LISA',
        icon: <ClimateIcon />,
    },
]

const Platform = () => {
    return (
        <section className="platform-access" id="platforms" aria-labelledby="platform-access-title">
            <h2 id="platform-access-title" className="visually-hidden">Access DDDP platforms</h2>
            <div className="platform-access__grid">
                {platforms.map((platform) => (
                    <a
                        className="platform-card"
                        href={platform.href}
                        key={platform.title}
                        target={platform.external ? '_blank' : undefined}
                        rel={platform.external ? 'noopener noreferrer' : undefined}
                    >
                        <div className="platform-card__topline">
                            <span className="platform-card__icon">{platform.icon}</span>
                            <span className="platform-card__arrow" aria-hidden="true">↗</span>
                        </div>
                        <h3>{platform.title}</h3>
                        <p>{platform.description}</p>
                        <span className="platform-card__link">{platform.label} <i aria-hidden="true">→</i></span>
                    </a>
                ))}
            </div>
        </section>
    )
}

export default Platform
