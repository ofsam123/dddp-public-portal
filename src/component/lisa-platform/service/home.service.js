import { notification } from 'antd'
import axios from './index-cms'
import instance from './index'
import { useQuery, useMutation} from 'react-query'


const getHome = async () => await axios.get('home/');

const updateHome = async ({id, payload}) => await axios.put(`home/${id}`, payload);

const getProductByCategory = async (category) => await instance.get(`/products/category/${category}`);

const getProductCategories = async () => await instance.get("/categories");

const getReports = async (productId) => await instance.get(`/forecast-report/product/${productId}`);

export function useGetHome() {
    return useQuery(['getHome'], () => getHome());
}

export function useGetProductCategories(){
    return useQuery(['getProductCategories'], getProductCategories);
}

export function useGetProductByCategory(category){
    return useQuery(['getProductByCategory'], () => getProductByCategory(category), {enabled: !!category});
}

export function useGetReports(productId){
    return useQuery(["getReports"], () => getReports(productId), {enabled: !!productId, cacheTime:0 });
}

export function useUpdateHome() {
    return useMutation(updateHome, {
        onSuccess: () => {
            notification.success({
                message: 'Success',
                description: 'Home updated successfully'
            })
        },
        onError: () => {
            notification.error({
                message: 'Error',
                description: 'Home update failed'
            })
        }
    })
}