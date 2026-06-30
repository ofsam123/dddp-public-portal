import { Button, Form, Input, Modal, Table, Upload, message, notification } from 'antd'
import React, { useState } from 'react'
import { UploadOutlined } from '@ant-design/icons';
import { useGetUncdfLocal, useUpdateUncdfLocal } from '../service/uncdf-local';

const layout = {
    labelCol: {
        span: 6,
    },
    wrapperCol: {
        span: 19,
        offset: 1,
    },
};


const UncdfLocal = () => {
    const { data: uncdfLocal, refetch } = useGetUncdfLocal()
    const mutation = useUpdateUncdfLocal()

    // Extract the actual data from the response
    const dataSource = uncdfLocal ? [{ ...uncdfLocal.data }] : [];

    const [selectedUncdfLocal, setSelectedUncdfLocal] = useState(null);
    const [isViewUncdfLocalModalVisible, setIsViewUncdfLocalModalVisible] = useState(false);
    const [form] = Form.useForm();
    const [isUpdateUncdfLocalModalVisible, setIsUpdateUncdfLocalModalVisible] = useState(false);
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
            key: "localImage",
            title: "Image",
            dataIndex: "localImage",
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
                        setSelectedUncdfLocal(post);
                        setIsViewUncdfLocalModalVisible(true);
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
        setSelectedUncdfLocal(post);
        form.setFieldsValue({
            uncdfTitle: post.uncdfTitle,
            uncdfDescription: post.uncdfDescription,
            uncdfImage: post.uncdfImage,
            localTitle: post.localTitle,
            localDescription: post.localDescription,
            localImage: post.localImage
        });
        setIsUpdateUncdfLocalModalVisible(true);
    };

    const onUpdateLocalCancel = () => {
        setIsUpdateUncdfLocalModalVisible(false);
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

        const id = uncdfLocal?.data.id;

        const existingLocalImage = Array.isArray(uncdfLocal?.data.localImage)
            ? uncdfLocal.data.localImage.map((urlObj) => urlObj.localImage).join(", ")
            : uncdfLocal?.data.localImage;


        // Get new values from the form or use existing ones if not provided
        const newValues = {
            uncdfTitle: form.getFieldValue("uncdfTitle") || uncdfLocal?.data.uncdfTitle,
            uncdfDescription: form.getFieldValue("uncdfDescription") || uncdfLocal?.data.uncdfDescription,
            uncdfImage: form.getFieldValue("uncdfImage") !== undefined ? form.getFieldValue("uncdfImage") : existingLocalImage,
            localTitle: form.getFieldValue("localTitle") || uncdfLocal?.data.localTitle,
            localDescription: form.getFieldValue("localDescription") || uncdfLocal?.data.localDescription,
            localImage: form.getFieldValue("localImage") !== undefined ? form.getFieldValue("localImage") : existingLocalImage,
        };

        // Compare newValues with selectedHome to find changed values
        const changedValues = Object.keys(newValues).reduce((acc, key) => {
            if (newValues[key] !== selectedUncdfLocal[key]) {
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
                    setIsUpdateUncdfLocalModalVisible(false);
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
            {/* modals edit uncdfLocal */}
            <Modal
                open={isUpdateUncdfLocalModalVisible}
                onCancel={onUpdateLocalCancel}
                footer={[
                    <Button onClick={onUpdateLocalCancel}>Cancel</Button>,
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
                        name={"uncdfTitle"}
                        label="UNCDF Title"
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
                        label="UNCDF Description"
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
                        label="UNCDF Image"
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
                    <Form.Item
                        name={"localImage"}
                        label="Local Image"
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
                open={isViewUncdfLocalModalVisible}
                onCancel={() => {
                    setIsViewUncdfLocalModalVisible(false);
                }}

                footer={[
                    <Button
                        onClick={() => {
                            setIsViewUncdfLocalModalVisible(false);
                        }}
                    >
                        Cancel
                    </Button>,
                    <Button
                        style={{ backgroundColor: "#2698FF", color: "white" }}
                        onClick={() => {
                            setIsViewUncdfLocalModalVisible(false);
                            editLocal(selectedUncdfLocal);
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
                    <Form.Item name={"uncdfTitle "} label="UNCDF Title">
                        <p style={{ margin: 0 }}>{selectedUncdfLocal?.uncdfTitle}</p>
                    </Form.Item>
                    <Form.Item name={"uncdfDescription"} label="UNCDF Description">
                        <p style={{ margin: 0 }}>{selectedUncdfLocal?.uncdfDescription}</p>
                    </Form.Item>
                    <Form.Item name={"uncdfImage"} label="UNCDF Image">
                        <p style={{ margin: 0 }}>{selectedUncdfLocal?.uncdfImage}</p>
                    </Form.Item>

                    <Form.Item name={"localTitle "} label="Local Title">
                        <p style={{ margin: 0 }}>{selectedUncdfLocal?.localTitle}</p>
                    </Form.Item>
                    <Form.Item name={"localDescription"} label="Local Description">
                        <p style={{ margin: 0 }}>{selectedUncdfLocal?.localDescription}</p>
                    </Form.Item>
                    <Form.Item name={"localImage"} label="Local Image">
                        <p style={{ margin: 0 }}>{selectedUncdfLocal?.localImage}</p>
                    </Form.Item>
                </Form>
            </Modal>
            <Table columns={tableColsOverView} dataSource={dataSource} />
        </div>
    )
}

export default UncdfLocal