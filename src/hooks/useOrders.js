// src/hooks/useOrders.js
import { useState, useEffect, useCallback } from "react";
import {
  collection,
  query,
  orderBy,
  where,
  onSnapshot,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  Timestamp,
  increment,
  writeBatch,
} from "firebase/firestore";
import { db } from "../services/firebase";

const STATUS_FLOW = ["Pending", "Processing", "Shipped", "Delivered"];

/**
 * useOrders hook (admin or user)
 * - provides realtime orders list
 * - offers helpers: fetchOrders, updateOrderStatus, deleteOrder, reduceStock, restoreStock
 */
export default function useOrders(uid = null, isAdmin = false) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const buildQuery = useCallback(() => {
    const ordersRef = collection(db, "orders");
    return isAdmin || !uid
      ? query(ordersRef, orderBy("createdAt", "desc"))
      : query(ordersRef, where("uid", "==", uid), orderBy("createdAt", "desc"));
  }, [uid, isAdmin]);

  const snapshotToOrders = (snapshot) =>
    snapshot.docs.map((d) => {
      const data = d.data() || {};
      return {
        id: d.id,
        ...data,
        // createdAt might be a Firestore Timestamp or string/number — normalize to ISO string for safety
        createdAt:
          data.createdAt && typeof data.createdAt.toDate === "function"
            ? data.createdAt.toDate().toISOString()
            : data.createdAt
            ? new Date(data.createdAt).toISOString()
            : new Date().toISOString(),
      };
    });

  // initial fetch (non-realtime) — useful for manual refresh
  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const q = buildQuery();
      const snapshot = await getDocs(q);
      const newOrders = snapshotToOrders(snapshot);
      setOrders(newOrders);
    } catch (err) {
      console.error("fetchOrders error:", err);
    } finally {
      setLoading(false);
    }
  }, [buildQuery]);

  useEffect(() => {
    setLoading(true);
    const q = buildQuery();
    const unsub = onSnapshot(
      q,
      (snapshot) => {
        setOrders(snapshotToOrders(snapshot));
        setLoading(false);
      },
      (err) => {
        console.error("orders onSnapshot error:", err);
        // fallback: try one-time fetch after error
        fetchOrders();
      }
    );

    return () => unsub();
  }, [buildQuery, fetchOrders]);

  /**
   * reduceStock: decrement product.stock by given items array
   * items: [{ id: string, quantity: number }]
   * uses updateDoc + increment (atomic)
   */
  const reduceStock = async (items) => {
    if (!Array.isArray(items) || items.length === 0) return;
    // use a batch to run writes together (still uses increment which is atomic)
    const batch = writeBatch(db);
    items.forEach((i) => {
      if (!i.id) return;
      const q = Number(i.quantity || 0);
      if (q === 0) return;
      const ref = doc(db, "products", i.id);
      // decrement
      batch.update(ref, { stock: increment(-Math.abs(q)) });
    });
    await batch.commit();
  };

  const restoreStock = async (items) => {
    if (!Array.isArray(items) || items.length === 0) return;
    const batch = writeBatch(db);

    items.forEach((i) => {
      if (!i.id) return;
      const q = Number(i.quantity || 0);
      if (q === 0) return;
      const ref = doc(db, "products", i.id);

      // نستخدم try/catch لكل updateDoc داخل batch مش batch نفسه لأنه atomic
      // لكن writeBatch لا يقبل try/catch لكل عملية، لذا الحل: فقط نستمر بدون عمل أي شيء لو المنتج مش موجود
      batch.update(ref, { stock: increment(Math.abs(q)) });
    });

    try {
      await batch.commit();
    } catch (err) {
      // إذا كان الخطأ بسبب مستند غير موجود، نتجاهله
      if (err.code === "not-found") {
        console.warn("restoreStock: some products not found, skipped");
      } else {
        throw err;
      }
    }
  };

  /**
   * updateOrderStatus
   * - if status becomes "Canceled", optionally restore stock via restoreStockFn
   */
  const updateOrderStatus = async (orderId, newStatus, restoreStockFn) => {
    const order = orders.find((o) => o.id === orderId);
    if (!order) throw new Error("Order not found");

    // if cancel and provide restore function, restore stock
    if (newStatus === "Canceled" && typeof restoreStockFn === "function") {
      const itemsToRestore = (order.items || []).map((it) => ({
        id: it.productId,
        quantity: Number(it.quantity || 0),
      }));
      if (itemsToRestore.length) await restoreStockFn(itemsToRestore);
    }

    await updateDoc(doc(db, "orders", orderId), {
      status: newStatus,
      statusHistory: [
        ...(order.statusHistory || []),
        { status: newStatus, changedAt: new Date().toISOString() },
      ],
    });
  };

  /**
   * deleteOrder
   * - attempts to delete order
   * - restores stock if order not shipped/delivered and restoreStockFn provided
   * - ensures deleteDoc always runs, even if order not in local state
   */
  const deleteOrder = async (orderId, restoreStockFn) => {
    let order;
    try {
      order = orders.find((o) => o.id === orderId);
      // only restore stock if order exists and not shipped/delivered
      if (order && order.status !== "Shipped" && order.status !== "Delivered") {
        if (typeof restoreStockFn === "function") {
          const itemsToRestore = (order.items || []).map((it) => ({
            id: it.productId,
            quantity: Number(it.quantity || 0),
          }));
          if (itemsToRestore.length) {
            try {
              await restoreStockFn(itemsToRestore);
            } catch (err) {
              console.error("restoreStockFn error:", err);
              // do not block deletion
            }
          }
        }
      }
      // always attempt delete
      await deleteDoc(doc(db, "orders", orderId));
      // remove from local state safely
      setOrders((prev) => prev.filter((o) => o.id !== orderId));
    } catch (err) {
      console.error("deleteOrder failed:", err);
      throw err; // optionally re-throw for UI notification
    }
  };

  return {
    orders,
    loading,
    fetchOrders,
    refreshOrders: fetchOrders,
    updateOrderStatus,
    deleteOrder,
    reduceStock,
    restoreStock,
    STATUS_FLOW,
  };
}
