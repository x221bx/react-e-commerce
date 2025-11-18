import { useState, useEffect } from "react";
import { doc, serverTimestamp, setDoc } from "firebase/firestore";
import { updateProfile } from "firebase/auth";
import toast from "react-hot-toast";

import { auth, db } from "../../../services/firebase";
import { getProfileState } from "../utils/helpers";
import { validateProfileField } from "../utils/validation";
import { MAX_AVATAR_SIZE } from "../utils/constants";

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

    const error = validateProfileField(field, value);
    setProfileErrors((prev) => ({ ...prev, [field]: error }));

    setHasUnsavedChanges(true);
  };

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
        photoURL: "Please upload a valid image file (PNG, JPG, or WebP only).",
      }));
      return;
    }
    if (file.size > MAX_AVATAR_SIZE) {
      setProfileErrors((prev) => ({
        ...prev,
        photoURL: "Image is too large. Please upload a file under 2MB.",
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
            // Calculate new dimensions (max 600px width/height for better performance)
            const maxSize = 600;
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

            // Compress with 0.7 quality for better performance
            canvas.toBlob(resolve, 'image/jpeg', 0.7);
          } catch (error) {
            reject(error);
          }
        };

        img.onerror = () => reject(new Error('Failed to load image'));
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
      toast.error("Unable to read the selected file.");
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

  const handleProfileSubmit = async (event) => {
    if (event?.preventDefault) event.preventDefault();
    if (!user?.uid) return;

    setIsSavingProfile(true);

    try {
      const docRef = doc(db, "users", user.uid);
      const trimmedFirst = profileForm.firstName.trim();
      const trimmedLast = profileForm.lastName.trim();
      const displayName = `${trimmedFirst} ${trimmedLast}`.trim() || user.name;
      const sanitizedPhoto = profileForm.photoURL?.trim?.() || profileForm.photoURL || "";
      const sanitizedProfession = profileForm.profession.trim();
      const normalizedGender = profileForm.gender || null;
      const normalizedBirthDate = profileForm.birthDate || null;

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

      setHasUnsavedChanges(false);
      toast.success("Profile updated successfully.");
    } catch (error) {
      console.error(error);
      toast.error(error?.message || "Unable to update profile.");
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