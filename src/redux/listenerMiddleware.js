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
import { setCartItems, clearCart } from "../features/cart/cartSlice";
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

  onAuthStateChanged(auth, (fbUser) => {
    cleanupAll();

    // ---------------------------
    // LOGOUT
    // ---------------------------
    if (!fbUser) {
      store.dispatch(setCurrentUser(null));
      store.dispatch(clearCart());
      store.dispatch(clearFavoritesData());
      ensureInit();
      return;
    }

    // ---------------------------
    // LOGIN
    // ---------------------------
    profileUnsub = onSnapshot(doc(db, "users", fbUser.uid), async (snap) => {
      const rawData = snap.exists() ? serializeFirestoreData(snap.data()) : {};
      const profile = {
        uid: fbUser.uid,
        ...rawData,
        email: rawData.email || fbUser.email || "",
        name: rawData.name || fbUser.displayName || fbUser.email || "",
        photoURL:
          rawData.photoURL || fbUser.photoURL || rawData.photoUrl || null,
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
      // ---------------------------
      cartUnsub = subscribeToUserCart(profile.uid, (cartItems) => {
        store.dispatch(setCartItems(cartItems));
      });

      // ---------------------------
      // FAVORITES Subscription
      // ---------------------------
      favoritesUnsub = subscribeToUserFavorites(profile.uid, (favorites) => {
        store.dispatch(setFavoritesItems(favorites));
      });

      // ---------------------------
      // Apply locale
      // ---------------------------
      const locale = profile?.preferences?.locale || "en";
      document.documentElement.lang = locale;
      document.documentElement.dir = locale === "ar" ? "rtl" : "ltr";

      ensureInit();
    });
  });
};
