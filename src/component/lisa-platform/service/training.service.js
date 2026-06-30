import { notification } from 'antd'
import axios from './index-cms'
import { useQuery, useMutation} from 'react-query'

const getTraining = async () => await axios.get('training/')
const updateTraining = async ({id, payload}) => await axios.put(`training/${id}`, payload)

export function useGetTraining() {
    return useQuery(['getTraining'], () => getTraining())
}

export function useUpdateTraining() {
    return useMutation(updateTraining, {
        onSuccess: () => {
            notification.success({
                message: 'Success',
                description: 'Training updated successfully'
            })
        },
        onError: () => {
            notification.error({
                message: 'Error',
                description: 'Training update failed'
            })
        }
    })
}