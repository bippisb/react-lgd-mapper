import axios, { AxiosInstance } from 'axios';

const baseURL = 'http://localhost:8000';

const axiosInstance: AxiosInstance = axios.create({
  baseURL,
  // You can add other configuration options here
});

export const getLevels = async () => {
  const res = await axiosInstance.get("/levels")
  return res.data.filter((l: any) => l.name !== "india")
}


type LevelName = "india" | "state" | "district" | "sub_district" | "block" | "panchayat";

export const getMatches = async (name: string, level_name: LevelName) => {
  const res = await axiosInstance.post("/match/entity", {
    name,
    level_id: level_name,
  });
  return res.data;
}

export default axiosInstance;
