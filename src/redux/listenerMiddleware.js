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

      if (previousUser?.uid) {
        store.dispatch(setCurrentUser(null));
        store.dispatch(clearCartLocal());
        store.dispatch(clearFavoritesData());
        try {
          localStorage.removeItem("authUser");
          // signOut thunk clears user-specific keys; avoid deleting here to prevent races.
        } catch (error) {
          console.warn("Failed to clear auth cache on logout", error);
        }
      }

      ensureInit();
      return;
    }

    // ---------------------------
    // LOGIN
    // ---------------------------
    profileUnsub = onSnapshot(doc(db, "users", fbUser.uid), async (snap) => {
      const rawData = snap.exists() ? serializeFirestoreData(snap.data()) : {};
      let username = rawData.username;

      if (!username) {
        try {
          const usernameQuery = query(
            collection(db, "usernames"),
            where("uid", "==", fbUser.uid)
          );
          const usernameDocs = await getDocs(usernameQuery);
          if (!usernameDocs.empty) username = usernameDocs.docs[0].id;
        } catch (error) {
          console.error("Failed to resolve username", error);
        }
      }

      const isAdmin = rawData.isAdmin || rawData.role === "admin";
      const isDelivery =
        !isAdmin && (rawData.isDelivery || rawData.role === "delivery");
      const profile = {
        uid: fbUser.uid,
        ...rawData,
        username,
        email: rawData.email || fbUser.email || "",
        name: rawData.name || fbUser.displayName || fbUser.email || "",
        photoURL:
          rawData.photoURL || fbUser.photoURL || rawData.photoUrl || null,
        isAdmin,
        isDelivery,
        role: isAdmin ? "admin" : isDelivery ? "delivery" : rawData.role || "user",
      };

      // Persist the authenticated user so cart/favorites use per-user storage keys
      try {
        localStorage.setItem("authUser", JSON.stringify(profile));
        // Clear guest storage to avoid mixing guest data into user cart/favorites
        localStorage.removeItem("cartItems");
        localStorage.removeItem("favoritesItems");
      } catch (error) {
        console.warn("Failed to persist auth user locally", error);
      }

      store.dispatch(setCurrentUser(profile));

      // ---------------------------
      // CART Subscription
      cartUnsub = subscribeToUserCart(profile.uid, (cartItems) => {
        if (!Array.isArray(cartItems)) return;
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
