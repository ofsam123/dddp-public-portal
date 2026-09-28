import React, { useEffect, useId } from 'react'
import NavBar from '../../header/NavBar'
import PublicFooter from '../../footer/PublicFooter'
import ExploreBreadcrumbs from '../../explore/components/ExploreBreadcrumbs'
import PublicState from '../../explore/components/PublicState'
import { formatDateTime } from '../dpatFormat'
import DpatGlobalSearch from './DpatGlobalSearch'
import '../Dpat.css'

const FONT_HREF = 'https://fonts.googleapis.com/css2?family=Public+Sans:wght@400;500;600;700&display=swap'

const useDpatFonts = () => {
    useEffect(() => {
        if (document.querySelector('link[data-dpat-fonts]')) return
        const link = document.createElement('link')
        link.rel = 'stylesheet'
        link.href = FONT_HREF
        link.dataset.dpatFonts = 'true'
        document.head.appendChild(link)
    }, [])
}

export const DpatPageShell = ({ children }) => {
    useDpatFonts()
    return (
        <>
            <NavBar />
            <main className="dpat-page">{children}</main>
            <PublicFooter />
        </>
    )
}

const MAX_SEGMENTED_YEARS = 5

const YearPicker = ({ year, years, onYearChange }) => {
    const labelId = useId()
    const segmented = years.length > 0 && years.length <= MAX_SEGMENTED_YEARS
    return (
        <div className="dpat-hero__year">
            <span id={labelId}>Assessment year</span>
            {segmented ? (
                <div className="dpat-segmented" role="group" aria-labelledby={labelId}>
                    {years.map((option) => (
                        <button
                            type="button"
                            key={option}
                            className={option === year ? 'is-active' : undefined}
                            aria-pressed={option === year}
                            onClick={() => option !== year && onYearChange(option)}
                        >
                            {option}
                        </button>
                    ))}
                </div>
            ) : (
                <select
                    aria-labelledby={labelId}
                    value={year || ''}
                    disabled={!year || years.length === 0}
                    onChange={(event) => onYearChange(Number(event.target.value))}
                >
                    {!year && <option value="">Loading</option>}
                    {[...years].reverse().map((option) => <option key={option} value={option}>{option}</option>)}
                </select>
            )}
            <small>Source: DPAT final outcomes</small>
        </div>
    )
}

export const DpatHero = ({ breadcrumbs, eyebrow, title, description, year, years = [], onYearChange, updatedAt, badges, children }) => {
    const updated = formatDateTime(updatedAt)
    return (
        <header className={`dpat-hero${children ? ' dpat-hero--overlap' : ''}`}>
            <div className="dpat-container">
                <div className="dpat-hero__top">
                    <ExploreBreadcrumbs items={breadcrumbs} />
                    <div className="dpat-hero__status">
                        <span className="dpat-hero__verified">
                            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3l7 3v5c0 4.6-3 8.4-7 10-4-1.6-7-5.4-7-10V6l7-3Z" /><path d="M9 12l2 2 4-4" /></svg>
                            Official final results
                        </span>
                        {updated && <span>Updated {updated}</span>}
                    </div>
                </div>
                <div className="dpat-hero__grid">
                    <div className="dpat-hero__content">
                        <span className="dpat-hero__eyebrow">{eyebrow}</span>
                        <h1>{title}</h1>
                        {description && <p>{description}</p>}
                        {badges && <div className="dpat-hero__badges">{badges}</div>}
                    </div>
                    <YearPicker year={year} years={years} onYearChange={onYearChange} />
                </div>
                {children}
            </div>
        </header>
    )
}

export const DpatToolbar = ({ year, label, children }) => (
    <nav className="dpat-tabs" aria-label={label}>
        <div className="dpat-container dpat-tabs__inner">
            <div className="dpat-tabs__list">{children}</div>
            <DpatGlobalSearch year={year} />
        </div>
    </nav>
)

export const DpatKpi = ({ label, value, unit, context, accent, children }) => (
    <article className={`dpat-kpi${accent ? ' has-accent' : ''}`} style={accent ? { '--kpi-accent': accent } : undefined}>
        <h3>{label}</h3>
        <div className="dpat-kpi__value">{value}{unit && <small>{unit}</small>}</div>
        {context && <p>{context}</p>}
        {children}
    </article>
)

export const DpatSection = ({ kicker, title, description, actions, children, id }) => (
    <section className="dpat-section" id={id} aria-labelledby={id ? `${id}-title` : undefined}>
        <div className="dpat-section__heading">
            <div>
                {kicker && <span className="dpat-kicker">{kicker}</span>}
                <h2 id={id ? `${id}-title` : undefined}>{title}</h2>
                {description && <p>{description}</p>}
            </div>
            {actions && <div className="dpat-section__actions">{actions}</div>}
        </div>
        {children}
    </section>
)

export const DpatLoading = ({ title = 'Loading DPAT final results' }) => (
    <div className="dpat-container dpat-state">
        <PublicState status="loading" title={title}>Preparing published final scores. This can take a few seconds the first time.</PublicState>
    </div>
)

export const DpatError = ({ error, title = 'DPAT results are unavailable' }) => (
    <div className="dpat-container dpat-state">
        <PublicState status={error?.status === 404 ? 'unavailable' : 'error'} title={title}>
            {error?.status === 404
                ? 'No published final results were found for this selection.'
                : 'We could not load published results right now. Please try again shortly.'}
        </PublicState>
    </div>
)
