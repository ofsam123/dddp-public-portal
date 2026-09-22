import React, { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import PortalLogo from '../shared/PortalLogo'
import './PillNav.css'

const PillNav = ({ logo, logoAlt = 'District Development Data Platform', items = [], activeHref = '/', className = '', baseColor = '#16325A', pillColor = '#ffffff', hoveredPillTextColor = '#ffffff', pillTextColor = '#16325A' }) => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
    const [openGroup, setOpenGroup] = useState(null)
    const containerRef = useRef(null)
    const triggerRefs = useRef({})

    useEffect(() => {
        const closeOutside = (event) => {
            if (containerRef.current && !containerRef.current.contains(event.target)) {
                setIsMobileMenuOpen(false)
                setOpenGroup(null)
            }
        }
        const closeEscape = (event) => {
            if (event.key !== 'Escape') return
            triggerRefs.current[openGroup]?.focus()
            setOpenGroup(null)
            setIsMobileMenuOpen(false)
        }
        document.addEventListener('pointerdown', closeOutside)
        document.addEventListener('keydown', closeEscape)
        return () => {
            document.removeEventListener('pointerdown', closeOutside)
            document.removeEventListener('keydown', closeEscape)
        }
    }, [openGroup])

    const cssVars = { '--base': baseColor, '--pill-bg': pillColor, '--hover-text': hoveredPillTextColor, '--pill-text': pillTextColor }
    const isNativeLink = (item) => item.external || item.href?.includes('#') || /^(https?:|mailto:|tel:|\/\/)/.test(item.href || '')
    const isActive = (item) => activeHref === (item.activeHref || item.href) || item.children?.some((child) => activeHref === child.href)
    const closeMobileMenu = () => { setIsMobileMenuOpen(false); setOpenGroup(null) }
    const renderLabel = (label) => <><span className="hover-circle" aria-hidden="true" /><span className="label-stack"><span className="pill-label">{label}</span><span className="pill-label-hover" aria-hidden="true">{label}</span></span></>

    const renderLink = (item, mobile = false) => {
        const classNameValue = mobile ? `mobile-menu-link${isActive(item) ? ' is-active' : ''}${item.action ? ' mobile-menu-link--action' : ''}` : `pill${isActive(item) ? ' is-active' : ''}${item.action ? ' pill--action' : ''}`
        const content = mobile ? item.label : renderLabel(item.label)
        if (isNativeLink(item)) return <a className={classNameValue} href={item.href} target={item.external ? '_blank' : undefined} rel={item.external ? 'noopener noreferrer' : undefined} onClick={mobile ? closeMobileMenu : undefined}>{content}</a>
        return <Link className={classNameValue} to={item.href} onClick={mobile ? closeMobileMenu : undefined}>{content}</Link>
    }

    return (
        <div className="pill-nav-container" ref={containerRef} style={cssVars}>
            <nav className={`pill-nav ${className}`} aria-label="Primary navigation">
                <PortalLogo src={logo} alt={logoAlt} variant="nav" onClick={closeMobileMenu} />
                <div className="pill-nav-items desktop-only"><ul className="pill-list">{items.map((item) => (
                    <li key={item.href || item.label} className="pill-group">
                        {item.children ? <>
                            <button ref={(node) => { triggerRefs.current[item.label] = node }} type="button" className={`pill${isActive(item) ? ' is-active' : ''}`} aria-expanded={openGroup === item.label} aria-controls={`nav-group-${item.label.replace(/\W/g, '-').toLowerCase()}`} onClick={() => setOpenGroup((value) => value === item.label ? null : item.label)}>{renderLabel(item.label)}<span className="pill-group__chevron" aria-hidden="true">+</span></button>
                            <div id={`nav-group-${item.label.replace(/\W/g, '-').toLowerCase()}`} className={`pill-group__popover${openGroup === item.label ? ' is-open' : ''}`}><ul>{item.children.map((child) => <li key={child.href}>{renderLink(child)}</li>)}</ul></div>
                        </> : renderLink(item)}
                    </li>
                ))}</ul></div>
                <button className={`mobile-menu-button mobile-only${isMobileMenuOpen ? ' is-open' : ''}`} type="button" onClick={() => setIsMobileMenuOpen((value) => !value)} aria-label="Toggle navigation" aria-expanded={isMobileMenuOpen} aria-controls="pill-mobile-menu"><span className="hamburger-line" /><span className="hamburger-line" /></button>
            </nav>
            <div className={`mobile-menu-popover mobile-only${isMobileMenuOpen ? ' is-open' : ''}`} id="pill-mobile-menu"><ul className="mobile-menu-list">{items.map((item) => (
                <li key={item.href || item.label}>{item.children ? <>
                    <button type="button" className={`mobile-menu-link mobile-menu-group${isActive(item) ? ' is-active' : ''}`} aria-expanded={openGroup === item.label} onClick={() => setOpenGroup((value) => value === item.label ? null : item.label)}>{item.label}<span aria-hidden="true">+</span></button>
                    {openGroup === item.label && <ul className="mobile-submenu">{item.children.map((child) => <li key={child.href}>{renderLink(child, true)}</li>)}</ul>}
                </> : renderLink(item, true)}</li>
            ))}</ul></div>
        </div>
    )
}

export default PillNav
