import { createSlice } from "@reduxjs/toolkit";

// ✅ Load favorites from localStorage (if any)
const initialFavorites = JSON.parse(localStorage.getItem("favorites")) || [];

const favouritesSlice = createSlice({
  name: "favorites",
  initialState: initialFavorites,
  reducers: {
    // ❤️ Add to favorites
    pushFavourites: (state, action) => {
      const exists = state.find((item) => item.id === action.payload.id);
      if (!exists) {
        state.push(action.payload);
        localStorage.setItem("favorites", JSON.stringify(state));
      }
    },

    // 💔 Remove favorite item
    removeFavourite: (state, action) => {
      const updated = state.filter((item) => item.id !== action.payload);
      localStorage.setItem("favorites", JSON.stringify(updated));
      return updated;
    },

    // 🧹 Clear all favorites
    clearFavourites: () => {
      localStorage.removeItem("favorites");
      return [];
    },
  },
});

export const { pushFavourites, removeFavourite, clearFavourites } =
  favouritesSlice.actions;

export default favouritesSlice.reducer;
