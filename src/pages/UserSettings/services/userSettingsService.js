// UserSettings Business Logic Service
import { doc, serverTimestamp, setDoc } from "firebase/firestore";
import {
  EmailAuthProvider,
  reauthenticateWithCredential,
  updatePassword,
  sendPasswordResetEmail,
} from "firebase/auth";
import { updateProfile, auth, db } from "../../../services/firebase";
import { getErrorMessage } from "../utils/translations";

export const saveNotifications = async (user, notificationForm) => {
  if (!user?.uid) {
    throw new Error("User not authenticated");
  }

  if (!notificationForm || typeof notificationForm !== 'object') {
    throw new Error("Invalid notification data");
  }

  try {
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

    return { success: true, message: getSettingsMessage('saveNotificationsSuccess') };
  } catch (error) {
    console.error('Error saving notifications:', error);

    // Handle specific Firebase errors
    if (error.code === 'permission-denied') {
      throw new Error("You don't have permission to update your settings. Please try logging in again.");
    } else if (error.code === 'unavailable') {
      throw new Error("Service is temporarily unavailable. Please check your internet connection and try again.");
    } else if (error.code === 'quota-exceeded') {
      throw new Error("Storage quota exceeded. Please contact support.");
    }

    throw new Error(getSettingsMessage('saveNotificationsFailed'));
  }
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

  return { success: true, message: getSettingsMessage('savePreferencesSuccess') };
};

export const updateUserPassword = async (currentPassword, newPassword) => {
  const currentUser = auth.currentUser;
  if (!currentUser?.email) {
    throw new Error("No authenticated user found");
  }

  if (!currentPassword || !newPassword) {
    throw new Error("Both current and new passwords are required");
  }

  if (newPassword.length < 8) {
    throw new Error("New password must be at least 8 characters long");
  }

  try {
    const credential = EmailAuthProvider.credential(
      currentUser.email,
      currentPassword
    );
    await reauthenticateWithCredential(currentUser, credential);
    await updatePassword(currentUser, newPassword);

    return { success: true, message: getSettingsMessage('updatePasswordSuccess') };
  } catch (error) {
    console.error('Error updating password:', error);

    // Handle specific Firebase Auth errors
    if (error.code === 'auth/wrong-password') {
      throw new Error(getSettingsMessage('wrongPassword'));
    } else if (error.code === 'auth/weak-password') {
      throw new Error(getSettingsMessage('weakPassword'));
    } else if (error.code === 'auth/too-many-requests') {
      throw new Error(getSettingsMessage('tooManyRequests'));
    } else if (error.code === 'auth/requires-recent-login') {
      throw new Error("For security reasons, please log out and log back in before changing your password.");
    }

    throw new Error(getSettingsMessage('updatePasswordFailed'));
  }
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
      ? getSettingsMessage('accountDeactivated')
      : getSettingsMessage('accountDeletionRequested')
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

  return { success: true, message: getSettingsMessage('saveProfileSuccess') };
};

export const sendPasswordReset = async (email) => {
  if (!email) {
    throw new Error("Email is required");
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new Error("Please enter a valid email address");
  }

  try {
    await sendPasswordResetEmail(auth, email);
    return {
      success: true,
      message: getSettingsMessage('passwordResetEmailSent')
    };
  } catch (error) {
    console.error('Error sending password reset email:', error);

    // Handle specific Firebase Auth errors
    if (error.code === 'auth/user-not-found') {
      throw new Error("No account found with this email address.");
    } else if (error.code === 'auth/invalid-email') {
      throw new Error("Please enter a valid email address.");
    } else if (error.code === 'auth/too-many-requests') {
      throw new Error("Too many requests. Please try again later.");
    }

    throw new Error("Failed to send password reset email. Please try again.");
  }
};

export const sendSupportMessage = async (user, messageData) => {
  if (!user?.uid) {
    throw new Error("User not authenticated");
  }

  if (!messageData?.message?.trim()) {
    throw new Error("Message is required");
  }

  if (!messageData?.phoneNumber?.trim()) {
    throw new Error("Phone number is required for contact purposes");
  }

  try {
    const supportData = {
      topic: messageData.topic || "general",
      message: messageData.message.trim(),
      phoneNumber: messageData.phoneNumber.trim(),
      userId: user.uid,
      userEmail: user.email,
      userName: user.name || user.displayName,
      status: "pending",
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    // Save to user's support messages collection
    const userSupportRef = doc(db, "users", user.uid, "support", Date.now().toString());
    await setDoc(userSupportRef, supportData);

    // Also save to global support collection for admin access
    const globalSupportRef = doc(db, "support", Date.now().toString());
    await setDoc(globalSupportRef, supportData);

    return {
      success: true,
      message: "Your message has been sent successfully! Our support team will respond within 24 hours."
    };
  } catch (error) {
    console.error('Error sending support message:', error);

    // Handle specific Firebase errors
    if (error.code === 'permission-denied') {
      throw new Error("You don't have permission to send messages. Please try logging in again.");
    } else if (error.code === 'unavailable') {
      throw new Error("Service is temporarily unavailable. Please check your internet connection and try again.");
    }

    throw new Error("Failed to send message. Please try again.");
  }
};
