// src/services/firebase.js

import { initializeApp } from "firebase/app";
import { getAuth, updateProfile } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL, uploadBytesResumable } from "firebase/storage";
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

export async function uploadImage(file, folderPath = "uploads/") {
  if (!file) {
    throw new Error("No file provided");
  }

  // Ensure user is authenticated
  if (!auth.currentUser) {
    throw new Error("You must be logged in to upload images");
  }

  // Get auth token for authenticated requests
  let idToken;
  try {
    idToken = await auth.currentUser.getIdToken();
  } catch (tokenError) {
    throw new Error("فشل الحصول على رمز المصادقة. يرجى تسجيل الخروج والدخول مرة أخرى.");
  }

  const folder = folderPath.endsWith("/") ? folderPath : `${folderPath}/`;
  const safeName = (file.name || "image").replace(/\s+/g, "_").replace(/[^a-zA-Z0-9._-]/g, "_");
  const fileName = `${Date.now()}_${safeName}`;
  const storagePath = `${folder}${fileName}`;

  // Determine content type
  const contentType = file.type || (file.name?.endsWith('.png') ? 'image/png' : 
                                    file.name?.endsWith('.webp') ? 'image/webp' : 'image/jpeg');

  try {
    // Method 1: Try Firebase SDK uploadBytesResumable first
    try {
      const imageRef = ref(storage, storagePath);
      const metadata = {
        contentType: contentType,
        customMetadata: {
          uploadedBy: auth.currentUser.uid,
          uploadedAt: new Date().toISOString()
        }
      };

      const uploadTask = uploadBytesResumable(imageRef, file, metadata);
      
      const snapshot = await new Promise((resolve, reject) => {
        uploadTask.on(
          'state_changed',
          (snapshot) => {
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            console.log('Upload progress:', Math.round(progress) + '%');
          },
          (error) => {
            reject(error);
          },
          () => {
            resolve(uploadTask.snapshot);
          }
        );
      });

      return await getDownloadURL(snapshot.ref);
    } catch (sdkError) {
      // Method 2: Fallback to Firebase Storage REST API if SDK fails
      console.warn('SDK upload failed, trying REST API:', sdkError);
      
      const bucketName = firebaseConfig.storageBucket;
      const encodedPath = encodeURIComponent(storagePath);
      const uploadUrl = `https://firebasestorage.googleapis.com/v0/b/${bucketName}/o?name=${encodedPath}`;

      // Upload using REST API with auth token
      const response = await fetch(uploadUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${idToken}`,
          'Content-Type': contentType,
        },
        body: file
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`Upload failed: ${response.status} ${errorData}`);
      }

      const result = await response.json();
      const downloadToken = result.downloadTokens;
      const downloadURL = `https://firebasestorage.googleapis.com/v0/b/${bucketName}/o/${encodedPath}?alt=media&token=${downloadToken}`;
      
      return downloadURL;
    }
  } catch (error) {
    console.error('Firebase Storage upload error:', error);
    
    // Better error messages in Arabic
    if (error.code === 'storage/unauthorized' || error.message?.includes('401')) {
      throw new Error('ليس لديك صلاحية لرفع الملفات. يرجى التحقق من تسجيل الدخول.');
    } else if (error.code === 'storage/canceled') {
      throw new Error('تم إلغاء الرفع. يرجى المحاولة مرة أخرى.');
    } else if (error.code === 'storage/unknown' || error.message?.includes('network')) {
      throw new Error('حدث خطأ في الاتصال. يرجى التحقق من اتصال الإنترنت والمحاولة مرة أخرى.');
    } else if (error.message?.includes('CORS') || error.message?.includes('cors') || error.message?.includes('blocked')) {
      // CORS error - provide helpful message with link to setup
      throw new Error('خطأ CORS: يرجى إعداد Firebase Storage Rules. راجع ملف FIREBASE_RULES_QUICK_SETUP.md للتعليمات السريعة.');
    }
    
    throw new Error(error.message || 'فشل رفع الصورة. يرجى المحاولة مرة أخرى.');
  }
}

// لو هتحتاج الـ app في أي مكان
export default app;
