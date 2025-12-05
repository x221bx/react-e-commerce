// src/features/favorites/favoritesSlice.js
import { createSlice } from "@reduxjs/toolkit";
import { saveUserFavorites } from "../../services/userDataService";

// Helper function to get user-specific favorites key
const getFavoritesKey = (userId) => {
  if (!userId) return "favoritesItems";
  return `favoritesItems_${userId}`;
};

// Get current user from localStorage (temporary solution until we have proper auth state)
const getCurrentUserId = () => {
  try {
    const authUser = JSON.parse(localStorage.getItem("authUser") || "null");
    return authUser?.uid || null;
  } catch {
    return null;
  }
};

const currentUserId = getCurrentUserId();
const rawInitialFavorites = JSON.parse(
  localStorage.getItem(getFavoritesKey(currentUserId)) || "[]"
);

// Deep clone initial favorites to prevent reference sharing with cart
const initialFavorites = Array.isArray(rawInitialFavorites)
  ? rawInitialFavorites.map(item => JSON.parse(JSON.stringify(item)))
  : [];

const favouritesSlice = createSlice({
  name: "favorites",
  initialState: {
    items: initialFavorites,
    userId: currentUserId,
  },
  reducers: {
    setUser: (state, action) => {
      state.userId = action.payload?.uid || null;
      state.loading = true;
    },

    setFavoritesItems: (state, action) => {
      // Deep clone to avoid reference sharing with cart
      state.items = Array.isArray(action.payload) 
        ? action.payload.map(item => JSON.parse(JSON.stringify(item)))
        : [];
      state.loading = false;
    },

    clearUserData: (state) => {
      state.items = [];
      state.userId = null;
      state.loading = false;
    },

    toggleFavourite: (state, action) => {
      const payload = action.payload || {};
      const productId = String(payload?.id || '');

      // Check if already in favorites by id only
      const exists = state.items.find((item) => String(item?.id) === productId);

      if (exists) {
        // Remove from favorites
        state.items = state.items.filter((i) => String(i?.id) !== productId);
      } else {
        // Add to favorites with a deep clone to avoid reference sharing
        const fav = JSON.parse(JSON.stringify(payload));
        state.items = [...state.items, fav];
      }

      // Persist to user-specific localStorage key
      const key = getFavoritesKey(state.userId);
      try {
        localStorage.setItem(key, JSON.stringify(state.items));
      } catch (e) {
        console.warn("Failed to persist favorites to localStorage", e);
      }

      // Save to Firebase (best-effort)
      if (state.userId) {
        saveUserFavorites(state.userId, state.items).catch(console.error);
      }
    },

    clearFavourites: (state) => {
      state.items = [];

      // Persist to localStorage
      const key = getFavoritesKey(state.userId);
      try {
        localStorage.setItem(key, JSON.stringify([]));
      } catch (e) {
        console.warn("Failed to persist favorites to localStorage", e);
      }

      // Clear from Firebase
      if (state.userId) {
        saveUserFavorites(state.userId, []).catch(console.error);
      }
    },
  },
});

export const {
  setUser,
  clearUserData,
  setFavoritesItems,
  toggleFavourite,
  clearFavourites,
} = favouritesSlice.actions;
export default favouritesSlice.reducer;
