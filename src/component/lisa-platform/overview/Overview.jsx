import React from 'react'
import NavBar from '../../header/NavBar'
import Footer from '../footer/LisaFooter'
import LisaLocalImage from '../../static/images/img/LISA.png'


const Overview = () => {
    return (
        <div>
            <NavBar />
            <div style={{ width: '70%', margin: '0 auto', textAlign: 'justify', marginTop: '5rem', marginBottom: '8rem' }}>
                <h2 style={{ color: '#0B6000', marginBottom: '1.5rem' }}>Local-based Information System for climate change Adaptation (LISA)</h2>
                <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
                    <img src={LisaLocalImage} width={400} height={350} alt='Lisa Overview' style={{ marginRight: '1rem' }} />
                    <p style={{ marginTop: '2rem', fontSize: '1.2rem' }}>
                        The United Nations Capital Development Fund (UNCDF) makes public and private finance work for the poor in the world's 46 least
                        developed countries. With its capital mandate and instruments, UNCDF offers “last mile” finance models that unlock public
                        private resources, especially at the domestic level, to reduce poverty and support local economic development. The Local Climate Adaptive
                        Living Facility (LoCAL) is a mechanism to integrate climate change into local authorities' planning and budgeting through the regular intergovernmental fiscal,
                        transfer system using performance-based grants in a participatory and gender-sensitive manner, increase awareness and capacities to respond to climate change at the local level including through ecosystem-based solutions and increase the quality and number of local investments that address climate change.

                    </p>
                </div>
                <p style={{ marginTop: '2rem', fontSize: '1.2rem' }}>
                    LoCAL combines performance-based climate resilience grants (PBCRGs), which ensure programming and verification of change expenditures at the local level, with technical and capacity-building support. 
                    It uses the grants and demonstration effect to trigger further flows for local climate action including global climate finance and national fiscal transfers. LoCAL also aims to support private finance for small and medium businesses and municipal finance and public-private partnerships. LoCAL is currently active in 17 countries in Africa, Asia, and the Pacific, with another 13 countries preparing to join (at the design stage).
                </p>
                <p style={{ fontSize: '1.2rem' }}>
                    UNCDF is bringing its expertise in promoting green and climate-resilient local communities and economies for returnees, youth, and women to support job creation in regions of departure, 
                    transit and return in Ghana, creating local ecosystems that facilitate the development of Micro, Small and Medium Enterprises (MSMEs) and enabling the transition of local economies to green and climate resilient development under the Boosting Green Employment and Enterprise Opportunities in Ghana (GrEEn) project, funded by the European Union Trust Fund for Africa. This intervention is being implemented in 10 MMDAs.
                </p>
                <p style={{ fontSize: '1.2rem' }}>
                    This project contributes to addressing the root causes of irregular migration through green and climate-resilient local economic development and improving future 
                    prospects of beneficiaries, by creating employment and enterprise opportunities in selected sectors and regions (Ashanti and Western). The action aims at supporting job creation in regions of departure, transit, and return of Ghana, creating local financial ecosystems that facilitate the development of Micro, Small, and Medium Enterprises (MSMEs), and enabling the transition of local economies to green and climate- resilient development.
                </p>
                <p style={{ fontSize: '1.2rem' }}>
                    UNCDF is also implementing under the project, Promoting Green and Climate Resilient Local Economies in Ghana – Applying 
                    circular economy (CE) and climate-smart agriculture (CSA) principles and solutions to local development pathways (LoCAL-ACE) in 6 MMDAs. The objective of the Action is to contribute to building green and climate-resilient local economies in Ghana, applying circular economy and climate-smart agriculture (CSA) principles and solutions to local development pathways with funding from the Ministry of Foreign Affairs, Royal Norwegian Embassy, Ghana.
                </p>
                <p style={{ fontSize: '1.2rem' }}>
                    In whole, UNCDF's interventions are expected to achieve the overall objective through increasing selected District Assemblies’ access to climate finance to plan and implement locally 
                    led green and climate-resilient public investments, while consolidating a country-based and internationally recognized mechanism to channel climate finance for local action through the performance-based climate resilience grant (PBCRG) system. G
                </p>
            </div>
            <Footer />
        </div>
    )
}

export default Overview