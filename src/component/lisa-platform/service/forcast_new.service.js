import instanceDDDP from './index-dddp';
import { useQuery, useMutation } from 'react-query';

//DDDP APIs
const getAllClimateByRegion = async () =>  await instanceDDDP.get(`/organisationUnits?level=2&paging=false`);

const getAllClimateByDistrict = async () =>  await instanceDDDP.get(`/organisationUnits?level=3&paging=false`);

const getAllClimateByCommunity = async () =>  await instanceDDDP.get(`/organisationUnits?level=4&paging=false`);

export const getParentUnit = async (regionId) =>  await instanceDDDP.get(`/organisationUnits/${regionId}`);


//DDDP Queries
export function useGetAllClimateByRegion(){
    return useQuery(['getAllClimateByRegion'], getAllClimateByRegion);
}

export function useGetAllClimateByDistrict(){
    return useQuery(['getAllClimateByDistrict'], getAllClimateByDistrict);
}

export function useGetAllClimateByCommunity(){
    return useQuery(['getAllClimateByCommunity'], getAllClimateByCommunity);
}

