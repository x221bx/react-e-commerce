// UserSettings Business Logic Service
import { collection, doc, getDocs, query, serverTimestamp, setDoc, updateDoc, where, deleteDoc } from "firebase/firestore";
import {
  EmailAuthProvider,
  reauthenticateWithCredential,
  updatePassword,
  sendPasswordResetEmail,
  deleteUser,
} from "firebase/auth";
import { updateProfile, auth, db } from "../../../services/firebase";
import { isValidEmail } from "../../../utils/validators";
import { getSettingsMessage } from "../utils/translations";

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
        theme: user?.preferences?.theme || preferenceForm?.theme || undefined,
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

export const deleteUserAccount = async (user, password) => {
  if (!user?.uid) throw new Error("User not authenticated");
  if (!password) throw new Error("Password is required for account deletion");
  const currentUser = auth.currentUser;
  if (!currentUser) throw new Error(getSettingsMessage("accountActionFailed"));

  const userDocRef = doc(db, "users", user.uid);
  const usernameKey = user.username?.trim?.().toLowerCase?.();

  try {
    // Cancel open orders for this user
    const ordersQuery = query(collection(db, "orders"), where("uid", "==", user.uid));
    const ordersSnapshot = await getDocs(ordersQuery);
    const cancelPromises = ordersSnapshot.docs.map((orderDoc) =>
      updateDoc(orderDoc.ref, {
        status: "cancelled",
        cancellationReason: "Account deleted by user",
        updatedAt: serverTimestamp(),
      }).catch((error) => {
        console.error("Failed to cancel order", orderDoc.id, error);
      })
    );
    await Promise.all(cancelPromises);
  } catch (error) {
    console.error("Order cancellation warning", error);
  }

  try {
    await deleteDoc(userDocRef);
    if (usernameKey) {
      await deleteDoc(doc(db, "usernames", usernameKey));
    }
  } catch (error) {
    console.error("Failed to delete profile data", error);
    throw new Error(getSettingsMessage("accountActionFailed"));
  }

  try {
    // Re-authenticate before deletion
    const credential = EmailAuthProvider.credential(
      currentUser.email,
      password
    );
    await reauthenticateWithCredential(currentUser, credential);

    // Now delete the user
    await deleteUser(currentUser);
  } catch (error) {
    console.error("Auth delete error", error);
    if (error.code === "auth/wrong-password") {
      throw new Error("Incorrect password. Please try again.");
    } else if (error.code === "auth/too-many-requests") {
      throw new Error("Too many failed attempts. Please try again later.");
    } else if (error.code === "auth/requires-recent-login") {
      throw new Error("For security reasons, please sign out and sign back in before deleting your account.");
    }
    throw new Error(getSettingsMessage("accountActionFailed"));
  }

  // Firebase Auth automatically signs out the user after deleteUser()
  // The auth state listener in App.jsx will handle Redux state updates

  // Redirect to home page after successful deletion
  setTimeout(() => {
    window.location.href = "/";
  }, 1500); // Give time for success message to show

  return {
    success: true,
    message: getSettingsMessage("accountDeleted"),
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
      // keep both top-level and nested contact for backward/forward compatibility
      phone: profileData.phone.trim(),
      location: profileData.location.trim(),
      contact: {
        ...(user?.contact || {}),
        phone: profileData.phone.trim(),
        location: profileData.location.trim(),
        email: user.email || "",
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

  if (!isValidEmail(email)) {
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

  if (!messageData?.description?.trim()) {
    throw new Error("Description is required");
  }

  if (!messageData?.phoneNumber?.trim()) {
    throw new Error("Phone number is required for contact purposes");
  }

  try {
    const trimmedDescription = messageData.description.trim();
    const supportData = {
      // New professional structure
      category: messageData.category || messageData.topic || "general",
      priority: messageData.priority || "normal",
      subject: messageData.subject || "Support Request",
      description: trimmedDescription,
      originalMessage: trimmedDescription, // Preserve original message

      // Contact information
      phoneNumber: messageData.phoneNumber.trim(),
      phone: messageData.phoneNumber.trim(), // align with admin views expecting "phone"
      contact: {
        phone: messageData.phoneNumber.trim(),
        email: user.email || "",
        name: user.name || user.displayName || user.email || ""
      },

      // User information
      uid: user.uid,
      userId: user.uid,
      userEmail: user.email,
      userName: user.name || user.displayName,

      // Status and tracking
      status: "pending",
      tags: [], // For future categorization
      assignedTo: null, // For admin assignment
      sla: {
        targetResponseTime: getSLATarget(messageData.priority || "normal"),
        actualResponseTime: null,
        targetResolutionTime: getSLAResolutionTarget(messageData.priority || "normal"),
        actualResolutionTime: null
      },

      // Conversation thread
      replies: [], // Will be populated by admin responses

      // Metadata
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      lastActivity: serverTimestamp(),

      // Additional tracking
      source: "customer_portal",
      channel: "web_form",
      satisfaction: null, // For post-resolution feedback
      reopened: false,
      reopenedCount: 0
    };

    // Generate unique ticket ID
    const ticketId = generateTicketId();
    supportData.ticketId = ticketId;

    // Save to global support collection for admin access (ensure phone fields included)
    const globalSupportRef = doc(db, "support", ticketId);
    await setDoc(globalSupportRef, supportData);

    // Also save to user's support tickets
    const userSupportRef = doc(db, "users", user.uid, "support_tickets", ticketId);
    await setDoc(userSupportRef, {
      ticketId,
      category: supportData.category,
      priority: supportData.priority,
      subject: supportData.subject,
      status: supportData.status,
      createdAt: supportData.createdAt,
      lastActivity: supportData.lastActivity
    });

    return {
      success: true,
      message: `Your support request has been submitted successfully! Ticket #${ticketId} created.`,
      ticketId
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

// Helper function to generate unique ticket IDs
const generateTicketId = () => {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substr(2, 5);
  return `TCK-${timestamp}-${random}`.toUpperCase();
};

// SLA target times based on priority (in hours)
const getSLATarget = (priority) => {
  switch (priority) {
    case "urgent": return 1; // 1 hour
    case "high": return 4; // 4 hours
    case "normal": return 24; // 24 hours
    case "low": return 72; // 72 hours
    default: return 24;
  }
};

const getSLAResolutionTarget = (priority) => {
  switch (priority) {
    case "urgent": return 8; // 8 hours
    case "high": return 24; // 24 hours
    case "normal": return 72; // 72 hours
    case "low": return 168; // 1 week
    default: return 72;
  }
};
