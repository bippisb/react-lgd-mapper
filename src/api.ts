import axios, { AxiosInstance } from 'axios';
import { LevelName, MatchItem } from './types';

const baseURL = 'http://localhost:8000';

const axiosInstance: AxiosInstance = axios.create({
  baseURL,
  // You can add other configuration options here
});

export const getLevels = async () => {
  const res = await axiosInstance.get("/levels")
  return res.data.filter((l: any) => l.name !== "india")
}

export const getMatches = async (name: string, level_name: LevelName, parent_id: number | null = null, with_parents = false) => {
  const res = await axiosInstance.post("/match/entity", {
    name,
    level: level_name,
    parent_id,
    with_parents,
  });
  return res.data;
}

export const getBatchedMatches = async (payload: MatchItem[], with_parents = false) => {
  const res = await axiosInstance.post("/match/entity", payload.map(p => ({ ...p, with_parents })));
  return res.data;
}


export const addVariation = async (variation: string, entity_id: number) => {
  const res = await axiosInstance.post("/add/variation", {
    variation, entity_id
  })
  return res.data
}

export default axiosInstance;
