// src/services/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth, updateProfile } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// ✅ إعدادات Firebase الخاصة بمشروعك
const firebaseConfig = {
  apiKey: "REDACTED",
  authDomain: "farm-vet-shop.firebaseapp.com",
  projectId: "farm-vet-shop",
  storageBucket: "farm-vet-shop.appspot.com", // ✅ تم تصحيحها
  messagingSenderId: "772008902258",
  appId: "1:772008902258:web:bba8970585f2dd89228ceb",
};

// ✅ تهيئة Firebase
const app = initializeApp(firebaseConfig);

// ✅ تصدير الخدمات الأساسية
export const auth = getAuth(app); // المصادقة (تسجيل الدخول / إنشاء حساب)
export const db = getFirestore(app); // قاعدة بيانات Firestore
export const storage = getStorage(app); // تخزين الملفات والصور
export { updateProfile }; // تحديث ملف المستخدم

export default app; // 🔁 تصدير التطبيق نفسه في حال احتاجته ملفات أخرى
