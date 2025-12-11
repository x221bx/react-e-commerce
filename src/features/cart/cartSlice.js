// src/features/cart/cartSlice.js
import { createSlice } from "@reduxjs/toolkit";
import { ensureProductLocalization } from "../../utils/productLocalization";

// Pick saved cart for current user (if logged in) or guest key
const getCurrentUserId = () => {
  try {
    const authUser = JSON.parse(localStorage.getItem("authUser") || "null");
    return authUser?.uid || null;
  } catch {
    return null;
  }
};

const getCartStorageKey = () => {
  const uid = getCurrentUserId();
  return uid ? `cartItems_${uid}` : "cartItems";
};

const rawSavedCart = JSON.parse(localStorage.getItem(getCartStorageKey()) || "[]");
const normalizeList = (items = []) =>
  Array.isArray(items)
    ? items.map((item) => ensureProductLocalization({ ...(item || {}) }))
    : [];

// Deep clone initial cart items to prevent reference sharing with favorites
const savedCart = Array.isArray(rawSavedCart)
  ? normalizeList(rawSavedCart).map((item) => JSON.parse(JSON.stringify(item)))
  : [];

const cartSlice = createSlice({
  name: "cart",
  initialState: {
    items: savedCart,
  },

  reducers: {
    addToCart: (state, action) => {
      const product = ensureProductLocalization(action.payload);

      // store a deep-cloned product to avoid retaining references
      const prod = JSON.parse(JSON.stringify(product || {}));
      prod.name = prod.name || prod.titleEn || prod.titleAr || prod.title || prod.productName;

      const exists = state.items.find((i) => i.id === prod.id);

      if (exists) {
        if (exists.quantity < (exists.stock || Infinity)) {
          exists.quantity += 1;
          exists.maxReached = false;
        } else {
          exists.maxReached = true;
        }
      } else {
        state.items.push({
          ...prod,
          quantity: 1,
          maxReached: false,
        });
      }

      // persist to user-specific key when logged in, otherwise guest key
      try {
        localStorage.setItem(getCartStorageKey(), JSON.stringify(state.items));
      } catch (e) {
        console.warn("Failed to persist cart to localStorage", e);
      }
    },

    decreaseQuantity: (state, action) => {
      const item = state.items.find((i) => i.id === action.payload);
      if (item && item.quantity > 1) {
        item.quantity -= 1;
        item.maxReached = false;
      }
      try {
        localStorage.setItem(getCartStorageKey(), JSON.stringify(state.items));
      } catch (e) {
        console.warn("Failed to persist cart to localStorage", e);
      }
    },

    removeFromCart: (state, action) => {
      state.items = state.items.filter((i) => i.id !== action.payload);
      try {
        localStorage.setItem(getCartStorageKey(), JSON.stringify(state.items));
      } catch (e) {
        console.warn("Failed to persist cart to localStorage", e);
      }
    },

    clearCart: (state) => {
      // Clear guest cart and current in-memory cart; do NOT remove user-specific storage
      state.items = [];
      try {
        const uid = getCurrentUserId();
        if (!uid) {
          // guest clear
          localStorage.setItem("cartItems", "[]");
        } else {
          // do not wipe user cart on clearCart (preserve persisted cart)
        }
      } catch (e) {
        console.warn("Failed to update cart storage", e);
      }
    },

    // Clear only in-memory cart without removing persisted per-user cart
    clearCartLocal: (state) => {
      state.items = [];
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

        const normalized = ensureProductLocalization(prod);

        return {
          ...item,
          stock: normalized.stock ?? normalized.quantity ?? 0,
          titleEn: normalized.titleEn,
          titleAr: normalized.titleAr,
          nameEn: normalized.nameEn,
          nameAr: normalized.nameAr,
          name:
            item.name ||
            normalized.titleEn ||
            normalized.titleAr ||
            normalized.nameEn ||
            normalized.nameAr ||
            normalized.title ||
            normalized.name,
        };
      });

      try {
        localStorage.setItem(getCartStorageKey(), JSON.stringify(state.items));
      } catch (e) {
        console.warn("Failed to persist cart to localStorage", e);
      }
    },

    // 🔥 ضروري علشان الميدلواير
    setCartItems: (state, action) => {
      // Deep clone to avoid reference sharing with favorites
      state.items = Array.isArray(action.payload)
        ? action.payload.map(item => JSON.parse(JSON.stringify(item)))
        : [];
      try {
        localStorage.setItem(getCartStorageKey(), JSON.stringify(state.items));
      } catch (e) {
        console.warn("Failed to persist cart to localStorage", e);
      }
    },
  },
});

export const {
  addToCart,
  decreaseQuantity,
  removeFromCart,
  clearCart,
  clearCartLocal,
  finalizeOrderLocal,
  updateCartStock,
  setCartItems,
} = cartSlice.actions;

export default cartSlice.reducer;
