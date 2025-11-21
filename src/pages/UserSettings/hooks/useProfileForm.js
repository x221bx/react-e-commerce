import { useState, useEffect } from "react";
import { doc, serverTimestamp, setDoc, getDoc, deleteDoc } from "firebase/firestore";
import { updateProfile } from "firebase/auth";
import toast from "react-hot-toast";

import { auth, db } from "../../../services/firebase";
import { getProfileState } from "../utils/helpers";
import { validateProfileField } from "../utils/validation";
import { MAX_AVATAR_SIZE } from "../utils/constants";
import { useDebounce } from "../../../hooks/useDebounce";
import { getSettingsMessage } from "../utils/translations";

export const useProfileForm = (user) => {
  const [profileForm, setProfileForm] = useState(getProfileState(user));
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [profileErrors, setProfileErrors] = useState({});
  const [avatarError, setAvatarError] = useState(false);
  const [uploadedAvatarName, setUploadedAvatarName] = useState("");
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

  useEffect(() => {
    setProfileForm(getProfileState(user));
    setAvatarError(false);
    setHasUnsavedChanges(false);
    setUploadedAvatarName("");
  }, [user]);

  useEffect(() => {
    setAvatarError(false);
  }, [profileForm.photoURL]);

  const handleProfileChange = (field, value) => {
    setProfileForm((prev) => ({ ...prev, [field]: value }));
    setHasUnsavedChanges(true);
  };

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

    // Compress image before converting to base64
    const compressImage = (file) => {
      return new Promise((resolve, reject) => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const img = new Image();

        img.onload = () => {
          try {
            // Calculate new dimensions (max 400px width/height to reduce file size)
            const maxSize = 400;
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

            // Preserve transparency for PNG/WebP, use JPEG for others
            const originalType = file.type;
            let outputType = 'image/jpeg';
            let quality = 0.7; // Lower quality for smaller files

            // Check if image has transparency (for PNG/WebP)
            const hasTransparency = originalType === 'image/png' || originalType === 'image/webp';

            if (hasTransparency) {
              // Keep original format to preserve transparency
              outputType = originalType;
              quality = 0.8; // Slightly higher quality for transparency
            } else {
              // Use JPEG for better compression on photos
              outputType = 'image/jpeg';
              quality = 0.75;
            }

            canvas.toBlob((blob) => {
              // Clean up resources
              URL.revokeObjectURL(img.src);
              canvas.width = 0;
              canvas.height = 0;
              resolve(blob);
            }, outputType, quality);
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

    const compressedFile = await compressImage(file);
    const reader = new FileReader();

    reader.onloadend = () => {
      const result = typeof reader.result === "string" ? reader.result : "";
      setProfileForm((prev) => ({ ...prev, photoURL: result }));
      setUploadedAvatarName(file.name);
      setAvatarError(false);
      setProfileErrors((prev) => ({ ...prev, photoURL: "" }));
      setHasUnsavedChanges(true);
      setIsUploadingAvatar(false);
    };
    reader.onerror = () => {
      toast.error(getSettingsMessage('fileReadError'));
      setIsUploadingAvatar(false);
    };
    reader.readAsDataURL(file);
  };

  const handleAvatarReset = () => {
    setProfileForm((prev) => ({ ...prev, photoURL: user?.photoURL || "" }));
    setUploadedAvatarName("");
    setAvatarError(false);
    setProfileErrors((prev) => ({ ...prev, photoURL: "" }));
  };

  const handlePhotoLinkChange = (value) => {
    setUploadedAvatarName("");
    setAvatarError(false);
    handleProfileChange("photoURL", value);
  };

  const resetProfileForm = () => {
    setProfileForm(getProfileState(user));
    setHasUnsavedChanges(false);
    setProfileErrors({});
    setUploadedAvatarName("");
  };

  // Helper function to check if there are actual changes
const hasProfileChanges = () => {
  const original = getProfileState(user);
  return (
    profileForm.firstName !== original.firstName ||
    profileForm.lastName !== original.lastName ||
    profileForm.email !== original.email ||
    profileForm.username !== original.username ||
    profileForm.phone !== original.phone ||
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
      const normalizedUsername = profileForm.username?.trim?.().toLowerCase() || "";
      const originalProfile = getProfileState(user);
      const originalUsername = originalProfile.username?.trim?.().toLowerCase() || "";
      const usernameChanged = normalizedUsername && normalizedUsername !== originalUsername;

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
            phone: profileForm.phone.trim(),
            location: profileForm.location.trim(),
          },
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );

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
    handleProfileChange,
    handleAvatarUpload,
    handleAvatarReset,
    handlePhotoLinkChange,
    resetProfileForm,
    handleProfileSubmit,
    setAvatarError,
  };
};
