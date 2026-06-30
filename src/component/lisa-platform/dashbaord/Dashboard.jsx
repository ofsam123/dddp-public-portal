import React, { useEffect, useState } from 'react'
import { Tabs } from 'antd';
import { notification, Table, Button, Select, Form, Input, Modal, DatePicker, Popconfirm, } from "antd";
import { UploadOutlined } from '@ant-design/icons';
import { message, Upload } from 'antd';
import { useGetHome, useUpdateHome } from '../service/home.service';
import { useGetHomeUncd, useUpdateHomeUncd } from '../service/home-uncd.service';
import UNCDF from './UNCDF';
import Product from './Product';
import News from './News';
import LocalBaseDetails from './LocalBaseDetails';
import Uncdf_Local from './UncdfLocal';
import UncdfLocal from './UncdfLocal';
import CapacityBuilding from './CapacityBuilding';
import Training from './Training';
import District from './District';
import Vulnerabiliy from './Vulnerabiliy';
import CrowdFunding from './CrowdFunding';


const { TabPane } = Tabs;
function callback(key) {
    console.log(key);
}

const spanStyleEdit = {
    cursor: "pointer",
    textDecoration: "none",
    color: "#0074D9",
};

const layout = {
    labelCol: {
        span: 6,
    },
    wrapperCol: {
        span: 19,
        offset: 1,
    },
};

