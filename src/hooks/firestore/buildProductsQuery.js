import { collection, orderBy, query, where } from "firebase/firestore";
import { db } from "../../services/firebase";

/**
 * Build a Firestore query for products with:
 * - client-side availability handling (stock/isAvailable)
 * - optional categoryId filter
 * - optional prefix search on name_lc
 * - sorting (createdAt by default)
 *
 * NOTE: Soft-deleted items (isDeleted) are filtered client-side to avoid extra indexes.
 * When qText is provided (range on name_lc), we orderBy name_lc first (required by Firestore).
 */
export function buildProductsQuery({
  sortBy = "createdAt",
  dir = "desc",
  qText = "",
  status = "all",
  category = "",
} = {}) {
  const col = collection(db, "products");
  const cons = [];

  // category filter (may need index if heavily used with sorting)
  if (category && category !== "all") {
    cons.push(where("categoryId", "==", category));
  }

  const needle = (qText || "").trim().toLowerCase();

  if (needle) {
    cons.push(where("name_lc", ">=", needle));
    cons.push(where("name_lc", "<=", `${needle}\uf8ff`));
    cons.push(orderBy("name_lc", dir));
  } else {
    if (sortBy === "name") {
      cons.push(orderBy("name_lc", dir));
    } else if (sortBy === "price") {
      cons.push(orderBy("price", dir));
    } else {
      cons.push(orderBy("createdAt", dir));
    }
  }

  return query(col, ...cons);
}
