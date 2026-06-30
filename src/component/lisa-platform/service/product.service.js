import { notification } from 'antd'
import axios from './index-cms'
import { useQuery, useMutation} from 'react-query'

const getProduct = async () => await axios.get('product/');

const updateProduct = async ({id, payload}) => await axios.put(`product/${id}`, payload);

export function useGetProduct() {
    return useQuery(['getProduct'], () => getProduct())
}

export function useUpdateProduct() {
    return useMutation(updateProduct, {
        onSuccess: () => {
            notification.success({
                message: 'Success',
                description: 'Product updated successfully'
            })
        },
        onError: () => {
            notification.error({
                message: 'Error',
                description: 'Product update failed'
            })
        }
    })
}