import React, { useEffect, useRef, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import PortalLogo from '../shared/PortalLogo'
import { ExternalArrowIcon } from '../shared/PortalIcons'
import usePublicYear from '../explore/hooks/usePublicYear'
import './NavBar.css'

const REPORTING_URL = 'https://dddp.gov.gh/'

const NAV_ICONS = {
    chart: <><path d="M4 20V10" /><path d="M10 20V4" /><path d="M16 20v-7" /><path d="M22 20H2" /></>,
    clipboard: <><rect x="5" y="4" width="14" height="17" rx="2" /><path d="M9 4V3h6v1" /><path d="M9 11l2 2 4-4" /><path d="M9 17h6" /></>,
    leaf: <><path d="M5 19c0-8 5-13 15-14-1 10-6 15-14 15" /><path d="M5 19l7-7" /></>,
    cloud: <><path d="M7 18h10a4 4 0 0 0 .5-8 6 6 0 0 0-11.5 1.5A3.5 3.5 0 0 0 7 18Z" /></>,
    layers: <><path d="M12 3l9 5-9 5-9-5 9-5Z" /><path d="M3 13l9 5 9-5" /></>,
    doc: <><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8l-5-5Z" /><path d="M14 3v5h5" /><path d="M9 13h6" /><path d="M9 17h4" /></>,
}

const NavIcon = ({ name }) => <svg viewBox="0 0 24 24" aria-hidden="true">{NAV_ICONS[name]}</svg>

const NAV_ITEMS = [
    { label: 'Home', href: '/' },
    { label: 'Explore data', href: '/explore' },
    {
        label: 'DPAT',
        children: [
            { label: 'Performance analysis', description: 'Official final DPAT results, rankings and district scorecards.', href: '/dpat/performance-analysis', icon: 'chart' },
            { label: 'DPAT assessment', description: 'How the District Performance Assessment Tool works.', href: '/dpat/assessment', icon: 'clipboard' },
        ],
    },
    {
        label: 'LISA climate',
        children: [
            { label: 'Climate change', description: 'Local climate information for district planning.', href: '/climate', icon: 'leaf' },
            { label: 'Forecast history', description: 'Past forecasts for districts across Ghana.', href: '/all-forcast', icon: 'cloud' },
        ],
    },
    {
        label: 'Data & statistics',
        children: [
            { label: 'Development dimension', description: 'Development activity grouped by dimension.', href: '/data-statistics/development-dimension', icon: 'layers' },
        ],
    },
    {
        label: 'Reports',
        children: [
            { label: 'MMDA annual progress report', description: 'Annual progress reports from district assemblies.', href: '/apr/mmda', icon: 'doc' },
            { label: 'RCC annual progress report', description: 'Annual progress reports from regional coordinating councils.', href: '/apr/rcc', icon: 'doc' },
        ],
    },
    { label: 'About', href: '/about' },
]

const groupId = (label) => `site-nav-${label.replace(/\W+/g, '-').toLowerCase()}`

const isPublicYearRoute = (pathname) => pathname === '/' || pathname === '/explore' || pathname.startsWith('/explore/')

const NavYearSelector = () => {
    const { year, years, isLoading, setYear } = usePublicYear()

    return (
        <label className={`site-nav__year${isLoading ? ' is-loading' : ''}`}>
            <span className="site-nav__year-label">Data year</span>
            <select
                aria-label="Data year for the whole site"
                disabled={isLoading || !year || years.length === 0}
                value={year || ''}
                onChange={(event) => setYear(Number(event.target.value))}
            >
                {!year && <option value="">{isLoading ? '…' : '—'}</option>}
                {[...years].reverse().map((availableYear) => (
                    <option value={availableYear} key={availableYear}>{availableYear}</option>
                ))}
            </select>
        </label>
    )
}

const NavBar = () => {
    const location = useLocation()
    const [openGroup, setOpenGroup] = useState(null)
    const [menuOpen, setMenuOpen] = useState(false)
    const [scrolled, setScrolled] = useState(false)
    const navRef = useRef(null)
    const isDpatRoute = location.pathname.startsWith('/dpat/performance-analysis')

    const current = new URLSearchParams(location.search)
    const context = new URLSearchParams()
    if (/^\d{4}$/.test(current.get('year') || '')) context.set('year', current.get('year'))
    if (current.get('dataset')) context.set('dataset', current.get('dataset'))
    const query = context.toString()
    const withContext = (href) => (query && isPublicYearRoute(href) ? `${href}?${query}` : href)

    const isActive = (item) => {
        if (item.href === '/') return location.pathname === '/'
        if (item.href) return location.pathname.startsWith(item.href)
        return item.children.some((child) => location.pathname.startsWith(child.href))
    }

    useEffect(() => {
        setOpenGroup(null)
        setMenuOpen(false)
    }, [location.pathname])

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 8)
        onScroll()
        window.addEventListener('scroll', onScroll, { passive: true })
        return () => window.removeEventListener('scroll', onScroll)
    }, [])

    useEffect(() => {
        const closeOutside = (event) => {
            if (navRef.current && !navRef.current.contains(event.target)) {
                setOpenGroup(null)
                setMenuOpen(false)
            }
        }
        const closeOnEscape = (event) => {
            if (event.key !== 'Escape') return
            setOpenGroup(null)
            setMenuOpen(false)
        }
        document.addEventListener('pointerdown', closeOutside)
        document.addEventListener('keydown', closeOnEscape)
        return () => {
            document.removeEventListener('pointerdown', closeOutside)
            document.removeEventListener('keydown', closeOnEscape)
        }
    }, [])

    const toggleGroup = (label) => setOpenGroup((value) => (value === label ? null : label))

    return (
        <header
            ref={navRef}
            className={`site-nav${isDpatRoute ? '' : ' site-nav--sticky'}${scrolled ? ' is-scrolled' : ''}${menuOpen ? ' is-menu-open' : ''}`}
        >
            <div className="site-nav__bar pt-container">
                <PortalLogo variant="nav" />

                <nav className="site-nav__primary" aria-label="Primary navigation">
                    <ul className="site-nav__list">
                        {NAV_ITEMS.map((item) => (
                            <li
                                key={item.label}
                                className={`site-nav__item${item.children ? ' has-menu' : ''}${openGroup === item.label ? ' is-open' : ''}`}
                                onMouseEnter={item.children ? () => setOpenGroup(item.label) : undefined}
                                onMouseLeave={item.children ? () => setOpenGroup(null) : undefined}
                            >
                                {item.children ? (
                                    <>
                                        <button
                                            type="button"
                                            className={`site-nav__link${isActive(item) ? ' is-active' : ''}`}
                                            aria-expanded={openGroup === item.label}
                                            aria-controls={groupId(item.label)}
                                            onClick={() => toggleGroup(item.label)}
                                        >
                                            {item.label}
                                            <svg className="site-nav__chevron" viewBox="0 0 12 12" aria-hidden="true"><path d="M3 4.5l3 3 3-3" /></svg>
                                        </button>
                                        <div className="site-nav__panel" id={groupId(item.label)}>
                                            <ul>
                                                {item.children.map((child) => (
                                                    <li key={child.href}>
                                                        <Link className={`site-nav__panel-link${location.pathname.startsWith(child.href) ? ' is-active' : ''}`} to={child.href}>
                                                            <span className="site-nav__panel-icon"><NavIcon name={child.icon} /></span>
                                                            <span>
                                                                <strong>{child.label}</strong>
                                                                <small>{child.description}</small>
                                                            </span>
                                                        </Link>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    </>
                                ) : (
                                    <Link className={`site-nav__link${isActive(item) ? ' is-active' : ''}`} to={withContext(item.href)} aria-current={isActive(item) ? 'page' : undefined}>
                                        {item.label}
                                    </Link>
                                )}
                            </li>
                        ))}
                    </ul>
                </nav>

                {isPublicYearRoute(location.pathname) && <NavYearSelector />}

                <a className="pt-button pt-button--primary pt-button--sm site-nav__cta" href={REPORTING_URL} target="_blank" rel="noopener noreferrer">
                    Reporting platform <ExternalArrowIcon />
                </a>

                <button
                    type="button"
                    className="site-nav__toggle"
                    aria-label={menuOpen ? 'Close menu' : 'Open menu'}
                    aria-expanded={menuOpen}
                    aria-controls="site-nav-mobile"
                    onClick={() => setMenuOpen((value) => !value)}
                >
                    <span /><span /><span />
                </button>
            </div>

            <div className="site-nav__mobile" id="site-nav-mobile" hidden={!menuOpen}>
                <div className="pt-container">
                    <ul>
                        {NAV_ITEMS.map((item) => (
                            <li key={item.label}>
                                {item.children ? (
                                    <>
                                        <button
                                            type="button"
                                            className={`site-nav__mobile-link${isActive(item) ? ' is-active' : ''}`}
                                            aria-expanded={openGroup === item.label}
                                            onClick={() => toggleGroup(item.label)}
                                        >
                                            {item.label}
                                            <svg className="site-nav__chevron" viewBox="0 0 12 12" aria-hidden="true"><path d="M3 4.5l3 3 3-3" /></svg>
                                        </button>
                                        {openGroup === item.label && (
                                            <ul className="site-nav__mobile-sub">
                                                {item.children.map((child) => (
                                                    <li key={child.href}>
                                                        <Link to={child.href} className={location.pathname.startsWith(child.href) ? 'is-active' : undefined}>
                                                            <span className="site-nav__panel-icon"><NavIcon name={child.icon} /></span>
                                                            {child.label}
                                                        </Link>
                                                    </li>
                                                ))}
                                            </ul>
                                        )}
                                    </>
                                ) : (
                                    <Link className={`site-nav__mobile-link${isActive(item) ? ' is-active' : ''}`} to={withContext(item.href)}>{item.label}</Link>
                                )}
                            </li>
                        ))}
                    </ul>
                    <a className="pt-button pt-button--primary site-nav__mobile-cta" href={REPORTING_URL} target="_blank" rel="noopener noreferrer">
                        Open reporting platform <ExternalArrowIcon />
                    </a>
                </div>
            </div>
        </header>
    )
}

export default NavBar
