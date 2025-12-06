import { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { doc, serverTimestamp, setDoc, getDoc, deleteDoc } from "firebase/firestore";
import { updateEmail, updateProfile } from "firebase/auth";
import toast from "react-hot-toast";

import { auth, db } from "../../../services/firebase";
import { updateCurrentUser } from "../../../features/auth/authSlice";
import { getProfileState } from "../utils/helpers";
import { validateProfileField } from "../utils/validation";
import { MAX_AVATAR_SIZE, MAX_COMPRESSED_AVATAR_SIZE } from "../utils/constants";
import { useDebounce } from "../../../hooks/useDebounce";
import { getSettingsMessage } from "../utils/translations";

const loadUserProfile = async (userId) => {
  if (!userId) return null;
  try {
    const userDoc = await getDoc(doc(db, "users", userId));
    if (userDoc.exists()) {
      return userDoc.data();
    }
  } catch (error) {
    console.error("Error loading user profile:", error);
  }
  return null;
};

export const useProfileForm = (user) => {
  const dispatch = useDispatch();
  const normalizePhoneInput = (value = "") => value.replace(/\D/g, "").slice(0, 11);

  const [profileForm, setProfileForm] = useState(() => {
    const initial = getProfileState(user);
    return { ...initial, phone: normalizePhoneInput(initial.phone) };
  });
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [profileErrors, setProfileErrors] = useState({});
  const [avatarError, setAvatarError] = useState(false);
  const [uploadedAvatarName, setUploadedAvatarName] = useState("");
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);

  const setProfileFieldError = (field, message) => {
    setProfileErrors((prev) => {
      const next = { ...prev };
      if (message) next[field] = message;
      else delete next[field];
      return next;
    });
  };

  const validatePhoneInline = (value = "", { strict = false } = {}) => {
    const digits = normalizePhoneInput(value);
    if (!digits) return strict ? getSettingsMessage("phoneRequiredGeneric") : "";
    const isValid = digits.startsWith("01") && digits.length === 11;
    return isValid ? "" : getSettingsMessage("invalidEgyptPhone");
  };

  useEffect(() => {
    const loadProfile = async () => {
      if (!user?.uid) {
        const resetState = getProfileState(user);
        const normalizedPhone = normalizePhoneInput(resetState.phone);
        setProfileForm({ ...resetState, phone: normalizedPhone });
        setAvatarError(false);
        setHasUnsavedChanges(false);
        setUploadedAvatarName("");
        return;
      }

      setIsLoadingProfile(true);
      try {
        // Load fresh data from Firebase
        const userProfile = await loadUserProfile(user.uid);
        if (userProfile) {
          // Merge Firebase data with Redux user data
          const mergedUser = { ...user, ...userProfile };
          const mergedState = getProfileState(mergedUser);
          const normalizedPhone = normalizePhoneInput(mergedState.phone);
          setProfileForm({ ...mergedState, phone: normalizedPhone });
        } else {
          const baseState = getProfileState(user);
          const normalizedPhone = normalizePhoneInput(baseState.phone);
          setProfileForm({ ...baseState, phone: normalizedPhone });
        }
      } catch (error) {
        console.error("Error loading profile:", error);
        const fallbackState = getProfileState(user);
        const normalizedPhone = normalizePhoneInput(fallbackState.phone);
        setProfileForm({ ...fallbackState, phone: normalizedPhone });
      } finally {
        setIsLoadingProfile(false);
      }

      setAvatarError(false);
      setHasUnsavedChanges(false);
      setUploadedAvatarName("");
    };

    loadProfile();
  }, [user?.uid]);

  useEffect(() => {
    setAvatarError(false);
  }, [profileForm.photoURL]);

  const handleProfileChange = (field, value) => {
    if (field === "phone") {
      const normalized = normalizePhoneInput(value);
      setProfileForm((prev) => ({ ...prev, phone: normalized }));
      setHasUnsavedChanges(true);
      setProfileFieldError("phone", validatePhoneInline(normalized));
      return;
    }

    setProfileForm((prev) => ({ ...prev, [field]: value }));
    setHasUnsavedChanges(true);
  };

  const handlePhoneChange = (value = "") => handleProfileChange("phone", value);

  // Debounced validation to avoid excessive re-renders
  const debouncedProfileForm = useDebounce(profileForm, 300);

  useEffect(() => {
    const newErrors = {};
    Object.keys(debouncedProfileForm).forEach(field => {
      const error = validateProfileField(field, debouncedProfileForm[field]);
      if (error) newErrors[field] = error;
    });
    setProfileErrors(newErrors);
  }, [debouncedProfileForm]);

  // Removed auto-save functionality - only save on manual submit

  const handleAvatarUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Enhanced file type validation
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    const allowedExtensions = ['.jpg', '.jpeg', '.png', '.webp'];
    const fileName = file.name.toLowerCase();
    const hasValidType = allowedTypes.includes(file.type);
    const hasValidExtension = allowedExtensions.some(ext => fileName.endsWith(ext));

    if (!hasValidType || !hasValidExtension) {
      setProfileErrors((prev) => ({
        ...prev,
        photoURL: getSettingsMessage('invalidImageFile'),
      }));
      return;
    }
    if (file.size > MAX_AVATAR_SIZE) {
      setProfileErrors((prev) => ({
        ...prev,
        photoURL: getSettingsMessage('imageTooLarge'),
      }));
      return;
    }
    setIsUploadingAvatar(true);

    try {
      // Compress and convert image to Base64
      const processImageToBase64 = (file) => {
        return new Promise((resolve, reject) => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          const img = new Image();

          img.onload = () => {
            try {
              // Calculate new dimensions (max 200px for any dimension)
              const maxSize = 200;
              let { width, height } = img;

              if (width > height) {
                if (width > maxSize) {
                  height = (height * maxSize) / width;
                  width = maxSize;
                }
              } else {
                if (height > maxSize) {
                  width = (width * maxSize) / height;
                  height = maxSize;
                }
              }

              canvas.width = width;
              canvas.height = height;

              ctx.drawImage(img, 0, 0, width, height);

              // Convert to Base64 with 60% quality JPEG
              const base64String = canvas.toDataURL('image/jpeg', 0.6);

              // Check if compressed size is under 500KB
              const base64Size = Math.round((base64String.length * 3) / 4); // Approximate size in bytes
              if (base64Size > MAX_COMPRESSED_AVATAR_SIZE) {
                reject(new Error('Compressed image is too large. Please choose a smaller image.'));
                return;
              }

              // Clean up resources
              URL.revokeObjectURL(img.src);
              canvas.width = 0;
              canvas.height = 0;
              resolve(base64String);
            } catch (error) {
              // Clean up on error
              URL.revokeObjectURL(img.src);
              canvas.width = 0;
              canvas.height = 0;
              reject(error);
            }
          };

          img.onerror = () => {
            URL.revokeObjectURL(img.src);
            canvas.width = 0;
            canvas.height = 0;
            reject(new Error('Failed to load image'));
          };
          img.src = URL.createObjectURL(file);
        });
      };

      const base64Image = await processImageToBase64(file);

      // Update form with the Base64 string
      setProfileForm((prev) => ({ ...prev, photoURL: base64Image }));
      setUploadedAvatarName(file.name);
      setAvatarError(false);
      setProfileErrors((prev) => ({ ...prev, photoURL: "" }));
      setHasUnsavedChanges(true);

      // Update Redux state immediately to show avatar in sidebar
      dispatch(updateCurrentUser({
        photoURL: base64Image,
      }));

      setIsUploadingAvatar(false);
      toast.success('Profile image processed successfully!');
    } catch (error) {
      console.error('Avatar processing error:', error);
      toast.error(error.message || 'Failed to process image. Please try again.');
      setProfileErrors((prev) => ({
        ...prev,
        photoURL: error.message || 'Failed to process image',
      }));
      setIsUploadingAvatar(false);
    }
  };

  const handleAvatarReset = () => {
    setProfileForm((prev) => ({ ...prev, photoURL: "" }));
    setUploadedAvatarName("");
    setAvatarError(false);
    setProfileErrors((prev) => ({ ...prev, photoURL: "" }));
    setHasUnsavedChanges(true);

    // Update Redux state immediately to remove avatar from sidebar
    dispatch(updateCurrentUser({
      photoURL: "",
    }));
  };

  const handlePhotoLinkChange = (value) => {
    setUploadedAvatarName("");
    setAvatarError(false);
    handleProfileChange("photoURL", value);
  };

  const resetProfileForm = () => {
    const resetState = getProfileState(user);
    const normalizedPhone = normalizePhoneInput(resetState.phone);
    setProfileForm({ ...resetState, phone: normalizedPhone });
    setHasUnsavedChanges(false);
    setProfileErrors({});
    setUploadedAvatarName("");
  };

  // Helper function to check if there are actual changes
