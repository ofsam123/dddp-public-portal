import React from 'react'
import { Link } from 'react-router-dom'
import { useGetProductCategories } from '../service/home.service'
import {
    AgricultureIcon,
    CommunityIcon,
    EmergencyIcon,
    InvestmentIcon,
    MonitoringIcon,
    ServicesIcon,
} from '../../shared/PortalIcons'
import './LocalInformation.css'

const fallbackProducts = [
    { title: 'Daily forecasts', href: '/daily-forecast', icon: <MonitoringIcon /> },
    { title: 'Agrometeorological bulletins', href: '/agrometeo', icon: <AgricultureIcon /> },
    { title: 'Climate bulletins', href: '/climate-product', icon: <CommunityIcon /> },
    { title: 'Drought & flood monitoring', href: '/Drought', icon: <EmergencyIcon /> },
    { title: 'Marine forecasts', href: '/marine', icon: <ServicesIcon /> },
    { title: 'Seasonal forecasts', href: '/seasonal', icon: <InvestmentIcon /> },
]

const LocalInformation = () => {
    const { data: productCategories, isLoading } = useGetProductCategories()
    const remoteProducts = Array.isArray(productCategories?.data) ? productCategories.data : []
    const products = remoteProducts.length
        ? remoteProducts.map((category, index) => ({
            title: category.category,
            image: category.categoryImage,
            category,
            icon: fallbackProducts[index % fallbackProducts.length].icon,
        }))
        : fallbackProducts

    return (
        <section className="lisa-products" aria-labelledby="lisa-products-title">
            <div className="lisa-products__heading">
                <div>
                    <span className="lisa-kicker">Climate products</span>
                    <h2 id="lisa-products-title">GMet information for different decisions.</h2>
                </div>
                <p>Explore forecasts and bulletins produced for agriculture, climate monitoring, marine activity and seasonal planning.</p>
            </div>

            {isLoading && !remoteProducts.length ? <div className="lisa-products__loading">Loading climate products…</div> : null}

            <div className="lisa-products__grid">
                {products.map((product, index) => {
                    const content = (
                        <>
                            <div className={`lisa-product-card__visual${product.image ? ' has-image' : ''}`}>
                                {product.image ? <img src={product.image} alt="" /> : <span>{product.icon}</span>}
                                <i>0{index + 1}</i>
                            </div>
                            <div className="lisa-product-card__content">
                                <small>GMet product</small>
                                <h3>{product.title}</h3>
                                <span>View product <i aria-hidden="true">→</i></span>
                            </div>
                        </>
                    )

                    return product.category ? (
                        <Link className="lisa-product-card" to="/product-details" state={{ category: product.category }} key={product.title}>
                            {content}
                        </Link>
                    ) : (
                        <Link className="lisa-product-card" to={product.href} key={product.title}>{content}</Link>
                    )
                })}
            </div>
        </section>
    )
}

export default LocalInformation
