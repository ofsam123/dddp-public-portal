import { notification } from 'antd'
import axios from './index-cms'
import { useQuery, useMutation} from 'react-query'

const getCapacityBuilding = async () => await axios.get('capacity/')
const updateCapacityBuilding = async ({id, payload}) => await axios.put(`capacity/${id}`, payload)

export function useGetCapacityBuilding() {
    return useQuery(['getCapacityBuilding'], () => getCapacityBuilding())
}

export function useUpdateCapacityBuilding() {
    return useMutation(updateCapacityBuilding, {
        onSuccess: () => {
            notification.success({
                message: 'Success',
                description: 'Capacity Building updated successfully'
            })
        },
        onError: () => {
            notification.error({
                message: 'Error',
                description: 'Capacity Building update failed'
            })
        }
    })
}