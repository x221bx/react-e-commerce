// src/pages/UserSettings/UserSettings.jsx
import React, { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";

import { selectCurrentUser, signOut as signOutThunk } from "../../features/auth/authSlice";
import { UseTheme } from "../../theme/ThemeProvider";
import Footer from "../../Authcomponents/Footer";

// Import modular components
import Navigation from "./components/Navigation";
import ConfirmDialog from "./components/ConfirmDialog";

// Import section components
import PersonalSection from "./components/sections/PersonalSection";
import SecuritySection from "./components/sections/SecuritySection";
import AccountSection from "./components/sections/AccountSection";

// Import utilities and hooks
import { emptySecurityForm } from "./utils/constants";
import {
  validateSecurityField,
  calculatePasswordStrength,
} from "./utils/validation";
import { getSettingsMessage } from "./utils/translations";
import { useProfileForm } from "./hooks/useProfileForm";
import { useSettingsNavigation } from "./hooks/useSettingsNavigation";
import {
  updateUserPassword,
  deleteUserAccount,
} from "./services/userSettingsService";

export default function UserSettings({ variant = "standalone" }) {
  const user = useSelector(selectCurrentUser);
  const isEmbedded = variant === "embedded";
  const { theme } = UseTheme();
  const isDarkMode = theme === "dark";

  // Form states
  const [securityForm, setSecurityForm] = useState(emptySecurityForm);

  // Loading states
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [pendingAccountAction, setPendingAccountAction] = useState(null);
  const [isLoadingUserData, setIsLoadingUserData] = useState(true);

  // UI states
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState({
    open: false,
    intent: null,
  });
  const [passwordStrength, setPasswordStrength] = useState({
    score: 0,
    feedback: [],
  });
  const [securityErrors, setSecurityErrors] = useState({});

  // Refs for sections
  const personalRef = useRef(null);
  const securityRef = useRef(null);
  const accountRef = useRef(null);

  // Custom hooks
  const navigation = useSettingsNavigation();
  const profile = useProfileForm(user);

  // Update forms when user changes
  useEffect(() => {
    if (user) {
      setSecurityForm(emptySecurityForm);
      setIsLoadingUserData(false);
    } else {
      setIsLoadingUserData(true);
    }
  }, [user]);

  // Intersection observer for active section tracking
  useEffect(() => {
    const sections = [
      { id: "personal", ref: personalRef },
      { id: "security", ref: securityRef },
      { id: "account", ref: accountRef },
    ];

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const sectionId = entry.target.getAttribute("id");
            if (sectionId) navigation.setActiveSection(sectionId);
          }
        });
      },
      {
        rootMargin: "-55% 0px -35% 0px",
        threshold: 0.25,
      }
    );

    sections.forEach(({ ref }) => {
      if (ref.current) observer.observe(ref.current);
    });

    return () => observer.disconnect();
  }, [navigation]);

  // Event handlers
  const handleSecurityChange = (field, value) => {
    setSecurityForm((prev) => ({ ...prev, [field]: value }));

    const error = validateSecurityField(field, value, {
      ...securityForm,
      [field]: value,
    });
    setSecurityErrors((prev) => ({ ...prev, [field]: error }));

    if (field === "newPassword") {
      const strength = calculatePasswordStrength(value);
      setPasswordStrength(strength);
      if (securityForm.confirmPassword) {
        const confirmError = validateSecurityField(
          "confirmPassword",
          securityForm.confirmPassword,
          { ...securityForm, newPassword: value }
        );
        setSecurityErrors((prev) => ({ ...prev, confirmPassword: confirmError }));
      }
    }
  };

  // Form submission handlers
  const handlePasswordSubmit = async (event) => {
    event.preventDefault();
    const nextErrors = {};
    const currentError = validateSecurityField(
      "currentPassword",
      securityForm.currentPassword,
      securityForm
    );
    const newError = validateSecurityField(
      "newPassword",
      securityForm.newPassword,
      securityForm
    );
    const confirmError = validateSecurityField(
      "confirmPassword",
      securityForm.confirmPassword,
      securityForm
    );

    if (currentError) nextErrors.currentPassword = currentError;
    if (newError) nextErrors.newPassword = newError;
    if (confirmError) nextErrors.confirmPassword = confirmError;

    setSecurityErrors(nextErrors);

    if (Object.keys(nextErrors).length) {
      const firstError = Object.values(nextErrors)[0];
      if (firstError) toast.error(firstError);
      return;
    }

    setIsUpdatingPassword(true);
    try {
      await updateUserPassword(
        securityForm.currentPassword,
        securityForm.newPassword
      );
      clearSensitiveData();
      toast.success(getSettingsMessage("updatePasswordSuccess"));
    } catch (error) {
      console.error("Password update error:", error);
      const errorMessage =
        error.message || getSettingsMessage("updatePasswordFailed");
      toast.error(errorMessage);
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  const handleAccountDelete = async () => {
    if (!user?.uid) return;
    setPendingAccountAction("delete");
    try {
      const result = await deleteUserAccount(user);
      toast.success(result.message);
      // Log out immediately after deletion
      dispatch(signOutThunk());
    } catch (error) {
      console.error("Account action error:", error);
      const errorMessage =
        error.message || getSettingsMessage("accountActionFailed");
      toast.error(errorMessage);
    } finally {
      setPendingAccountAction(null);
    }
  };

  const openConfirmDialog = (intent = "delete") =>
    setConfirmDialog({ open: true, intent });
  const closeConfirmDialog = () =>
    setConfirmDialog({ open: false, intent: null });
  const handleConfirmedAccountAction = () => {
    handleAccountDelete();
    closeConfirmDialog();
  };

  // Clear sensitive data from memory
  const clearSensitiveData = () => {
    setSecurityForm(emptySecurityForm);
    setShowCurrentPassword(false);
    setShowNewPassword(false);
    setShowConfirmPassword(false);
  };

  // ───────────────── LOADING STATE ─────────────────
  if (!user || isLoadingUserData) {
    return (
      <div className="min-h-screen bg-white py-10 transition-colors dark:bg-[#020f0f]">
        <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 sm:px-6 lg:flex-row lg:gap-10 lg:px-8">
          {/* Sidebar skeleton */}
          <aside className="space-y-4 lg:w-64">
            <div className="rounded-3xl bg-white/90 backdrop-blur-sm p-6 shadow-xl ring-1 ring-emerald-100/60 dark:bg-[#0f1d1d]/80 dark:ring-emerald-900/40">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 animate-pulse rounded-full bg-slate-200 dark:bg-emerald-950/60" />
                <div className="space-y-2">
                  <div className="h-4 w-24 animate-pulse rounded bg-slate-200 dark:bg-emerald-950/60" />
                  <div className="h-3 w-32 animate-pulse rounded bg-slate-200 dark:bg-emerald-950/60" />
                </div>
              </div>
              <div className="mt-4 h-3 w-full animate-pulse rounded bg-slate-200 dark:bg-emerald-950/60" />
            </div>

            <div className="rounded-3xl bg-white/90 backdrop-blur-sm p-4 shadow-xl ring-1 ring-emerald-100/60 dark:bg-[#0f1d1d]/80 dark:ring-emerald-900/40">
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <div
                    key={i}
                    className="h-10 w-full animate-pulse rounded-2xl bg-slate-200 dark:bg-emerald-950/60"
                  />
                ))}
              </div>
            </div>
          </aside>

          {/* Main content skeleton */}
          <div className="flex-1 space-y-6">
            <div className="rounded-3xl bg-white/80 backdrop-blur-sm p-6 shadow-xl ring-1 ring-emerald-100/60 dark:bg-[#0f1d1d]/80 dark:ring-emerald-900/40">
              <div className="space-y-4">
                <div className="h-6 w-48 animate-pulse rounded bg-slate-200 dark:bg-emerald-950/60" />
                <div className="h-4 w-96 animate-pulse rounded bg-slate-200 dark:bg-emerald-950/60" />
              </div>
            </div>
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="rounded-3xl bg-white/80 backdrop-blur-sm p-6 shadow-xl ring-1 ring-emerald-100/60 dark:bg-[#0f1d1d]/80 dark:ring-emerald-900/40"
              >
                <div className="space-y-4">
                  <div className="h-5 w-32 animate-pulse rounded bg-slate-200 dark:bg-emerald-950/60" />
                  <div className="h-4 w-full animate-pulse rounded bg-slate-200 dark:bg-emerald-950/60" />
                  <div className="h-10 w-full animate-pulse rounded bg-slate-200 dark:bg-emerald-950/60" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const settingsSections = (
    <>
      <PersonalSection
        sectionId="personal"
        personalRef={personalRef}
        profile={profile}
        handleProfileChange={profile.handleProfileChange}
        handleAvatarUpload={profile.handleAvatarUpload}
        handleAvatarReset={profile.handleAvatarReset}
        handlePhotoLinkChange={profile.handlePhotoLinkChange}
        resetProfileForm={profile.resetProfileForm}
        handleProfileSubmit={profile.handleProfileSubmit}
        isSavingProfile={profile.isSavingProfile}
        hasUnsavedChanges={profile.hasUnsavedChanges}
        errors={profile.profileErrors}
        handlePhoneChange={profile.handlePhoneChange}
      />

      <SecuritySection
        sectionId="security"
        securityRef={securityRef}
        securityForm={securityForm}
        handleSecurityChange={handleSecurityChange}
        handlePasswordSubmit={handlePasswordSubmit}
        isUpdatingPassword={isUpdatingPassword}
        showCurrentPassword={showCurrentPassword}
        showNewPassword={showNewPassword}
        showConfirmPassword={showConfirmPassword}
        setShowCurrentPassword={setShowCurrentPassword}
        setShowNewPassword={setShowNewPassword}
        setShowConfirmPassword={setShowConfirmPassword}
        passwordStrength={passwordStrength}
        securityErrors={securityErrors}
        user={user}
      />

      <AccountSection
        sectionId="account"
        accountRef={accountRef}
        pendingAccountAction={pendingAccountAction}
        openConfirmDialog={openConfirmDialog}
      />
    </>
  );

  // ───────────────── EMBEDDED (inside AccountLayout) ─────────────────
  const content = isEmbedded ? (
    <div
      className={`settings-shell space-y-6 rounded-3xl p-4 transition-colors ${
        isDarkMode
          ? "bg-[#0f1d1d]/80 ring-emerald-900/40 text-slate-200"
          : "bg-white/95 ring-emerald-100 text-slate-900"
      }`}
    >
      <Navigation
        variant="embedded"
        activeCategory={navigation.activeCategory}
        activeSection={navigation.activeSection}
        filteredNavItems={navigation.filteredNavItems}
        activeCategoryCopy={navigation.activeCategoryCopy}
        handleCategoryChange={navigation.handleCategoryChange}
        scrollToSection={navigation.scrollToSection}
        user={user}
        profileForm={profile.profileForm}
      />
      {settingsSections}
    </div>
  ) : (
    // ───────────────── STANDALONE VARIANT ─────────────────
    <div className="min-h-screen bg-white py-10 transition-colors dark:bg-[#020f0f]">
      <div className="settings-shell mx-auto flex max-w-6xl flex-col gap-6 px-4 sm:px-6 lg:flex-row lg:gap-10 lg:px-8">
        <aside className="space-y-4 lg:w-64">
          <Navigation
            variant="standalone"
            activeCategory={navigation.activeCategory}
            activeSection={navigation.activeSection}
            filteredNavItems={navigation.filteredNavItems}
            activeCategoryCopy={navigation.activeCategoryCopy}
            handleCategoryChange={navigation.handleCategoryChange}
            scrollToSection={navigation.scrollToSection}
          />
        </aside>

        <div className="flex-1 space-y-6">{settingsSections}</div>
      </div>
    </div>
  );

  return (
    <>
      {content}
      <ConfirmDialog
        open={confirmDialog.open}
        intent={confirmDialog.intent}
        onCancel={closeConfirmDialog}
        onConfirm={handleConfirmedAccountAction}
      />
      {!isEmbedded && <Footer />}
    </>
  );
}
