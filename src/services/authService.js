/**
 * Authentication service functions
 * Handles user registration, login, logout, and Google authentication
 */

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

/**
 * Register a new user with email and password
 * @param {string} email - User email
 * @param {string} password - User password
 * @param {string} name - User display name
 * @returns {Promise<User>} Firebase user object
 */
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

/**
 * Sign in user with email and password
 * @param {string} email - User email
 * @param {string} password - User password
 * @returns {Promise<User>} Firebase user object
 */
export const loginUser = async (email, password) => {
  const res = await signInWithEmailAndPassword(auth, email, password);
  return res.user;
};

/**
 * Sign in user with Google account
 * @returns {Promise<User>} Firebase user object
 */
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

/**
 * Sign out the current user
 * @returns {Promise<void>}
 */
export const logoutUser = async () => {
  await signOut(auth);
};
