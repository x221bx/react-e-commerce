// src/hooks/useNotifications.js
import { useEffect, useState, useCallback } from "react";
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  updateDoc,
  doc,
  limit,
} from "firebase/firestore";
import { db } from "../services/firebase";

export function useNotifications({ uid, role } = {}) {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [connectionError, setConnectionError] = useState(false);

  useEffect(() => {
    if (!db) return;
    // Create query: notifications for this user OR admin notifications
    let q;
    if (uid && role === "admin") {
      q = query(
        collection(db, "notifications"),
        where("recipientRole", "==", "admin"),
        orderBy("createdAt", "desc"),
        limit(100)
      );
    } else if (uid) {
      // user: notifications that are for them OR role=admin? (we usually show only their own)
      q = query(
        collection(db, "notifications"),
        where("recipientId", "==", uid),
        orderBy("createdAt", "desc"),
        limit(200)
      );
    } else {
      // fallback: subscribe to admin notifications only
      q = query(
        collection(db, "notifications"),
        where("recipientRole", "==", "admin"),
        orderBy("createdAt", "desc"),
        limit(100)
      );
    }

    setLoading(true);
    setConnectionError(false);
    const unsub = onSnapshot(
      q,
      (snap) => {
        const arr = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        setNotifications(arr);
        setLoading(false);
        setConnectionError(false); // Reset error on success
      },
      (err) => {
        console.error("notifications onSnapshot error", err);
        setLoading(false);
        // Check if it's a blocked connection error
        if (err.message?.includes('blocked') || err.code === 'unavailable') {
          setConnectionError(true);
        }
      }
    );

    return () => unsub();
  }, [uid, role]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markRead = useCallback(async (id) => {
    try {
      await updateDoc(doc(db, "notifications", id), {
        read: true,
        readAt: new Date(),
      });
    } catch (err) {
      console.error("markRead error", err);
    }
  }, []);

  const markAllRead = useCallback(async () => {
    try {
      const batchPromises = notifications
        .filter((n) => !n.read)
        .map((n) =>
          updateDoc(doc(db, "notifications", n.id), {
            read: true,
            readAt: new Date(),
          })
        );
      await Promise.all(batchPromises);
    } catch (err) {
      console.error("markAllRead error", err);
    }
  }, [notifications]);

  return { notifications, loading, unreadCount, markRead, markAllRead, connectionError };
}
