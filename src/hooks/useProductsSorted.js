import { useQuery } from "@tanstack/react-query";
import { getDocs } from "firebase/firestore";
import { buildProductsQuery } from "./firestore/buildProductsQuery";

/**
 * Server-sorted, client-paginated list of products.
 * Accepts status filter: "all" | "available" | "unavailable"
 */
export function useProductsSorted({
  sortBy = "createdAt",
  dir = "desc",
  qText = "",
  status = "all",
} = {}) {
  return useQuery({
    queryKey: ["productsSorted", { sortBy, dir, qText, status }],
    queryFn: async () => {
      const q = buildProductsQuery({ sortBy, dir, qText, status });
      const snap = await getDocs(q);
      return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    },
    staleTime: 15_000,
    keepPreviousData: true,
  });
}
