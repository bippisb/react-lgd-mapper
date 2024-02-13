import axios, { AxiosInstance } from 'axios';
import { LevelName } from './types';

const baseURL = 'http://localhost:8000';

const axiosInstance: AxiosInstance = axios.create({
  baseURL,
  // You can add other configuration options here
});

export const getLevels = async () => {
  const res = await axiosInstance.get("/levels")
  return res.data.filter((l: any) => l.name !== "india")
}

export const getMatches = async (name: string, level_name: LevelName, parent_id: number | null = null) => {
  const res = await axiosInstance.post("/match/entity", {
    name,
    level: level_name,
    parent_id
  });
  return res.data;
}

export default axiosInstance;
