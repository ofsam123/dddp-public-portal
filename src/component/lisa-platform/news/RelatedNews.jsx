import React from 'react'
import { Link } from 'react-router-dom'


const RelatedNews = ({ newsItems = [] }) => {
    return (
        <div>
            <div style={{ textAlign: 'left', width: '70%', margin: '0 auto', marginTop: '5rem', marginBottom: '8rem' }}>
                <h4 style={{ color: '#0B6000', marginTop: '8rem', margin: '0 auto', marginBottom: '2rem' }}>
                    Related News
                </h4>
                {newsItems.map(({ path, text }, index) => (
                    <Link key={index} to={path} style={{ textDecoration: 'underline', color: '#244855' }}>
                        <p style={{ fontSize: '1.1rem', lineHeight: '1rem', color: '#000' }}>
                            {text}
                        </p>
                    </Link>
                ))}
            </div>
        </div>
    );
};

export default RelatedNews