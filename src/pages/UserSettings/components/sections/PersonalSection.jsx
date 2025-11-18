import React from "react";
import SectionCard from "../SectionCard";
import ProfileAvatar from "../ProfileAvatar";
import { SelectInput } from "../FormComponents";
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
  handlePhotoLinkChange,
  resetProfileForm,
  handleProfileSubmit,
  isSavingProfile,
  hasUnsavedChanges,
  errors = {}
}) => {
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language.startsWith('ar');

  const getGenderLabel = (value) => {
    return t(`settings.${value}`, value);
  };

  const validateEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const validatePhone = (phone) => {
    return /^[\d\s\-\+\(\)]+$/.test(phone) && phone.replace(/\D/g, '').length >= 7;
  };

  return (
    <SectionCard
      sectionId={sectionId}
      innerRef={personalRef}
      eyebrow={t('settings.personal_info', 'Personal Information')}
      title={t('settings.keep_contact_accurate', 'Keep your contact details accurate')}
      description={t('settings.info_on_invoices', 'This information appears on invoices and delivery slips.')}
    >
      <form onSubmit={handleProfileSubmit} className="space-y-5">
        {/* Error Alert */}
        {Object.keys(errors).length > 0 && (
          <div className="flex gap-3 rounded-xl border border-red-200 bg-red-50 p-4 dark:border-red-900 dark:bg-red-900/20">
            <AlertCircle className="h-5 w-5 flex-shrink-0 text-red-600 dark:text-red-400" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-red-600 dark:text-red-400">
                {t('common.error', 'Error')}
              </p>
              <ul className="mt-1 space-y-1 text-xs text-red-500 dark:text-red-300">
                {Object.entries(errors).map(([field, message]) => (
                  <li key={field}>• {message}</li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* Avatar and basic info */}
        <div className="grid gap-6 lg:grid-cols-[1fr,auto]">
          <div className="rounded-2xl border border-slate-100 bg-white/70 p-6 dark:border-slate-800 dark:bg-slate-900/40">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
              <ProfileAvatar
                photo={!profile.avatarError ? profile.profileForm.photoURL : ""}
                initials={profile.initials}
                onError={() => profile.setAvatarError(true)}
                size="lg"
              />
              <div className="flex-1 space-y-3 sm:ml-4">
                <p className="text-sm font-semibold text-slate-900 dark:text-white">
                  {t('settings.upload_profile_photo', 'Upload a new profile photo')}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {t('settings.photo_formats', 'PNG, JPG, or WebP · Max 2MB. We\'ll optimize it automatically for light and dark mode.')}
                </p>
                <div className="flex flex-wrap gap-2">
                  <label className="inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold text-white shadow-sm transition bg-emerald-600 hover:bg-emerald-500 cursor-pointer touch-manipulation disabled:opacity-50" style={{ pointerEvents: isSavingProfile ? 'none' : 'auto' }}>
                    <UploadCloud className="h-4 w-4" />
                    {isSavingProfile ? t('common.uploading', 'Uploading...') : t('settings.choose_file', 'Choose file')}
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/webp"
                      onChange={handleAvatarUpload}
                      className="sr-only"
                      disabled={isSavingProfile}
                    />
                  </label>
                  {profile.profileForm.photoURL && (
                    <button
                      type="button"
                      onClick={handleAvatarReset}
                      disabled={isSavingProfile}
                      className="inline-flex items-center rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 touch-manipulation disabled:opacity-50"
                    >
                      {t('common.remove', 'Remove')}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
          <div className="min-w-0 lg:max-w-xs">
            <Input
              label={t('settings.image_link_optional', 'Image link (optional)')}
              name="photoURL"
              value={profile.photoLinkValue}
              onChange={(e) => handlePhotoLinkChange(e.target.value)}
              placeholder="https://images.example.com/profile.jpg"
              error={errors.photoURL}
            />
          </div>
        </div>

        {/* Form fields */}
        <div className="grid gap-4 md:grid-cols-2">
          <Input
            label={t('settings.first_name', 'First Name')}
            name="firstName"
            value={profile.profileForm.firstName}
            onChange={(e) => handleProfileChange("firstName", e.target.value)}
            placeholder={isArabic ? "أحمد" : "John"}
            required
            error={errors.firstName}
          />
          <Input
            label={t('settings.last_name', 'Last Name')}
            name="lastName"
            value={profile.profileForm.lastName}
            onChange={(e) => handleProfileChange("lastName", e.target.value)}
            placeholder={isArabic ? "السعيد" : "Appleseed"}
            required
            error={errors.lastName}
          />
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <SelectInput
            label={t('settings.gender', 'Gender')}
            value={profile.profileForm.gender || ""}
            onChange={(e) => handleProfileChange("gender", e.target.value)}
            error={errors.gender}
          >
            <option value="">{t('settings.select', 'Select')}</option>
            <option value="male">{getGenderLabel('male')}</option>
            <option value="female">{getGenderLabel('female')}</option>
          </SelectInput>
          <Input
            label={t('settings.birth_date', 'Birth date')}
            type="date"
            name="birthDate"
            value={profile.profileForm.birthDate || ""}
            onChange={(e) => handleProfileChange("birthDate", e.target.value)}
            error={errors.birthDate}
          />
          <Input
            label={t('settings.profession_role', 'Profession / role')}
            name="profession"
            value={profile.profileForm.profession}
            onChange={(e) => handleProfileChange("profession", e.target.value)}
            placeholder={isArabic ? "خبير التغذية الحيوانية" : "Livestock nutritionist"}
            error={errors.profession}
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Input
            label={t('settings.phone_number', 'Phone Number')}
            name="phone"
            type="tel"
            value={profile.profileForm.phone}
            onChange={(e) => handleProfileChange("phone", e.target.value)}
            placeholder="+1 555 0100"
            error={errors.phone}
          />
          <Input
            label={t('settings.farm_city', 'Farm / City')}
            name="location"
            value={profile.profileForm.location}
            onChange={(e) => handleProfileChange("location", e.target.value)}
            placeholder={isArabic ? "الوادي الأخضر" : "Green Valley, CA"}
            error={errors.location}
          />
        </div>

        {/* Status and Actions */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
            {hasUnsavedChanges && !isSavingProfile && (
              <>
                <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-amber-400" />
                {t('settings.unsaved_changes', 'Unsaved changes')}
              </>
            )}
            {isSavingProfile && <span>{t('common.saving', 'Saving...')}</span>}
            {!hasUnsavedChanges && !isSavingProfile && !Object.keys(errors).length && (
              <span className="text-emerald-600 dark:text-emerald-300">{t('settings.all_changes_saved', 'All changes saved')}</span>
            )}
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={resetProfileForm}
              disabled={isSavingProfile}
              className="inline-flex items-center rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 disabled:opacity-50"
            >
              {t('common.reset', 'Reset')}
            </button>
            <button
              type="submit"
              disabled={isSavingProfile || Object.keys(errors).length > 0}
              className="inline-flex items-center rounded-xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-600 disabled:opacity-70"
            >
              {isSavingProfile ? t('common.saving', 'Saving...') : t('settings.save_profile', 'Save profile')}
            </button>
          </div>
        </div>
      </form>
    </SectionCard>
  );
};

export default PersonalSection;