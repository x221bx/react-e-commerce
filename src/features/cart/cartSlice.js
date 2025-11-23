import { createSlice } from "@reduxjs/toolkit";
import { saveUserCart, getUserCart, subscribeToUserCart } from "../../services/userDataService";
import { doc, updateDoc } from "firebase/firestore";

const cartSlice = createSlice({
  name: "cart",
  initialState: {
    items: [],
    userId: null,
    loading: false,
  },

  reducers: {
    setUser: (state, action) => {
      state.userId = action.payload?.uid || null;
      state.loading = true;
    },

    setCartItems: (state, action) => {
      state.items = action.payload;
      state.loading = false;
    },

    clearUserData: (state) => {
      state.items = [];
      state.userId = null;
      state.loading = false;
    },

    addToCart: (state, action) => {
      const product = action.payload;

      // 🧼 تنظيف المنتج قبل دخوله Redux
      const safeProduct = { ...product };
      if (safeProduct.createdAt?.seconds) {
        safeProduct.createdAt = safeProduct.createdAt.seconds * 1000;
      }
      if (safeProduct.updatedAt?.seconds) {
        safeProduct.updatedAt = safeProduct.updatedAt.seconds * 1000;
      }

      const exists = state.items.find((i) => i.id === safeProduct.id);

      if (exists) {
        if ((exists.quantity || 1) < (safeProduct.stock || Infinity)) {
          exists.quantity = (exists.quantity || 1) + 1;
          exists.maxReached = false;
        } else {
          exists.maxReached = true;
        }
      } else {
        state.items.push({
          ...safeProduct,
          quantity: 1,
          maxReached: false,
        });
      }

      // Save to Firebase
      if (state.userId) {
        saveUserCart(state.userId, state.items).catch(console.error);
      }
    },

    decreaseQuantity: (state, action) => {
      const item = state.items.find((i) => i.id === action.payload);
      if (item && item.quantity > 1) {
        item.quantity -= 1;
        item.maxReached = false;
      }

      // Save to Firebase
      if (state.userId) {
        saveUserCart(state.userId, state.items).catch(console.error);
      }
    },

    removeFromCart: (state, action) => {
      state.items = state.items.filter((i) => i.id !== action.payload);

      // Save to Firebase
      if (state.userId) {
        saveUserCart(state.userId, state.items).catch(console.error);
      }
    },

    clearCart: (state) => {
      state.items = [];

      // Save to Firebase
      if (state.userId) {
        saveUserCart(state.userId, []).catch(console.error);
      }
    },

    syncStock: (state, action) => {
      const { id, change } = action.payload;
      const item = state.items.find((i) => i.id === id);
      if (item) {
        const ref = doc(db, "products", item.id);
        const newStock = (item.stock || 0) - change;
        updateDoc(ref, { quantity: Math.max(0, newStock) }).catch(console.error);
        item.stock = Math.max(0, newStock);
      }
    },
  },
});

export const {
  setUser,
  setCartItems,
  clearUserData,
  addToCart,
  decreaseQuantity,
  removeFromCart,
  clearCart,
  finalizeOrderLocal,
  updateCartStock,
} = cartSlice.actions;

export default cartSlice.reducer;
