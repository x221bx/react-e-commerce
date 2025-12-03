// src/features/cart/cartSlice.js
import { createSlice } from "@reduxjs/toolkit";

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
        if (exists.quantity < (exists.stock || Infinity)) {
          exists.quantity += 1;
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
      const item = state.items.find((i) => i.id === action.payload);
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
      localStorage.setItem("cartItems", "[]");
    },

    finalizeOrderLocal: (state) => {
      state.items = [];
      localStorage.setItem("cartItems", "[]");
    },

    updateCartStock: (state, action) => {
      const products = action.payload;

      state.items = state.items.map((item) => {
        const prod = products.find((p) => p.id === item.id);
        if (!prod) return item;

        return {
          ...item,
          stock: prod.stock ?? prod.quantity ?? 0,
        };
      });

      localStorage.setItem("cartItems", JSON.stringify(state.items));
    },

    // 🔥 ضروري علشان الميدلواير
    setCartItems: (state, action) => {
      state.items = action.payload || [];
      localStorage.setItem("cartItems", JSON.stringify(state.items));
    },
  },
});

export const {
  addToCart,
  decreaseQuantity,
  removeFromCart,
  clearCart,
  finalizeOrderLocal,
  updateCartStock,
  setCartItems,
} = cartSlice.actions;

export default cartSlice.reducer;
