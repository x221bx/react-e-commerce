import { createListenerMiddleware } from "@reduxjs/toolkit";
import { auth, db } from "../services/firebase";
import { onAuthStateChanged } from "firebase/auth";
import {
  doc,
  onSnapshot,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { setCurrentUser, setAuthInitialized } from "../features/auth/authSlice";
import { setUser as setCartUser, clearUserData as clearCartData, setCartItems } from "../features/cart/cartSlice";
import { setUser as setFavoritesUser, clearUserData as clearFavoritesData, setFavoritesItems } from "../features/favorites/favoritesSlice";
import { subscribeToUserCart, subscribeToUserFavorites } from "../services/userDataService";

// Helper function to serialize Firestore data for Redux
const serializeFirestoreData = (data) => {
  if (!data) return data;

  const serialized = { ...data };

  // Convert Firebase Timestamps to ISO strings
  Object.keys(serialized).forEach(key => {
    const value = serialized[key];
    if (value && typeof value === 'object' && value.toDate) {
      // It's a Firebase Timestamp
      serialized[key] = value.toDate().toISOString();
    } else if (value && typeof value === 'object') {
      // Recursively serialize nested objects
      serialized[key] = serializeFirestoreData(value);
    }
  });

  return serialized;
};

export const listenerMiddleware = createListenerMiddleware();

export const startAuthListener = (store) => {
  let profileUnsub = null;
  let cartUnsub = null;
  let favoritesUnsub = null;
  let didInit = false;

  const ensureInit = () => {
    if (!didInit) {
      didInit = true;
      store.dispatch(setAuthInitialized(true));
    }
  };

  onAuthStateChanged(auth, (fbUser) => {
    // cleanup previous listeners
    if (profileUnsub) {
      profileUnsub();
      profileUnsub = null;
    }
    if (cartUnsub) {
      cartUnsub();
      cartUnsub = null;
    }
    if (favoritesUnsub) {
      favoritesUnsub();
      favoritesUnsub = null;
    }

    if (!fbUser) {
      store.dispatch(setCurrentUser(null));
      // Clear user-specific data on logout
      store.dispatch(clearCartData());
      store.dispatch(clearFavoritesData());
      ensureInit();
      return;
    }

    // subscribe to user profile doc
    profileUnsub = onSnapshot(doc(db, "users", fbUser.uid), async (snap) => {
      const rawData = snap.exists() ? serializeFirestoreData(snap.data()) : {};
      const profile = {
        uid: fbUser.uid,
        ...rawData,
        email: rawData.email || fbUser.email || "",
        name: rawData.name || fbUser.displayName || fbUser.email || "",
        photoURL: rawData.photoURL || fbUser.photoURL || rawData.photoUrl || null,
      };

      if (!profile.username) {
        try {
          const usernameQuery = query(
            collection(db, "usernames"),
            where("uid", "==", fbUser.uid)
          );
          const usernameDocs = await getDocs(usernameQuery);
          if (!usernameDocs.empty) {
            profile.username = usernameDocs.docs[0].id;
          }
        } catch (error) {
          console.error("Failed to resolve username from Firestore", error);
        }
      }

      store.dispatch(setCurrentUser(profile));

      // Set up Firebase subscriptions for user data
      store.dispatch(setCartUser(profile));
      cartUnsub = subscribeToUserCart(profile.uid, (cartItems) => {
        store.dispatch(setCartItems(cartItems));
      });

      store.dispatch(setFavoritesUser(profile));
      favoritesUnsub = subscribeToUserFavorites(profile.uid, (favorites) => {
        store.dispatch(setFavoritesItems(favorites));
      });

      const locale = profile?.preferences?.locale || "en";
      document.documentElement.lang = locale;
      document.documentElement.dir = locale === "ar" ? "rtl" : "ltr";
      ensureInit();
    });
  });
};
