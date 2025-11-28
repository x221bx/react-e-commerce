import { collection, orderBy, query, where } from "firebase/firestore";
import { db } from "../../services/firebase"; // adjust path

/**
 * Build a Firestore query for products with server-side sort + optional availability + prefix search + category filter.
 * @param {Object} opts
 * @param {"createdAt"|"price"|"name"} [opts.sortBy="createdAt"]
 * @param {"asc"|"desc"} [opts.dir="desc"]
 * @param {string} [opts.qText=""]   // name prefix search; expects name_lc in docs
 * @param {"all"|"available"|"unavailable"} [opts.status="all"]
 * @param {string} [opts.category=""]   // category filter
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

  // 🟢 filter by availability status
  if (status === "available") cons.push(where("isAvailable", "==", true));
  if (status === "unavailable") cons.push(where("isAvailable", "==", false));

  // 📂 filter by category
  if (category && category !== "all") {
    cons.push(where("category", "==", category));
  }

  //  prefix search on name_lc
  const needle = (qText || "").trim().toLowerCase();
  if (needle) {
    cons.push(where("name_lc", ">=", needle));
    cons.push(where("name_lc", "<=", `${needle}\uf8ff`));
  }

  // 🔽 sorting logic
  if (sortBy === "name") {
    cons.push(orderBy("name_lc", dir));
  } else if (sortBy === "price") {
    cons.push(orderBy("price", dir));
  } else {
    cons.push(orderBy("createdAt", dir));
  }

  return query(col, ...cons);
}
