import { Button, Form, Input, Modal, Table, Upload, message, notification } from 'antd'
import React, { useState } from 'react'
import { useGetHomeUncd, useUpdateHomeUncd } from '../service/home-uncd.service';
import { UploadOutlined } from '@ant-design/icons';

const layout = {
    labelCol: {
        span: 6,
    },
    wrapperCol: {
        span: 19,
        offset: 1,
    },
};

const UNCDF = () => {
    const { data: uncdf, refetch } = useGetHomeUncd()
    const mutation = useUpdateHomeUncd()

    // Extract the actual data from the response
    const dataSource = uncdf ? [{ ...uncdf.data }] : [];

    const [selectedUNCDF, setSelectedUNCDF] = useState(null);
    const [isViewOverviewModalVisible, setIsViewOverviewModalVisible] = useState(false);
    const [seletedUNCDF, setSeletedUNCDF] = useState(null);
    const [form] = Form.useForm();
    const [isEditUNCDFModalVisible, setIsEditUNCDFModalVisible] = useState(false);
    const [isUpdateUncdfModalVisible, setIsUpdateUncdfModalVisible] = useState(false);
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
            key: "uncdfTitle",
            title: "Title",
            dataIndex: "uncdfTitle",
        },
        {
            key: "uncdfDescription",
            title: "UNCDF Description",
            dataIndex: "uncdfDescription",
        },
        {
            key: "uncdfButtonText",
            title: "Button Text",
            dataIndex: "uncdfButtonText",
        },
        {
            key: "uncdfImage",
            title: "UNCDF Image",
            dataIndex: "uncdfImage",
        },
        {
            key: "localTitle",
            title: "Local Title",
            dataIndex: "localTitle",
        },
        {
            key: "localDescription",
            title: "Local Description",
            dataIndex: "localDescription",
        },
        {
            key: "action", title: "Action", align: "center",
            render: (post) => [
                <Button
                    onClick={() => editUNCDF(post)}
                    style={{ marginRight: "7px", color: "#0074D9" }}>
                    Edit
                </Button>,
                <Button
                    onClick={() => {
                        setSelectedUNCDF(post);
                        setIsViewOverviewModalVisible(true);
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

    const editUNCDF = (post) => {
        setSelectedUNCDF(post);
        form.setFieldsValue({
            uncdfTitle: post.uncdfTitle,
            uncdfDescription: post.uncdfDescription,
            uncdfButtonText: post.uncdfButtonText,
            uncdfImage: post.uncdfImage,
            localTitle: post.localTitle,
            localDescription: post.localDescription,
        });
        setIsUpdateUncdfModalVisible(true);
    };

    const onUpdateUNCDFCancel = () => {
        setIsUpdateUncdfModalVisible(false);
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

    const updateUNCDF = (e) => {
        e.preventDefault();

        const id = uncdf?.data.id;

        const existingUncdfImage = Array.isArray(uncdf?.data.uncdfImage)
            ? uncdf.data.uncdfImage.map((urlObj) => urlObj.uncdfImage).join(", ")
            : uncdf?.data.uncdfImage;

        // Get new values from the form or use existing ones if not provided
        const newValues = {
            uncdfTitle: form.getFieldValue("uncdfTitle") || uncdf?.data.uncdfTitle,
            uncdfDescription: form.getFieldValue("uncdfDescription") || uncdf?.data.uncdfDescription,
            uncdfButtonText: form.getFieldValue("uncdfButtonText") || uncdf?.data.uncdfButtonText,
            uncdfImage: form.getFieldValue("uncdfImage") !== undefined ? form.getFieldValue("uncdfImage") : existingUncdfImage,
            localTitle: form.getFieldValue("localTitle") || uncdf?.data.localTitle,
            localDescription: form.getFieldValue("localDescription") || uncdf?.data.localDescription,
        };

        // Compare newValues with selectedHome to find changed values

        const changedValues = Object.keys(newValues).reduce((acc, key) => {
            if (newValues[key] !== selectedUNCDF[key]) {
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

        // console.log("Payload: ", newValues);

        mutation.mutate({ id: id, payload: newValues },
            {
                onSuccess: () => {
                    setIsUpdateUncdfModalVisible(false)
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
            {/* modals edit uncdf */}
            <Modal
                open={isUpdateUncdfModalVisible}
                onCancel={onUpdateUNCDFCancel}
                footer={[
                    <Button onClick={onUpdateUNCDFCancel}>Cancel</Button>,
                    <Button
                        style={{ backgroundColor: "#2698FF", color: "white" }}
                        onClick={updateUNCDF}
                    >
                        Update Overview
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
                        name={"uncdfTitle"}
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
                        name={"uncdfDescription"}
                        label="Description"
                        rules={[
                            {
                                required: true,
                            },
                        ]}
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item
                        name={"uncdfButtonText"}
                        label="Button Text"
                        rules={[
                            {
                                required: true,
                            },
                        ]}
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item
                        name={"uncdfImage"}
                        label="Image"
                        rules={[
                            {
                                required: true,
                            },
                        ]}
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item
                        name={"localTitle"}
                        label="Local Title"
                        rules={[
                            {
                                required: true,
                            },
                        ]}
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item
                        name={"localDescription"}
                        label="Local Description"
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
                open={isViewOverviewModalVisible}
                onCancel={() => {
                    setIsViewOverviewModalVisible(false);
                }}

                footer={[
                    <Button
                        onClick={() => {
                            setIsViewOverviewModalVisible(false);
                        }}
                    >
                        Cancel
                    </Button>,
                    <Button
                        style={{ backgroundColor: "#2698FF", color: "white" }}
                        onClick={() => {
                            setIsViewOverviewModalVisible(false);
                            editUNCDF(selectedUNCDF);
                        }}
                    >
                        Edit UNCDF{" "}
                    </Button>,
                ]}
            >
                <Form
                    {...layout}
                    name="nest-messages"
                    form={form}
                    style={{ paddingTop: "35px" }}
                >
                    <Form.Item name={"uncdfTitle"} label="Title">
                        <p style={{ margin: 0 }}>{selectedUNCDF?.uncdfTitle}</p>
                    </Form.Item>

                    <Form.Item name={"uncdfDescription"} label="Description">
                        <p style={{ margin: 0 }}>{selectedUNCDF?.uncdfDescription}</p>
                    </Form.Item>

                    <Form.Item name={"uncdfButtonText"} label="Button Text">
                        <p style={{ margin: 0 }}>{selectedUNCDF?.uncdfButtonText}</p>
                    </Form.Item>

                    <Form.Item name={"uncdfImage"} label="Image">
                        <p style={{ margin: 0 }}>{selectedUNCDF?.uncdfImage}</p>
                    </Form.Item>

                    <Form.Item name={"localTitle"} label="Local Title">
                        <p style={{ margin: 0 }}>{selectedUNCDF?.localTitle}</p>
                    </Form.Item>

                    <Form.Item name={"localDescription"} label="Local Description">
                        <p style={{ margin: 0 }}>{selectedUNCDF?.localDescription}</p>
                    </Form.Item>
                </Form>
            </Modal>
            <Table columns={tableColsOverView} dataSource={dataSource} />
        </div>
    )
}

export default UNCDF