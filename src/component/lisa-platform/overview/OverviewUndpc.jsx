import React from 'react'
import UncdfLogo from '../../static/images/img/Uncdf.png'


const OverviewUndpc = () => {
    return (
        <div style={{ paddingBottom: '5rem' }}>
            <h1 style={{ color: '#0B6000', textAlign: 'center', marginTop: '7rem', width: '70%', margin: '0 auto' }} >
                UN Capital Development Fund (UNCDF) in Ghana
            </h1>
            <div className="container" style={{ marginTop: '2rem', width: '80%', textAlign: 'justify' }}>
                <div className="clearfix" style={{ fontSize: '1.2rem' }}>
                    <img src={UncdfLogo} alt="Local Overview" className="fluid-img overview-image" style={{float:'left', padding:'50px', maxWidth:'350px'}} />
                    {/* <p style={{ fontSize: '1.2rem' }}> */}
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
                    {/* </p> */}
                </div>
                {/* <p style={{ fontSize: '1.2rem', marginTop: '1.5rem' }}>
                    In Ghana UNCDF holds a singular place in the development finance architecture by way of its unique investment mandate, innovative financial instruments and finance capabilities. UNCDF's mission is to support market development by enabling access to finance in high-risk environments for impactful investments by providing financial instruments, financial mechanisms, and financial advisory. Flagship priority areas include:
                </p> */}
                {/* <ol style={{ fontSize: '1.2rem', marginTop: '1.5rem' }}>
                    <li>Local Transformative Finance: UNCDF combines investment with sector expertise across all aspects of subnational public and private finance to design and support financing mechanisms and funds that advance urban, green and productive transitions.</li>
                    <li>Inclusive Digital Economies: UNCDF addresses market-system constraints and gender inequalities that prevent the emergence of inclusive digital economies, working closely with private and public partners and civil society to create demonstration effects and an enabling environment that drives digital transformation, both in finance and real economy sectors critical for the SDGs.</li>
                </ol> */}
            </div>
        </div>
    )
}

export default OverviewUndpc