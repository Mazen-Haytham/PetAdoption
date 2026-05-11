import { create } from "zustand";
import * as adminApi from "../api/Admin.api";
import { DASHBOARD_PETS_QUERY, DEFAULT_PETS_QUERY } from "../admin/adminConstants";
import { adminApprovalRequestId, apiErrorMessage } from "../admin/adminHelpers";

/**
 * All admin UI reads/writes here (one store = easy to find).
 *
 * Blocks:
 * 1) Dashboard — load users + many pets for stats
 * 2) Users     — list + approve/reject
 * 3) Pets      — list + approve/reject + SignalR refresh uses lastPetsQuery
 * 4) Bell      — new post counter for SignalR
 */
export default create((set, get) => ({
  // --- Dashboard ---
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

  // --- Users ---
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

  // --- Pets ---
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
          adminApprovalRequestId(p) === approvalRequestId
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
          adminApprovalRequestId(p) === approvalRequestId
            ? { ...p, status: "Rejected" }
            : p,
        ),
      }));
    } catch (err) {
      set({ petsError: apiErrorMessage(err) });
    }
  },

  // --- SignalR (new owner post) ---
  newPostNotificationCount: 0,

  bumpNewPostNotification() {
    set((s) => ({ newPostNotificationCount: s.newPostNotificationCount + 1 }));
  },

  clearNewPostNotifications() {
    set({ newPostNotificationCount: 0 });
  },

  async refreshPetsAfterHubEvent() {
    const q = get().lastPetsQuery ?? DEFAULT_PETS_QUERY;
    try {
      const pets = await adminApi.getAdminPets(q);
      set({ pets });
    } catch {
      /* leave list as-is */
    }
  },
}));
