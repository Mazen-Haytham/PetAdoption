import axios from "axios";
import { useAuthStore } from '../store/authStore'

const BASE_URL = "https://localhost:7081/api";
export const ORIGIN_URL = "https://localhost:7081";


const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  timeout: 5000,
});

const refreshApi = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
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
    const original = error.config;

    // 403
    if (error.response?.status === 403) {
      window.location.href = "/unauthorized";
      return Promise.reject(error.response ? error.response.data : error.message);
    }

    // 401
    if (error.response?.status !== 401 || original._retry) {
      return Promise.reject(error.response ? error.response.data : error.message);
    }

    original._retry = true;

    try {
      const res = await refreshApi.post("/Auth/refresh-token");
      const newToken = res.data.accessToken;

      useAuthStore.getState().setAccessToken(newToken);

      original.headers.Authorization = `Bearer ${newToken}`;
      return api(original);

    } catch {
      useAuthStore.getState().clearAuth();
      window.location.href = "/login";
      return Promise.reject(error.response ? error.response.data : error.message);
    }
  }
);

export default api;

// ─── user ────────────────────────────────────────────────────
export async function getMe() {
  try {
    const res = await api.get("/auth/me");
    console.log("getMe response:", res);
    return res.data;
  } catch (error) {
    return Promise.reject(error.response ? error.response.data : error.message);
  }
}


export async function logout() {
  try {
    await api.post("/auth/logout");
  } catch(err) {
    console.error("Logout failed:", err.response ? err.response.data : err.message);
  } finally {
    useAuthStore.getState().clearAuth();
    window.location.href = "/login";
  }
}

// ─── Pets ────────────────────────────────────────────────────

export function resolveAssetUrl(path) {
  if (!path || typeof path !== "string" || path.trim() === "") return null;
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  if (path.startsWith("/")) return `${ORIGIN_URL}${path}`;
  return `${ORIGIN_URL}/${path}`;
}

export async function getMyPetPosts() {
  try {
    const res = await api.get("/pets/mine");
    console.log("getMyPetPosts response:", res);
    return res.data.data ?? [];
  } catch (error) {
    if (error?.response?.status === 404) return [];
    return Promise.reject(error.response ? error.response.data : error.message);
  }
}

// ─── Adoptions (Requests) ─────────────────────────────────────

export async function getReceivedAdoptionRequests() {
  try {
    const res = await api.get("/adoptions/received");
    console.log("getReceivedAdoptionRequests response:", res);
    return res.data.data ?? [];
  } catch (error) {
    if (error?.response?.status === 404) return [];
    return Promise.reject(error.response ? error.response.data : error.message);
  }
}

export async function getMyAdoptionRequests() {
  try {
    const res = await api.get("/adoptions/my");
    console.log("getMyAdoptionRequests response:", res);
    return res.data ?? [];
  } catch (error) {
    if (error?.response?.status === 404) return [];
    return Promise.reject(error.response ? error.response.data : error.message);
  }
}

export async function getAdoptionHistory() {
  try {
    const res = await api.get("/adoptions/history");
    return res.data ?? [];
  } catch (error) {
    if (error?.response?.status === 404) return [];
    return Promise.reject(error.response ? error.response.data : error.message);
  }
}

export async function acceptAdoptionRequest(requestId) {
  try {
    const res = await api.put(`/adoptions/${requestId}/accept`);
    if (res.status === 204) return;
    return res.data;
  } catch (error) {
    return Promise.reject(error.response ? error.response.data : error.message);
  }
}

export async function rejectAdoptionRequest(requestId) {
  try {
    const res = await api.put(`/adoptions/${requestId}/reject`);
    if (res.status === 204) return;
    return res.data;
  } catch (error) {
    return Promise.reject(error.response ? error.response.data : error.message);
  }
}

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