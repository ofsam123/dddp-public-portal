import { Button, Form, Input, Modal, Table, Upload, message, notification } from 'antd'
import React, { useState } from 'react'
import { UploadOutlined } from '@ant-design/icons';
import { useGetNews, useUpdateNews } from '../service/news.service';


const layout = {
    labelCol: {
        span: 6,
    },
    wrapperCol: {
        span: 19,
        offset: 1,
    },
};


const News = () => {
    const { data: news, refetch } = useGetNews()
    const mutation = useUpdateNews()

    // Extract the actual data from the response
    const dataSource = news?.data;

    const [selectedNews, setSelectedNews] = useState(null);
    const [isViewNewsModalVisible, setIsViewNewsModalVisible] = useState(false);
    const [form] = Form.useForm();
    const [isUpdateNewsModalVisible, setIsUpdateNewsModalVisible] = useState(false);
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
            key: "newsHeader",
            title: "Headline",
            dataIndex: "newsHeader"
        },
        {
            key: "newsLetterTitle",
            title: "Title",
            dataIndex: "newsLetterTitle"
        },
        {
            key: "newsLetterDescription",
            title: "Description",
            dataIndex: "newsLetterDescription"
        },
        {
            key: "newsLetterButtonText",
            title: "Button Text",
            dataIndex: "newsLetterButtonText"
        },
        {
            key: "newsLetterImage",
            title: "Image",
            dataIndex: "newsLetterImage"
        },
        {
            key: "action", title: "Action", align: "center",
            render: (post) => [
                <Button
                    onClick={() => editNews(post)}
                    style={{ marginRight: "7px", color: "#0074D9" }}>
                    Edit
                </Button>,
                <Button
                    onClick={() => {
                        setSelectedNews(post);
                        setIsViewNewsModalVisible(true);
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

    const editNews = (post) => {
        setSelectedNews(post);
        form.setFieldsValue({
            newsHeader: post.newsHeader,
            newsLetterTitle: post.newsLetterTitle,
            newsLetterDescription: post.newsLetterDescription,
            newsLetterButtonText: post.newsLetterButtonText,
            newsLetterImage: post.newsLetterImage,
        });
        setIsUpdateNewsModalVisible(true);
    };

    const onUpdateProductCancel = () => {
        setIsUpdateNewsModalVisible(false);
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

    const updateNews = (e, productId) => {
        e.preventDefault();

        const existingNews = news.data.find((item) => item.id === productId);
        const existingNewsImage = existingNews?.newsLetterImage || "";

        // Get new values from the form, or use existing ones if not provided
        const newValues = {
            newsHeader: form.getFieldValue("newsHeader") || existingNews.newsHeader,
            newsLetterTitle: form.getFieldValue("newsLetterTitle") || existingNews.newsLetterTitle,
            newsLetterDescription: form.getFieldValue("newsLetterDescription") || existingNews.newsLetterDescription,
            newsLetterButtonText: form.getFieldValue("newsLetterButtonText") || existingNews.newsLetterButtonText,
            newsLetterImage: form.getFieldValue("newsLetterImage") !== undefined ? form.getFieldValue("newsLetterImage") : existingNewsImage,
        };

        // Compare newValues with selectedHome to find changed values
        const changedValues = Object.keys(newValues).reduce((acc, key) => {
            if (newValues[key] !== selectedNews[key]) {
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

        mutation.mutate({ id: productId, payload: newValues },
            {
                onSuccess: () => {
                    setIsUpdateNewsModalVisible(false)
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
            {/* modals edit news */}
            <Modal
                open={isUpdateNewsModalVisible}
                onCancel={onUpdateProductCancel}
                footer={[
                    <Button onClick={onUpdateProductCancel}>Cancel</Button>,
                    <Button
                        style={{ backgroundColor: "#2698FF", color: "white" }}
                        onClick={(e) => updateNews(e, selectedNews.id)}
                    >
                        Update News
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
                        name={"newsHeader"}
                        label="Header"
                        rules={[
                            {
                                required: true,
                            },
                        ]}
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item
                        name={"newsLetterTitle"}
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
                        name={"newsLetterDescription"}
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
                        name={"newsLetterButtonText"}
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
                        name={"newsLetterImage"}
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
                open={isViewNewsModalVisible}
                onCancel={() => {
                    setIsViewNewsModalVisible(false);
                }}

                footer={[
                    <Button
                        onClick={() => {
                            setIsViewNewsModalVisible(false);
                        }}
                    >
                        Cancel
                    </Button>,
                    <Button
                        style={{ backgroundColor: "#2698FF", color: "white" }}
                        onClick={() => {
                            setIsViewNewsModalVisible(false);
                            editNews(selectedNews);
                        }}
                    >
                        Edit Product{" "}
                    </Button>,
                ]}
            >
                <Form
                    {...layout}
                    name="nest-messages"
                    form={form}
                    style={{ paddingTop: "35px" }}
                >
                    <Form.Item name={"newsHeader"} label="Header">
                        <p style={{ margin: 0 }}>{selectedNews?.newsHeader}</p>
                    </Form.Item>
                    <Form.Item name={"newsLetterTitle"} label="Title">
                        <p style={{ margin: 0 }}>{selectedNews?.newsLetterTitle}</p>
                    </Form.Item>
                    <Form.Item name={"newsLetterDescription"} label="Description">
                        <p style={{ margin: 0 }}>{selectedNews?.newsLetterDescription}</p>
                    </Form.Item>
                    <Form.Item name={"newsLetterButtonText"} label="Button Text">
                        <p style={{ margin: 0 }}>{selectedNews?.newsLetterButtonText}</p>
                    </Form.Item>
                    <Form.Item name={"newsLetterImage"} label="Image">
                        <p style={{ margin: 0 }}>{selectedNews?.newsLetterImage}</p>
                    </Form.Item>
                </Form>
            </Modal>
            <Table columns={tableColsOverView} dataSource={dataSource} />
        </div>
    )
}

export default News