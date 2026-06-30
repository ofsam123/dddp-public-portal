import { notification } from 'antd'
import axios from './index-cms'
import { useQuery, useMutation} from 'react-query'

const getLocalDetails = async () => await axios.get('localBaseDetailsPage/')
const updateLocalDetails = async ({id, payload}) => await axios.put(`localBaseDetailsPage/${id}`, payload)

export function useGetLocalDetails() {
    return useQuery(['getLocalDetails'], () => getLocalDetails())
}

export function useUpdateLocalDetails() {
    return useMutation(updateLocalDetails, {
        onSuccess: () => {
            notification.success({
                message: 'Success',
                description: 'Local details updated successfully'
            })
        },
        onError: () => {
            notification.error({
                message: 'Error',
                description: 'Local details update failed'
            })
        }
    })
}