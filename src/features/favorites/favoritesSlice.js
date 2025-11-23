import { createSlice } from "@reduxjs/toolkit";
import { saveUserFavorites } from "../../services/userDataService";

// Helper function to get user-specific favorites key
const getFavoritesKey = (userId) => userId ? `favorites_${userId}` : "favorites";

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
const initialFavorites = JSON.parse(localStorage.getItem(getFavoritesKey(currentUserId)) || "[]");

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
      state.items = action.payload;
      state.loading = false;
    },

    clearUserData: (state) => {
      state.items = [];
      state.userId = null;
      state.loading = false;
    },

    toggleFavourite: (state, action) => {
      const exists = state.items.find((item) => item.id === action.payload.id);

      if (exists) {
        // remove
        state.items = state.items.filter((i) => i.id !== action.payload.id);
      } else {
        // add
        state.items = [...state.items, action.payload];
      }

      // Save to Firebase
      if (state.userId) {
        saveUserFavorites(state.userId, state.items).catch(console.error);
      }
    },

    clearFavourites: (state) => {
      state.items = [];

      // Clear from Firebase
      if (state.userId) {
        saveUserFavorites(state.userId, []).catch(console.error);
      }
    },
  },
});

export const { setUser, clearUserData, setFavoritesItems, toggleFavourite, clearFavourites } = favouritesSlice.actions;
export default favouritesSlice.reducer;
