import { useQuery } from "@tanstack/react-query";
import {
  collection,
  query,
  where,
  getCountFromServer,
  getDocs,
} from "firebase/firestore";
import { db } from "../services/firebase.js";

// ✅ عدد كل المنتجات
export function useProductsCount() {
  return useQuery({
    queryKey: ["count", "products", "total"],
    queryFn: async () => {
      const q = query(collection(db, "products"));
      const snapshot = await getCountFromServer(q);
      return snapshot.data().count || 0;
    },
    staleTime: 15_000,
  });
}

// ✅ عدد المنتجات المتوفرة فقط
export function useProductsAvailableCount() {
  return useQuery({
    queryKey: ["count", "products", "available"],
    queryFn: async () => {
      const q = query(
        collection(db, "products"),
        where("isAvailable", "==", true)
      );
      const snapshot = await getCountFromServer(q);
      return snapshot.data().count || 0;
    },
    staleTime: 15_000,
  });
}

// ✅ عدد التصنيفات
export function useCategoriesCount() {
  return useQuery({
    queryKey: ["count", "categories", "total"],
    queryFn: async () => {
      const q = query(collection(db, "categories"));
      const snapshot = await getCountFromServer(q);
      return snapshot.data().count || 0;
    },
    staleTime: 15_000,
  });
}

// ✅ عدد المستخدمين
export function useUsersCount() {
  return useQuery({
    queryKey: ["count", "users", "total"],
    queryFn: async () => {
      const q = query(collection(db, "users"));
      const snapshot = await getCountFromServer(q);
      return snapshot.data().count || 0;
    },
    staleTime: 15_000,
  });
}

// ✅ إحصائيات المستخدمين (بيانات وهمية مؤقتًا)
export function useUsersStats() {
  return useQuery({
    queryKey: ["stats", "users"],
    queryFn: async () => {
      const snapshot = await getDocs(collection(db, "users"));
      const users = snapshot.docs.map((doc) => doc.data());

      const statsMap = {};
      users.forEach((user) => {
        const date = user.createdAt?.toDate?.() || new Date();
        const month = date.toLocaleString("default", { month: "short" });
        const year = date.getFullYear();
        const key = `${month}-${year}`;
        if (!statsMap[key]) {
          statsMap[key] = { date: key, daily: 0, monthly: 0, yearly: 0 };
        }
        statsMap[key].daily += 1;
        statsMap[key].monthly += 1;
        statsMap[key].yearly += 1;
      });

      return Object.values(statsMap);
    },
    staleTime: 30_000,
  });
}