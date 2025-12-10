// src/hooks/useProductsSorted.js
import { useQuery } from "@tanstack/react-query";
import { getDocs } from "firebase/firestore";
import { buildProductsQuery } from "./firestore/buildProductsQuery";

/**
 * Server-sorted, client-paginated list of products.
 * Accepts status filter: "all" | "available" | "unavailable"
 * Accepts category filter
 */
export function useProductsSorted({
  sortBy = "createdAt",
  dir = "desc",
  qText = "",
  status = "all",
  category = "",
} = {}) {
  return useQuery({
    queryKey: ["productsSorted", { sortBy, dir, qText, status, category }],
    queryFn: async () => {
      const q = buildProductsQuery({ sortBy, dir, qText, status, category });
      const snap = await getDocs(q);
      return snap.docs
        .map((d) => {
          const data = d.data();
          const stock = Number(data.stock ?? data.quantity ?? 0) || 0;
          const isAvailable =
            data.isAvailable === false ? false : stock > 0;

          return {
            id: d.id,
            ...data,
            stock,
            isAvailable,
          };
        })
        .filter((p) => {
          if (p.isDeleted) return false;
          if (status === "available") return p.isAvailable;
          if (status === "unavailable") return !p.isAvailable;
          return true;
        });
    },
    staleTime: 15_000,
    keepPreviousData: true,
  });
}
