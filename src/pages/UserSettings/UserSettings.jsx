import React, { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { doc, serverTimestamp, setDoc } from "firebase/firestore";
import {
  EmailAuthProvider,
  reauthenticateWithCredential,
  updatePassword,
} from "firebase/auth";
import toast from "react-hot-toast";

import { selectCurrentUser } from "../../features/auth/authSlice";
import { auth, db } from "../../services/firebase";
import { UseTheme } from "../../theme/ThemeProvider";
import i18n from "../../i18n";

// Import modular components
import Navigation from "./components/Navigation";
import OverviewCard from "./components/OverviewCard";
import ConfirmDialog from "./components/ConfirmDialog";

// Import section components
import PersonalSection from "./components/sections/PersonalSection";
import PreferencesSection from "./components/sections/PreferencesSection";
import SecuritySection from "./components/sections/SecuritySection";
import NotificationsSection from "./components/sections/NotificationsSection";
import AccountSection from "./components/sections/AccountSection";

// Import utilities and hooks
import { emptySecurityForm, notificationDefaults, preferenceDefaults } from "./utils/constants";
import { getNotificationState, getPreferenceState } from "./utils/helpers";
import { validateSecurityField, calculatePasswordStrength } from "./utils/validation";
import { getErrorMessage } from "./utils/translations";
import { useProfileForm } from "./hooks/useProfileForm";
import { useSettingsNavigation } from "./hooks/useSettingsNavigation";
import {
  saveNotifications,
  savePreferences,
  updateUserPassword,
  updateAccountStatus
} from "./services/userSettingsService";

export default function UserSettings({ variant = "standalone" }) {
  const user = useSelector(selectCurrentUser);
  const isEmbedded = variant === "embedded";
  const { theme } = UseTheme();
  const isDarkMode = theme === "dark";

  // Form states
  const [notificationForm, setNotificationForm] = useState(getNotificationState(user));
  const [preferenceForm, setPreferenceForm] = useState(getPreferenceState(user));
  const [securityForm, setSecurityForm] = useState(emptySecurityForm);

  // Loading states
  const [isSavingNotifications, setIsSavingNotifications] = useState(false);
  const [isSavingPreferences, setIsSavingPreferences] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [pendingAccountAction, setPendingAccountAction] = useState(null);

  // UI states
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState({ open: false, intent: null });
  const [passwordStrength, setPasswordStrength] = useState({ score: 0, feedback: [] });
  const [securityErrors, setSecurityErrors] = useState({});

  // Refs for sections
  const personalRef = useRef(null);
  const preferencesRef = useRef(null);
  const securityRef = useRef(null);
  const notificationsRef = useRef(null);
  const accountRef = useRef(null);

  // Custom hooks
  const navigation = useSettingsNavigation();
  const profile = useProfileForm(user);

  // Update forms when user changes
  useEffect(() => {
    setNotificationForm(getNotificationState(user));
    setPreferenceForm(getPreferenceState(user));
    setSecurityForm(emptySecurityForm);
  }, [user]);

  // Intersection observer for active section tracking
  useEffect(() => {
    const sections = [
      { id: "personal", ref: personalRef },
      { id: "preferences", ref: preferencesRef },
      { id: "security", ref: securityRef },
      { id: "notifications", ref: notificationsRef },
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
        // Trigger intersection when section is 55% from top and 35% from bottom of viewport
        rootMargin: "-55% 0px -35% 0px",
        // Require 25% of the section to be visible
        threshold: 0.25
      }
    );

    sections.forEach(({ ref }) => {
      if (ref.current) observer.observe(ref.current);
    });

    return () => observer.disconnect();
  }, [navigation]);

  // Event handlers
  const handleNotificationsChange = (field) => {
    setNotificationForm((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const handlePreferenceChange = (field, value) => {
    setPreferenceForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSecurityChange = (field, value) => {
    setSecurityForm((prev) => ({ ...prev, [field]: value }));

    const error = validateSecurityField(field, value, { ...securityForm, [field]: value });
    setSecurityErrors((prev) => ({ ...prev, [field]: error }));

    if (field === "newPassword") {
      const strength = calculatePasswordStrength(value);
      setPasswordStrength(strength);
    }
  };

  // Form submission handlers
  const handleNotificationsSubmit = async (event) => {
    event.preventDefault();
    if (!user?.uid) return;

    setIsSavingNotifications(true);
    try {
      await saveNotifications(user, notificationForm);
      toast.success('Notification settings saved successfully');
    } catch (error) {
      console.error(error);
      toast.error(getErrorMessage('saveNotificationsFailed'));
    } finally {
      setIsSavingNotifications(false);
    }
  };

  const handlePreferencesSubmit = async (event) => {
    event.preventDefault();
    if (!user?.uid) return;

    setIsSavingPreferences(true);
    try {
      await savePreferences(user, preferenceForm);

      // Apply language change if locale was changed
      if (preferenceForm.locale && preferenceForm.locale !== i18n.language) {
        await i18n.changeLanguage(preferenceForm.locale);
        document.documentElement.dir = preferenceForm.locale === 'ar' ? 'rtl' : 'ltr';
        document.documentElement.lang = preferenceForm.locale;
      }

      toast.success('Preferences saved successfully');
    } catch (error) {
      console.error(error);
      toast.error(getErrorMessage('savePreferencesFailed'));
    } finally {
      setIsSavingPreferences(false);
    }
  };

  const handlePasswordSubmit = async (event) => {
    event.preventDefault();
    if (!securityForm.currentPassword || !securityForm.newPassword) {
      toast.error(getErrorMessage('currentPasswordRequired'));
      return;
    }
    if (securityForm.newPassword !== securityForm.confirmPassword) {
      toast.error(getErrorMessage('passwordsNotMatch'));
      return;
    }

    setIsUpdatingPassword(true);
    try {
      await updateUserPassword(securityForm.currentPassword, securityForm.newPassword);
      clearSensitiveData();
      toast.success('Password updated successfully');
    } catch (error) {
      console.error(error);
      if (error?.code === "auth/wrong-password") {
        toast.error(getErrorMessage('wrongPassword'));
      } else if (error?.code === "auth/weak-password") {
        toast.error(getErrorMessage('weakPassword'));
      } else if (error?.code === "auth/too-many-requests") {
        toast.error(getErrorMessage('tooManyRequests'));
      } else {
        toast.error(getErrorMessage('updatePasswordFailed'));
      }
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  const handleAccountAction = async (action) => {
    if (!user?.uid) return;
    setPendingAccountAction(action);
    try {
      const result = await updateAccountStatus(user, action);
      toast.success(result.message);
    } catch (error) {
      console.error(error);
      toast.error(getErrorMessage('accountActionFailed'));
    } finally {
      setPendingAccountAction(null);
    }
  };

  const openConfirmDialog = (intent) => setConfirmDialog({ open: true, intent });
  const closeConfirmDialog = () => setConfirmDialog({ open: false, intent: null });
  const handleConfirmedAccountAction = () => {
    if (!confirmDialog.intent) return;
    handleAccountAction(confirmDialog.intent);
    closeConfirmDialog();
  };

  // Clear sensitive data from memory
  const clearSensitiveData = () => {
    setSecurityForm(emptySecurityForm);
    setShowCurrentPassword(false);
    setShowNewPassword(false);
    setShowConfirmPassword(false);
  };

  if (!user) {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center gap-4">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-emerald-500" />
        <p className="text-sm text-slate-600 dark:text-slate-400">
          {getErrorMessage('loading')}
        </p>
      </div>
    );
  }


  if (isEmbedded) {
    return (
      <>
        <div
          className={`space-y-6 rounded-3xl p-4 shadow-sm transition-colors ${
            isDarkMode
              ? "bg-slate-900/80 ring-1 ring-slate-800 text-slate-200"
              : "bg-white/95 ring-1 ring-slate-100 text-slate-900"
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
          />

          <PreferencesSection
            sectionId="preferences"
            preferencesRef={preferencesRef}
            preferenceForm={preferenceForm}
            handlePreferenceChange={handlePreferenceChange}
            handlePreferencesSubmit={handlePreferencesSubmit}
            isSavingPreferences={isSavingPreferences}
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
          />

          <NotificationsSection
            sectionId="notifications"
            notificationsRef={notificationsRef}
            notificationForm={notificationForm}
            handleNotificationsChange={handleNotificationsChange}
            handleNotificationsSubmit={handleNotificationsSubmit}
            isSavingNotifications={isSavingNotifications}
          />

          <AccountSection
            sectionId="account"
            accountRef={accountRef}
            pendingAccountAction={pendingAccountAction}
            openConfirmDialog={openConfirmDialog}
          />
        </div>

        <ConfirmDialog
          open={confirmDialog.open}
          intent={confirmDialog.intent}
          onCancel={closeConfirmDialog}
          onConfirm={handleConfirmedAccountAction}
        />
      </>
    );
  }

  // Standalone version
  return (
    <>
      <div className="min-h-screen bg-slate-50 py-10 transition-colors dark:bg-slate-950">
        <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 sm:px-6 lg:flex-row lg:gap-10 lg:px-8">
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

          <div className="flex-1 space-y-6">
            <OverviewCard
              user={user}
              profileForm={profile.profileForm}
              preferenceForm={preferenceForm}
              scrollToSection={navigation.scrollToSection}
            />

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
            />

            <PreferencesSection
              sectionId="preferences"
              preferencesRef={preferencesRef}
              preferenceForm={preferenceForm}
              handlePreferenceChange={handlePreferenceChange}
              handlePreferencesSubmit={handlePreferencesSubmit}
              isSavingPreferences={isSavingPreferences}
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
            />

            <NotificationsSection
              sectionId="notifications"
              notificationsRef={notificationsRef}
              notificationForm={notificationForm}
              handleNotificationsChange={handleNotificationsChange}
              handleNotificationsSubmit={handleNotificationsSubmit}
              isSavingNotifications={isSavingNotifications}
            />

            <AccountSection
              sectionId="account"
              accountRef={accountRef}
              pendingAccountAction={pendingAccountAction}
              openConfirmDialog={openConfirmDialog}
            />
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={confirmDialog.open}
        intent={confirmDialog.intent}
        onCancel={closeConfirmDialog}
        onConfirm={handleConfirmedAccountAction}
      />
    </>
  );
}

