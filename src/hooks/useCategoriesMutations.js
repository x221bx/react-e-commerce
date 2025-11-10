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

const CATEGORIES_QUERY_KEY = "categories";

export function useCreateCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (newCategory) => {
      const payload = { ...newCategory, createdAt: serverTimestamp() };
      return addDoc(collection(db, "categories"), payload);
    },
    onSuccess: (ref) => {
      qc.invalidateQueries({ queryKey: [CATEGORIES_QUERY_KEY] });
      qc.invalidateQueries({ queryKey: ["categoriesSorted"] });
      qc.invalidateQueries({ queryKey: ["count", "categories", "total"] });
      if (ref?.id) qc.invalidateQueries({ queryKey: ["category", ref.id] });
    },
  });
}

export function useUpdateCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, updatedFields }) =>
      updateDoc(doc(db, "categories", id), updatedFields),
    onSuccess: (_res, { id }) => {
      qc.invalidateQueries({ queryKey: [CATEGORIES_QUERY_KEY] });
      qc.invalidateQueries({ queryKey: ["categoriesSorted"] });
      qc.invalidateQueries({ queryKey: ["category", id] });
      qc.invalidateQueries({ queryKey: ["count", "categories", "total"] });
    },
  });
}

export function useDeleteCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => deleteDoc(doc(db, "categories", id)),
    onSuccess: (_res, id) => {
      qc.invalidateQueries({ queryKey: [CATEGORIES_QUERY_KEY] });
      qc.invalidateQueries({ queryKey: ["categoriesSorted"] });
      qc.invalidateQueries({ queryKey: ["category", id] });
      qc.invalidateQueries({ queryKey: ["count", "categories", "total"] });
    },
  });
}
