// src/redux/store.js
import { configureStore } from "@reduxjs/toolkit";
import auth from "../features/auth/authSlice";
import cart from "../features/cart/cartSlice";
import favorites from "../features/favorites/favoritesSlice";
import ordersSlice from "../features/orders/ordersSlice";
import { listenerMiddleware, startAuthListener } from "./listenerMiddleware";

// 🔹 Load cart from localStorage
const savedCart = JSON.parse(localStorage.getItem("cartItems") || "[]");

export const store = configureStore({
  reducer: {
    auth,
    cart,
    favorites,
    ordersSlice,
  },
  preloadedState: {
    cart: { items: savedCart }, // <-- هنا الـ cart هيبدأ بالبيانات المحفوظة
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }).concat(listenerMiddleware.middleware),
});

startAuthListener(store);
