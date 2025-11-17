// src/features/notifications/notificationsSlice.js
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  items: [], // { id, title, body, type, createdAtMs, read, meta? }
  unreadCount: 0,
  open: false,
};

const notificationsSlice = createSlice({
  name: "notifications",
  initialState,
  reducers: {
    setNotifications(state, action) {
      state.items = action.payload;
      state.unreadCount = state.items.filter((i) => !i.read).length;
    },
    addNotification(state, action) {
      state.items.unshift(action.payload);
      state.unreadCount = state.items.filter((i) => !i.read).length;
    },
    markAllRead(state) {
      state.items = state.items.map((i) => ({ ...i, read: true }));
      state.unreadCount = 0;
    },
    markReadById(state, action) {
      const id = action.payload;
      const idx = state.items.findIndex((i) => i.id === id);
      if (idx !== -1) state.items[idx].read = true;
      state.unreadCount = state.items.filter((i) => !i.read).length;
    },
    setOpen(state, action) {
      state.open = !!action.payload;
    },
    clearNotifications(state) {
      state.items = [];
      state.unreadCount = 0;
    },
  },
});

export const {
  setNotifications,
  addNotification,
  markAllRead,
  markReadById,
  setOpen,
  clearNotifications,
} = notificationsSlice.actions;

export default notificationsSlice.reducer;
