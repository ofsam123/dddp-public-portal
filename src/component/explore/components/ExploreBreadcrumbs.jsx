import React from 'react'
import { Link } from 'react-router-dom'

const ExploreBreadcrumbs = ({ items }) => (
    <nav className="explore-breadcrumbs" aria-label="Breadcrumb">
        <ol>
            {items.map((item, index) => {
                const isCurrent = index === items.length - 1

                return (
                    <li key={`${item.label}-${item.href || 'current'}`}>
                        {isCurrent ? (
                            <span aria-current="page">{item.label}</span>
                        ) : (
                            <Link to={item.href}>{item.label}</Link>
                        )}
                    </li>
                )
            })}
        </ol>
    </nav>
)

export default ExploreBreadcrumbs
