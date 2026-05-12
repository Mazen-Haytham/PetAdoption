/**
 * All HTTP calls for the admin area.
 * Uses the shared axios instance from api.js (auth headers, refresh on 401, etc.).
 */
import api from "./api";

function reject(error) {
  return Promise.reject(error.response ? error.response.data : error.message);
}

// ─── Users ─────────────────────────────────────────────────────

export async function getAdminUsersAll() {
  try {
    const res = await api.get("/admin/users/all");
    return res.data.data ?? [];
  } catch (error) {
    return reject(error);
  }
}

export async function putAdminUserApprove(userId) {
  try {
    const res = await api.put(`/admin/users/approve/${userId}`);
    return res.data;
  } catch (error) {
    return reject(error);
  }
}

export async function putAdminUserReject(userId) {
  try {
    const res = await api.put(`/admin/users/reject/${userId}`);
    return res.data;
  } catch (error) {
    return reject(error);
  }
}

// ─── Pets ──────────────────────────────────────────────────────

export async function getAdminPets({ status = "", page = 1, pageSize = 50 } = {}) {
  try {
    const params = new URLSearchParams();
    if (status) params.set("status", status);
    params.set("page", String(page));
    params.set("pageSize", String(pageSize));
    const res = await api.get(`/admin/pets?${params.toString()}`);
    return res.data.data ?? [];
  } catch (error) {
    return reject(error);
  }
}

export async function putAdminPetApprove(petPostId) {
  try {
    const res = await api.put(`/admin/pets/approve/${petPostId}`);
    return res.data;
  } catch (error) {
    return reject(error);
  }
}

export async function putAdminPetReject(petPostId) {
  try {
    const res = await api.put(`/admin/pets/reject/${petPostId}`);
    return res.data;
  } catch (error) {
    return reject(error);
  }
}
