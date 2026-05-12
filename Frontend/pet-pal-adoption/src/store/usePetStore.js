// src/store/usePetStore.js

import { create } from "zustand";
import api, {
  createAdoptionRequest,
  getAvailablePetPosts,
  searchPetPosts, // ← ADD
} from "../api/api";





const usePetStore = create((set) => ({
  // ── State ──────────────────────────────────────────────────
  createdPet: null,
  isCreating: false,
  createError: null,
  createSuccess: false,

  // ── Actions ────────────────────────────────────────────────

  /**
   * Create a new pet post.
   *
   * @param {Object} petData
   * @param {string}   petData.name
   * @param {number}   petData.age
   * @param {string}   petData.breed
   * @param {string}   petData.gender
   * @param {string}   petData.location
   * @param {string}   petData.type
   * @param {string}   petData.gender
   * @param {string}   petData.description
   * @param {string}   petData.healthStatus  - comma-separated string
   * @param {File[]}   petData.images        - at least 1 required
   */
  createPetPost: async (petData) => {
    set({ isCreating: true, createError: null, createSuccess: false, createdPet: null });

    try {
      // Build FormData — backend expects multipart/form-data
      const formData = new FormData();
      formData.append("name",         petData.name);
      formData.append("age",          petData.age);
      formData.append("breed",        petData.breed);
      formData.append("gender",       petData.gender);
      formData.append("location",     petData.location);
      formData.append("type",         petData.type);
      formData.append("gender",         petData.gender);
      formData.append("description",  petData.description ?? "");
      formData.append("healthStatus", petData.healthStatus ?? "");

      if (!petData.images || petData.images.length === 0) {
        throw new Error("At least one image is required.");
      }

      petData.images.forEach((file) => {
        formData.append("images", file);
      });

      // api instance automatically:
      //   - attaches Bearer token via request interceptor
      //   - retries once with refreshed token on 401
      //   - redirects to /unauthorized on 403
      // Do NOT set Content-Type — axios sets multipart boundary automatically with FormData
      const response = await api.post("/pets", formData);

      // Controller returns 201 { Id, Name, Breed, Age, Location, Type, Status, CreatedAt }
      set({ createdPet: response.data, isCreating: false, createSuccess: true });

      return { success: true, data: response.data };

    } catch (error) {
      // api interceptor normalises errors to response.data or message string
      const message =
        error?.message ||
        error?.title ||
        "Failed to create pet post.";

      set({ createError: message, isCreating: false, createSuccess: false });

      return { success: false, error: message };
    }
  },

  // ── Search ──────────────────────────────────────
isSearching: false,
searchError: null,

searchPets: async (filter) => {
  set({ browseLoading: true, browseError: null })
  try {
    const list = await searchPetPosts(filter)
    set({ browsePets: Array.isArray(list) ? list : [], browseLoading: false })
  } catch (error) {
    const msg = typeof error === 'string'
      ? error : error?.message || 'Search failed.'
    set({ browseError: msg, browseLoading: false })
  }
},

  // Reset when unmounting the form or after navigation
  resetCreateState: () =>
    set({
      createdPet: null,
      isCreating: false,
      createError: null,
      createSuccess: false,
    }),

  // ========== Adopter home (/adopter) — browse + request adoption ==========
  browsePets: [],
  browseLoading: false,
  browseError: null,
  adoptSubmitting: false,
  adoptError: null,

  fetchBrowsePets: async () => {
    set({ browseLoading: true, browseError: null });
    try {
      const list = await getAvailablePetPosts();
      set({ browsePets: Array.isArray(list) ? list : [], browseLoading: false });
    } catch (error) {
      const msg =
        typeof error === "string"
          ? error
          : error?.message || "Could not load pets.";
      set({ browseError: msg, browseLoading: false });
    }
  },

  submitAdoptionRequest: async (petPostId, message) => {
    set({ adoptSubmitting: true, adoptError: null });
    try {
      const data = await createAdoptionRequest(petPostId, message);
      set({ adoptSubmitting: false });
      return { ok: true, data };
    } catch (error) {
      const msg =
        typeof error === "string"
          ? error
          : error?.message || "Request failed.";
      set({ adoptError: msg, adoptSubmitting: false });
      return { ok: false, error: msg };
    }
  },

  clearAdoptError: () => set({ adoptError: null }),
}));





export default usePetStore;
