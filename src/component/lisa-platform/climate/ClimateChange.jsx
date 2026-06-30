import React, { useCallback, useEffect, useState } from 'react'
import NavBar from '../../header/NavBar'
import { ProductOutlined } from '@ant-design/icons';
import { Breadcrumb, Layout, Menu, notification } from 'antd';
import './ClimateChange.css'
import { getAllClimatesByRegion, getAllTrackedInstancesByOrgUnit, getClimatesByDistrictIdAndRegion, getClimatesByRegion, getReportByDistrictId } from '../service/forcast.service';
import ClimateChangeCarrousel from './ClimateChangeCarrousel';
import moment from 'moment';
import Table from 'react-bootstrap/Table';
import { Pagination } from 'react-bootstrap';
import { getParentUnit, useGetAllClimateByCommunity, useGetAllClimateByDistrict, useGetAllClimateByRegion } from '../service/forcast_new.service';


const dataElementId = {
    "Geocoordinates": "L0JvYCSg7nO",
    "Number of affected persons": "UNnbpQMikK5",
    "Recorded value": "DAHtXO5hLw2",
    "Risk Level": "Efous4MOrza",
    "Recorded Photo": "hO2QxM62IeC",
    "Community Remarks": "rltHa1VipBI",
    "Recorded Photo1": "GS1CkiTNZQn",
    "Recorded Photo2": "V15hHhNVs4Z",
    "Recorded Photo3": "M1EGcCp1VH4",
    "Recorded Photo4": "PVB1oKJ9sfD",
    "Recorded Photo5": "yHTZ3xJ1BJg"
}
const { Content, Footer, Sider } = Layout;

const breadcrumbItems = [
    <Breadcrumb.Item key="home">Home</Breadcrumb.Item>,
    <Breadcrumb.Item key="lisa">Lisa</Breadcrumb.Item>,
    <Breadcrumb.Item key="climate">Climate</Breadcrumb.Item>
];

const activeRegions = [
    'Ashanti Region',
    'Western Region',
    'Greater Accra Region',
    'Central Region',
    'Eastern Region'
];

const activeDistricts = [
    'Sekyere Afram Plains',
    'Offinso North',
    'Offinso Municipal',
    'Ejura Sekeredumase',
    'Sekyere Kumawu',
    'Adansi South',
    'Wassa Amenfi East',
    'Ahanta West Municipal',
    'Nzema East',
    'Jomoro',
    'Ada East',
    'Effutu Municipal',
    'Fanteakwa North',
]

const specifiedDistricts = {
    'Ashanti Region': [
        'Sekyere Afram Plains',
        'Offinso North',
        'Offinso Municipal',
        'Ejura Sekeredumase',
        'Sekyere Kumawu',
        'Adansi South',
    ],
    'Western Region': [
        'Wassa Amenfi East',
        'Ahanta West Municipal',
        'Nzema East',
        'Jomoro',
    ],
    'Greater Accra Region': [
        'Ada East',
    ],
    'Central Region': [
        'Effutu Municipal',
    ],
    'Eastern Region': [
        'Fanteakwa North',
    ],
};

