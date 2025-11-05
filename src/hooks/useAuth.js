// src/features/auth/authSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { auth, db } from "../services/firebase";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  updateProfile,
  signOut as _signOut,
} from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";

// Utils
const resolveEmail = async (identifier) => {
  if (identifier.includes("@")) return identifier;
  const snap = await getDoc(doc(db, "usernames", identifier));
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

// --- Thunks ---
export const signInWithIdentifier = createAsyncThunk(
  "auth/signInWithIdentifier",
  async ({ identifier, password }, { rejectWithValue }) => {
    try {
      const email = await resolveEmail(identifier);
      await signInWithEmailAndPassword(auth, email, password);
      return true;
    } catch (e) {
      return rejectWithValue(mapAuthError(e, "login"));
    }
  }
);

export const signUp = createAsyncThunk(
  "auth/signUp",
  async ({ name, email, username, password }, { rejectWithValue }) => {
    try {
      const u = await getDoc(doc(db, "usernames", username));
      if (u.exists()) throw { code: "auth/username-taken" };

      const cred = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(cred.user, { displayName: name });

      await setDoc(doc(db, "users", cred.user.uid), {
        email,
        name,
        isAdmin: false,
      });

      await setDoc(doc(db, "usernames", username), {
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
  await _signOut(auth);
});

// --- Slice ---
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
  },
  extraReducers: (b) => {
    b.addCase(signInWithIdentifier.rejected, (s, a) => {
      s.error = a.payload;
    });
    b.addCase(signUp.rejected, (s, a) => {
      s.error = a.payload;
    });
    b.addCase(resetPassword.rejected, (s, a) => {
      s.error = a.payload;
    });
    b.addCase(signOut.fulfilled, (s) => {
      s.user = null;
    });
  },
});

export const { setCurrentUser, setAuthInitialized, clearAuthError } =
  slice.actions;
export default slice.reducer;

// --- Selectors ---
export const selectCurrentUser = (s) => s.auth.user;
export const selectIsAuthInitialized = (s) => s.auth.isInitialized;
// export const selectAuthError = (s) => s.auth.error;
