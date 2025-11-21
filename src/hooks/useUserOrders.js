import { useEffect, useState } from "react";
import { onSnapshot } from "firebase/firestore";
import { getUserOrdersQuery } from "../services/ordersService";

export const useUserOrders = (userId) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setOrders([]);
      setLoading(false);
      return undefined;
    }

    const query = getUserOrdersQuery(userId);
    if (!query) {
      setOrders([]);
      setLoading(false);
      return undefined;
    }

    const unsubscribe = onSnapshot(
      query,
      (snap) => {
        const next = snap.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            createdAt: data.createdAt?.toDate?.() || null,
            updatedAt: data.updatedAt?.toDate?.() || null,
          };
        });
        setOrders(next);
        setLoading(false);
      },
      () => {
        setOrders([]);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [userId]);

  return { orders, loading };
};

export default useUserOrders;
