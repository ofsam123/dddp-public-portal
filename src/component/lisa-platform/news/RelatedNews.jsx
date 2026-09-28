import React from 'react'
import { Link } from 'react-router-dom'

const RelatedNews = ({ newsItems = [] }) => {
    if (!newsItems.length) return null

    return (
        <section className="related-news" aria-labelledby="related-news-title">
            <div className="related-news__inner">
                <h2 id="related-news-title">Related stories</h2>
                <div className="related-news__grid">
                {newsItems.map(({ path, text }, index) => (
                    <Link key={index} to={path} className="related-news__card">
                        {text}
                        <span aria-hidden="true">→</span>
                    </Link>
                ))}
                </div>
            </div>
        </section>
    )
}

export default RelatedNews
