import axios, { AxiosInstance } from 'axios';
import { LevelName, MatchItem } from './types';

const baseURL = 'https://lgddevapi.indiadataportal.com';

const axiosInstance: AxiosInstance = axios.create({
  baseURL,
  // You can add other configuration options here
});


export const getLevels = async () => {
  const res = await axiosInstance.get("/levels")
  return res.data.filter((l: any) => l.name !== "india")
}


export const getMatches = async (name: string, level_name: LevelName, parent_id: number | null = null, with_parents = false, with_community_variations = true) => {
  const res = await axiosInstance.post("/match/entity", {
    items: [{
      name,
      level: level_name,
      parent_id,
    }],
    with_parents,
    with_community_variations
  });
  return res.data[0];
}


export const getBatchedMatches = async (payload: MatchItem[], with_parents = false, with_community_variations = true) => {
  const res = await axiosInstance.post("/match/entity", {
    with_parents,
    with_community_variations,
    items: payload
  });
  return res.data;
}


export const lookUpCommunityReportedVariation = async (name: string, level_id: number | null = null, parent_id: number | null = null) => {
  const res = await axiosInstance.post("/match/variation",  {
    name, level_id, parent_id
  })
  return res.data;
}


export const addVariation = async (variation: string, entity_id: string, email: string) => {
  const res = await axiosInstance.post("/add/variation", {
    variation, entity_id, email
  })
  return res.data;
}


export default axiosInstance;
