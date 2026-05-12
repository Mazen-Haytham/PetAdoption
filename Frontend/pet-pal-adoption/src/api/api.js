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
      await refreshApi.post("/auth/logout"); // refreshApi = no interceptors
      useAuthStore.getState().clearAuth();
      return Promise.reject(error.response ? error.response.data : error.message);
    }
  }
);

export default api;

// ─── user ────────────────────────────────────────────────────
export async function getMe() {
  try {
    const res = await api.get("/auth/me");
    // console.log("getMe response:", res);
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
    return res.data.data ?? [];
  } catch (error) {
    if (error?.response?.status === 404) return [];
    return Promise.reject(error.response ? error.response.data : error.message);
  }
}

/** POST /pets — multipart form; Owner/Shelter/Admin. */
export async function createPetPost(formData) {
  const res = await api.post("/pets", formData);
  return res.data;
}

/** PUT /pets/:petPostId — JSON body; partial updates supported. */
export async function updatePetPost(petPostId, body) {
  const res = await api.put(`/pets/${petPostId}`, body);
  return res.data;
}

/** DELETE /pets/:petPostId */
export async function deletePetPost(petPostId) {
  const res = await api.delete(`/pets/${petPostId}`);
  return res.data;
}

// ─── Adopter browse (public GET; POST adoption needs login) ─

/** GET /pets — available listings (anonymous allowed). Empty list → [] on 404. */
export async function getAvailablePetPosts() {
  try {
    const res = await api.get("/pets");
    return res.data.data ?? [];
  } catch (error) {
    if (error?.response?.status === 404) return [];
    return Promise.reject(error.response ? error.response.data : error.message);
  }
}

/** POST /adoptions — Adopter only; body uses petPostId + message. */
export async function createAdoptionRequest(petPostId, message) {
  try {
    const res = await api.post("/adoptions", { petPostId, message });
    return res.data;
  } catch (error) {
    return Promise.reject(error.response ? error.response.data : error.message);
  }
}

// ─── Adoptions (Requests) ─────────────────────────────────────

export async function getReceivedAdoptionRequests() {
  try {
    const res = await api.get("/adoptions/received");
    // console.log("getReceivedAdoptionRequests response:", res);
    return res.data.data ?? [];
  } catch (error) {
    if (error?.response?.status === 404) return [];
    return Promise.reject(error.response ? error.response.data : error.message);
  }
}

export async function getMyAdoptionRequests() {
  try {
    const res = await api.get("/adoptions/my");
    // console.log("getMyAdoptionRequests response:", res);
    return res.data ?? [];
  } catch (error) {
    if (error?.response?.status === 404) return [];
    return Promise.reject(error.response ? error.response.data : error.message);
  }
}

export async function getAdoptionHistory() {
  try {
    const res = await api.get("/adoptions/history");
    return res.data?.data ?? res.data ?? [];
  } catch (error) {
    if (error?.response?.status === 404) return [];
    return Promise.reject(error.response ? error.response.data : error.message);
  }
}

/** Completed adoptions for an applicant (shelter/owner viewing a request). */
export async function getAdopterAdoptionHistoryForShelter(adopterId) {
  const res = await api.get(`/adoptions/history/for-adopter/${adopterId}`);
  return res.data?.data ?? [];
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



export async function searchPetPosts(filter) {
  try {
    const res = await api.get('/pets/search', { params: filter })
    return res.data.data ?? []
  } catch (error) {
    if (error?.response?.status === 404) return []
    return Promise.reject(error.response ? error.response.data : error.message)
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