const hasProfileChanges = () => {
  const original = getProfileState(user);
  const normalizedOriginalPhone = normalizePhoneInput(original.phone);
  return (
    profileForm.firstName !== original.firstName ||
    profileForm.lastName !== original.lastName ||
    profileForm.email !== original.email ||
    profileForm.username !== original.username ||
    profileForm.phone !== normalizedOriginalPhone ||
    profileForm.location !== original.location ||
    profileForm.photoURL !== original.photoURL
  );
};

  const handleProfileSubmit = async (event) => {
    if (event?.preventDefault) event.preventDefault();
    if (!user?.uid) return;

    // Check if there are actual changes before saving
    if (!hasProfileChanges()) {
      toast.info(getSettingsMessage('noChangesToSave'));
      return;
    }

    setIsSavingProfile(true);

    try {
      const docRef = doc(db, "users", user.uid);
      const trimmedFirst = profileForm.firstName.trim();
      const trimmedLast = profileForm.lastName.trim();
      const displayName = `${trimmedFirst} ${trimmedLast}`.trim() || user.name;
      const sanitizedPhoto = profileForm.photoURL?.trim?.() || profileForm.photoURL || "";
      const trimmedEmail = profileForm.email?.trim?.() || user.email || "";
      const normalizedPhone = normalizePhoneInput(profileForm.phone);
      const trimmedLocation = profileForm.location.trim();
      const normalizedUsername = profileForm.username?.trim?.().toLowerCase() || "";
      const originalProfile = getProfileState(user);
      const originalUsername = originalProfile.username?.trim?.().toLowerCase() || "";
      const usernameChanged = normalizedUsername && normalizedUsername !== originalUsername;
      const currentAuthEmail = auth.currentUser?.email || user.email || "";
      const emailChanged = trimmedEmail && trimmedEmail !== currentAuthEmail;


      if (!trimmedEmail) {
        const message = getSettingsMessage('invalidEmail');
        setProfileErrors((prev) => ({ ...prev, email: message }));
        toast.error(message);
        setIsSavingProfile(false);
        return;
      }

      if (!normalizedPhone || !normalizedPhone.startsWith("01") || normalizedPhone.length !== 11) {
        const message = getSettingsMessage('invalidEgyptPhone');
        setProfileErrors((prev) => ({ ...prev, phone: message }));
        toast.error(message);
        setIsSavingProfile(false);
        return;
      }

      if (!normalizedUsername) {
        const message = getSettingsMessage('usernameRequired');
        setProfileErrors((prev) => ({ ...prev, username: message }));
        toast.error(message);
        setIsSavingProfile(false);
        return;
      }

      if (normalizedUsername.length < 3 || normalizedUsername.length > 30 || !/^[a-zA-Z0-9_]+$/.test(normalizedUsername)) {
        const message = getSettingsMessage('usernameInvalid');
        setProfileErrors((prev) => ({ ...prev, username: message }));
        toast.error(message);
        setIsSavingProfile(false);
        return;
      }

      let usernameRefToWrite = null;
      if (usernameChanged) {
        const usernameRef = doc(db, "usernames", normalizedUsername);
        const usernameSnap = await getDoc(usernameRef);
        if (usernameSnap.exists() && usernameSnap.data()?.uid !== user.uid) {
          const message = getSettingsMessage('usernameTaken');
          setProfileErrors((prev) => ({ ...prev, username: message }));
          toast.error(message);
          setIsSavingProfile(false);
          return;
        }
        usernameRefToWrite = usernameRef;
      }

      await setDoc(
        docRef,
        {
          firstName: trimmedFirst,
          lastName: trimmedLast,
          name: displayName,
          email: trimmedEmail,
          username: normalizedUsername,
          photoURL: sanitizedPhoto || null,
          contact: {
            ...(user?.contact || {}),
            phone: normalizedPhone,
            location: trimmedLocation,
          },
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );

      if (emailChanged && auth.currentUser) {
        try {
          await updateEmail(auth.currentUser, trimmedEmail);
        } catch (error) {
          const message =
            error.code === "auth/requires-recent-login"
              ? getSettingsMessage("emailRequiresRecentLogin")
              : getSettingsMessage("emailUpdateFailed");
          setProfileErrors((prev) => ({ ...prev, email: message }));
          toast.error(message);
          setIsSavingProfile(false);
          return;
        }
      }

      if (displayName && auth.currentUser) {
        await updateProfile(auth.currentUser, { displayName });
      }

      if (usernameChanged && usernameRefToWrite) {
        await setDoc(usernameRefToWrite, {
          email: trimmedEmail,
          uid: user.uid,
        });
        if (originalUsername) {
          await deleteDoc(doc(db, "usernames", originalUsername));
        }
      }

      // Update Redux state with new user data
      dispatch(updateCurrentUser({
        name: displayName,
        email: trimmedEmail,
        username: normalizedUsername,
        photoURL: sanitizedPhoto,
      }));

      setHasUnsavedChanges(false);
      toast.success(getSettingsMessage('saveProfileSuccess'));
    } catch (error) {
      console.error(error);
      toast.error(error?.message || getSettingsMessage('saveProfileFailed'));
    } finally {
      setIsSavingProfile(false);
    }
  };

  return {
    profileForm,
    isSavingProfile,
    hasUnsavedChanges,
    profileErrors,
    avatarError,
    uploadedAvatarName,
    isUploadingAvatar,
    isLoadingProfile,
    handleProfileChange,
    handleAvatarUpload,
    handleAvatarReset,
    handlePhotoLinkChange,
    resetProfileForm,
    handleProfileSubmit,
    setAvatarError,
    handlePhoneChange,
    normalizePhoneInput,
    validatePhoneInline,
  };
};
