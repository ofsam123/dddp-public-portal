import React from 'react'
import { useLocation } from 'react-router-dom'
import PillNav from './PillNav'

const baseNavItems = [
    { label: 'Home', href: '/' },
    { label: 'Explore Data', href: '/explore' },
    { label: 'Reports & Resources', href: '/#reports-resources' },
    { label: 'LISA', href: '/lisa' },
    { label: 'Updates', href: '/updates' },
    { label: 'About', href: '/about' },
    { label: 'Reporting Platform', href: 'https://dddp.gov.gh/', external: true, action: true },
]

const NavBar = () => {
    const location = useLocation()
    const activeHref = location.pathname.startsWith('/explore') ? '/explore' : location.pathname
    const year = new URLSearchParams(location.search).get('year')
    const yearQuery = /^\d{4}$/.test(year || '') ? `?year=${year}` : ''
    const navItems = baseNavItems.map((item) => {
        if (item.href === '/') return { ...item, href: `/${yearQuery}`, activeHref: '/' }
        if (item.href === '/explore') return { ...item, href: `/explore${yearQuery}`, activeHref: '/explore' }
        if (item.href === '/#reports-resources' && yearQuery) {
            return { ...item, href: `/${yearQuery}#reports-resources`, activeHref: '/#reports-resources' }
        }
        return item
    })

    return (
        <div className={`pill-nav-shell ${location.pathname === '/' ? 'pill-nav-shell--home' : 'pill-nav-shell--page'}`}>
            <PillNav
                items={navItems}
                activeHref={activeHref}
                baseColor="#16325A"
                pillColor="#ffffff"
                hoveredPillTextColor="#ffffff"
                pillTextColor="#16325A"
                className="dddp-pill-nav"
            />
        </div>
    )
}

export default NavBar
