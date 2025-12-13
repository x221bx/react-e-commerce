import { initializeApp, getApps } from "firebase/app";
import {
  getAuth,
  createUserWithEmailAndPassword,
  updateProfile,
  signOut,
  sendPasswordResetEmail,
} from "firebase/auth";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  setDoc,
  Timestamp,
  where,
  updateDoc,
  deleteDoc,
  writeBatch,
} from "firebase/firestore";
import { db, firebaseConfig } from "./firebase";

const SECONDARY_APP_NAME = "delivery-admin-helper";
let secondaryAuth = null;

function getSecondaryAuth() {
  if (secondaryAuth) return secondaryAuth;
  const existing = getApps().find((a) => a.name === SECONDARY_APP_NAME);
  const app = existing || initializeApp(firebaseConfig, SECONDARY_APP_NAME);
  secondaryAuth = getAuth(app);
  return secondaryAuth;
}

export async function createDeliveryAccount({
  name,
  email,
  password,
  username,
  phone = "",
  vehicleType = "",
  zone = "",
  createdBy = null,
}) {
  if (!name || !email || !password || !username) {
    throw new Error("Name, email, password, and username are required");
  }

  const normalizedUsername = username.trim().toLowerCase();
  const usernameDoc = await getDoc(doc(db, "usernames", normalizedUsername));
  if (usernameDoc.exists()) {
    throw new Error("Username is already in use");
  }

  const auth = getSecondaryAuth();
  const cred = await createUserWithEmailAndPassword(auth, email.trim(), password);
  await updateProfile(cred.user, { displayName: name });

  const profile = {
    email: email.trim(),
    name: name.trim(),
    username: normalizedUsername,
    phone: phone.trim(),
    vehicleType: vehicleType.trim(),
    zone: zone.trim(),
    role: "delivery",
    isDelivery: true,
    isAdmin: false,
    active: true,
    createdAt: Timestamp.now(),
    createdBy: createdBy?.uid || null,
    createdByName: createdBy?.name || createdBy?.email || null,
  };

  await setDoc(doc(db, "users", cred.user.uid), profile);
  await setDoc(doc(db, "usernames", normalizedUsername), {
    email: email.trim(),
    uid: cred.user.uid,
  });

  // Keep the primary admin session intact by signing out only the secondary auth
  await signOut(auth).catch(() => {});

  return { uid: cred.user.uid, ...profile };
}

export async function listDeliveryAccounts() {
  const usersRef = collection(db, "users");
  const [roleSnap, flagSnap, disabledRoleSnap, inactiveSnap] = await Promise.all([
    getDocs(query(usersRef, where("role", "==", "delivery"))),
    getDocs(query(usersRef, where("isDelivery", "==", true))).catch(() => null),
    getDocs(query(usersRef, where("role", "==", "disabled"))).catch(() => null),
    getDocs(query(usersRef, where("active", "==", false))).catch(() => null),
  ]);

  const merged = new Map();
  roleSnap.forEach((docSnap) => merged.set(docSnap.id, { id: docSnap.id, ...docSnap.data() }));

  [flagSnap, disabledRoleSnap, inactiveSnap].forEach((snap) => {
    if (!snap) return;
    snap.forEach((docSnap) => {
      if (!merged.has(docSnap.id)) {
        merged.set(docSnap.id, { id: docSnap.id, ...docSnap.data() });
      }
    });
  });

  return Array.from(merged.values());
}

export async function updateDeliveryAccount(id, updates = {}) {
  if (!id) throw new Error("Delivery user id is required");
  const currentSnap = await getDoc(doc(db, "users", id));
  if (!currentSnap.exists()) throw new Error("Delivery user not found");
  const current = currentSnap.data() || {};
  const payload = {};
  ["name", "phone", "vehicleType", "zone"].forEach((key) => {
    if (updates[key] !== undefined) payload[key] = (updates[key] || "").trim();
  });
  if (typeof updates.active === "boolean") {
    payload.active = updates.active;
    payload.isDelivery = updates.active;
    payload.role = updates.active ? "delivery" : "disabled";
    payload.updatedAt = Timestamp.now();
  }

  // Username change: ensure uniqueness and update mapping
  if (updates.username && updates.username.trim()) {
    const newUsername = updates.username.trim().toLowerCase();
    const oldUsername = current.username;
    if (newUsername !== oldUsername) {
      const existing = await getDoc(doc(db, "usernames", newUsername));
      if (existing.exists()) throw new Error("Username is already in use");
      // move username mapping
      const batch = writeBatch(db);
      batch.set(doc(db, "usernames", newUsername), {
        email: current.email,
        uid: id,
      });
      if (oldUsername) {
        batch.delete(doc(db, "usernames", oldUsername));
      }
      batch.update(doc(db, "users", id), { username: newUsername });
      await batch.commit();
    }
  }

  await updateDoc(doc(db, "users", id), payload);
  return payload;
}

export async function deactivateDeliveryAccount(id, meta = {}) {
  if (!id) throw new Error("Delivery user id is required");
  await updateDoc(doc(db, "users", id), {
    active: false,
    isDelivery: false,
    role: "disabled",
    deactivatedAt: Timestamp.now(),
    deactivatedBy: meta.uid || null,
    deactivatedByName: meta.name || meta.email || null,
  });
}

export async function sendDeliveryPasswordReset(email) {
  if (!email) throw new Error("Email is required");
  const auth = getSecondaryAuth();
  await sendPasswordResetEmail(auth, email);
  await signOut(auth).catch(() => {});
}

export async function deleteDeliveryAccount(id) {
  if (!id) throw new Error("Delivery user id is required");
  const userRef = doc(db, "users", id);
  const snap = await getDoc(userRef);
  if (!snap.exists()) return;
  const data = snap.data() || {};
  const username = data.username;

  // Clear assignments on orders for this driver
  const assignments = await getDocs(query(collection(db, "orders"), where("assignedDeliveryId", "==", id)));
  const batch = writeBatch(db);
  assignments.forEach((d) => {
    batch.update(d.ref, {
      assignedDeliveryId: null,
      deliveryId: null,
      assignedDeliveryName: null,
      assignedDeliveryEmail: null,
      assignedDeliveryPhone: null,
      assignedAt: null,
    });
  });
  await batch.commit().catch(() => {});

  // Remove username mapping and user doc
  if (username) {
    await deleteDoc(doc(db, "usernames", username)).catch(() => {});
  }
  await deleteDoc(userRef);
}