const Dashboard = () => {
    const { data: homeData, isLoading: homeLoading, error: homeError, refetch } = useGetHome()
    const mutation = useUpdateHome()
    const mutationHomeUncd = useUpdateHomeUncd()

    // console.log("Home Id", homeData?.data.id)

    // Extract the actual data from the response
    const dataSource = homeData ? [{ ...homeData.data }] : [];

    const [isViewPostModalVisible, setIsViewPostModalVisible] = useState(false);
    const [isViewBannerModalVisible, setIsViewBannerModalVisible] = useState(false);
    const [isViewOverviewModalVisible, setIsViewOverviewModalVisible] = useState(false);
    const [selectedPost, setSelectedPost] = useState(null);
    const [selectedHome, setSelectedHome] = useState(null);
    const [selectedOverview, setSelectedOverview] = useState(null);
    const [form] = Form.useForm();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [fileList, setFileList] = useState([]);
    const [uploading, setUploading] = useState(false);
    const [isUpdateHomeModalVisible, setIsUpdateHomeModalVisible] = useState(false);


    const showModal = () => {
        setIsModalOpen(true);
    };

    const handleOk = () => {
        setIsModalOpen(false);
    };

    const handleCancel = () => {
        setIsModalOpen(false);
    };

    // const handleUpload = () => {
    //     const formData = new FormData();
    //     fileList.forEach((file) => {
    //         formData.append('files[]', file);
    //     });
    //     setUploading(true);
    //     // You can use any AJAX library you like
    //     fetch('https://660d2bd96ddfa2943b33731c.mockapi.io/api/upload', {
    //         method: 'POST',
    //         body: formData,
    //     })
    //         .then((res) => res.json())
    //         .then(() => {
    //             setFileList([]);
    //             message.success('upload successfully.');
    //         })
    //         .catch(() => {
    //             message.error('upload failed.');
    //         })
    //         .finally(() => {
    //             setUploading(false);
    //         });
    // };

    const props = {
        onRemove: (file) => {
            const index = fileList.indexOf(file);
            const newFileList = fileList.slice();
            newFileList.splice(index, 1);
            setFileList(newFileList);
        },
        beforeUpload: (file) => {
            setFileList([...fileList, file]);
            return false;
        },
        fileList,
    };

    const [tableCols] = useState([
        {
            key: "logo",
            title: "DDDP Logo",
            dataIndex: "logo",
        },
        {
            key: "lisaPlatform",
            title: "Lisa Platform",
            dataIndex: "lisaPlatform",
        },
        {
            key: "dpatPlatform",
            title: "DPAT Platform",
            dataIndex: "dpatPlatform",
        },
        {
            key: "dcatPlatform",
            title: "DCAT Platform",
            dataIndex: "dcatPlatform",
        },
        {
            key: "action", title: "Action", align: "center",
            render: (post) => [
                <Button
                    // onClick={() => editPost(post)}
                    style={{ marginRight: "7px", color: "#0074D9" }}>
                    Edit
                </Button>,
                <Button
                    onClick={() => {
                        setSelectedPost(post);
                        setIsViewPostModalVisible(true);
                    }}
                    style={{ marginRight: "7px", color: "#0074D9" }}
                >
                    View
                </Button>,
            ],
        },
    ]);

    const [HomeCols] = useState([
        {
            key: "homeTitle",
            title: "Title",
            dataIndex: "homeTitle",
        },
        {
            key: "description",
            title: "Description",
            dataIndex: "homeDescription",
        },
        {
            key: "homeButtonText",
            title: "Button Text",
            dataIndex: "homeButtonText",
        },
        {
            key: "homeImage",
            title: "Image URLs",
            dataIndex: "homeImage",
            render: (url) => <a href={url} target="_blank" rel="noopener noreferrer">{url}</a>
            // render: (urls) => urls.map(urlObj => urlObj.imageUrl).join(', ')
        },
        {
            key: "action", title: "Action", align: "center",
            render: (post) => [
                <Button
                    onClick={() => editHome(post)}
                    style={{ marginRight: "7px", color: "#0074D9" }}>
                    Edit
                </Button>,
                <Button
                    onClick={() => {
                        setSelectedHome(post);
                        setIsViewBannerModalVisible(true);
                    }}
                    style={{ marginRight: "7px", color: "#0074D9" }}
                >
                    View
                </Button>,
                <Button
                    style={{ marginRight: "7px", color: "#0074D9" }}
                    onClick={showModal}>
                    Upload Image
                </Button>
            ],
        },
    ]);

    // const [registertableCols] = useState([
    //     {
    //         key: "registerTitle",
    //         title: "Title",
    //         dataIndex: "registerTitle",
    //     },
    //     {
    //         key: "registerDescription",
    //         title: "Description",
    //         dataIndex: "registerDescription",
    //     },
    //     {
    //         key: "registerButton",
    //         title: "Button Text",
    //         dataIndex: "registerButton",
    //     },
    //     {
    //         key: "backgroundImageUrl",
    //         title: "Image URLs",
    //         dataIndex: "backgroundImageUrl",
    //     },
    //     {
    //         key: "action", title: "Action", align: "center",
    //         render: (post) => [
    //             <Button
    //                 onClick={() => editRegister(post)}
    //                 style={{ marginRight: "7px", color: "#0074D9" }}>
    //                 Edit
    //             </Button>,
    //             <Button
    //                 onClick={() => {
    //                     setSelectedRegister(post);
    //                     setIsViewRegisterModalVisible(true);
    //                 }}
    //                 style={{ marginRight: "7px", color: "#0074D9" }}
    //             >
    //                 View
    //             </Button>,
    //             // <Button
    //             //     style={{ marginRight: "7px", color: "#0074D9" }}
    //             //     onClick={showModal}>
    //             //     Upload Image
    //             // </Button>
    //         ],
    //     },
    // ]);

    // const [talktableCols] = useState([
    //     {
    //         key: "talkToUsTitle",
    //         title: "Title",
    //         dataIndex: "talkToUsTitle",
    //     },
    //     {
    //         key: "talkToUsDescription",
    //         title: "Description",
    //         dataIndex: "talkToUsDescription",
    //     },
    //     {
    //         key: "talkToUsContactButton",
    //         title: "Button Text",
    //         dataIndex: "talkToUsContactButton",
    //     },
    //     {
    //         key: "talkToUsLearnMoreButton",
    //         title: "Learn More Button Text",
    //         dataIndex: "talkToUsLearnMoreButton",
    //     },
    //     {
    //         key: "action", title: "Action", align: "center",
    //         render: (post) => [
    //             <Button
    //                 onClick={() => editTalk(post)}
    //                 style={{ marginRight: "7px", color: "#0074D9" }}>
    //                 Edit
    //             </Button>,
    //             <Button
    //                 onClick={() => {
    //                     setSelectedTalk(post);
    //                     setIsViewTalkModalVisible(true);
    //                 }}
    //                 style={{ marginRight: "7px", color: "#0074D9" }}
    //             >
    //                 View
    //             </Button>,
    //         ],
    //     },
    // ]);

    // const [enroltableCols] = useState([
    //     {
    //         key: "frequentlyAskedQuestionsTitle",
    //         title: "Frequently Asked QuestionsTitle",
    //         dataIndex: "frequentlyAskedQuestionsTitle",
    //     },
    //     {
    //         key: "frequentlyAskedQuestionsDescription",
    //         title: "Frequently Asked Questions Description",
    //         dataIndex: "frequentlyAskedQuestionsDescription",
    //     },
    //     {
    //         key: "enrollTitle",
    //         title: "Title",
    //         dataIndex: "enrollTitle",
    //     },
    //     {
    //         key: "enrollDescription",
    //         title: "Description",
    //         dataIndex: "enrollDescription",
    //     },
    //     {
    //         key: "enrollButton",
    //         title: "Button Text",
    //         dataIndex: "enrollButton",
    //     },
    //     {
    //         key: "action", title: "Action", align: "center",
    //         render: (post) => [
    //             <Button
    //                 onClick={() => editEnrol(post)}
    //                 style={{ marginRight: "7px", color: "#0074D9" }}>
    //                 Edit
    //             </Button>,
    //             <Button
    //                 onClick={() => {
    //                     setSelectedEnrol(post);
    //                     setIsViewEnrolModalVisible(true);
    //                 }}
    //                 style={{ marginRight: "7px", color: "#0074D9" }}
    //             >
    //                 View
    //             </Button>,
    //         ],
    //     },
    // ]);

    // const [jobFiguretableCols] = useState([
    //     {
    //         key: "type",
    //         title: "Title",
    //         dataIndex: "type",
    //     },
    //     {
    //         key: "value",
    //         title: "Value",
    //         dataIndex: "value",
    //     },
    //     {
    //         key: "action", title: "Action", align: "center",
    //         render: (post) => [
    //             <Button
    //                 onClick={() => editJobFigure(post)}
    //                 style={{ marginRight: "7px", color: "#0074D9" }}>
    //                 Edit
    //             </Button>,
    //             <Button
    //                 onClick={() => {
    //                     setSelectedJobFigure(post);
    //                     setIsViewJobFigureModalVisible(true);
    //                 }}
    //                 style={{ marginRight: "7px", color: "#0074D9" }}
    //             >
    //                 View
    //             </Button>,
    //         ],
    //     },
    // ]);

    // const [footertableCols] = useState([
    //     {
    //         key: "footerHome",
    //         title: "Footer Home",
    //         dataIndex: "footerHome",
    //     },
    //     {
    //         key: "footerTermsAndConditions",
    //         title: "Terms",
    //         dataIndex: "footerTermsAndConditions",
    //     },
    //     {
    //         key: "footerAbout",
    //         title: "About",
    //         dataIndex: "footerAbout",
    //     },
    //     {
    //         key: "footerContactUs",
    //         title: "Contact",
    //         dataIndex: "footerContactUs",
    //     },
    //     {
    //         key: "report",
    //         title: "Report",
    //         dataIndex: "report",
    //     },
    //     {
    //         key: "footerCopyRight",
    //         title: "CopyRight",
    //         dataIndex: "footerCopyRight",
    //     },
    //     {
    //         key: "footerFacebookLink",
    //         title: "Facebook",
    //         dataIndex: "footerFacebookLink",
    //     },
    //     {
    //         key: "footerTwitterLink",
    //         title: "Twitter",
    //         dataIndex: "footerTwitterLink",
    //     },
    //     {
    //         key: "footerInstagramLink",
    //         title: "Instagram",
    //         dataIndex: "footerInstagramLink",
    //     },
    //     {
    //         key: "footerLinkedInLink",
    //         title: "LinkedIn",
    //         dataIndex: "footerLinkedInLink",
    //     },
    //     {
    //         key: "footerImageUrl",
    //         title: "Image URL",
    //         dataIndex: "footerImageUrl",
    //     },
    //     {
    //         key: "action", title: "Action", align: "center",
    //         render: (post) => [
    //             <Button
    //                 onClick={() => editFooter(post)}
    //                 style={{ marginRight: "7px", color: "#0074D9" }}>
    //                 Edit
    //             </Button>,
    //             <Button
    //                 onClick={() => {
    //                     setSelectedFooter(post);
    //                     setIsViewFooterModalVisible(true);
    //                 }}
    //                 style={{ marginRight: "7px", color: "#0074D9" }}
    //             >
    //                 View
    //             </Button>,
    //         ],
    //     },
    // ]);

    // const [jobstableCols] = useState([
    //     {
    //         key: "jobTitle",
    //         title: "Title",
    //         dataIndex: "jobTitle",
    //     },
    //     {
    //         key: "jobDescription",
    //         title: "Description",
    //         dataIndex: "jobDescription",
    //     },
    //     {
    //         key: "jobContactButton",
    //         title: "Contact Button",
    //         dataIndex: "jobContactButton",
    //     },
    //     {
    //         key: "jobList",
    //         title: "Job List",
    //         dataIndex: "jobList", render: (job) => job.map(jobObj => jobObj.jobTitle).join(', ')
    //     },
    //     {
    //         key: "jobImageUrl",
    //         title: "Image URL",
    //         dataIndex: "jobImageUrl",
    //     },
    //     {
    //         key: "action", title: "Action", align: "center",
    //         render: (post) => [
    //             <Button onClick={() => editJob(post)} style={{ marginRight: "7px", color: "#0074D9" }}>
    //                 Edit
    //             </Button>,
    //             <Button
    //                 onClick={() => {
    //                     setSelectedJob(post);
    //                     setIsViewJobModalVisible(true);
    //                 }}
    //                 style={{ marginRight: "7px", color: "#0074D9" }}
    //             >
    //                 View
    //             </Button>,
    //         ],
    //     },
    // ]);

    // const getNavData = () => {
    //     getNav().then(res => {
    //         setNav(res.data)
    //         console.log('Nav data', res.data)
    //     }).catch(err => {
    //         console.error(err);
    //     });
    // }

    // const getHomeBannerData = () => {
    //     getHomeBanner()
    //         .then(res => {
    //             // If res.data is an object
    //             if (res.data && typeof res.data === 'object') {
    //                 setBanner([res.data])
    //             } else {
    //                 setBanner([])
    //             }
    //         }).catch(err => {
    //             console.error(err);
    //         });
    // }

    // const getOverviewData = async () => {
    //     getOverview().then(res => {
    //         setOverview(res.data)
    //     }).catch(err => {
    //         console.error(err);
    //     });
    // }

    // const getRegisterData = () => {
    //     getRegister()
    //         .then(res => {
    //             if (res.data && typeof res.data === 'object') {
    //                 setRegister([res.data])
    //             } else {
    //                 setRegister([])
    //             }
    //         }).catch(err => {
    //             console.error(err);
    //         });
    // }

    // const getTalkData = () => {
    //     getTalk().then(res => {
    //         if (res.data && typeof res.data === 'object') {
    //             setTalk([res.data])
    //         } else {
    //             setTalk([])
    //         }
    //     }).catch(err => {
    //         console.error(err);
    //     });
    // }

    // const getEnrollData = () => {
    //     getEnroll().then(res => {
    //         setEnrol(res.data)
    //     })
    // }

    // const getJobFigureData = () => {
    //     getJobFigures().then(res => {
    //         console.log('Job Figure data', res.data)
    //         setJobFigure(res.data)
    //     })
    // }

    // const getFooterData = () => {
    //     getFooter().then(res => {
    //         if(res.data && typeof res.data === 'object'){
    //             setFooter([res.data])
    //         }
    //         else{
    //             setFooter([])
    //         }

    //     })
    // }

    // const getJobData = () => {
    //     getJobOpportunity().then(res => {
    //         if(res.data && typeof res.data === 'object'){
    //             setJobs([res.data])
    //         }else{
    //             setJobs([])
    //         }
    //     })
    // }

    // useEffect(() => {
    //     getNavData()
    //     getHomeBannerData()
    //     getOverviewData()
    //     getRegisterData()
    //     getTalkData()
    //     getEnrollData()
    //     getJobFigureData()
    //     getFooterData()
    //     getJobData()
    // }, [])

    // const updateNavBar = () => {
    //     const newValues = {
    //         home: form.getFieldValue("home"),
    //         aboutUs: form.getFieldValue("aboutUs"),
    //         valueChain: form.getFieldValue("valueChain"),
    //         hamis: form.getFieldValue("hamis"),
    //         register: form.getFieldValue("register"),
    //         contactUs: form.getFieldValue("contact"),
    //         masterCardLogo: form.getFieldValue("masterCardLogo"),
    //         agriImpactLogo: form.getFieldValue("agriImpactLogo"),
    //     };

    //     // Only keep the fields that have changed
    //     const changedValues = Object.keys(newValues).reduce((result, key) => {
    //         if (newValues[key] !== nav[key]) {
    //             result[key] = newValues[key];
    //         }
    //         return result;
    //     }, {});

    //     // Send the update
    //     editNav(selectedPost.id, changedValues).then(res => {
    //         notification.success({
    //             message: "Post updated successfully",
    //         });
    //         getNavData();
    //         setIsUpdatePostModalVisible(false);
    //     }).catch(err => {
    //         console.error(err);
    //         notification.error({
    //             message: "An error occurred",
    //         });
    //     });
    // };

    const updateHomeDetails = (e) => {
        e.preventDefault();
        const id = homeData?.data.id;
        const existingHomeImage = Array.isArray(homeData?.data.homeImage)
            ? homeData.data.homeImage.map((urlObj) => urlObj.homeImage).join(', ')
            : homeData?.data.homeImage;

        // Get new values from the form or use existing ones if not provided
        const newValues = {
            homeTitle: form.getFieldValue("homeTitle") || homeData?.data.homeTitle,
            homeDescription: form.getFieldValue("homeDescription") || homeData?.data.homeDescription,
            homeButtonText: form.getFieldValue("homeButtonText") || homeData?.data.homeButtonText,
            homeImage: form.getFieldValue("homeImage") !== undefined ? form.getFieldValue("homeImage") : existingHomeImage,
        };

        // Compare newValues with selectedHome to find changed values
        const changedValue = Object.keys(newValues).reduce((result, key) => {
            if (newValues[key] !== selectedHome[key]) {
                result[key] = newValues[key];
            }
            return result;
        }, {});

        // If no fields were changed, don't submit
        if (Object.keys(changedValue).length === 0) {
            notification.info({
                message: "No changes to update!",
                description: "No changes were detected, Please make changes to update",
            });
            return;
        }

        mutation.mutate({ id: id, payload: newValues },
            {
                onSuccess: () => {
                    setIsUpdateHomeModalVisible(false);
                    refetch();
                },
            }
        );

    };

    const editHome = (post) => {
        setSelectedHome(post);
        form.setFieldsValue({
            homeTitle: post.homeTitle,
            homeDescription: post.homeDescription,
            homeButtonText: post.homeButtonText,
        });
        setIsUpdateHomeModalVisible(true);
    };

    const onUpdateHomeCancel = () => {
        setIsUpdateHomeModalVisible(false);
    }
    // const onUpdateRegisterCancel = () => {
    //     setIsUpdateRegisterModalVisible(false);
    // }
    // const onUpdateTalkCancel = () => {
    //     setIsUpdateTalkModalVisible(false);
    // }

    // const onUpdateEnrolCancel = () => {
    //     setIsUpdateEnrolModalVisible(false);
    // }

    // const onUpdateJobFigureCancel = () => {
    //     setIsUpdateJobFigureModalVisible(false);
    // }

    // const onUpdateFooterCancel = () => {
    //     setIsUpdateFooterModalVisible(false);
    // }

    // const onUpdateJobCancel = () => {
    //     setIsUpdateJobModalVisible(false);
    // }

    return (
        <div>
            <div style={{ textAlign: 'center', paddingTop: '2rem', paddingBottom: '2rem' }}>
                <h2>Welcome to LISA Content Managment Portal</h2>
            </div>
            <div style={{ paddingLeft: '2rem', paddingRight: '2rem' }}>
                {/* Modal upload image  */}
                {/* <Modal
                    title="Upload Image for Banner Carousel"
                    open={isModalOpen}
                    onCancel={handleCancel}
                    footer={[
                        <Button onClick={handleCancel}>Cancel</Button>,
                        <Button
                            key="ok"
                            style={{ marginRight: "7px", color: "#0074D9" }}
                            onClick={handleOk}
                        >
                            Close
                        </Button>,
                    ]}
                >
                    <Upload {...props}>
                        <Button icon={<UploadOutlined />}>Select File</Button>
                    </Upload>
                    <Button
                        onClick={handleUpload}
                        disabled={fileList.length === 0}
                        loading={uploading}
                        style={{
                            marginTop: 16,
                            color: "#0074D9"
                        }}
                    >
                        {uploading ? 'Uploading' : 'Start Upload'}
                    </Button>
                </Modal> */}
                <Tabs onChange={callback} type="card">
                    <TabPane tab="Home" key="2">
                        {/* modals edit banner */}
                        <Modal
                            open={isUpdateHomeModalVisible}
                            onCancel={onUpdateHomeCancel}
                            footer={[
                                <Button onClick={onUpdateHomeCancel}>Cancel</Button>,
                                <Button
                                    style={{ backgroundColor: "#2698FF", color: "white" }}
                                    onClick={updateHomeDetails}
                                >
                                    Update Banner
                                </Button>,
                            ]}
                        >
                            <Form
                                {...layout}
                                name="nest-messages"
                                form={form}
                                style={{ paddingTop: "35px" }}
                            >
                                <Form.Item
                                    name={"homeTitle"}
                                    label="Title"
                                    rules={[
                                        {
                                            required: true,
                                        },
                                    ]}
                                >
                                    <Input />
                                </Form.Item>
                                <Form.Item
                                    name={"homeDescription"}
                                    label="Descritipn"
                                    rules={[
                                        {
                                            required: true,
                                        },
                                    ]}
                                >
                                    <Input />
                                </Form.Item>
                                <Form.Item
                                    name={"homeButtonText"}
                                    label="Button Text"
                                    rules={[
                                        {
                                            required: true,
                                        },
                                    ]}
                                >
                                    <Input />
                                </Form.Item>
                            </Form>
                        </Modal>

                        {/* modal view  */}
                        <Modal
                            open={isViewBannerModalVisible}
                            onCancel={() => {
                                setIsViewBannerModalVisible(false);
                            }}

                            footer={[
                                <Button
                                    onClick={() => {
                                        setIsViewBannerModalVisible(false);
                                    }}
                                >
                                    Cancel
                                </Button>,
                                <Button
                                    style={{ backgroundColor: "#2698FF", color: "white" }}
                                    onClick={() => {
                                        setIsViewBannerModalVisible(false);
                                        editHome(selectedHome);
                                    }}
                                >
                                    Edit Banner{" "}
                                </Button>,
                            ]}
                        >
                            <Form
                                {...layout}
                                name="nest-messages"
                                form={form}
                                style={{ paddingTop: "35px" }}
                            >
                                <Form.Item name={"homeTitle"} label="Title">
                                    <p style={{ margin: 0 }}>{selectedHome?.homeTitle}</p>
                                </Form.Item>
                                <Form.Item name={"homeDescription"} label="Descritpion">
                                    <p style={{ margin: 0 }}>{selectedHome?.homeDescription}</p>
                                </Form.Item>
                                <Form.Item name={"homeButtonText"} label="Button Text">
                                    <p style={{ margin: 0 }}>{selectedHome?.homeButtonText}</p>
                                </Form.Item>
                            </Form>
                        </Modal>
                        {/* main content */}
                        <Table
                            columns={HomeCols}
                            dataSource={dataSource}
                            loading={homeLoading}
                            rowKey={(record) => record.id}
                        />
                    </TabPane>
                    <TabPane tab="UNCDF" key="3">
                        {/* main content */}
                        <UNCDF />
                    </TabPane>
                    <TabPane tab="Products" key="4">
                        <Product />
                    </TabPane>
                    <TabPane tab="News" key="5">
                        <News />
                    </TabPane>
                    <TabPane tab="Local (LISA) " key="6">
                        <LocalBaseDetails />
                    </TabPane>
                    <TabPane tab="UNCDF & Local" key="7">
                        <UncdfLocal />
                    </TabPane>
                    <TabPane tab="Capacity Building" key="8">
                        <CapacityBuilding />
                    </TabPane>
                    <TabPane tab="Training" key="9">
                        <Training />
                    </TabPane>
                    <TabPane tab="District Development" key="10">
                        <District />
                    </TabPane>
                    <TabPane tab="Vulnerability" key="11">
                        <Vulnerabiliy />
                    </TabPane>
                    <TabPane tab="Crowdfunding" key="12">
                        <CrowdFunding />
                    </TabPane>
                </Tabs>
            </div>
        </div>
    )
}


export default Dashboard