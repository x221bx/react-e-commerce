// UserSettings Business Logic Service
import { doc, serverTimestamp, setDoc } from "firebase/firestore";
import {
  EmailAuthProvider,
  reauthenticateWithCredential,
  updatePassword,
} from "firebase/auth";
import toast from "react-hot-toast";

import { updateProfile, auth, db } from "../../../services/firebase";
import { getErrorMessage } from "../utils/translations";

export const saveNotifications = async (user, notificationForm) => {
  if (!user?.uid) throw new Error("User not authenticated");

  const docRef = doc(db, "users", user.uid);
  await setDoc(
    docRef,
    {
      preferences: {
        ...(user?.preferences || {}),
        notifications: notificationForm,
      },
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );

  return { success: true, message: getErrorMessage('saveNotificationsFailed') };
};

export const savePreferences = async (user, preferenceForm) => {
  if (!user?.uid) throw new Error("User not authenticated");

  const docRef = doc(db, "users", user.uid);
  await setDoc(
    docRef,
    {
      preferences: {
        ...(user?.preferences || {}),
        locale: preferenceForm.locale,
        measurement: preferenceForm.measurement,
        deliveryNotes: preferenceForm.deliveryNotes.trim(),
      },
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );

  return { success: true, message: getErrorMessage('savePreferencesFailed') };
};

export const updateUserPassword = async (currentPassword, newPassword) => {
  const currentUser = auth.currentUser;
  if (!currentUser?.email) {
    throw new Error("No authenticated user found");
  }

  const credential = EmailAuthProvider.credential(
    currentUser.email,
    currentPassword
  );
  await reauthenticateWithCredential(currentUser, credential);
  await updatePassword(currentUser, newPassword);

  return { success: true, message: getErrorMessage('updatePasswordFailed') };
};

export const updateAccountStatus = async (user, action) => {
  if (!user?.uid) throw new Error("User not authenticated");

  const docRef = doc(db, "users", user.uid);
  await setDoc(
    docRef,
    {
      accountStatus:
        action === "deactivate" ? "inactive" : "pending-deletion",
      accountStatusUpdatedAt: serverTimestamp(),
    },
    { merge: true }
  );

  return {
    success: true,
    message: action === "deactivate"
      ? getErrorMessage('accountDeactivated')
      : getErrorMessage('accountDeletionRequested')
  };
};

export const saveProfile = async (user, profileData) => {
  if (!user?.uid) throw new Error("User not authenticated");

  const docRef = doc(db, "users", user.uid);
  const trimmedFirst = profileData.firstName.trim();
  const trimmedLast = profileData.lastName.trim();
  const displayName = `${trimmedFirst} ${trimmedLast}`.trim() || user.name;
  const sanitizedPhoto = profileData.photoURL?.trim?.() || profileData.photoURL || "";
  const sanitizedProfession = profileData.profession.trim();
  const normalizedGender = profileData.gender || null;
  const normalizedBirthDate = profileData.birthDate || null;

  await setDoc(
    docRef,
    {
      firstName: trimmedFirst,
      lastName: trimmedLast,
      name: displayName,
      photoURL: sanitizedPhoto || null,
      birthDate: normalizedBirthDate,
      gender: normalizedGender,
      profession: sanitizedProfession || null,
      contact: {
        ...(user?.contact || {}),
        phone: profileData.phone.trim(),
        location: profileData.location.trim(),
      },
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );

  // Update Firebase Auth display name
  if (displayName && auth.currentUser) {
    await updateProfile(auth.currentUser, { displayName });
  }

  return { success: true, message: getErrorMessage('saveProfileFailed') };
};