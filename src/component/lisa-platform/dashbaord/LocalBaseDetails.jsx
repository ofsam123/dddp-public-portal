import { Button, Form, Input, Modal, Table, Upload, message, notification } from 'antd'
import React, { useState } from 'react'
import { UploadOutlined } from '@ant-design/icons';
import { useGetLocalDetails, useUpdateLocalDetails } from '../service/local-details';

const layout = {
    labelCol: {
        span: 6,
    },
    wrapperCol: {
        span: 19,
        offset: 1,
    },
};

const LocalBaseDetails = () => {
    const { data: local, refetch } = useGetLocalDetails()
    const mutation = useUpdateLocalDetails()

    // Extract the actual data from the response
    const dataSource = local ? [{ ...local.data }] : [];

    const [selectedLocal, setSelectedLocal] = useState(null);
    const [isViewLocalModalVisible, setIsViewLocalModalVisible] = useState(false);
    const [form] = Form.useForm();
    const [isUpdateLocalModalVisible, setIsUpdateLocalModalVisible] = useState(false);
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
            key: "localTitle",
            title: "Title",
            dataIndex: "localTitle",
        },
        {
            key: "localDescription",
            title: "Description",
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
                        setSelectedLocal(post);
                        setIsViewLocalModalVisible(true);
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
        setSelectedLocal(post);
        form.setFieldsValue({
            localTitle: post.localTitle,
            localDescription: post.localDescription,
            localImage: post.localImage
        });
        setIsUpdateLocalModalVisible(true);
    };

    const onUpdateLocalCancel = () => {
        setIsUpdateLocalModalVisible(false);
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

        const id = local?.data.id;

        const existingLocalImage = Array.isArray(local?.data.localImage)
            ? local.data.localImage.map((urlObj) => urlObj.localImage).join(", ")
            : local?.data.localImage;


        // Get new values from the form or use existing ones if not provided
        const newValues = {
            localTitle: form.getFieldValue("localTitle") || local?.data.localTitle,
            localDescription: form.getFieldValue("localDescription") || local?.data.localDescription,
            localImage: form.getFieldValue("localImage") !== undefined ? form.getFieldValue("localImage") : existingLocalImage,
        };

        // Compare newValues with selectedHome to find changed values
        const changedValues = Object.keys(newValues).reduce((acc, key) => {
            if (newValues[key] !== selectedLocal[key]) {
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
                    setIsUpdateLocalModalVisible(false);
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
            {/* modals edit local */}
            <Modal
                open={isUpdateLocalModalVisible}
                onCancel={onUpdateLocalCancel}
                footer={[
                    <Button onClick={onUpdateLocalCancel}>Cancel</Button>,
                    <Button
                        style={{ backgroundColor: "#2698FF", color: "white" }}
                        onClick={updateLocal}
                    >
                        Update Local
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
                        name={"localTitle"}
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
                        name={"localDescription"}
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
                        name={"localImage"}
                        label="Image"
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
                open={isViewLocalModalVisible}
                onCancel={() => {
                    setIsViewLocalModalVisible(false);
                }}

                footer={[
                    <Button
                        onClick={() => {
                            setIsViewLocalModalVisible(false);
                        }}
                    >
                        Cancel
                    </Button>,
                    <Button
                        style={{ backgroundColor: "#2698FF", color: "white" }}
                        onClick={() => {
                            setIsViewLocalModalVisible(false);
                            editLocal(selectedLocal);
                        }}
                    >
                        Edit Local{" "}
                    </Button>,
                ]}
            >
                <Form
                    {...layout}
                    name="nest-messages"
                    form={form}
                    style={{ paddingTop: "35px" }}
                >
                    <Form.Item name={"localTitle "} label="Title">
                        <p style={{ margin: 0 }}>{selectedLocal?.localTitle}</p>
                    </Form.Item>
                    <Form.Item name={"localDescription"} label="Description">
                        <p style={{ margin: 0 }}>{selectedLocal?.localDescription}</p>
                    </Form.Item>
                    <Form.Item name={"localImage"} label="Image">
                        <p style={{ margin: 0 }}>{selectedLocal?.localImage}</p>
                    </Form.Item>
                </Form>
            </Modal>
            <Table columns={tableColsOverView} dataSource={dataSource} />
        </div>
    )
}

export default LocalBaseDetails