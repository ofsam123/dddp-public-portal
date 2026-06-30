import { notification } from 'antd'
import axios from './index-cms'
import { useQuery, useMutation} from 'react-query'

const getCrowdFunding = async () => await axios.get('crowdfunding/')
const updateCrowdFunding = async ({id, payload}) => await axios.put(`crowdfunding/${id}`, payload)

export function useGetCrowdFunding() {
    return useQuery(['getCrowdFunding'], () => getCrowdFunding())
}

export function useUpdateCrowdFunding() {
    return useMutation(updateCrowdFunding, {
        onSuccess: () => {
            notification.success({
                message: 'Success',
                description: 'Crowd Funding updated successfully'
            })
        },
        onError: () => {
            notification.error({
                message: 'Error',
                description: 'Crowd Funding update failed'
            })
        }
    })
}