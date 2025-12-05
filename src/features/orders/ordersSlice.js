// src/features/orders/ordersSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  collection,
  getDocs,
  doc,
  updateDoc,
  arrayUnion,
  orderBy,
  query,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../../services/firebase";

// ✅ Helper: يحوّل أي Firestore Timestamp إلى string
const convertTimestamps = (obj) => {
  if (!obj || typeof obj !== "object") return obj;
  if (obj.toDate) return obj.toDate().toISOString(); // Firestore Timestamp
  const newObj = Array.isArray(obj) ? [] : {};
  for (const key in obj) {
    newObj[key] = convertTimestamps(obj[key]);
  }
  return newObj;
};

// 🔹 Get All Orders Once
export const fetchOrdersOnce = createAsyncThunk(
  "orders/fetchOrdersOnce",
  async (_, { rejectWithValue }) => {
    try {
      const q = query(collection(db, "orders"), orderBy("createdAt", "desc"));
      const snap = await getDocs(q);
      const list = snap.docs.map((d) => {
        const data = convertTimestamps(d.data());
        return { id: d.id, ...data };
      });
      return list;
    } catch (err) {
      return rejectWithValue(err.message || "Failed to fetch orders");
    }
  }
);

// 🔹 Update Order Status on Server
export const updateOrderStatusOnServer = createAsyncThunk(
  "orders/updateOrderStatusOnServer",
  async ({ orderId, newStatus }, { rejectWithValue }) => {
    try {
      const orderRef = doc(db, "orders", orderId);

      await updateDoc(orderRef, {
        status: newStatus,
        statusHistory: arrayUnion({
          status: newStatus,
          changedAt: new Date().toISOString(),
        }),
        updatedAt: serverTimestamp(),
      });

      return { orderId, newStatus, changedAt: new Date().toISOString() };
    } catch (err) {
      return rejectWithValue(err.message || "Failed to update status");
    }
  }
);

// 🔹 Slice
const ordersSlice = createSlice({
  name: "orders",
  initialState: {
    items: [],
    loading: false,
    error: null,
  },
  reducers: {
    setOrders(state, action) {
      // تنظيف أي Timestamp حتى لو دخل من dispatch خارجي
      state.items = convertTimestamps(action.payload);
    },
    setLoading(state, action) {
      state.loading = action.payload;
    },
    setError(state, action) {
      state.error = action.payload;
    },
    updateOrderLocal(state, action) {
      const { orderId, newStatus, changedAt } = action.payload;
      const idx = state.items.findIndex((o) => o.id === orderId);
      if (idx !== -1) {
        state.items[idx].status = newStatus;
        if (!Array.isArray(state.items[idx].statusHistory))
          state.items[idx].statusHistory = [];
        state.items[idx].statusHistory.push({ status: newStatus, changedAt });
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchOrdersOnce.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOrdersOnce.fulfilled, (state, action) => {
        state.loading = false;
        state.items = convertTimestamps(action.payload);
      })
      .addCase(fetchOrdersOnce.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error.message;
      })
      .addCase(updateOrderStatusOnServer.rejected, (state, action) => {
        state.error = action.payload || action.error.message;
      });
  },
});

export const { setOrders, setLoading, setError, updateOrderLocal } =
  ordersSlice.actions;

export default ordersSlice.reducer;
