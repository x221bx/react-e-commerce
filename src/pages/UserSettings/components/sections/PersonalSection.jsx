import React from "react";
import SectionCard from "../SectionCard";
import ProfileAvatar from "../ProfileAvatar";
import Input from "../../../../components/ui/Input";
import { UploadCloud, AlertCircle } from "lucide-react";
import { useTranslation } from "react-i18next";

const PersonalSection = ({
  sectionId,
  personalRef,
  profile,
  handleProfileChange,
  handleAvatarUpload,
  handleAvatarReset,
  resetProfileForm,
  handleProfileSubmit,
  isSavingProfile,
  hasUnsavedChanges,
  errors = {},
}) => {
  const { t } = useTranslation();
  const errorEntries = Object.entries(errors || {});
  const hasErrors = errorEntries.length > 0;
  const fullName = `${profile.profileForm.firstName || ""} ${
    profile.profileForm.lastName || ""
  }`
    .trim()
    .replace(/\s+/g, " ");

  return (
    <SectionCard
      sectionId={sectionId}
      innerRef={personalRef}
      eyebrow={t("settings.personal_info", "Personal Information")}
      title={t("settings.keep_contact_accurate", "Update your contact details")}
      description={t(
        "settings.info_on_invoices",
        "This information appears on invoices and delivery slips."
      )}
    >
      <form onSubmit={handleProfileSubmit} className="space-y-5 text-slate-900 dark:text-slate-100">
        {hasErrors && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-3 dark:border-red-800 dark:bg-red-900/20">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-4 w-4 flex-shrink-0 text-red-600 dark:text-red-400 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-red-800 dark:text-red-200">
                  {t("settings.fix_errors_short", "Check these fields to continue:")}
                </p>
                <ul className="mt-1 space-y-1 text-xs text-red-700 dark:text-red-300">
                  {errorEntries.map(([field, message]) => (
                    <li key={field}>• {message}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-[auto,1fr]">
          <div className="flex flex-col items-center gap-4 text-slate-900 dark:text-slate-100">
            <div className="relative group">
              <ProfileAvatar
                photo={!profile.avatarError ? profile.profileForm.photoURL : ""}
                initials={profile.initials}
                onError={() => profile.setAvatarError(true)}
                size="xl"
                name={fullName || t("settings.personal_info", "Personal Information")}
              />
              {profile.profileForm.photoURL && (
                <div className="absolute -bottom-2 -right-2 flex gap-1">
                  <button
                    type="button"
                    onClick={handleAvatarReset}
                    disabled={isSavingProfile}
                    className="p-1.5 rounded-full bg-red-500   shadow-lg hover:bg-red-600 transition disabled:opacity-50"
                    title={t("common.remove", "Remove photo")}
                  >
                    <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              )}
            </div>
            <div className="text-center">
              <p className="text-sm font-semibold mb-1">
                {fullName || t("settings.personal_info", "Your Profile")}
              </p>
              <p className="text-xs text-slate-600 dark:text-slate-300 font-medium">
                {t("settings.photo_formats", "PNG, JPG, WebP • Max 2MB")}
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-600 p-6 text-center transition hover:border-emerald-400 dark:hover:border-emerald-500">
              <UploadCloud className="mx-auto h-8 w-8 text-slate-500 dark:text-slate-200 mb-2" />
              <p className="text-sm font-semibold mb-1">
                {t("settings.upload_profile_photo", "Upload profile photo")}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-300 mb-4">
                {t("settings.photo_formats_desc", "Drag and drop or click to browse")}
              </p>
              <label className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 cursor-pointer disabled:opacity-50">
                <UploadCloud className="h-4 w-4" />
                {isSavingProfile
                  ? t("common.uploading", "Uploading...")
                  : t("settings.choose_file", "Choose file")}
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  onChange={handleAvatarUpload}
                  className="sr-only"
                  disabled={isSavingProfile}
                />
              </label>
            </div>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 text-slate-900 dark:text-slate-100">
          <Input
            label={t("settings.username", "Username")}
            name="username"
            value={profile.profileForm.username}
            onChange={(e) => handleProfileChange("username", e.target.value)}
            placeholder={t("settings.username_placeholder", "your.username")}
            required
            error={errors.username}
          />
          <Input
            label={t("settings.email", "Email")}
            name="email"
            type="email"
            value={profile.profileForm.email}
            placeholder={t("settings.email_placeholder", "john@example.com")}
            onChange={(e) => handleProfileChange("email", e.target.value)}
            required
            error={errors.email}
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Input
            label={t("settings.first_name", "First Name")}
            name="firstName"
            value={profile.profileForm.firstName}
            onChange={(e) => handleProfileChange("firstName", e.target.value)}
            placeholder={t("settings.first_name_placeholder", "John")}
            required
            error={errors.firstName}
          />
          <Input
            label={t("settings.last_name", "Last Name")}
            name="lastName"
            value={profile.profileForm.lastName}
            onChange={(e) => handleProfileChange("lastName", e.target.value)}
            placeholder={t("settings.last_name_placeholder", "Appleseed")}
            required
            error={errors.lastName}
          />
        </div>

        <div className="grid gap-4">
          <Input
            label={t("settings.phone_number", "Phone Number")}
            name="phone"
            type="tel"
            value={profile.profileForm.phone}
            onChange={(e) => handleProfileChange("phone", e.target.value)}
            placeholder={t("settings.phone_placeholder", "01XXXXXXXXX")}
            error={errors.phone}
          />
        </div>

        <Input
          label={t("settings.location", "Location")}
          name="location"
          value={profile.profileForm.location}
          onChange={(e) => handleProfileChange("location", e.target.value)}
          placeholder={t("settings.location_placeholder", "Add your city or delivery landmark")}
          error={errors.location}
        />

        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
           <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
             {isSavingProfile && (
               <>
                 <div className="h-1.5 w-1.5 animate-spin rounded-full border border-slate-400 border-t-transparent" />
                 {t("common.saving", "Saving...")}
               </>
             )}
             {!hasUnsavedChanges && !isSavingProfile && !hasErrors && (
               <span className="text-emerald-600 dark:text-emerald-300">
                 {t("settings.all_changes_saved", "All changes saved")}
               </span>
             )}
           </div>
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={resetProfileForm}
              disabled={isSavingProfile}
              className="inline-flex items-center rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 disabled:opacity-50"
            >
              {t("common.reset", "Reset")}
            </button>
            <button
              type="submit"
              disabled={isSavingProfile || hasErrors}
              className="inline-flex items-center rounded-xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-600 disabled:opacity-70"
            >
              {isSavingProfile
                ? t("common.saving", "Saving...")
                : t("settings.save_profile", "Save profile")}
            </button>
          </div>
        </div>
      </form>
    </SectionCard>
  );
};

export default PersonalSection;
