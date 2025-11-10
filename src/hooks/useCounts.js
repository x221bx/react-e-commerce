import { useQuery } from "@tanstack/react-query";
import {
  collection,
  query,
  where,
  getCountFromServer,
<<<<<<< HEAD
  getDocs,
} from "firebase/firestore";
import { db } from "../services/firebase.js";

/* ----------------------------------------
 🛍️ عدد كل المنتجات
---------------------------------------- */
=======
} from "firebase/firestore";
import { db } from "../services/firebase.js";

// عدد كل المنتجات
>>>>>>> 2bf9a10 (feat(admin): setup admin dashboard layout and routing)
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

<<<<<<< HEAD
/* ----------------------------------------
 ✅ عدد المنتجات المتوفرة فقط
---------------------------------------- */
=======
// عدد المنتجات المتوفرة فقط
>>>>>>> 2bf9a10 (feat(admin): setup admin dashboard layout and routing)
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

<<<<<<< HEAD
/* ----------------------------------------
 🏷️ عدد التصنيفات (زراعية / بيطرية)
---------------------------------------- */
=======
// عدد التصنيفات (الزراعية أو البيطرية)
>>>>>>> 2bf9a10 (feat(admin): setup admin dashboard layout and routing)
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
<<<<<<< HEAD

/* ----------------------------------------
 👥 عدد المستخدمين الكلي
---------------------------------------- */
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

/* ----------------------------------------
 📈 إحصائيات المستخدمين (Daily & Monthly)
---------------------------------------- */
export function useUsersStats() {
  return useQuery({
    queryKey: ["users-stats"],
    queryFn: async () => {
      const snap = await getDocs(collection(db, "users"));
      const users = snap.docs.map((d) => d.data());

      // 🗓️ تجميع حسب التاريخ (اليوم)
      const daily = {};
      users.forEach((u) => {
        const date = new Date(
          u.createdAt?.seconds ? u.createdAt.seconds * 1000 : Date.now()
        )
          .toISOString()
          .split("T")[0]; // YYYY-MM-DD
        daily[date] = (daily[date] || 0) + 1;
      });

      // 📅 تحويل البيانات لتنسيق الرسم البياني
      const data = Object.entries(daily).map(([date, count]) => ({
        date,
        daily: count,
        monthly: count * 30, // تمثيل تقريبي للزيادة الشهرية
      }));

      return data.sort((a, b) => new Date(a.date) - new Date(b.date));
    },
    staleTime: 30_000,
  });
}
=======
>>>>>>> 2bf9a10 (feat(admin): setup admin dashboard layout and routing)