const ClimateChange = () => {


    const { data: regionData, isFetched: regionFetched } = useGetAllClimateByRegion();
    const { data: districtData, isFetched: districtFetched } = useGetAllClimateByDistrict();
    const { data: communityData, isFetched: communityFeteched } = useGetAllClimateByCommunity();


    const [regions, setRegions] = useState([]);
    const [districts, setDistricts] = useState([]);
    const [communities, setCommunities] = useState([]);
    const [districtsByRegion, setDistrictsByRegion] = useState({});
    const [communityByDistrict, setCommunityByDistrict] = useState();

    const [filteredItems, setFilteredItems] = useState([]);
    const [selectedCommunity, setSelectedCommunity] = useState(null);

    const [climateReport, setClimateReport] = useState(null);
    const [climateType, setClimateType] = useState('');
    const [data, setData] = useState([]);
    const [uniqueDates, setUniqueDates] = useState([]);
    const rowsPerPage = 1;
    const [currentPage, setCurrentPage] = useState(1);

    useEffect(() => {

        if (regionFetched && regionData?.data) {
            setRegions(regionData.data?.organisationUnits || []);

            if (districtFetched && districtData?.data) {
                setDistricts(districtData.data?.organisationUnits || []);

                if (communityFeteched && communityData?.data) {
                    setCommunities(communityData.data?.organisationUnits || []);

                    mapRegionDistrict(
                        regionData.data?.organisationUnits || [],
                        districtData.data?.organisationUnits || [],
                        communityData.data?.organisationUnits || []);
                }
            }
        }

    }, [regionFetched, districtFetched, communityFeteched, communityData]);

    useEffect(() => {
        let newData = [];

        if (climateReport) {
            (climateReport?.instances || []).forEach((event, index) => {
                let eventData = {
                    key: index,
                    eventDate: moment(event.eventDate).format('YYYY-MM-DD'),
                    event: event.event,
                    "Geocoordinates": 0,
                    "Number of affected persons": 0,
                    "Recorded value": 0,
                    "Risk Level": 0,
                    "Community Remarks": 0,
                    "Tracked Entity": event.trackedEntity || 0
                };

                if (event.dataValues.length !== 0) {
                    event.dataValues.forEach((dataValue) => {
                        const key = Object.keys(dataElementId).find(key => dataElementId[key] === dataValue.dataElement);
                        if (key && !key.startsWith('Recorded Photo')) {
                            let value = dataValue.value || 0;
                            eventData[key] = value;
                        }
                    });
                }

                newData.push(eventData);
            });
            setData(newData);
        } else {
            console.log("climateReport is not available");
        }
    }, [climateReport]);

    const mapRegionDistrict = (regions, districts, communities) => {

        let mappedData = {};

        Promise.all((regions.filter(reg => activeRegions.includes(reg.displayName)))
            .map(async region => {

                const data = await getParentUnit(region.id),
                    districtIds = (data.data?.children || []).map(dt => dt.id),
                    curDistricts = districts.filter(district => districtIds.includes(district.id));
                // console.log(region.id, JSON.stringify(curDistricts));

                mappedData[`${region.id}`] = curDistricts;
            })).then(res => {
                setDistrictsByRegion(mappedData);

                mapDistrictCommunity(mappedData, districts, communities);
            });
    }

    const mapDistrictCommunity = (dr_data, districts, communities) => {

        let mappedData = {};

        Promise.all((districts.filter(dist => activeDistricts.includes(dist.displayName)))
            .map(async district => {
                const data = await getParentUnit(district.id),
                    communityIds = (data.data?.children || []).map(dt => dt.id),
                    curCommunities = communities.filter(community => communityIds.includes(community.id));

                // console.log(district.id, curCommunities)
                mappedData[district.id] = curCommunities;
            })).then(res => {
                setCommunityByDistrict(mappedData);

                arrangeMenus(dr_data, mappedData);

                getInitialReport();
            });
    }

    const arrangeMenus = (districtsByRegion, communityByDistrict) => {

        let menus = [];

        (regions.filter(rg => activeRegions.includes(rg.displayName))).map((region, index) => {

            let regionMenu = { "label": region.displayName, "key": `sub${index + 1}`, "children": [] },
                regionDistricts = districtsByRegion[`${region.id}`] || [];

            (regionDistricts).map((district, idx) => {

                if (specifiedDistricts[`${region?.displayName}`].includes(district?.displayName)) {
                    let districtMenu = { "label": district?.displayName, "key": `sub${index + 1}-${idx + 1}`, "children": [] },
                        districtCommunities = communityByDistrict[district.id] || [];

                    (districtCommunities).map((community, idxx) => {
                        let communityMenu = {
                            "label": community?.displayName,
                            "key": `${index + 1}-${idx + 1}-${idxx + 1}`,
                            onClick: async () => {
                                setSelectedCommunity(community);
                                try {
                                    const report = await getReportByDistrictId(community.id);
                                    const climateTypeResponse = await getAllTrackedInstancesByOrgUnit(community.id);
                                    setClimateReport(report);
                                    setClimateType(climateTypeResponse?.instances || '');
                                } catch (error) {
                                    console.error(error);
                                }
                            }
                        };

                        districtMenu.children.push(communityMenu);
                    })

                    regionMenu.children.push(districtMenu);
                }
            })

            menus.push(regionMenu);
        });

        setFilteredItems(menus);
    }

    const handleChangePage = (value) => {
        setCurrentPage(value);
    };

    const paginatedData = data.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);
    let eventIds = (climateReport?.instances || []).map(event => event.event);
    let dataElementUids = (climateReport?.instances || []).map(event => event.dataValues.map(dataValue => dataValue.dataElement));

    const getInitialReport = () => {
        // alert(selectedCommunity)
        !selectedCommunity && getReportByDistrictId('LWb4JFsvkrp').then(report => {
            setClimateReport(report);
        })
        .catch(error => {
            console.error(error);
            notification.error({
                message: 'Error',
                description: 'An error occurred while fetching the report',
            });
        });
    }

    const columns = [
        {
            title: 'Title',
            dataIndex: 'dataElement',
            width: '17%',
        },
        {
            title: 'Value',
            dataIndex: 'value',
            width: '50%',
        },
        {
            title: 'Event Date',
            dataIndex: 'eventDate',
            width: '30%',
            key: 'eventDate',
            sorter: (a, b) => {
                // Convert dates to numbers and compare
                return new Date(a.eventDate) - new Date(b.eventDate);
            },
            // sortDirections: ['descend', 'ascend'],
            filters: uniqueDates.map(date => ({ text: date, value: date })),
            onFilter: (value, record) => {
                return record.eventDate.startsWith(value);
            },
        },
    ];

    return (
        <div>
            <NavBar />
            <Layout>
                <Content style={{ padding: '0 50px' }}>
                    <Breadcrumb style={{ margin: '16px 0' }} items={breadcrumbItems} />
                    <Layout className="site-layout-background" style={{ padding: '24px 0', }}>
                        <Sider className="site-layout-background" width={240}>
                            <Menu
                                mode="inline"
                                defaultSelectedKeys={['5-12-2']}
                                defaultOpenKeys={['sub5', 'sub5-12']}
                                style={{ height: '100%', }}
                                items={filteredItems}
                            />
                        </Sider>
                        <Content
                            style={{ padding: '0 24px', minHeight: 280, }}
                        >

                            {/* {selectedDistrict && climateReport && climateReport.events.length > 0 && <ClimateChangeCarrousel dataElementId={eventIds} dataElementUids={dataElementUids} currentPage={currentPage} />} */}
                            {climateReport && (climateReport?.instances || []).length > 0 && <ClimateChangeCarrousel dataElementId={eventIds} dataElementUids={dataElementUids} currentPage={currentPage} />}
                            <div style={{ margin: '2rem 2rem' }}>
                                <h3>{selectedCommunity?.displayName || 'LISA'} Climate Change </h3>
                            </div>
                            {/* {JSON.stringify(data)} */}
                            <Table striped bordered hover>
                                <thead>
                                    <tr>
                                        {columns.map((column, index) => (
                                            <th key={index}>{column.title}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {paginatedData.map((event, rowIndex) => (
                                        <React.Fragment key={rowIndex}>
                                            <tr>
                                                <td>Type of Climate</td>
                                                <td>
                                                    {climateType && climateType.map((type, index) => (
                                                        <>
                                                            {(type.trackedEntity === event["Tracked Entity"]) &&
                                                                <span>{type?.attributes[0].value}</span>
                                                            }
                                                        </>
                                                    ))
                                                    }
                                                </td>
                                                <td>{event.eventDate}</td>
                                            </tr>
                                            {/* <tr>
                                                <td>Type of Climate</td>
                                                <td>
                                                    {climateType && climateType.map((type, index) => (
                                                        <>
                                                            {(type.trackedEntity === event["Tracked Entity"]) &&
                                                                <span>{type?.attributes[4]?.value}</span>
                                                            }
                                                        </>
                                                    ))
                                                    }
                                                </td>
                                                <td>{event.eventDate}</td>
                                            </tr> */}
                                            <tr>
                                                <td>Geocoordinates</td>
                                                <td>{event.Geocoordinates}</td>
                                                <td>{event.eventDate}</td>
                                            </tr>
                                            <tr>
                                                <td>Number of affected persons</td>
                                                <td>{event["Number of affected persons"]}</td>
                                                <td>{event.eventDate}</td>
                                            </tr>
                                            <tr>
                                                <td>Recorded value</td>
                                                <td>{event["Recorded value"]}</td>
                                                <td>{event.eventDate}</td>
                                            </tr>
                                            <tr>
                                                <td>Risk Level</td>
                                                <td>{event["Risk Level"]}</td>
                                                <td>{event.eventDate}</td>
                                            </tr>
                                            <tr>
                                                <td>Community Remarks</td>
                                                <td>{event["Community Remarks"]}</td>
                                                <td>{event.eventDate}</td>
                                            </tr>
                                        </React.Fragment>
                                    ))}
                                </tbody>
                            </Table>
                            <Pagination>
                                {Array.from({ length: Math.ceil(data.length / rowsPerPage) }, (_, index) => (
                                    <Pagination.Item key={index} active={index + 1 === currentPage} onClick={() => handleChangePage(index + 1)}>
                                        {index + 1}
                                    </Pagination.Item>
                                ))}
                            </Pagination>
                        </Content>
                    </Layout>
                </Content>
                <Footer style={{ textAlign: 'center', }}>AO Holdings © 2024 All rights resverved</Footer>
            </Layout>
        </div>
    )
}

export default ClimateChange;
