import { create } from "zustand";
import * as adminApi from "../api/Admin.api";
import {
  apiErrorMessage,
  DASHBOARD_PETS_QUERY,
  DEFAULT_PETS_QUERY,
  sameModerationRequestId,
} from "../admin/adminShared";

function newId() {
  return typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

/**
 * All admin UI state + server calls.
 * Notifications = list from SignalR (bell panel reads this).
 */
export default create((set, get) => ({
  dashboardLoading: false,
  dashboardError: null,

  async loadDashboardData() {
    set({ dashboardLoading: true, dashboardError: null });
    try {
      const [users, pets] = await Promise.all([
        adminApi.getAdminUsersAll(),
        adminApi.getAdminPets(DASHBOARD_PETS_QUERY),
      ]);
      set({
        users,
        pets,
        dashboardLoading: false,
        usersLoading: false,
        petsLoading: false,
        lastPetsQuery: DASHBOARD_PETS_QUERY,
      });
    } catch (err) {
      set({ dashboardError: apiErrorMessage(err), dashboardLoading: false });
    }
  },

  users: [],
  usersLoading: false,
  usersError: null,

  async fetchUsers() {
    set({ usersLoading: true, usersError: null });
    try {
      const users = await adminApi.getAdminUsersAll();
      set({ users, usersLoading: false });
    } catch (err) {
      set({ usersError: apiErrorMessage(err), usersLoading: false });
    }
  },

  async approveUser(id) {
    try {
      await adminApi.putAdminUserApprove(id);
      set((s) => ({
        users: s.users.map((u) => (u.id === id ? { ...u, status: "Approved" } : u)),
      }));
    } catch (err) {
      set({ usersError: apiErrorMessage(err) });
    }
  },

  async rejectUser(id) {
    try {
      await adminApi.putAdminUserReject(id);
      set((s) => ({
        users: s.users.map((u) => (u.id === id ? { ...u, status: "Rejected" } : u)),
      }));
    } catch (err) {
      set({ usersError: apiErrorMessage(err) });
    }
  },

  pets: [],
  petsLoading: false,
  petsError: null,
  lastPetsQuery: { ...DEFAULT_PETS_QUERY },

  async fetchPets(options = {}) {
    const q = {
      status: options.status ?? "",
      page: options.page ?? 1,
      pageSize: options.pageSize ?? DEFAULT_PETS_QUERY.pageSize,
    };
    set({ petsLoading: true, petsError: null, lastPetsQuery: q });
    try {
      const pets = await adminApi.getAdminPets(q);
      set({ pets, petsLoading: false });
    } catch (err) {
      set({ petsError: apiErrorMessage(err), petsLoading: false });
    }
  },

  prependPet(pet) {
    set((s) => ({ pets: [pet, ...s.pets] }));
  },

  async approvePet(approvalRequestId) {
    try {
      await adminApi.putAdminPetApprove(approvalRequestId);
      set((s) => ({
        pets: s.pets.map((p) =>
          sameModerationRequestId(p, approvalRequestId)
            ? { ...p, status: "Approved" }
            : p,
        ),
      }));
    } catch (err) {
      set({ petsError: apiErrorMessage(err) });
    }
  },

  async rejectPet(approvalRequestId) {
    try {
      await adminApi.putAdminPetReject(approvalRequestId);
      set((s) => ({
        pets: s.pets.map((p) =>
          sameModerationRequestId(p, approvalRequestId)
            ? { ...p, status: "Rejected" }
            : p,
        ),
      }));
    } catch (err) {
      set({ petsError: apiErrorMessage(err) });
    }
  },

  /** New posts from SignalR — shown in the bell panel (max 10). */
  postNotifications: [],

  bumpNewPostNotification(payload) {
    const message =
      payload?.message ??
      payload?.Message ??
      "New pet post waiting for approval";
    const item = { id: newId(), message, createdAt: Date.now() };
    set((s) => ({
      postNotifications: [item, ...s.postNotifications].slice(0, 10),
    }));
  },

  clearPostNotifications() {
    set({ postNotifications: [] });
  },

  async refreshPetsAfterHubEvent() {
    const q = get().lastPetsQuery ?? DEFAULT_PETS_QUERY;
    try {
      const pets = await adminApi.getAdminPets(q);
      set({ pets });
    } catch {
      /* keep list */
    }
  },
}));
