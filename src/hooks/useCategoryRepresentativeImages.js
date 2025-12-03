// src/hooks/useCategoryRepresentativeImages.js
import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  collection,
  getDocs,
  limit,
  orderBy,
  query as firestoreQuery,
  where,
} from "firebase/firestore";
import { db } from "../services/firebase";

const pickProductImage = (product) => {
  if (!product) return null;
  return (
    product.thumbnailUrl ||
    product.heroImage ||
    product.coverImage ||
    (Array.isArray(product.images) && product.images[0]) ||
    null
  );
};

export function useCategoryRepresentativeImages(categoryIds = []) {
  const normalizedIds = useMemo(
    () => categoryIds.filter((id) => Boolean(id)),
    [categoryIds]
  );

  return useQuery({
    queryKey: ["categoryRepresentativeImages", normalizedIds],
    queryFn: async () => {
      const entries = await Promise.all(
        normalizedIds.map(async (categoryId) => {
          const productsCol = collection(db, "products");
          const q = firestoreQuery(
            productsCol,
            where("categoryId", "==", categoryId),
            orderBy("createdAt", "desc"),
            limit(4)
          );
          const snap = await getDocs(q);
          const productDoc = snap.docs[0];
          const images = snap.docs
            .map((doc) => pickProductImage(doc.data()))
            .filter(Boolean);
          return [categoryId, images];
        })
      );
      return Object.fromEntries(
        entries.filter(([, images]) => images.length > 0)
      );
    },
    enabled: normalizedIds.length > 0,
    staleTime: 60_000,
  });
}
