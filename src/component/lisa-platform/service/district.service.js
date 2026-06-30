import { notification } from 'antd'
import axios from './index-cms'
import { useQuery, useMutation} from 'react-query'

const getDistrict = async () => await axios.get('district/')
const updateDistrict = async ({id, payload}) => await axios.put(`district/${id}`, payload)

export function useGetDistrict() {
    return useQuery(['getDistrict'], () => getDistrict())
}

export function useUpdateDistrict() {
    return useMutation(updateDistrict, {
        onSuccess: () => {
            notification.success({
                message: 'Success',
                description: 'District updated successfully'
            })
        },
        onError: () => {
            notification.error({
                message: 'Error',
                description: 'District update failed'
            })
        }
    })
}