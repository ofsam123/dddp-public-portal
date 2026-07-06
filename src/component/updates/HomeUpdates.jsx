import React from 'react'
import CapacityBuildingImage from '../static/images/img/capacity-building 2.jpg'
import TrainingImage from '../static/images/img/training3.jpg'
import DistrictDevelopmentImage from '../static/images/img/district-development.jpg'
import './HomeUpdates.css'

const updates = [
    {
        category: 'Capacity building',
        title: 'Strengthening the LISA platform for district assemblies',
        description: 'Continuing efforts to make essential local climate information more useful for district planning.',
        image: CapacityBuildingImage,
        href: '/capacity-building',
    },
    {
        category: 'Training',
        title: 'Supporting local teams in LoCAL-ACE districts',
        description: 'District teams come together to build practical skills for climate-informed local development.',
        image: TrainingImage,
        href: '/training',
    },
    {
        category: 'District development',
        title: 'Using data to strengthen public accountability',
        description: 'How better development information supports decisions, tracks progress and improves accountability.',
        image: DistrictDevelopmentImage,
        href: '/district-development',
    },
]

const HomeUpdates = () => (
    <section className="updates-section" aria-labelledby="updates-title">
        <div className="updates-section__heading">
            <div>
                <span className="section-kicker">Latest stories</span>
                <h2 id="updates-title">Updates from the field.</h2>
            </div>
            <a href="/lisa">View all updates <span aria-hidden="true">→</span></a>
        </div>

        <div className="updates-grid">
            {updates.map((update) => (
                <article className="update-card" key={update.title}>
                    <a className="update-card__image" href={update.href} aria-label={`Read ${update.title}`}>
                        <img src={update.image} alt="" />
                        <span>{update.category}</span>
                    </a>
                    <div className="update-card__content">
                        <h3><a href={update.href}>{update.title}</a></h3>
                        <p>{update.description}</p>
                        <a className="update-card__link" href={update.href}>Read story <span aria-hidden="true">→</span></a>
                    </div>
                </article>
            ))}
        </div>
    </section>
)

export default HomeUpdates
