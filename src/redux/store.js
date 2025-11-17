import { configureStore } from "@reduxjs/toolkit";
import auth from "../features/auth/authSlice";
import { listenerMiddleware, startAuthListener } from "./listenerMiddleware";
import cart from "../features/cart/cartSlice";
import favorites from "../features/favorites/favoritesSlice";
import notificationsReducer from "../features/notifications/notificationsSlice";
export const store = configureStore({
  reducer: {
    auth,
    cart,
    favorites,
    notifications: notificationsReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(listenerMiddleware.middleware),
});

startAuthListener(store);
