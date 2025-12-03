/**
 * Firebase configuration and initialization
 * Handles authentication, database, storage, and functions setup
 */

import { initializeApp } from "firebase/app";
import { getAuth, updateProfile } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { getFunctions } from "firebase/functions";

const firebaseConfig = {
  apiKey: "REDACTED",
  authDomain: "farm-vet-shop.firebaseapp.com",
  projectId: "farm-vet-shop",
  storageBucket: "farm-vet-shop.appspot.com",
  messagingSenderId: "772008902258",
  appId: "1:772008902258:web:bba8970585f2dd89228ceb",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export const functions = getFunctions(app);

export { updateProfile };

export async function uploadImage(file, folderPath = "uploads/") {
  if (!file) {
    throw new Error("No file provided");
  }
  const folder = folderPath.endsWith("/") ? folderPath : `${folderPath}/`;
  const safeName = (file.name || "image").replace(/\s+/g, "_");
  const imageRef = ref(storage, `${folder}${Date.now()}_${safeName}`);
  const snapshot = await uploadBytes(imageRef, file);
  return getDownloadURL(snapshot.ref);
}

export default app;
