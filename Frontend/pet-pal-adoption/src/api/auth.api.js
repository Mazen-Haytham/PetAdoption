import api from "./api";

export async function register(name, email, password, role) {
  try {
    const res = await api.post("/auth/register", { name, email, password, role });
    return res.status;
  } catch (error) {
    return Promise.reject(error.response ? error.response.data : error.message);
  }
}

export async function login(email, password) {
  try {
    const res = await api.post("/auth/login", { email, password });
    return  res.data;
  } catch (error) {
    return Promise.reject(error.response ? error.response.data : error.message);
  }
}