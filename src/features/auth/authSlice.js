import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { auth, db } from "../../services/firebase";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  updateProfile,
  signOut as _signOut,
} from "firebase/auth";
import {
  doc,
  getDoc,
  setDoc,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";

const resolveEmail = async (identifier) => {
  if (identifier.includes("@")) return identifier;
  const snap = await getDoc(doc(db, "usernames", identifier.toLowerCase()));
  if (!snap.exists()) throw { code: "auth/user-not-found" };
  return snap.data().email;
};

const mapAuthError = (e, ctx = "generic") => {
  const code = e?.code || "auth/unknown";
  const build = (message, fieldErrors = {}) => ({ code, message, fieldErrors });

  if (
    code === "auth/invalid-login-credentials" ||
    code === "auth/invalid-credential"
  ) {
    return build("Incorrect email/username or password.", {
      ...(ctx === "login"
        ? { identifier: "Check this", password: "Check this" }
        : {}),
    });
  }

  switch (code) {
    case "auth/user-not-found":
      return build("No account found.", { identifier: "Not found" });
    case "auth/wrong-password":
      return build("Incorrect password.", { password: "Wrong password" });
    case "auth/email-already-in-use":
      return build("This email is already in use.", {
        email: "Already in use",
      });
    case "auth/weak-password":
      return build("Password is too weak.", { password: "Too weak" });
    case "auth/username-taken":
      return build("Username is taken.", { username: "Taken" });
    case "auth/invalid-email":
      return build("Invalid email format.", { email: "Invalid" });
    default:
      return build("Something went wrong. Please try again.");
  }
};

export const signInWithIdentifier = createAsyncThunk(
  "auth/signInWithIdentifier",
  async ({ identifier, password }, { rejectWithValue }) => {
    try {
      const email = await resolveEmail(identifier);
      const cred = await signInWithEmailAndPassword(auth, email, password);

      const userRef = doc(db, "users", cred.user.uid);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        throw { code: "auth/user-not-found" };
      }

      const userData = userSnap.data();
      let username = userData.username || "";
      if (!username) {
        const usernameQuery = query(
          collection(db, "usernames"),
          where("uid", "==", cred.user.uid)
        );
        const usernameDocs = await getDocs(usernameQuery);
        if (!usernameDocs.empty) {
          username = usernameDocs.docs[0].id;
        }
      }

      const isAdmin = userData.isAdmin || userData.role === "admin";

      return {
        uid: cred.user.uid,
        email: cred.user.email,
        name: userData.name || cred.user.displayName,
        username,
        isAdmin,
        role: isAdmin ? "admin" : "user",
      };
    } catch (e) {
      return rejectWithValue(mapAuthError(e, "login"));
    }
  }
);

export const signUp = createAsyncThunk(
  "auth/signUp",
  async ({ name, email, username, password }, { rejectWithValue }) => {
    try {
      const normalizedUsername = username.toLowerCase();
      const u = await getDoc(doc(db, "usernames", normalizedUsername));
      if (u.exists()) throw { code: "auth/username-taken" };

      const cred = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(cred.user, { displayName: name });
      await setDoc(doc(db, "users", cred.user.uid), {
        email,
        name,
        username: normalizedUsername,
        isAdmin: false,
      });

      await setDoc(doc(db, "usernames", normalizedUsername), {
        email,
        uid: cred.user.uid,
      });

      return true;
    } catch (e) {
      return rejectWithValue(mapAuthError(e, "signup"));
    }
  }
);

export const resetPassword = createAsyncThunk(
  "auth/resetPassword",
  async ({ emailOrUsername }, { rejectWithValue }) => {
    try {
      const email = await resolveEmail(emailOrUsername);
      await sendPasswordResetEmail(auth, email);
      return true;
    } catch (e) {
      return rejectWithValue(mapAuthError(e, "reset"));
    }
  }
);

export const signOut = createAsyncThunk("auth/signOut", async () => {
  // Clear user-specific data from localStorage before signing out
  try {
    const authUser = JSON.parse(localStorage.getItem("authUser") || "null");
    if (authUser?.uid) {
      localStorage.removeItem(`cartItems_${authUser.uid}`);
      localStorage.removeItem(`favorites_${authUser.uid}`);
    }
    localStorage.removeItem("authUser");
  } catch (error) {
    console.warn("Error clearing user data on logout:", error);
  }

  await _signOut(auth);
});

const slice = createSlice({
  name: "auth",
  initialState: {
    user: null,
    isInitialized: false,
    error: null,
  },
  reducers: {
    setCurrentUser(state, { payload }) {
      state.user = payload;
    },
    setAuthInitialized(state, { payload }) {
      state.isInitialized = payload;
    },
    clearAuthError(state) {
      state.error = null;
    },
    updateCurrentUser(state, { payload }) {
      if (state.user) {
        state.user = { ...state.user, ...payload };
        // Update localStorage as well
        localStorage.setItem("authUser", JSON.stringify(state.user));
      }
    },
  },
  extraReducers: (b) => {
    b.addCase(signInWithIdentifier.fulfilled, (s, a) => {
      s.user = a.payload;
      s.isInitialized = true;
      s.error = null;
      // Store user data for cart/favorites initialization
      localStorage.setItem("authUser", JSON.stringify(a.payload));
    });
    b.addCase(signInWithIdentifier.rejected, (s, a) => {
      s.error = a.payload;
      s.isInitialized = true;
    });
    b.addCase(signUp.rejected, (s, a) => {
      s.error = a.payload;
    });
    b.addCase(resetPassword.rejected, (s, a) => {
      s.error = a.payload;
    });
    b.addCase(signOut.fulfilled, (s) => {
      s.user = null;
      s.isInitialized = false;
    });
  },
});

export const { setCurrentUser, setAuthInitialized, clearAuthError, updateCurrentUser } =
  slice.actions;
export default slice.reducer;

export const selectCurrentUser = (s) => s.auth.user;
export const selectIsAuthInitialized = (s) => s.auth.isInitialized;
