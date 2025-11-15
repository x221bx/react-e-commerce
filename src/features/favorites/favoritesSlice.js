import { createSlice } from "@reduxjs/toolkit";

const initialFavorites = JSON.parse(localStorage.getItem("favorites") || "[]");

const favouritesSlice = createSlice({
  name: "favorites",
  initialState: initialFavorites,
  reducers: {
    toggleFavourite: (state, action) => {
      const exists = state.find((item) => item.id === action.payload.id);

      if (exists) {
        // remove
        const updated = state.filter((i) => i.id !== action.payload.id);
        localStorage.setItem("favorites", JSON.stringify(updated));
        return updated;
      } else {
        // add
        const updated = [...state, action.payload];
        localStorage.setItem("favorites", JSON.stringify(updated));
        return updated;
      }
    },

    clearFavourites: () => {
      localStorage.removeItem("favorites");
      return [];
    },
  },
});

export const { toggleFavourite, clearFavourites } = favouritesSlice.actions;
export default favouritesSlice.reducer;
