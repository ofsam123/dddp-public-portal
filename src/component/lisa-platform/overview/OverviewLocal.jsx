import React from 'react'
import NavBar from '../../header/NavBar'
import Footer from '../footer/LisaFooter'
import UncdfLogo from '../../static/images/img/Uncdf.png'
import LocalImage from '../../static/images/img/lisa-local.jpg'

const OverviewLocal = () => {

    return (
        <div>
            <NavBar />
            <div style={{ paddingBottom: '5rem', marginTop: '5rem' }}>
                <h1 style={{ color: '#0B6000', textAlign: 'center', marginTop: '7rem', width: '70%', margin: '0 auto' }} >
                    UN Capital Development Fund (UNCDF) in Ghana
                </h1>
                <div className="container" style={{ marginTop: '2rem', width: '80%', textAlign: 'justify' }}>
                    <div className='clearfix' style={{ fontSize: '1.2rem', marginTop: '1.5rem' }}>
                        <img src={UncdfLogo} alt="Local Overview" className="" style={{margin: '0px 30px 20px 0px', float: 'left'}} />

                        The UN Capital Development Fund assists developing countries in the development of their economies by supplementing existing sources of capital assistance by means of grants, loans and guarantees, first and foremost for the least developed among the developing countries.
                            <br /><br />
                            As a Flagship Catalytic Blended Financing platform of the UN, UNCDF utilizes its unique capability to crowd-in finance for the scaling of development impact where the needs are greatest—a capability rooted in UNCDF's unique investment mandate—to support the achievement of the 2030 Agenda for Sustainable Development and the realization of the Doha Programme of Action for the least developed countries, 2022-2031.
                            <br /><br />
                            In Ghana UNCDF holds a singular place in the development finance architecture by way of its unique investment mandate, innovative financial instruments and finance capabilities. UNCDF's mission is to support market development by enabling access to finance in high-risk environments for impactful investments by providing financial instruments, financial mechanisms, and financial advisory. Flagship priority areas include:
                    <br /><br />
                            <ol style={{ fontSize: '1.2rem', marginTop: '1.5rem' }}>
                        <li>Local Transformative Finance: UNCDF combines investment with sector expertise across all aspects of subnational public and private finance to design and support financing mechanisms and funds that advance urban, green and productive transitions.</li>
                        <li>Inclusive Digital Economies: UNCDF addresses market-system constraints and gender inequalities that prevent the emergence of inclusive digital economies, working closely with private and public partners and civil society to create demonstration effects and an enabling environment that drives digital transformation, both in finance and real economy sectors critical for the SDGs.</li>
                    </ol>
                    </div>
                    
                    {/* <p style={{ fontSize: '1.2rem', marginTop: '1.5rem' }}>
                        In Ghana UNCDF holds a singular place in the development finance architecture by way of its unique investment mandate, innovative financial instruments and finance capabilities. UNCDF's mission is to support market development by enabling access to finance in high-risk environments for impactful investments by providing financial instruments, financial mechanisms, and financial advisory. Flagship priority areas include:
                    </p> */}
                    
                </div>
            </div>
            <div style={{ width: '70%', margin: '0 auto', textAlign: 'justify', marginBottom: '8rem' }}>
                <h2 style={{ color: '#0B6000', textAlign: 'center', marginTop: '8rem', width: '70%', margin: '0 auto', marginBottom: '2rem' }}>
                    Local-based information system for climate change adaptation (LISA)
                </h2>
                <div className="overview-container">
                    {/* <img src={LocalImage} alt="Local Overview" className="img-fluid overview-image" /> */}

                    <p style={{ fontSize: '1.2rem' }}>
                        The Local Climate Adaptive Living Facility (LoCAL) is a mechanism designed by UNCDF to integrate climate change into local authorities' planning and budgeting through the regular intergovernmental fiscal transfer
                        system using performance-based funds in a participatory and gender-sensitive manner, increase awareness and capacities to respond to
                        climate change at the local level including through ecosystem-based solutions and
                        increase the quality and number of local investments that address climate change.
                        It uses climate funds and demonstration effect to trigger further flows for local climate action including global climate finance and national fiscal transfers. LoCAL also aims to support private finance for small and medium businesses and municipal finance and public-private partnerships.
                    </p>
                </div>
                <h2 style={{ color: '#0B6000', textAlign: 'center', width: '80%', margin: '0 auto', marginBottom: '1.5rem', paddingTop: '2rem' }}>
                    UNCDF currently  uses the LoCAL mechanism in two major projects:
                </h2>
                <ol>
                    <li style={{ fontSize: '1.2rem' }}>The Boosting Green Employment and Enterprise Opportunities in Ghana (GrEEn) project, <a href='https://www.uncdf.org/green' target='_blank' rel='noreferrer' style={{color: '#009688'}}>Boosting Green Employment and Enterprise Opportunities in Ghana – (GrEEn)</a> - UN Capital Development Fund (UNCDF))- funded by the European Union Trust Fund for Africa. Using the LoCAL mechanism, GrEEn established the Local-based information system for climate change adaptation (LISA) in 10 selected Districts in Western and Ashanti regions, which supported the integration of climate change adaptation into local development planning and adaptation actions, at the local level through the GrEEn project.</li>
                    <li style={{ fontSize: '1.2rem' }}>
                    Promoting Green and Climate Resilient Local Economies in Ghana – Applying circular economy (CE) and climate-smart agriculture (CSA) principles and solutions to local development pathways (LoCAL-ACE) in 6 MMDAs with funding from the Ministry of Foreign Affairs, Royal Norwegian Embassy, Ghana. -ADD LINK
                    </li>
                </ol>
                <p style={{ fontSize: '1.2rem' }}>
                    Data on climate change remains a challenge in Ghana, especially relevant data at the community level, that will enable localized ecosystem-based adaptation measures. To this end, UNCDF through the LoCAL mechanism, established the Local-based information system for climate change adaptation (LISA) in 13 selected Districts in Eastern, Greater Accra, Central, Western and Ashanti regions, which supported the integration of climate change adaptation into local development planning and adaptation actions, at the local level through the GrEEn project.
                </p>
                <p style={{ fontSize: '1.2rem' }}>
                    The LISA is a web application hosted with the Ministry of Local Government, Decentralization and Rural Development (MLGDRD) on the District Development Data Platform (DDDP), that allows public access to specific information on the Sustainable Development Goals achievements at the district level. The DDDP is also a tool for the collection, validation, analysis, and presentation of statistical data, tailored to track projects and programmes as well as core indicators of the Metropolitan, Municipal, and District Assemblies (MMDAs) in Ghana.
                </p>
            </div>
            <Footer />
        </div>
    )
}

export default OverviewLocal