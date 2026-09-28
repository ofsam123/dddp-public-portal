import React from 'react'
import NavBar from '../../header/NavBar'
import PublicFooter from '../../footer/PublicFooter'
import VulnerabilityImage from '../../static/images/img/vulnerability.jpg'
import TrainingImage from '../../static/images/img/training3.jpg'
import DistrictDevelopmentImage from '../../static/images/img/district-development.jpg'
import CroudFundingImage from '../../static/images/img/croud-funding2.jpg'
import CapacityBuildingImage from '../../static/images/img/capacity-building 2.jpg'
import './News.css'

const updates = [
    {
        category: 'Capacity building',
        title: 'Capacity building on the utilization of ACCAF',
        description: 'How district officers are being supported to use climate adaptation data and tools more confidently in local planning.',
        image: CapacityBuildingImage,
        href: '/capacity-building',
    },
    {
        category: 'Training',
        title: 'Training for the local ACE districts',
        description: 'A practical workshop helping LoCAL-ACE district staff capture climate events, identify interventions and manage project information digitally.',
        image: TrainingImage,
        href: '/training',
    },
    {
        category: 'Forum',
        title: 'District Development Data Platform User’s Forum',
        description: 'A convening focused on the value of high-quality district data for accountability, planning and better local decision-making.',
        image: DistrictDevelopmentImage,
        href: '/district-development',
    },
    {
        category: 'Workshop',
        title: 'Vulnerability assessment and crowdfunding workshop',
        description: 'Building the capacity of local government officials to conduct rapid climate vulnerability assessments and mobilize alternative finance.',
        image: VulnerabilityImage,
        href: '/vulnerability',
    },
    {
        category: 'Training',
        title: 'Crowdfunding training for climate-resilient infrastructure',
        description: 'Introducing district officers to alternative finance strategies for resilient public investment.',
        image: CroudFundingImage,
        href: '/crowdfunding',
    },
]

const News = () => (
    <main className="updates-page">
        <NavBar />

        <section className="updates-page__hero">
            <div>
                <span className="section-kicker">Latest stories</span>
                <h1>Updates from the field.</h1>
                <p>
                    Follow the work happening across districts, institutions and partners as DDDP and LISA support stronger local decisions.
                </p>
            </div>
        </section>

        <section className="updates-page__grid" aria-label="All updates">
            {updates.map((update) => (
                <article className="updates-page__card" key={update.title}>
                    <a className="updates-page__image" href={update.href} aria-label={`Read ${update.title}`}>
                        <img src={update.image} alt="" />
                        <span>{update.category}</span>
                    </a>
                    <div className="updates-page__content">
                        <h2><a href={update.href}>{update.title}</a></h2>
                        <p>{update.description}</p>
                        <a className="updates-page__link" href={update.href}>Read story <span aria-hidden="true">→</span></a>
                    </div>
                </article>
            ))}
        </section>

        <PublicFooter />
    </main>
)

export default News
