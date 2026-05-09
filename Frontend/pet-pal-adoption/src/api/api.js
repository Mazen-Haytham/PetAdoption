import axios from "axios";
import { useAuthStore } from '../store/authStore'

const BASE_URL = "https://localhost:7081/api";
const ORIGIN_URL = "https://localhost:7081";


const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  timeout: 5000,
});


api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config

    if (error.response?.status !== 401 || original._retry) {
      return Promise.reject(error.response ? error.response.data : error.message)
    }

    original._retry = true

    try {
      const res = await api.post("/auth/refresh-token")
      const newToken = res.data.accessToken

      useAuthStore.getState().setAccessToken(newToken)

      original.headers.Authorization = `Bearer ${newToken}`
      return api(original)

    } catch {
      useAuthStore.getState().clearAuth()
      window.location.href = "/login"
      return Promise.reject(error.response ? error.response.data : error.message)
    }
  }
)

export default api;