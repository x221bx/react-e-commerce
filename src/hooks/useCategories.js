// import { useCategoriesSorted } from "./firestore/useCategoriesSorted";

// export function useCategories({ dir = "desc" } = {}) {
//   const { data = [], isLoading, isError, error } = useCategoriesSorted({ dir });

//   // 🔄 Normalize categories for UI compatibility
//   const categories = (data || []).map((c) => ({
//     id: c.id,
//     title: c.title || "",
//     note: c.note || "",
//     img: c.img || "",
//   }));

//   return {
//     categories,
//     isLoading,
//     isError,
//     error,
//   };
// }
