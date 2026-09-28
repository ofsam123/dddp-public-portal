import React from 'react'
import { Link } from 'react-router-dom'
import DDDPlogo from '../static/images/img/dddp-clean-logo.png'
import './PortalLogo.css'

const PortalLogo = ({
    to = '/',
    src = DDDPlogo,
    alt = 'District Development Data Platform',
    variant = 'nav',
    className = '',
    onClick,
}) => {
    const logoClassName = `portal-logo portal-logo--${variant}${className ? ` ${className}` : ''}`

    return (
        <Link className={logoClassName} to={to} aria-label="DDDP home" onClick={onClick}>
            <img className="portal-logo__image" src={src} alt={alt} />
        </Link>
    )
}

export default PortalLogo
