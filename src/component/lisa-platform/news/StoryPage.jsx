import React from 'react'
import NavBar from '../../header/NavBar'
import PublicFooter from '../../footer/PublicFooter'
import RelatedNews from './RelatedNews'
import './StoryPage.css'

const StoryPage = ({
    category = 'LISA story',
    title,
    summary,
    children,
    images = [],
    related = [],
}) => (
    <main className="story-page">
        <NavBar />

        <section className="story-hero">
            <div className="story-hero__inner">
                <a className="story-hero__back" href="/updates">← Back to updates</a>
                <div className="story-hero__content">
                    <span className="section-kicker">{category}</span>
                    <h1>{title}</h1>
                    {summary ? <p>{summary}</p> : null}
                </div>
            </div>
        </section>

        <article className="story-article">
            <div className="story-article__content">
                {children}
            </div>

            {images.length > 0 ? (
                <div className={`story-gallery story-gallery--${Math.min(images.length, 3)}`}>
                    {images.map((image) => (
                        <figure key={image.src}>
                            <img src={image.src} alt={image.alt} />
                        </figure>
                    ))}
                </div>
            ) : null}
        </article>

        <RelatedNews newsItems={related} />
        <PublicFooter />
    </main>
)

export default StoryPage
