import React from 'react'
import { DoubleRightOutlined } from '@ant-design/icons'
import './Overview.css'

const LocalOverviewHome = () => {
    return (
        <div>
            <h1 style={{ color: '#0B6000', textAlign: 'center', marginTop: '7rem', width: '70%', margin: '0 auto' }} >
                Local Climate Adaptive Living Facility (LoCAL) LISA
            </h1>
            <div className="container" style={{ marginTop: '2rem', width: '80%', textAlign: 'justify' }}>
                <p style={{ fontSize: '1.2rem' }}>
                The Local Climate Adaptive Living Facility (LoCAL) is a mechanism designed by UNCDF to integrate climate change into local authorities' planning and budgeting through the regular intergovernmental fiscal transfer system using performance-based funds in a participatory and gender-sensitive manner, increase awareness and capacities to respond to climate change at the local level including through ecosystem-based solutions and increase the quality and number of local investments that address climate change. It uses climate funds and demonstration effect to trigger further flows for local climate action including global climate finance and national fiscal transfers. LoCAL also aims to support private finance for small and medium businesses and municipal finance and public-private partnerships.
                </p>
                <div className="overview-container">
                </div>
                <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'flex-end', }}>
                    <a href="/local-overview"
                        style={{ textDecoration: 'none', color: '#21B1DB', width: '10rem', textAlign: 'center', display: 'block' }}
                    >
                        Read More
                        <DoubleRightOutlined className='icon' style={{ marginLeft: '0.3rem', }} />
                    </a>
                </div>
            </div>
        </div>
    )
}

export default LocalOverviewHome