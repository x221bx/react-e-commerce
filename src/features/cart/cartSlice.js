import { createSlice } from "@reduxjs/toolkit";
import { db } from "../../services/firebase";
import { doc, updateDoc, increment } from "firebase/firestore";

const savedCart = JSON.parse(localStorage.getItem("cartItems") || "[]");

const cartSlice = createSlice({
  name: "cart",
  initialState: {
    items: savedCart,
  },

  reducers: {
    addToCart: (state, action) => {
      const product = action.payload;
      const exists = state.items.find((i) => i.id === product.id);

      if (exists) {
        if ((exists.quantity || 1) < (product.stock || Infinity)) {
          exists.quantity = (exists.quantity || 1) + 1;
          exists.maxReached = false;
        } else {
          exists.maxReached = true;
        }
      } else {
        state.items.push({
          ...product,
          quantity: 1,
          maxReached: false,
        });
      }

      localStorage.setItem("cartItems", JSON.stringify(state.items));
    },

    decreaseQuantity: (state, action) => {
      const id = action.payload;
      const item = state.items.find((i) => i.id === id);
      if (item && item.quantity > 1) {
        item.quantity -= 1;
        item.maxReached = false;
      }
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

    // 🔹 Sync stock in Firestore
    syncStock: (state, action) => {
      const { id, change } = action.payload;
      const item = state.items.find((i) => i.id === id);
      if (item) {
        const ref = doc(db, "products", item.id);
        const newStock = (item.stock || 0) - change; // خصم أو زيادة
        updateDoc(ref, { quantity: Math.max(0, newStock) }).catch(
          console.error
        );
        item.stock = Math.max(0, newStock);
      }
    },
  },
});

export const {
  addToCart,
  decreaseQuantity,
  removeFromCart,
  clearCart,
  syncStock,
} = cartSlice.actions;

export default cartSlice.reducer;
