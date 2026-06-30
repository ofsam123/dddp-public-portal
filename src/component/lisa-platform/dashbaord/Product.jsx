import { Button, Form, Input, Modal, Table, Upload, message, notification } from 'antd'
import React, { useState } from 'react'
import { UploadOutlined } from '@ant-design/icons';
import { useGetProduct, useUpdateProduct } from '../service/product.service';

const layout = {
    labelCol: {
        span: 6,
    },
    wrapperCol: {
        span: 19,
        offset: 1,
    },
};

const Product = () => {
    const { data: product, refetch } = useGetProduct()
    const mutation = useUpdateProduct()

    // Extract the actual data from the response
    const dataSource = product?.data;

    const [selectedProduct, setSelectedProduct] = useState(null);
    const [isViewProductModalVisible, setIsViewProductModalVisible] = useState(false);
    const [form] = Form.useForm();
    const [isUpdateProductModalVisible, setIsUpdateProductModalVisible] = useState(false);
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
            key: "productTitle",
            title: "Title",
            dataIndex: "productTitle",
        },
        {
            key: "productImage",
            title: "Image",
            dataIndex: "productImage",
        },
        {
            key: "action", title: "Action", align: "center",
            render: (post) => [
                <Button
                    onClick={() => editProduct(post)}
                    style={{ marginRight: "7px", color: "#0074D9" }}>
                    Edit
                </Button>,
                <Button
                    onClick={() => {
                        setSelectedProduct(post);
                        setIsViewProductModalVisible(true);
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

    const editProduct = (post) => {
        setSelectedProduct(post);
        form.setFieldsValue({
            productTitle: post.productTitle,
            productImage: post.productImage,
        });
        setIsUpdateProductModalVisible(true);
    };

    const onUpdateProductCancel = () => {
        setIsUpdateProductModalVisible(false);
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

    const updateProduct = (e, productId) => {
        e.preventDefault();

        const existingProduct = product.find((item) => item.id === productId);
        const existingProductImage = existingProduct?.productImage || "";

        // Get new values from the form, or use existing ones if not provided
        const newValues = {
            productTitle: form.getFieldValue("productTitle") || existingProduct.productTitle,
            productImage: form.getFieldValue("productImage") !== undefined ? form.getFieldValue("productImage") : existingProductImage,
        };

        // Compare newValues with selectedHome to find changed values
        const changedValues = Object.keys(newValues).reduce((acc, key) => {
            if (newValues[key] !== selectedProduct[key]) {
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

        // mutation.mutate({ id: productId, payload: newValues },
        //     {
        //         onSuccess: () => {
        //             setIsUpdateProductModalVisible(false)
        //             refetch()
        //         }
        //     }
        // );
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
            {/* modals edit product */}
            <Modal
                open={isUpdateProductModalVisible}
                onCancel={onUpdateProductCancel}
                footer={[
                    <Button onClick={onUpdateProductCancel}>Cancel</Button>,
                    <Button
                        style={{ backgroundColor: "#2698FF", color: "white" }}
                        onClick={(e) => updateProduct(e, selectedProduct.id)}
                    >
                        Update Product
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
                        name={"productTitle"}
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
                        name={"productImage"}
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
                open={isViewProductModalVisible}
                onCancel={() => {
                    setIsViewProductModalVisible(false);
                }}

                footer={[
                    <Button
                        onClick={() => {
                            setIsViewProductModalVisible(false);
                        }}
                    >
                        Cancel
                    </Button>,
                    <Button
                        style={{ backgroundColor: "#2698FF", color: "white" }}
                        onClick={() => {
                            setIsViewProductModalVisible(false);
                            editProduct(selectedProduct);
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
                    <Form.Item name={"productTitle"} label="Title">
                        <p style={{ margin: 0 }}>{selectedProduct?.productTitle}</p>
                    </Form.Item>
                    <Form.Item name={"productImage"} label="Description">
                        <p style={{ margin: 0 }}>{selectedProduct?.productImage}</p>
                    </Form.Item>
                </Form>
            </Modal>
            
            <Table columns={tableColsOverView} dataSource={product} />
        </div>
    )
}

export default Product