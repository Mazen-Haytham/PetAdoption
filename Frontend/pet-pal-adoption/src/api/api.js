import axios from "axios";
import { useAuthStore } from '../store/authStore'

const BASE_URL = "https://localhost:7081/api";
export const ORIGIN_URL = "https://localhost:7081";


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

// // ─── Pets ────────────────────────────────────────────────────

// export function resolveAssetUrl(path) {
//   if (!path) return null;
//   if (typeof path !== "string") return null;
//   if (path.startsWith("http://") || path.startsWith("https://")) return path;
//   if (path.startsWith("/")) return `${ORIGIN_URL}${path}`;
//   return `${ORIGIN_URL}/${path}`;
// }

// export async function getMyPetPosts() {
//   const res = await fetch(`${BASE_URL}/pets/mine`, {
//     method: "GET",
//     headers: authHeaders(),
//   });
//   if (res.status === 404) return []; // No pet posts found is not an error
//   const json = await handleResponse(res);
//   return json?.data ?? [];
// }

// // ─── Adoptions (Requests) ─────────────────────────────────────

// export async function getReceivedAdoptionRequests() {
//   const res = await fetch(`${BASE_URL}/adoptions/received`, {
//     method: "GET",
//     headers: authHeaders(),
//   });
//   if (res.status === 404) return []; // No adoption requests found is not an error
//   const json = await handleResponse(res);
//   return json?.data ?? [];
// }

// export async function getMyAdoptionRequests() {
//   const res = await fetch(`${BASE_URL}/adoptions/my`, {
//     method: "GET",
//     headers: authHeaders(),
//   });
//   if (res.status === 404) return []; // No adoption requests found is not an error
//   const json = await handleResponse(res);
//   return json?.data ?? [];
// }

// export async function getAdoptionHistory() {
//   const res = await fetch(`${BASE_URL}/adoptions/history`, {
//     method: "GET",
//     headers: authHeaders(),
//   });
//   if (res.status === 404) return []; // No adoption history found is not an error
//   const json = await handleResponse(res);
//   return json?.data ?? [];
// }

// export async function acceptAdoptionRequest(requestId) {
//   const res = await fetch(`${BASE_URL}/adoptions/${requestId}/accept`, {
//     method: "PUT",
//     headers: authHeaders(),
//   });
//   if (res.status === 204) return;
//   return handleResponse(res);
// }

// export async function rejectAdoptionRequest(requestId) {
//   const res = await fetch(`${BASE_URL}/adoptions/${requestId}/reject`, {
//     method: "PUT",
//     headers: authHeaders(),
//   });
//   if (res.status === 204) return;
//   return handleResponse(res);
// }

// // ─── Admin ───────────────────────────────────────────────────

// export async function updateUserStatus(userId, decision) {
//   // decision: "approve" | "reject"
//   const res = await fetch(`${BASE_URL}/auth/users/${userId}/status`, {
//     method: "PATCH",
//     headers: authHeaders(),
//     body: JSON.stringify({ decision }),
//   });

//   if (res.status === 204) return; // No Content → success
//   return handleResponse(res);
// }