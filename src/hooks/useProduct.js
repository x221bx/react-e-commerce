import { useQuery } from "@tanstack/react-query";
import { db } from "../services/firebase.js";
import { doc, getDoc } from "firebase/firestore";

export function useProduct(id) {
  return useQuery({
    queryKey: ["product", id],
    enabled: !!id,
    queryFn: async () => {
      const snap = await getDoc(doc(db, "products", id));
      return snap.exists() ? { id: snap.id, ...snap.data() } : null;
    },
    staleTime: 15_000,
  });
}
