import { useEffect, useState } from "react";
import { getDocs, query, collection, where } from "firebase/firestore";
import { db } from "../services/firebase";

export const useUserOrders = (userId) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [connectionError, setConnectionError] = useState(false);

  useEffect(() => {
    if (!userId) {
      setOrders([]);
      setLoading(false);
      return;
    }

    // Use getDocs with a simple query to avoid index requirements
    const fetchOrders = async () => {
      try {
        setConnectionError(false);
        const ordersCollection = collection(db, "orders");
        const q = query(ordersCollection, where("uid", "==", userId));
        const snap = await getDocs(q);

        const next = snap.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            createdAt: data.createdAt?.toDate?.() || null,
            updatedAt: data.updatedAt?.toDate?.() || null,
          };
        });

        // Sort client-side by createdAt desc
        next.sort((a, b) => {
          const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return bTime - aTime;
        });

        setOrders(next);
        setLoading(false);
      } catch (err) {
        console.error("useUserOrders getDocs error", err);
        setOrders([]);
        setLoading(false);
        // Check if it's a blocked connection error
        if (err.message?.includes('blocked') || err.code === 'unavailable') {
          setConnectionError(true);
        }
      }
    };

    fetchOrders();
  }, [userId]);

  return { orders, loading, connectionError };
};

export default useUserOrders;
