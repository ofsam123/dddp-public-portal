import React from 'react'
import NavBar from '../header/NavBar'
import PublicFooter from '../footer/PublicFooter'
import './PublicRouteShell.css'

const PublicRouteShell = ({ title }) => <><NavBar /><main className="public-route-shell"><h1>{title}</h1></main><PublicFooter /></>
export default PublicRouteShell
