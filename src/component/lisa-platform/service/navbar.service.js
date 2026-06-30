import axios from './index-cms'
import { useQuery } from 'react-query'


const getNavebar = async () => await axios.get('navbar/')

export function useGetNavBars() {
    return useQuery(['getNavbar'], () => getNavebar())
}




