// src/api/api.js

const BASE_URL = "https://localhost:7081/api";

// ─── Helpers ────────────────────────────────────────────────

function getToken() {
  return localStorage.getItem("token");
}

function authHeaders() {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${getToken()}`,
  };
}

async function handleResponse(res) {
  if (res.status === 204) return; 
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || res.statusText || "Something went wrong.");
  return data;
}

// ─── Auth ────────────────────────────────────────────────────

export async function register(name, email, password, role) {
  const res = await fetch(`${BASE_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, email, password, role }),
  });
  return handleResponse(res);
  // returns { user: { name, email, role, userFavourites } }
}

export async function login(email, password) {
  const res = await fetch(`${BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const data = await handleResponse(res);
  // backend returns { tokenResponse: { accessToken, refreshToken }, user: { userId, name, email, role, userFavourites } }

  const accessToken = data?.tokenResponse?.accessToken ?? data?.tokenResponse?.AccessToken;
  if (accessToken) localStorage.setItem("token", accessToken);
  if (data?.user) localStorage.setItem("user", JSON.stringify(data.user));

  return {
    user: data?.user ?? null,
    token: accessToken ?? null,
    tokenResponse: data?.tokenResponse ?? null,
  };
}

export function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
}

export function getCurrentUser() {
  const user = localStorage.getItem("user");
  try {
  return user ? JSON.parse(user) : null;
} catch {
  return null;
}
}

// ─── Adoptions (Requests) ─────────────────────────────────────

export async function getMyAdoptionRequests() {
  const res = await fetch(`${BASE_URL}/adoptions/my`, {
    method: "GET",
    headers: authHeaders(),
  });
  const json = await handleResponse(res);
  return json?.data ?? [];
}

export async function getAdoptionHistory() {
  const res = await fetch(`${BASE_URL}/adoptions/history`, {
    method: "GET",
    headers: authHeaders(),
  });
  const json = await handleResponse(res);
  return json?.data ?? [];
}

// ─── Admin ───────────────────────────────────────────────────

export async function updateUserStatus(userId, decision) {
  // decision: "approve" | "reject"
  const res = await fetch(`${BASE_URL}/auth/users/${userId}/status`, {
    method: "PATCH",
    headers: authHeaders(),
    body: JSON.stringify({ decision }),
  });

  if (res.status === 204) return; // No Content → success
  return handleResponse(res);
}