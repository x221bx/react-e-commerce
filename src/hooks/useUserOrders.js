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
  increment,
  writeBatch,
} from "firebase/firestore";
import { db } from "../services/firebase";

const STATUS_FLOW = ["Pending", "Processing", "Shipped", "Out for delivery", "Delivered"];

export default function useOrders(uid = null, isAdmin = false) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // تبني query حسب إذا admin أو user
  const buildQuery = useCallback(() => {
    const ordersRef = collection(db, "orders");
    if (isAdmin || !uid) {
      return query(ordersRef, orderBy("createdAt", "desc"));
    }
    // ⚠️ تأكد من استخدام 'uid' كما هو في Firestore
    return query(
      ordersRef,
      where("uid", "==", uid),
      orderBy("createdAt", "desc")
    );
  }, [uid, isAdmin]);

  const snapshotToOrders = (snapshot) =>
    snapshot.docs.map((d) => {
      const data = d.data() || {};
      return {
        id: d.id,
        ...data,
        createdAt:
          data.createdAt?.toDate?.()?.toISOString() ||
          data.createdAt ||
          new Date().toISOString(),
      };
    });

  // fetch orders مرة واحدة (في حالة refresh)
  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const q = buildQuery();
      const snapshot = await getDocs(q);
      setOrders(snapshotToOrders(snapshot));
    } catch (err) {
      console.error("fetchOrders error:", err);
    } finally {
      setLoading(false);
    }
  }, [buildQuery]);

  // useEffect للتحديث realtime
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
        fetchOrders();
      }
    );
    return () => unsub();
  }, [buildQuery, fetchOrders]);

  // تقليل المخزون
  const reduceStock = async (items) => {
    if (!Array.isArray(items) || items.length === 0) return;
    const batch = writeBatch(db);
    items.forEach((i) => {
      if (!i.id || !i.quantity) return;
      const ref = doc(db, "products", i.id);
      batch.update(ref, { stock: increment(-Math.abs(i.quantity)) });
    });
    await batch.commit();
  };

  // استرجاع المخزون
  const restoreStock = async (items) => {
    if (!Array.isArray(items) || items.length === 0) return;
    const batch = writeBatch(db);
    items.forEach((i) => {
      if (!i.id || !i.quantity) return;
      const ref = doc(db, "products", i.id);
      batch.update(ref, { stock: increment(Math.abs(i.quantity)) });
    });
    try {
      await batch.commit();
    } catch (err) {
      if (err.code === "not-found") {
        console.warn("restoreStock: some products not found, skipped");
      } else {
        throw err;
      }
    }
  };

  // تحديث حالة الأوردر
  const updateOrderStatus = async (orderId, newStatus, restoreStockFn) => {
    const order = orders.find((o) => o.id === orderId);
    if (!order) throw new Error("Order not found");

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

  // حذف أوردر
  const deleteOrder = async (orderId, restoreStockFn) => {
    const order = orders.find((o) => o.id === orderId);
    if (order && !["Shipped", "Delivered"].includes(order.status)) {
      if (typeof restoreStockFn === "function") {
        const itemsToRestore = (order.items || []).map((it) => ({
          id: it.productId,
          quantity: Number(it.quantity || 0),
        }));
        if (itemsToRestore.length) await restoreStockFn(itemsToRestore);
      }
    }
    await deleteDoc(doc(db, "orders", orderId));
    setOrders((prev) => prev.filter((o) => o.id !== orderId));
  };

  return {
    orders,
    loading,
    fetchOrders,
    updateOrderStatus,
    deleteOrder,
    reduceStock,
    restoreStock,
    STATUS_FLOW,
  };
}
