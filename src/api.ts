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

export default axiosInstance;
