import React from 'react'
import { useLocation } from 'react-router-dom'
import PillNav from './PillNav'
import DDDPlogo from '../static/images/img/dddp-clean-logo.png'

const navItems = [
    { label: 'Home', href: '/' },
    { label: 'Platforms', href: '/#platforms' },
    { label: 'Development', href: '/#development' },
    { label: 'Insights', href: '/#insights' },
    { label: 'LISA', href: '/lisa' },
    { label: 'About', href: '/about' },
    { label: 'Reporting tool', href: 'https://dddp.gov.gh/', external: true },
]

const NavBar = () => {
    const location = useLocation()

    return (
        <div className={`pill-nav-shell ${location.pathname === '/' ? 'pill-nav-shell--home' : 'pill-nav-shell--page'}`}>
            <PillNav
                logo={DDDPlogo}
                logoAlt="District Development Data Platform"
                items={navItems}
                activeHref={location.pathname}
                baseColor="#0f608e"
                pillColor="#ffffff"
                hoveredPillTextColor="#ffffff"
                pillTextColor="#153e5c"
                className="dddp-pill-nav"
            />
        </div>
    )
}

export default NavBar
