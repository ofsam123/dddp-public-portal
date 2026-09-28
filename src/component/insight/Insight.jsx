import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import ghanaDataImage from '../static/images/img/district-development.jpg'
import regionDataImage from '../static/images/img/local.png'
import districtDataImage from '../static/images/img/lisa-local.jpg'
import { ExternalArrowIcon } from '../shared/PortalIcons'
import { PublicMotionItem, PublicMotionSection } from '../shared/PublicMotion'
import './Insight.css'

const places = [
    {
        label: 'Ghana',
        title: 'Start with the national public picture.',
        description: 'Begin with the national view before moving into regional and local context.',
        topics: ['National context', 'Approved summaries', 'Public resources'],
        image: ghanaDataImage,
        href: '/explore/ghana',
        linkLabel: 'Open Ghana overview',
    },
    {
        label: 'Regions',
        title: 'Move from Ghana into regional context.',
        description: 'Choose a region to understand public information in a clearer place context.',
        topics: ['Regional view', 'Comparisons', 'Related districts'],
        image: regionDataImage,
        href: '/explore',
        linkLabel: 'Browse regions',
    },
    {
        label: 'Districts',
        title: 'Make district information easier to understand.',
        description: 'Open district/MMDA pages for local public information as it becomes available.',
        topics: ['District profile', 'Local resources', 'Updates'],
        image: districtDataImage,
        href: '/explore/ghana',
        linkLabel: 'Start from Ghana',
    },
]

const Insight = () => {
    const [activeIndex, setActiveIndex] = useState(0)
    const activePlace = places[activeIndex]

    return (
        <PublicMotionSection className="insights-section" id="explore-place" aria-labelledby="insights-title">
            <PublicMotionItem className="insights-section__heading">
                <span className="section-kicker">Explore by place</span>
                <h2 id="insights-title">A public geography model for Ghana, regions and districts.</h2>
                <p>
                    Find information by where it belongs, from the national picture to regional and district pages.
                </p>
            </PublicMotionItem>

            <PublicMotionItem className="insight-tabs" role="tablist" aria-label="Geographic levels">
                {places.map((place, index) => (
                    <button
                        type="button"
                        role="tab"
                        aria-selected={activeIndex === index}
                        className={activeIndex === index ? 'is-active' : ''}
                        onClick={() => setActiveIndex(index)}
                        key={place.label}
                    >
                        <span>{String(index + 1).padStart(2, '0')}</span>{place.label}
                    </button>
                ))}
            </PublicMotionItem>

            <PublicMotionItem className="insight-panel" role="tabpanel">
                <div className="insight-panel__content">
                    <span className="insight-panel__index">Geography {String(activeIndex + 1).padStart(2, '0')}</span>
                    <h3>{activePlace.title}</h3>
                    <p>{activePlace.description}</p>
                    <div className="insight-panel__topics">
                        {activePlace.topics.map((topic) => <span key={topic}>{topic}</span>)}
                    </div>
                    <Link to={activePlace.href}>
                        {activePlace.linkLabel}
                        <span className="insight-panel__link-icon"><ExternalArrowIcon /></span>
                    </Link>
                </div>
                <div className="insight-panel__visual">
                    <div className="insight-panel__image-wrap">
                        <img src={activePlace.image} alt={`${activePlace.label} public information context`} loading="lazy" decoding="async" />
                    </div>
                    <div className="insight-panel__badge"><i /> Ghana to region to district</div>
                </div>
            </PublicMotionItem>
        </PublicMotionSection>
    )
}

export default Insight
