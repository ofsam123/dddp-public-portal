import { notification } from 'antd'
import axios from './index-cms'
import { useQuery, useMutation} from 'react-query'

const getHomeUncd = async () => await axios.get('uncdf/')
const updateHomeUncd = async ({id, payload}) => await axios.put(`uncdf/${id}`, payload)

export function useGetHomeUncd() {
    return useQuery(['getHomeUncd'], () => getHomeUncd())
}

export function useUpdateHomeUncd() {
    return useMutation(updateHomeUncd, {
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