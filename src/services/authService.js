// src/services/authService.js
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  GoogleAuthProvider,
  signInWithPopup,
  updateProfile,
} from "firebase/auth";
import { auth, db } from "./firebase";
import { doc, setDoc } from "firebase/firestore";

const googleProvider = new GoogleAuthProvider();

// تسجيل مستخدم جديد
export const registerUser = async (email, password, name) => {
  const res = await createUserWithEmailAndPassword(auth, email, password);
  const user = res.user;

  await updateProfile(user, { displayName: name });

  await setDoc(doc(db, "users", user.uid), {
    uid: user.uid,
    name,
    email,
    createdAt: new Date(),
  });

  return user;
};

// تسجيل الدخول
export const loginUser = async (email, password) => {
  const res = await signInWithEmailAndPassword(auth, email, password);
  return res.user;
};

// تسجيل الدخول بحساب Google
export const loginWithGoogle = async () => {
  const res = await signInWithPopup(auth, googleProvider);
  const user = res.user;

  await setDoc(doc(db, "users", user.uid), {
    uid: user.uid,
    name: user.displayName,
    email: user.email,
    photoURL: user.photoURL,
  });

  return user;
};

export const logoutUser = async () => {
  await signOut(auth);
};
