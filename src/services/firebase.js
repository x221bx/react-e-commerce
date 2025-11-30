// src/services/firebase.js

import { initializeApp } from "firebase/app";
import { getAuth, updateProfile } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getFunctions } from "firebase/functions";

// ✅ إعدادات Firebase الخاصة بمشروعك
const firebaseConfig = {
  apiKey: "REDACTED",
  authDomain: "farm-vet-shop.firebaseapp.com",
  projectId: "farm-vet-shop",
  storageBucket: "farm-vet-shop.appspot.com",
  messagingSenderId: "772008902258",
  appId: "1:772008902258:web:bba8970585f2dd89228ceb",
};

// ✅ تشغيل Firebase
const app = initializeApp(firebaseConfig);

// ✅ تصدير الخدمات الأساسية
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// ✅ Cloud Functions — تستخدمها لو عايز تربط AI Cloud أو Serverless
export const functions = getFunctions(app);

// تصدير تحديث البروفايل
export { updateProfile };

// لو هتحتاج الـ app في أي مكان
export default app;
