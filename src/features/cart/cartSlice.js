import { createSlice } from "@reduxjs/toolkit";

// 🛒 Load existing cart (if any)
const savedCart = JSON.parse(localStorage.getItem("cartItems") || "[]");

const cartSlice = createSlice({
  name: "cart",
  initialState: {
    items: savedCart,
  },

  reducers: {
    addToCart: (state, action) => {
      const product = action.payload;

      // 🔍 Check if item exists in cart
      const exists = state.items.find((i) => i.id === product.id);

      if (exists) {
        // 👉 لو موجود: زوّد الكمية فقط
        exists.quantity = (exists.quantity || 1) + 1;
      } else {
        // 👉 لو جديد: أضِفه مع quantity = 1
        state.items.push({
          ...product,
          quantity: 1,
        });
      }

      localStorage.setItem("cartItems", JSON.stringify(state.items));
    },

    removeFromCart: (state, action) => {
      // لو عايز تشيل منتج بالكامل
      state.items = state.items.filter((i) => i.id !== action.payload);
      localStorage.setItem("cartItems", JSON.stringify(state.items));
    },

    decreaseQuantity: (state, action) => {
      const id = action.payload;
      const item = state.items.find((i) => i.id === id);

      if (item) {
        if (item.quantity > 1) {
          item.quantity -= 1;
        } else {
          // لو وصلت 1 وقلّلت → اشيله
          state.items = state.items.filter((i) => i.id !== id);
        }
      }

      localStorage.setItem("cartItems", JSON.stringify(state.items));
    },

    clearCart: (state) => {
      state.items = [];
      localStorage.setItem("cartItems", JSON.stringify([]));
    },
  },
});

// Export actions
export const { addToCart, removeFromCart, clearCart, decreaseQuantity } =
  cartSlice.actions;

export default cartSlice.reducer;
