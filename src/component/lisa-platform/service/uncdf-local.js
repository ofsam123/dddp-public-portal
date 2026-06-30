import { notification } from 'antd'
import axios from './index-cms'
import { useQuery, useMutation} from 'react-query'

const getUncdfLocal = async () => await axios.get('uncdfDetailsPage/')
const updateUncdfLocal = async ({id, payload}) => await axios.put(`uncdfDetailsPage/${id}`, payload)

export function useGetUncdfLocal() {
    return useQuery(['getUncdfLocal'], () => getUncdfLocal())
}

export function useUpdateUncdfLocal() {
    return useMutation(updateUncdfLocal, {
        onSuccess: () => {
            notification.success({
                message: 'Success',
                description: 'Uncdf local updated successfully'
            })
        },
        onError: () => {
            notification.error({
                message: 'Error',
                description: 'Uncdf local update failed'
            })
        }
    })
}