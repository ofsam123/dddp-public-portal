import { notification } from 'antd'
import axios from './index-cms'
import { useQuery, useMutation} from 'react-query'

const getNews = async () => await axios.get('newsletter/')
const updateNews = async ({id, payload}) => await axios.put(`newsletter/${id}`, payload)

export function useGetNews() {
    return useQuery(['getNews'], () => getNews())
}

export function useUpdateNews() {
    return useMutation(updateNews, {
        onSuccess: () => {
            notification.success({
                message: 'Success',
                description: 'News updated successfully'
            })
        },
        onError: () => {
            notification.error({
                message: 'Error',
                description: 'News update failed'
            })
        }
    })
}