import { Button, Form, Input, Modal, Table, Upload, message, notification } from 'antd'
import React, { useState } from 'react'
import { UploadOutlined } from '@ant-design/icons';
import { useGetVulnerability, useUpdateVulnerability } from '../service/vulnerability.service';

const layout = {
    labelCol: {
        span: 6,
    },
    wrapperCol: {
        span: 19,
        offset: 1,
    },
};

const Vulnerabiliy = () => {
    const { data: vulnerability, refetch } = useGetVulnerability()
    const mutation = useUpdateVulnerability()

    // Extract the actual data from the response
    const dataSource = vulnerability ? [{ ...vulnerability.data }] : [];
    const data = dataSource[0];

    const [selectedVulnerability, setSelectedVulnerability] = useState(null);
    const [isViewVulnerabilityModalVisible, setIsViewVulnerabilityModalVisible] = useState(false);
    const [form] = Form.useForm();
    const [isUpdateVulnerabilityModalVisible, setIsUpdateDistrictModalVisible] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [fileList, setFileList] = useState([]);
    const [uploading, setUploading] = useState(false);

    const showModal = () => {
        setIsModalOpen(true);
    };

    const handleOk = () => {
        setIsModalOpen(false);
    };

    const handleCancel = () => {
        setIsModalOpen(false);
    };

    const [tableColsOverView] = useState([
        {
            key: "title",
            title: "Title",
            dataIndex: "title",
        },
        {
            key: "description",
            title: "Description",
            dataIndex: "description",
        },
        {
            key: "vulnerabilityAssessmentImage",
            title: "Image",
            render: (record) => (
                <div>
                    {/* Map through the vulnerabilityAssessmentImage array to display the URLs */}
                    {record.vulnerabilityAssessmentImage?.map((image, index) => (
                        <div key={index}>
                            <span>{image.vulnerabilityAssessmentImage}</span>
                        </div>
                    ))}
                </div>
            ),
        },
        {
            key: "action", title: "Action", align: "center",
            render: (post) => [
                <Button
                    onClick={() => editLocal(post)}
                    style={{ marginRight: "7px", color: "#0074D9" }}>
                    Edit
                </Button>,
                <Button
                    onClick={() => {
                        setSelectedVulnerability(post);
                        setIsViewVulnerabilityModalVisible(true);
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

    const editLocal = (post) => {
        setSelectedVulnerability(post);
        form.setFieldsValue({
            title: post.title,
            description: post.description,
            vulnerabilityAssessmentImage: post.vulnerabilityAssessmentImage,
        });
        setIsUpdateDistrictModalVisible(true);
    };

    const onUpdateTrainingCancel = () => {
        setIsUpdateDistrictModalVisible(false);
    }

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

    const handleUpload = () => {
        const formData = new FormData();
        fileList.forEach((file) => {
            formData.append('files[]', file);
        });
        setUploading(true);
        // You can use any AJAX library you like
        fetch('https://660d2bd96ddfa2943b33731c.mockapi.io/api/upload', {
            method: 'POST',
            body: formData,
        })
            .then((res) => res.json())
            .then(() => {
                setFileList([]);
                message.success('upload successfully.');
            })
            .catch(() => {
                message.error('upload failed.');
            })
            .finally(() => {
                setUploading(false);
            });
    };

    const updateLocal = (e) => {
        e.preventDefault();

        const id = vulnerability?.data.id;

        const existingLocalImage = Array.isArray(vulnerability?.data.vulnerabilityAssessmentImage)
            ? vulnerability.data.vulnerabilityAssessmentImage.map((urlObj) => urlObj.vulnerabilityAssessmentImage).join(", ")
            : vulnerability?.data.vulnerabilityAssessmentImage;


        // Get new values from the form or use existing ones if not provided
        const newValues = {
            title: form.getFieldValue("title") || vulnerability?.data.title,
            description: form.getFieldValue("description") || vulnerability?.data.description,
            vulnerabilityAssessmentImage: form.getFieldValue("vulnerabilityAssessmentImage") !== undefined ? form.getFieldValue("vulnerabilityAssessmentImage") : existingLocalImage,
        };

        // Compare newValues with selectedHome to find changed values
        const changedValues = Object.keys(newValues).reduce((acc, key) => {
            if (newValues[key] !== selectedVulnerability[key]) {
                acc[key] = newValues[key];
            }
            return acc;
        }, {});

        // If no values have changed, don't submit
        if (Object.keys(changedValues).length === 0) {
            notification.info({
                message: "No changes detected!",
                description: "No changes were detected, Please make changes to update",
            });
            return;
        }

        console.log("Payload: ", newValues);
        mutation.mutate({ id: id, payload: newValues },
            {
                onSuccess: () => {
                    setIsUpdateDistrictModalVisible(false);
                    refetch()
                }
            }
        );
    }

    return (
        <div>
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
            {/* modals edit vulnerability */}
            <Modal
                open={isUpdateVulnerabilityModalVisible}
                onCancel={onUpdateTrainingCancel}
                footer={[
                    <Button onClick={onUpdateTrainingCancel}>Cancel</Button>,
                    <Button
                        style={{ backgroundColor: "#2698FF", color: "white" }}
                        onClick={updateLocal}
                    >
                        Update
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
                        name={"title"}
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
                        name={"description"}
                        label="Description"
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

            <Modal
                open={isViewVulnerabilityModalVisible}
                onCancel={() => {
                    setIsViewVulnerabilityModalVisible(false);
                }}

                footer={[
                    <Button
                        onClick={() => {
                            setIsViewVulnerabilityModalVisible(false);
                        }}
                    >
                        Cancel
                    </Button>,
                    <Button
                        style={{ backgroundColor: "#2698FF", color: "white" }}
                        onClick={() => {
                            setIsViewVulnerabilityModalVisible(false);
                            editLocal(selectedVulnerability);
                        }}
                    >
                        Edit{" "}
                    </Button>,
                ]}
            >
                <Form
                    {...layout}
                    name="nest-messages"
                    form={form}
                    style={{ paddingTop: "35px" }}
                >
                    <Form.Item name={"title "} label="Title">
                        <p style={{ margin: 0 }}>{selectedVulnerability?.title}</p>
                    </Form.Item>
                    <Form.Item name={"description"} label="Description">
                        <p style={{ margin: 0 }}>{selectedVulnerability?.description}</p>
                    </Form.Item>
                    <Form.Item name={"vulnerabilityAssessmentImage"} label="Image">
                        <div>
                            {/* Iterate over the vulnerabilityAssessmentImage array and display the images */}
                            {selectedVulnerability?.vulnerabilityAssessmentImage?.map((image, index) => (
                                <div key={index}>
                                    <span>{image.vulnerabilityAssessmentImage}</span>
                                </div>
                            ))}
                        </div>
                    </Form.Item>
                </Form>
            </Modal>
            <Table columns={tableColsOverView} dataSource={dataSource} />
        </div>
    )
}

export default Vulnerabiliy