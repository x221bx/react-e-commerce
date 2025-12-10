// src/hooks/useProduct.js
import { useQuery } from "@tanstack/react-query";
import { db } from "../services/firebase";
import { doc, getDoc } from "firebase/firestore";

export function useProduct(id) {
  return useQuery({
    queryKey: ["product", id],
    enabled: !!id,
    queryFn: async () => {
      const snap = await getDoc(doc(db, "products", id));
      if (!snap.exists()) return null;

      const data = snap.data();

      // normalize timestamps
      if (data.createdAt?.toMillis) data.createdAt = data.createdAt.toDate();
      if (data.updatedAt?.toMillis) data.updatedAt = data.updatedAt.toDate();

      if (data.isDeleted) return null;

      return { id: snap.id, ...data };
    },
    staleTime: 15000,
  });
}
