// API 封装
import axios from "axios";

const api = axios.create({
  baseURL: "http://127.0.0.1:5000", // 根据后端实际地址调整
  withCredentials: true,
});

export const register = (data) => api.post("/register", data);
export const login = (data) => api.post("/login", data);

export const getPublicKey = (params) => api.get("/getPublicKey", { params });
export const getFriends = (params) => api.get("/friends", { params });
export const addFriend = (data) => api.post("/friends", data);
export const sendMessage = (data) => api.post("/send_message", data);
export const getMessages = (params) => api.get("/get_messages", { params });

export default api;
