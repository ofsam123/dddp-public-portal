import React, { useEffect } from 'react'
import NavBar from '../../header/NavBar'
import Footer from '../footer/LisaFooter'
import Report from '../downloadPDF/Report';


const Climate = () => {

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);


    return (
        <div>
            <NavBar />
             <div style={{ marginTop: '8rem', marginBottom: '5rem' }}>
                <h1 style={{ color: '#0B6000', textAlign: 'center' }}>Climate Bulletins</h1>
                <div style={{ width: '80%', margin: '0 auto', marginTop: '2rem' }}>
                    <p>
                        The 2024 rainy season (agro-climatic characteristics) of the northern part of Ghana indicates a higher likelihood of late onset, with significant probability of normal to long early dry spells, long to normal late dry spells, and late cessation. Normal to above – normal total rainfall is expected in most parts of the country except for some parts of the forest zone which will be below normal to normal during the MJJ season. During the JJA season, the extreme Northern sector of the country is forecasted to be above normal to normal rainfall and normal to below – normal for the rest of the country. The SON season is expected to have normal to above normal rainfall in the extreme Northern sector and normal to below normal in the rest of the country. The DJF season is expected to have normal to above normal rainfall in the extreme Northern sector and normal to below normal in the rest of the country.
                    </p>
                </div>
            </div>
            <Report title="CLIMATE FORECAST REPORT" seasonalForecast='Climate Bulletins' />
            <Footer />
        </div>
    )
}

export default Climate