import { createListenerMiddleware } from "@reduxjs/toolkit";
import { auth, db } from "../services/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, onSnapshot } from "firebase/firestore";
import { setCurrentUser, setAuthInitialized } from "../features/auth/authSlice";

export const listenerMiddleware = createListenerMiddleware();

export const startAuthListener = (store) => {
  let profileUnsub = null;
  let didInit = false;
  const ensureInit = () => {
    if (!didInit) {
      didInit = true;
      store.dispatch(setAuthInitialized(true));
    }
  };

  onAuthStateChanged(auth, (fbUser) => {
    // cleanup previous profile listener
    if (profileUnsub) {
      profileUnsub();
      profileUnsub = null;
    }

    if (!fbUser) {
      store.dispatch(setCurrentUser(null));
      ensureInit();
      return;
    }

    // subscribe to user profile doc
    profileUnsub = onSnapshot(doc(db, "users", fbUser.uid), (snap) => {
      const profile = snap.exists()
        ? { uid: fbUser.uid, ...snap.data() }
        : { uid: fbUser.uid };
      store.dispatch(setCurrentUser(profile));
      const locale = profile?.preferences?.locale || "en";
      document.documentElement.lang = locale;
      document.documentElement.dir = locale === "ar" ? "rtl" : "ltr";
      ensureInit();
    });
  });
};
