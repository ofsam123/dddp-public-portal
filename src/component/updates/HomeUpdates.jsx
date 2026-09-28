import React from 'react'
import { Link } from 'react-router-dom'
import CapacityBuildingImage from '../static/images/img/capacity-building 2.jpg'
import TrainingImage from '../static/images/img/training3.jpg'
import DistrictDevelopmentImage from '../static/images/img/district-development.jpg'
import { PublicMotionItem, PublicMotionSection } from '../shared/PublicMotion'
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

const HomeUpdates = () => {
    const [featuredUpdate, ...supportingUpdates] = updates

    return (
        <PublicMotionSection className="updates-section" aria-labelledby="updates-title">
            <div className="updates-section__inner">
                <PublicMotionItem className="updates-section__heading">
                    <div>
                        <span className="section-kicker">Latest stories</span>
                        <h2 id="updates-title">Updates from the field.</h2>
                    </div>
                    <Link to="/updates">View all updates <span aria-hidden="true">-&gt;</span></Link>
                </PublicMotionItem>

                <PublicMotionItem className="updates-editorial">
                    <article className="update-card update-card--featured">
                        <Link className="update-card__image" to={featuredUpdate.href} aria-label={`Read ${featuredUpdate.title}`}>
                            <img src={featuredUpdate.image} alt="" loading="lazy" decoding="async" />
                            <span>{featuredUpdate.category}</span>
                        </Link>
                        <div className="update-card__content">
                            <h3><Link to={featuredUpdate.href}>{featuredUpdate.title}</Link></h3>
                            <p>{featuredUpdate.description}</p>
                            <Link className="update-card__link" to={featuredUpdate.href}>Read story <span aria-hidden="true">-&gt;</span></Link>
                        </div>
                    </article>

                    <div className="updates-list">
                        {supportingUpdates.map((update) => (
                            <article className="update-row" key={update.title}>
                                <Link className="update-row__image" to={update.href} aria-label={`Read ${update.title}`}>
                                    <img src={update.image} alt="" loading="lazy" decoding="async" />
                                </Link>
                                <div>
                                    <span>{update.category}</span>
                                    <h3><Link to={update.href}>{update.title}</Link></h3>
                                    <p>{update.description}</p>
                                </div>
                            </article>
                        ))}
                    </div>
                </PublicMotionItem>
            </div>
        </PublicMotionSection>
    )
}

export default HomeUpdates
