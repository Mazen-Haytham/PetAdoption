// src/store/usePetStore.js

import { create } from "zustand";
import axios from "axios";

const BASE_URL = "https://localhost:7081/api";

function getToken() {
  return localStorage.getItem("token");
}

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
   * @param {Object} petData - Fields matching CreatePetDto
   * @param {string}   petData.name
   * @param {number}   petData.age
   * @param {string}   petData.breed
   * @param {string}   petData.location
   * @param {string}   petData.type
   * @param {string}   petData.description
   * @param {string}   petData.healthStatus
   * @param {File[]}   petData.images        - Array of File objects (at least 1 required)
   */
  createPetPost: async (petData) => {
    set({ isCreating: true, createError: null, createSuccess: false, createdPet: null });

    try {
      // Build FormData — backend expects multipart/form-data
      const formData = new FormData();
      formData.append("name", petData.name);
      formData.append("age", petData.age);
      formData.append("breed", petData.breed);
      formData.append("gender", petData.gender);
      formData.append("location", petData.location);
      formData.append("type", petData.type);
      formData.append("description", petData.description ?? "");
      formData.append("healthStatus", petData.healthStatus ?? "");

      if (!petData.images || petData.images.length === 0) {
        throw new Error("At least one image is required.");
      }

      petData.images.forEach((file) => {
        formData.append("images", file); // key must match the C# property name
      });

      const response = await axios.post(`${BASE_URL}/pets`, formData, {
        headers: {
          // Do NOT set Content-Type manually — axios sets the correct
          // multipart boundary automatically when FormData is the body.
          Authorization: `Bearer ${getToken()}`,
        },
      });

      // Controller returns 201 with { Id, Name, Breed, Age, Location, Type, Status, CreatedAt }
      set({
        createdPet: response.data,
        isCreating: false,
        createSuccess: true,
      });

      return { success: true, data: response.data };
    } catch (error) {
      const message =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.message ||
        "Failed to create pet post.";

      set({ createError: message, isCreating: false, createSuccess: false });

      return { success: false, error: message };
    }
  },

  // Reset create state (call this when unmounting the form or after navigation)
  resetCreateState: () =>
    set({
      createdPet: null,
      isCreating: false,
      createError: null,
      createSuccess: false,
    }),
}));

export default usePetStore;