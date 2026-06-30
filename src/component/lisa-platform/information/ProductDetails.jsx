import React, { useEffect } from 'react'
import NavBar from '../../header/NavBar'
import Footer from '../footer/LisaFooter'
import Report from '../downloadPDF/Report';
import { useLocation } from 'react-router-dom';
import { useGetProductByCategory } from '../service/home.service';

const ProductDetails = () => {

    const location = useLocation();
    const { category } = location.state;

    const { data: products, isLoading, error, isError} = useGetProductByCategory(category?.id);

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    // if(isLoading){
        
    //     return <div>Loading...</div>;
    // }

    return (
        <div>
            <NavBar />

            <div style={{ marginTop: '8rem', marginBottom: '5rem' }}>
                <h1 style={{ color: '#0B6000', textAlign: 'center' }}>{category?.category}</h1>
                <div style={{ width: '80%', margin: '0 auto', marginTop: '2rem' }}>
                    <p>{category?.description}</p>
                </div>
            </div>

            <Report 
                title={`${(category?.category || '').toUpperCase()} REPORT`} 
                seasonalForecast={`${category?.category}`}
                products={products?.data || []} />

            <Footer />
        </div>
    )
}

export default ProductDetails