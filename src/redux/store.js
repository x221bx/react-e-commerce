import { configureStore } from "@reduxjs/toolkit";
import auth from "../features/auth/authSlice";
import cart from "../features/cart/cartSlice";
import favorites from "../features/favorites/favoritesSlice";
import notificationsReducer from "../features/notifications/notificationsSlice";
import ordersSlice from "../features/orders/ordersSlice";
import { listenerMiddleware, startAuthListener } from "./listenerMiddleware";

export const store = configureStore({
  reducer: {
    auth,
    cart,
    favorites,
    notifications: notificationsReducer,
    ordersSlice,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }).concat(listenerMiddleware.middleware),
});

startAuthListener(store);
