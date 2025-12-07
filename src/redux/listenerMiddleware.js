// src/redux/listenerMiddleware.js
import { createListenerMiddleware } from "@reduxjs/toolkit";
import { auth, db } from "../services/firebase";
import i18n from "../i18n";
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
import { setCartItems, clearCartLocal } from "../features/cart/cartSlice";
import {
  setFavoritesItems,
  clearUserData as clearFavoritesData,
} from "../features/favorites/favoritesSlice";
import {
  subscribeToUserCart,
  subscribeToUserFavorites,
} from "../services/userDataService";

// ---------------------------
// Helper: Serialize Firestore data
// ---------------------------
const serializeFirestoreData = (data) => {
  if (!data) return data;
  const serialized = { ...data };
  Object.keys(serialized).forEach((key) => {
    const value = serialized[key];
    if (value?.toDate) {
      serialized[key] = value.toDate().toISOString(); // Firebase Timestamp → ISO
    } else if (typeof value === "object" && value !== null) {
      serialized[key] = serializeFirestoreData(value); // Nested objects
    }
  });
  return serialized;
};

// ---------------------------
// Listener Middleware
// ---------------------------
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

  const cleanupAll = () => {
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
  };

  // ---------------------------
  // Preload from localStorage (guest keys) with deep cloning
  // ---------------------------
  const rawPreloadCart = JSON.parse(localStorage.getItem("cartItems") || "[]");
  const rawPreloadFavorites = JSON.parse(localStorage.getItem("favoritesItems") || "[]");
  
  // Deep clone to prevent reference sharing
  const preloadCart = Array.isArray(rawPreloadCart)
    ? rawPreloadCart.map(item => JSON.parse(JSON.stringify(item)))
    : [];
  const preloadFavorites = Array.isArray(rawPreloadFavorites)
    ? rawPreloadFavorites.map(item => JSON.parse(JSON.stringify(item)))
    : [];
  
  store.dispatch(setCartItems(preloadCart));
  store.dispatch(setFavoritesItems(preloadFavorites));

  // ---------------------------
  // Firebase Auth Listener
  // ---------------------------
  onAuthStateChanged(auth, (fbUser) => {
    cleanupAll();

    // ---------------------------
// LOGOUT
    // ---------------------------
    if (!fbUser) {
    const previousUser = store.getState().auth.currentUser;

    // عند تسجيل الخروج نريد مسح الحالة في الذاكرة لكن لا نمسح التخزين الخاص بالمستخدم
    if (previousUser?.uid) {
      store.dispatch(setCurrentUser(null));
      store.dispatch(clearCartLocal());
      store.dispatch(clearFavoritesData());
    }

  ensureInit();
  return;
}


    // ---------------------------
// LOGIN
    // ---------------------------
    profileUnsub = onSnapshot(doc(db, "users", fbUser.uid), async (snap) => {
      const rawData = snap.exists() ? serializeFirestoreData(snap.data()) : {};
      const isAdmin = rawData.isAdmin || rawData.role === "admin";
      const profile = {
        uid: fbUser.uid,
        ...rawData,
        email: rawData.email || fbUser.email || "",
        name: rawData.name || fbUser.displayName || fbUser.email || "",
        photoURL:
          rawData.photoURL || fbUser.photoURL || rawData.photoUrl || null,
        isAdmin,
        role: isAdmin ? "admin" : "user",
      };

      // Resolve username if missing
      if (!profile.username) {
        try {
          const usernameQuery = query(
            collection(db, "usernames"),
            where("uid", "==", fbUser.uid)
          );
          const usernameDocs = await getDocs(usernameQuery);
          if (!usernameDocs.empty) profile.username = usernameDocs.docs[0].id;
        } catch (error) {
          console.error("Failed to resolve username", error);
        }
      }

      store.dispatch(setCurrentUser(profile));

      // ---------------------------
// CART Subscription
cartUnsub = subscribeToUserCart(profile.uid, (cartItems) => {
  if (!Array.isArray(cartItems)) return;

  const existingCart = store.getState().cart.items ?? [];
  if (existingCart.length > 0 && cartItems.length === 0) {
    return;
  }

  store.dispatch(setCartItems(cartItems));
});

// FAVORITES Subscription
favoritesUnsub = subscribeToUserFavorites(profile.uid, (favorites) => {
  if (Array.isArray(favorites)) {
    store.dispatch(setFavoritesItems(favorites));
  }
});

      // ---------------------------
// Apply locale
      // ---------------------------
      const locale = profile?.preferences?.locale || i18n.language || "en";
      if (i18n.language !== locale) {
        await i18n.changeLanguage(locale);
      }
      document.documentElement.lang = locale;

      ensureInit();
    });
  });
};
