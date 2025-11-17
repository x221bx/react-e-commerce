import { useProductsSorted } from "./useProductsSorted";

export function useAutoStock(threshold = 0) {
  const { data: products = [] } = useProductsSorted({});
  const needsRestock = products.filter((p) => p.stock <= threshold);
  // Frontend-only: عرض تنبيه
  return { needsRestock };
}
