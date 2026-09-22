import React from 'react'
import { useLocation } from 'react-router-dom'
import PillNav from './PillNav'

const baseNavItems = [
    { label: 'Home', href: '/' },
    { label: 'Explore Data', href: '/explore' },
    { label: 'LISA', children: [{ label: 'Climate Change', href: '/climate' }, { label: 'Forecast History', href: '/all-forcast' }] },
    { label: 'DPAT', children: [{ label: 'DPAT Assessment', href: '/dpat/assessment' }, { label: 'Performance Analysis', href: '/dpat/performance-analysis' }] },
    { label: 'Data & Statistics', children: [{ label: 'Development Dimension', href: '/data-statistics/development-dimension' }] },
    { label: 'APR', children: [{ label: 'MMDA APR', href: '/apr/mmda' }, { label: 'RCC APR', href: '/apr/rcc' }] },
    { label: 'About Us', href: '/about' },
    { label: 'Reporting Platform', href: 'https://dddp.gov.gh/', external: true, action: true },
]

const NavBar = () => {
    const location = useLocation()
    const activeHref = location.pathname.startsWith('/explore') ? '/explore' : location.pathname
    const current = new URLSearchParams(location.search)
    const context = new URLSearchParams()
    if (/^\d{4}$/.test(current.get('year') || '')) context.set('year', current.get('year'))
    if (current.get('dataset')) context.set('dataset', current.get('dataset'))
    const query = context.toString()
    const navItems = baseNavItems.map((item) => {
        if (item.href === '/') return { ...item, href: query ? `/?${query}` : '/', activeHref: '/' }
        if (item.href === '/explore') return { ...item, href: query ? `/explore?${query}` : '/explore', activeHref: '/explore' }
        return item
    })
    return (
        <div className={`pill-nav-shell ${location.pathname === '/' ? 'pill-nav-shell--home' : 'pill-nav-shell--page'}`}>
            <PillNav items={navItems} activeHref={activeHref} baseColor="#16325A" pillColor="#ffffff" hoveredPillTextColor="#ffffff" pillTextColor="#16325A" className="dddp-pill-nav" />
        </div>
    )
}

export default NavBar
