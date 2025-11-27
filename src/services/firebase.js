// src/services/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth, updateProfile } from "firebase/auth";
import { getFirestore, initializeFirestore, persistentLocalCache, persistentMultipleTabManager } from "firebase/firestore";
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

// ✅ تهيئة Firestore مع التخزين المؤقت
let db;
try {
  db = initializeFirestore(app, {
    localCache: persistentLocalCache({
      tabManager: persistentMultipleTabManager()
    })
  });
} catch (err) {
  // Fallback to getFirestore if initializeFirestore fails
  console.warn('Failed to initialize Firestore with persistence:', err);
  db = getFirestore(app);
}

// ✅ تصدير الخدمات الأساسية
export const auth = getAuth(app); // المصادقة (تسجيل الدخول / إنشاء حساب)
export { db }; // قاعدة بيانات Firestore
export const storage = getStorage(app); // تخزين الملفات والصور
export { updateProfile }; // تحديث ملف المستخدم

// ✅ دالة رفع الصور إلى Firebase Storage
export const uploadImage = async (file, path = 'articles/') => {
  const { ref, uploadBytes, getDownloadURL } = await import('firebase/storage');

  try {
    // إنشاء اسم فريد للصورة
    const fileName = `${Date.now()}-${file.name}`;
    const storageRef = ref(storage, `${path}${fileName}`);

    // رفع الصورة
    const snapshot = await uploadBytes(storageRef, file);

    // الحصول على رابط التحميل
    const downloadURL = await getDownloadURL(snapshot.ref);

    return downloadURL;
  } catch (error) {
    console.error('Error uploading image:', error);
    throw new Error('Failed to upload image');
  }
};

export default app; // 🔁 تصدير التطبيق نفسه في حال احتاجته ملفات أخرى
