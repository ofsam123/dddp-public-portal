import React, { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import PortalLogo from '../shared/PortalLogo'
import './PillNav.css'

const PillNav = ({
    logo,
    logoAlt = 'District Development Data Platform',
    items = [],
    activeHref = '/',
    className = '',
    baseColor = '#16325A',
    pillColor = '#ffffff',
    hoveredPillTextColor = '#ffffff',
    pillTextColor = '#16325A',
}) => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
    const containerRef = useRef(null)

    useEffect(() => {
        const closeOnOutsideClick = (event) => {
            if (containerRef.current && !containerRef.current.contains(event.target)) {
                setIsMobileMenuOpen(false)
            }
        }

        const closeOnEscape = (event) => {
            if (event.key === 'Escape') setIsMobileMenuOpen(false)
        }

        document.addEventListener('pointerdown', closeOnOutsideClick)
        document.addEventListener('keydown', closeOnEscape)

        return () => {
            document.removeEventListener('pointerdown', closeOnOutsideClick)
            document.removeEventListener('keydown', closeOnEscape)
        }
    }, [])

    const cssVars = {
        '--base': baseColor,
        '--pill-bg': pillColor,
        '--hover-text': hoveredPillTextColor,
        '--pill-text': pillTextColor,
    }

    const isNativeLink = (item) => item.external || item.href.includes('#') || /^(https?:|mailto:|tel:|\/\/)/.test(item.href)

    const closeMobileMenu = () => setIsMobileMenuOpen(false)

    const renderLabel = (label) => (
        <>
            <span className="hover-circle" aria-hidden="true" />
            <span className="label-stack">
                <span className="pill-label">{label}</span>
                <span className="pill-label-hover" aria-hidden="true">{label}</span>
            </span>
        </>
    )

    const renderDesktopItem = (item) => {
        const active = activeHref === (item.activeHref || item.href)
        const itemClassName = `pill${active ? ' is-active' : ''}${item.action ? ' pill--action' : ''}`

        if (isNativeLink(item)) {
            return (
                <a
                    className={itemClassName}
                    href={item.href}
                    target={item.external ? '_blank' : undefined}
                    rel={item.external ? 'noopener noreferrer' : undefined}
                >
                    {renderLabel(item.label)}
                </a>
            )
        }

        return <Link className={itemClassName} to={item.href}>{renderLabel(item.label)}</Link>
    }

    const renderMobileItem = (item) => {
        const itemClassName = `mobile-menu-link${activeHref === (item.activeHref || item.href) ? ' is-active' : ''}${item.action ? ' mobile-menu-link--action' : ''}`

        if (isNativeLink(item)) {
            return (
                <a
                    className={itemClassName}
                    href={item.href}
                    target={item.external ? '_blank' : undefined}
                    rel={item.external ? 'noopener noreferrer' : undefined}
                    onClick={closeMobileMenu}
                >
                    {item.label}<span aria-hidden="true">↗</span>
                </a>
            )
        }

        return <Link className={itemClassName} to={item.href} onClick={closeMobileMenu}>{item.label}</Link>
    }

    return (
        <div className="pill-nav-container" ref={containerRef} style={cssVars}>
            <nav className={`pill-nav ${className}`} aria-label="Primary navigation">
                <PortalLogo src={logo} alt={logoAlt} variant="nav" onClick={closeMobileMenu} />

                <div className="pill-nav-items desktop-only">
                    <ul className="pill-list">
                        {items.map((item) => <li key={item.href}>{renderDesktopItem(item)}</li>)}
                    </ul>
                </div>

                <button
                    className={`mobile-menu-button mobile-only${isMobileMenuOpen ? ' is-open' : ''}`}
                    type="button"
                    onClick={() => setIsMobileMenuOpen((open) => !open)}
                    aria-label="Toggle navigation"
                    aria-expanded={isMobileMenuOpen}
                    aria-controls="pill-mobile-menu"
                >
                    <span className="hamburger-line" />
                    <span className="hamburger-line" />
                </button>
            </nav>

            <div
                className={`mobile-menu-popover mobile-only${isMobileMenuOpen ? ' is-open' : ''}`}
                id="pill-mobile-menu"
            >
                <ul className="mobile-menu-list">
                    {items.map((item) => <li key={item.href}>{renderMobileItem(item)}</li>)}
                </ul>
            </div>
        </div>
    )
}

export default PillNav
