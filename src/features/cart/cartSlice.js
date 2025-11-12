import { createSlice } from "@reduxjs/toolkit";

const savedCart = JSON.parse(localStorage.getItem("cartItems") || "[]");

const cartSlice = createSlice({
  name: "cart",
  initialState: {
    items: savedCart,
  },
  reducers: {
    addToCart: (state, action) => {
      const exists = state.items.find((i) => i.id === action.payload.id);
      if (!exists) state.items.push(action.payload);
      localStorage.setItem("cartItems", JSON.stringify(state.items));
    },
    removeFromCart: (state, action) => {
      state.items = state.items.filter((i) => i.id !== action.payload);
      localStorage.setItem("cartItems", JSON.stringify(state.items));
    },
    clearCart: (state) => {
      state.items = [];
      localStorage.setItem("cartItems", JSON.stringify([]));
    },
  },
});
// Export actions & reducer
export const { addToCart, removeFromCart, clearCart } = cartSlice.actions;
export default cartSlice.reducer;
