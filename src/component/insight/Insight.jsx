import React, { useState } from 'react'
import agricultureData from '../static/images/img/agriculture-data.png'
import educationData from '../static/images/img/education-data.png'
import healthData from '../static/images/img/health-data.png'
import commerceData from '../static/images/img/technology-data.png'
import infrastructureData from '../static/images/img/inftrastructure-data.png'
import { ExternalArrowIcon } from '../shared/PortalIcons'
import './Insight.css'

const insights = [
    {
        label: 'Agriculture',
        title: 'See the local agriculture ecosystem more clearly.',
        description: 'Bring together information on farmers, value-chain actors, production, markets and local agricultural services.',
        topics: ['Value chains', 'Production', 'Market access'],
        image: agricultureData,
    },
    {
        label: 'Education',
        title: 'Turn education information into local action.',
        description: 'Understand access to education, facilities and service delivery to support better district-level planning.',
        topics: ['Facilities', 'Access', 'Service delivery'],
        image: educationData,
    },
    {
        label: 'Health',
        title: 'Build a stronger picture of community health.',
        description: 'Explore health facilities, coverage and access information across public and private service providers.',
        topics: ['Coverage', 'Facilities', 'Community access'],
        image: healthData,
    },
    {
        label: 'Commerce',
        title: 'Understand enterprise and technology activity.',
        description: 'Connect local commerce, digital services and entrepreneurship information for evidence-led economic planning.',
        topics: ['Enterprise', 'Digital services', 'Innovation'],
        image: commerceData,
    },
    {
        label: 'Infrastructure',
        title: 'Plan infrastructure around real local needs.',
        description: 'Bring infrastructure, connectivity and environmental information into a shared district view.',
        topics: ['Connectivity', 'Settlements', 'Environment'],
        image: infrastructureData,
    },
]

const Insight = () => {
    const [activeIndex, setActiveIndex] = useState(0)
    const activeInsight = insights[activeIndex]

    return (
        <section className="insights-section" aria-labelledby="insights-title">
            <div className="insights-section__heading">
                <span className="section-kicker">Explore the data</span>
                <h2 id="insights-title">From information to insight.</h2>
                <p>Move between key sectors to see how connected district data can support planning and decision-making.</p>
            </div>

            <div className="insight-tabs" role="tablist" aria-label="Data sectors">
                {insights.map((insight, index) => (
                    <button
                        type="button"
                        role="tab"
                        aria-selected={activeIndex === index}
                        className={activeIndex === index ? 'is-active' : ''}
                        onClick={() => setActiveIndex(index)}
                        key={insight.label}
                    >
                        <span>{String(index + 1).padStart(2, '0')}</span>{insight.label}
                    </button>
                ))}
            </div>

            <div className="insight-panel" role="tabpanel">
                <div className="insight-panel__content">
                    <span className="insight-panel__index">Sector {String(activeIndex + 1).padStart(2, '0')}</span>
                    <h3>{activeInsight.title}</h3>
                    <p>{activeInsight.description}</p>
                    <div className="insight-panel__topics">
                        {activeInsight.topics.map((topic) => <span key={topic}>✓ {topic}</span>)}
                    </div>
                    <a href="https://dddp.gov.gh/" target="_blank" rel="noopener noreferrer">
                        Explore in the reporting tool
                        <span className="insight-panel__link-icon"><ExternalArrowIcon /></span>
                    </a>
                </div>
                <div className="insight-panel__visual">
                    <div className="insight-panel__image-wrap">
                        <img src={activeInsight.image} alt={`${activeInsight.label} data illustration`} />
                    </div>
                    <div className="insight-panel__badge"><i /> Connected district data</div>
                </div>
            </div>
        </section>
    )
}

export default Insight
