import React, { useEffect, useState } from 'react'
import { getForcastReport, getReportFiles } from '../service/forcast.service';
import { Table, Button } from 'antd';
import moment from 'moment';


const Report = ({seasonalForecast, title, products}) => {

    const [report, setReport] = useState([]);
    const [files, setFiles] = useState({});

    const getForcastData = async () => {

        Promise.all( products.map(async (pdt) => {
            return await getReportFiles(pdt.id);
        })).then(result => {
            // console.log('data',JSON.stringify(result));
            // console.log('data length',result.length);
            let filesNew = {};
            result.map(rs => {
                let fileLink = rs?.data[0]?.fileLink || '',
                pdt_id = rs?.data[0]?.product?.id || 0;

                filesNew[pdt_id] = fileLink;

                // console.log('data',filesNew);
            })

            setFiles(filesNew);
            // console.log('product',JSON.stringify(products));
        })

        // getForcastReport(seasonalForecast)
        //     .then((res) => {
        //         setReport(res.data)
        //         console.log("The report is :", res.data)
        //     })
        //     .catch((error) => {
        //         console.log(error)
        //     })
    }

    useEffect(() => {

        getForcastData()
    }, [products])

    const columns = [
        {
            title: 'No',
            dataIndex: 'key',
            key: 'key',
            width: '5%',
            render: (text, record, index) => index + 1,
        },
        {
            title: 'Name',
            dataIndex: 'name',
            width: '30%',
            key: 'name',
        },
        {
            title: 'Publication Date',
            dataIndex: 'publicationDate',
            key: 'publicationDate',
            width: '30%',
        },
        {
            title: 'Action',
            key: 'action',
            width: '30%',
            align: 'center',
            render: (text, record) => (
                <div style={{ display: 'flex', justifyContent: 'center' }}>
                    <Button href={files[record.id]} rel="noreferrer" target='_blank' download style={{
                        textDecoration: 'none', marginRight: '0.3rem',
                        transition: 'transform 0.3s ease-in-out', cursor: 'pointer',
                    }}
                        onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
                        onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
                    >
                        Download
                    </Button>
                </div>
            ),
        },
    ];

    const dataSource = report.map((item, index) => ({
        key: index,
        name: item.name,
        publicationDate: moment(item.publicationDate).format('YYYY-MM-DD'),
        fileLink: item.fileLink,
    }));

    return (
        <div 
        style={{
            display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center',
            backgroundColor: '#F5F7FE', minHeight: '50vh', width: '100%', marginTop: '5rem', paddingBottom: '5rem'
        }}
        >
            <h2 style={{ marginTop: '5rem', marginBottom: '2rem', color: '#0B6000' }}>{title}</h2>
            {/* {JSON.stringify(files)} */}
            <Table columns={columns} dataSource={products} style={{ width: '60%', }} />
        </div>
    )
}

export default Report