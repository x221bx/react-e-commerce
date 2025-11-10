import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  collection,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../services/firebase";

const PRODUCTS_QUERY_KEY = "products";

export function useAddProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (newProduct) => {
      const payload = {
        ...newProduct,
        name_lc: (newProduct.name || "").toLowerCase(),
        createdAt: serverTimestamp(),
      };
      return addDoc(collection(db, "products"), payload);
    },
    onSuccess: (ref) => {
      qc.invalidateQueries({ queryKey: [PRODUCTS_QUERY_KEY] });
      qc.invalidateQueries({ queryKey: ["productsSorted"] });
      qc.invalidateQueries({ queryKey: ["count", "products", "total"] });
      qc.invalidateQueries({ queryKey: ["count", "products", "available"] });
      if (ref?.id) qc.invalidateQueries({ queryKey: ["product", ref.id] });
    },
  });
}

export function useUpdateProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updatedFields }) => {
      const patch = {
        ...updatedFields,
        ...(updatedFields.name
          ? { name_lc: updatedFields.name.toLowerCase() }
          : {}),
      };
      return updateDoc(doc(db, "products", id), patch);
    },
    onSuccess: (_res, { id }) => {
      qc.invalidateQueries({ queryKey: [PRODUCTS_QUERY_KEY] });
      qc.invalidateQueries({ queryKey: ["productsSorted"] });
      qc.invalidateQueries({ queryKey: ["product", id] });
      qc.invalidateQueries({ queryKey: ["count", "products", "total"] });
      qc.invalidateQueries({ queryKey: ["count", "products", "available"] });
    },
  });
}

export function useDeleteProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (productId) => deleteDoc(doc(db, "products", productId)),
    onSuccess: (_res, productId) => {
      qc.invalidateQueries({ queryKey: [PRODUCTS_QUERY_KEY] });
      qc.invalidateQueries({ queryKey: ["productsSorted"] });
      qc.invalidateQueries({ queryKey: ["product", productId] });
      qc.invalidateQueries({ queryKey: ["count", "products", "total"] });
      qc.invalidateQueries({ queryKey: ["count", "products", "available"] });
    },
  });
}
