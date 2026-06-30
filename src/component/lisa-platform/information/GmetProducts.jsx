import React, { useEffect } from 'react'
import { useLocation } from 'react-router-dom';

const GmetProducts = () => {
  const location = useLocation();

  useEffect(() => {
    const id = location.state?.id;
    console.log("Retrieved id from state:", id);
    if (id) {
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }, [location]);


  return (
    <div>
      <section id='1' className="container" style={{ marginTop: '8rem', marginBottom: '5rem' }}>
        Daily Forecast
      </section>
      <section id='2' className="container" style={{ marginTop: '8rem', marginBottom: '5rem' }}>
        Agrometeorological Bulletins
      </section>
      <section id='3' className="container" style={{ marginTop: '8rem', marginBottom: '5rem' }}>
        Climate Bulletins
      </section>
      <section id='4' className="container" style={{ marginTop: '8rem', marginBottom: '5rem' }}>
        Drought and Flood Monitoring Bulletins
      </section>
      <section id='5' className="container" style={{ marginTop: '8rem', marginBottom: '5rem' }}>
        Marine Forecasts
      </section>
      <section id='6' className="container" style={{ marginTop: '8rem', marginBottom: '5rem' }}>
        Seasonal Forecasts
      </section>
    </div>
  )
}

export default GmetProducts