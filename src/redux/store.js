import { configureStore } from "@reduxjs/toolkit";
import auth from "../features/auth/authSlice";
import { listenerMiddleware, startAuthListener } from "./listenerMiddleware";

export const store = configureStore({
  reducer: {
    auth,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(listenerMiddleware.middleware),
});

startAuthListener(store);
