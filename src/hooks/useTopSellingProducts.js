// src/hooks/useTopSellingProducts.js
import { useQuery } from "@tanstack/react-query";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../services/firebase";

export function useTopSellingProducts(limit = 3) {
  return useQuery({
    queryKey: ["top-selling", limit],
    queryFn: async () => {
      const snap = await getDocs(collection(db, "orders"));
      const counts = {};

      snap.docs.forEach((doc) => {
        const data = doc.data() || {};
        const items = data.items || [];
        items.forEach((item) => {
          const id = item.productId || item.id;
          if (!id) return;
          const qty = Number(item.quantity || 0);
          counts[id] = counts[id] || { id, title: item.name || item.title, total: 0 };
          counts[id].total += qty;
        });
      });

      return Object.values(counts)
        .sort((a, b) => b.total - a.total)
        .slice(0, limit);
    },
    staleTime: 30_000,
  });
}
