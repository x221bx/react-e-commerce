import { useEffect, useMemo, useRef, useState } from "react";
import {
  collection,
  doc,
  onSnapshot,
  query,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";
import { db } from "../services/firebase";

const toMillis = (value) => {
  if (!value) return Date.now();
  if (typeof value === "number") return value;
  if (typeof value === "string") {
    const parsed = Date.parse(value);
    return Number.isNaN(parsed) ? Date.now() : parsed;
  }
  if (typeof value.toMillis === "function") return value.toMillis();
  if (value.seconds) return value.seconds * 1000;
  return Date.now();
};

const normalize = (text) =>
  text?.toString?.().trim().toLowerCase().replace(/\s+/g, "-") || "";

const createOrderEvent = (docSnapshot) => {
  const data = docSnapshot.data() || {};
  const status = data.status || data.currentStatus;
  if (!status) return null;
  const normalizedStatus = normalize(status);
  if (!normalizedStatus || normalizedStatus === "pending") return null;

  const orderNumber = data.orderNumber || docSnapshot.id.slice(-6);
  const title = `Order #${orderNumber}`;
  const message = `Status updated to ${status}`;
  const signature = toMillis(
    data.statusUpdatedAt || data.updatedAt || data.createdAt || new Date()
  );

  return {
    id: `order:${docSnapshot.id}:${normalizedStatus}:${signature}`,
    sourceId: docSnapshot.id,
    type: "order-status",
    category: "orders",
    title,
    message,
    timestamp: signature,
    read: false,
    source: "derived",
    target: `/account/tracking?orderId=${docSnapshot.id}`,
    meta: {
      status,
      orderId: docSnapshot.id,
    },
  };
};

const createSupportEvents = (docSnapshot) => {
  const data = docSnapshot.data() || {};
  const timestamp = toMillis(data.updatedAt || data.createdAt);
  const events = [];

  if (data.adminResponse) {
    const responseSignature =
      data.adminResponseUpdatedAt?.seconds ||
      data.adminResponseUpdatedAt ||
      data.adminResponse?.length ||
      timestamp;

    events.push({
      id: `support:${docSnapshot.id}:response:${responseSignature}`,
      sourceId: docSnapshot.id,
      type: "support-response",
      category: "support",
      title: data.topic || "Support update",
      message: data.adminResponse,
      timestamp,
      read: false,
      source: "derived",
      target: `/account/complaints`,
      meta: { topic: data.topic, status: data.status },
    });
  }

  const status = data.status ? normalize(data.status) : "";
  if (status && status !== "pending") {
    events.push({
      id: `support:${docSnapshot.id}:status:${status}`,
      sourceId: docSnapshot.id,
      type: "support-status",
      category: "support",
      title: data.topic || "Support status",
      message: `Status updated to ${data.status}`,
      timestamp,
      read: false,
      source: "derived",
      target: `/account/complaints`,
      meta: { topic: data.topic, status: data.status },
    });
  }

  return events;
};

const mergeDocs = (primary = [], secondary = []) => {
  const map = new Map();
  [...primary, ...secondary].forEach((docSnapshot) => {
    if (!docSnapshot) return;
    map.set(docSnapshot.id, docSnapshot);
  });
  return Array.from(map.values());
};

/**
 * Enhanced realtime notifications hook.
 * Combines Firestore notification documents with derived order/support updates
 * and exposes helpers for marking items as read.
 */
export function useNotifications(options = {}) {
  const { uid, role } = options;
  const [firestoreEvents, setFirestoreEvents] = useState([]);
  const [orderEvents, setOrderEvents] = useState([]);
  const [supportEvents, setSupportEvents] = useState([]);
  const [connectionError, setConnectionError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [seenMap, setSeenMap] = useState({});
  const [localReadMap, setLocalReadMap] = useState({});
  const supportUidDocsRef = useRef([]);
  const supportUserDocsRef = useRef([]);
  const seenDocReadyRef = useRef(false);
  const seenDocRef = useMemo(
    () => (uid ? doc(db, "notificationSeen", uid) : null),
    [uid]
  );

  useEffect(() => {
    if (!seenDocRef) {
      setSeenMap({});
      seenDocReadyRef.current = false;
      return;
    }
    const unsubscribe = onSnapshot(
      seenDocRef,
      (snapshot) => {
        if (!snapshot.exists()) {
          seenDocReadyRef.current = false;
          setSeenMap({});
          return;
        }
        seenDocReadyRef.current = true;
        const data = snapshot.data() || {};
        setSeenMap(data.seen || {});
      },
      (error) => {
        console.error("Notifications seen subscription error:", error);
      }
    );
    return () => unsubscribe();
  }, [seenDocRef]);

  const persistSeenIds = useMemo(() => {
    return async (ids = []) => {
      if (!ids.length) return;
      setSeenMap((prev) => {
        const next = { ...prev };
        ids.forEach((id) => {
          next[id] = Date.now();
        });
        return next;
      });
      if (!seenDocRef) return;
      const payload = ids.reduce((acc, id) => {
        acc[`seen.${id}`] = Date.now();
        return acc;
      }, {});
      try {
        await setDoc(seenDocRef, payload, { merge: true });
        seenDocReadyRef.current = true;
      } catch (error) {
        console.error("Failed to persist notification seen state:", error);
      }
    };
  }, [seenDocRef]);

  useEffect(() => {
    if (!uid && role !== "admin") {
      setFirestoreEvents([]);
      setLoading(false);
      return undefined;
    }

    const notificationsRef = collection(db, "notifications");
    let notificationsQuery = notificationsRef;

    if (uid && role !== "admin") {
      notificationsQuery = query(notificationsRef, where("uid", "==", uid));
    }

    setConnectionError(null);
    setLoading(true);

    const unsubscribe = onSnapshot(
      notificationsQuery,
      (snapshot) => {
        const docs = snapshot.docs.map((docSnapshot) => {
          const data = docSnapshot.data() || {};
          return {
            id: docSnapshot.id,
            sourceId: docSnapshot.id,
            type: data.type || "system",
            category: data.category || "system",
            title: data.title || "Notification",
            message: data.message || "",
            timestamp: toMillis(data.createdAt || data.updatedAt),
            read: !!data.read,
            source: "firestore",
            target: data.target || data.link || null,
            meta: data.meta || {},
          };
        });
        setFirestoreEvents(docs);
        setLoading(false);
      },
      (error) => {
        console.error("Notifications listener error:", error);
        setConnectionError(
          error.message || "Realtime notifications unavailable"
        );
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [uid, role]);

  useEffect(() => {
    if (!uid) {
      setOrderEvents([]);
      return undefined;
    }

    const ordersRef = collection(db, "orders");
    const q = query(ordersRef, where("uid", "==", uid));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const events = snapshot.docs
          .map(createOrderEvent)
          .filter(Boolean);
        setOrderEvents(events);
      },
      (error) => {
        console.error("Order notifications error:", error);
        setConnectionError(
          (prev) => prev || "Order status notifications unavailable"
        );
      }
    );

    return () => unsubscribe();
  }, [uid]);

  useEffect(() => {
    if (!uid) {
      setSupportEvents([]);
      supportUidDocsRef.current = [];
      supportUserDocsRef.current = [];
      return undefined;
    }

    supportUidDocsRef.current = [];
    supportUserDocsRef.current = [];

    const supportRef = collection(db, "support");
    const queryByUid = query(supportRef, where("uid", "==", uid));
    const queryByUserId = query(supportRef, where("userId", "==", uid));

    const unsubscribers = [];
    const recompute = () => {
      const mergedDocs = mergeDocs(
        supportUidDocsRef.current,
        supportUserDocsRef.current
      );
      const events = mergedDocs.flatMap(createSupportEvents);
      setSupportEvents(events);
    };

    const unsubUid = onSnapshot(
      queryByUid,
      (snapshot) => {
        supportUidDocsRef.current = snapshot.docs;
        recompute();
      },
      (error) => {
        console.error("Support notifications error:", error);
        setConnectionError(
          (prev) => prev || "Support notifications unavailable"
        );
      }
    );
    unsubscribers.push(unsubUid);

    const unsubUserId = onSnapshot(
      queryByUserId,
      (snapshot) => {
        supportUserDocsRef.current = snapshot.docs;
        recompute();
      },
      (error) => {
        console.error("Support notifications error:", error);
      }
    );
    unsubscribers.push(unsubUserId);

    return () => unsubscribers.forEach((fn) => fn && fn());
  }, [uid]);

  const derivedEvents = useMemo(() => {
    const combined = [...orderEvents, ...supportEvents];
    if (!combined.length) return [];
    return combined.map((event) => ({
      ...event,
      read: !!seenMap[event.id],
    }));
  }, [orderEvents, supportEvents, seenMap]);

  const mappedFirestoreEvents = useMemo(() => firestoreEvents.map(event => ({ ...event, read: event.read || !!localReadMap[event.id] })), [firestoreEvents, localReadMap]);

  const notifications = useMemo(() => {
    const merged = [...mappedFirestoreEvents, ...derivedEvents];
    return merged.sort((a, b) => b.timestamp - a.timestamp);
  }, [mappedFirestoreEvents, derivedEvents]);

  const unreadCount = useMemo(
    () => notifications.filter((notification) => !notification?.read).length,
    [notifications]
  );

  const markRead = async (id) => {
    if (!id) return;
    const notification = notifications.find((n) => n.id === id);
    if (!notification) return;

    if (notification.source === "firestore") {
      setLocalReadMap(prev => ({ ...prev, [id]: true }));
      try {
        await updateDoc(doc(db, "notifications", id), { read: true });
      } catch (error) {
        console.error("Failed to mark notification as read:", error);
      }
      return;
    }

    await persistSeenIds([id]);
  };

  const markAllRead = async () => {
    const firestoreIds = [];
    const localIds = [];

    notifications.forEach((n) => {
      if (n.read) return;
      if (n.source === "firestore") {
        firestoreIds.push(n.id);
      } else {
        localIds.push(n.id);
      }
    });

    if (localIds.length) {
      await persistSeenIds(localIds);
    }

    if (firestoreIds.length) {
      setLocalReadMap(prev => {
        const next = { ...prev };
        firestoreIds.forEach(id => next[id] = true);
        return next;
      });
      await Promise.all(
        firestoreIds.map((id) =>
          updateDoc(doc(db, "notifications", id), { read: true }).catch(error =>
            console.error("Failed to mark notification as read:", error)
          )
        )
      );
    }
  };

  return {
    notifications,
    unreadCount,
    loading,
    connectionError,
    markRead,
    markAllRead,
  };
}
