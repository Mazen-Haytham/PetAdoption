import { create } from "zustand";

const BASE_URL = "https://localhost:7081/api";

function parseJwt(token) {
  try {
    return JSON.parse(atob(token.split(".")[1]));
  } catch {
    return null;
  }
}

const ROLE_CLAIM =
  "http://schemas.microsoft.com/ws/2008/06/identity/claims/role";

export const useAuthStore = create((set) => ({
  accessToken: null,
  role: null,
  isAuthLoading: true,

  setAccessToken: (token) => {
    const payload = parseJwt(token);
    const role = payload?.[ROLE_CLAIM] ?? null;
    set({ accessToken: token, role });
  },

  clearAuth: () => set({ accessToken: null, role: null }),

  initAuth: async () => {
    try {
      const res = await fetch(`${BASE_URL}/auth/refresh-token`, {
        method: "POST",
        credentials: "include", // sends the httpOnly cookie
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!res.ok) {
        const errorData = await res.text();
        console.warn(
          `[authStore] Refresh token failed (${res.status}):`,
          errorData,
        );
        throw new Error(`Refresh failed: ${res.status}`);
      }

      const data = await res.json();
      if (!data.accessToken) {
        throw new Error("No accessToken in refresh response");
      }

      const payload = parseJwt(data.accessToken);
      const role = payload?.[ROLE_CLAIM] ?? null;

      set({ accessToken: data.accessToken, role });
    } catch (error) {
      // cookie missing/expired — treat as logged out, not an error
      console.warn("[authStore] Auth initialization failed:", error.message);
      set({ accessToken: null, role: null });
    } finally {
      set({ isAuthLoading: false });
    }
  },
}));
