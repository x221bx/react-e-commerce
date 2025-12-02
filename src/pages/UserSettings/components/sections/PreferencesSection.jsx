// src/pages/UserSettings/components/sections/PreferencesSection.jsx
import React from "react";
import SectionCard from "../SectionCard";
import { SelectInput, TextAreaInput } from "../FormComponents";
import { useTranslation } from "react-i18next";
import i18n from "../../../../i18n";

const PreferencesSection = ({
  sectionId,
  preferencesRef,
  preferenceForm,
  handlePreferenceChange,
  handlePreferencesSubmit,
  isSavingPreferences
}) => {
  const { t } = useTranslation();

  const handleLocaleChange = (value) => {
    handlePreferenceChange("locale", value);
  };

  return (
  <SectionCard
    sectionId={sectionId}
    innerRef={preferencesRef}
    eyebrow={t('settings.language_display')}
    title={t('settings.personalize_info')}
    description={t('settings.units_language_notes')}
    tone="highlight"
  >
    <form onSubmit={handlePreferencesSubmit} className="space-y-5">
      <div className="grid gap-4 md:grid-cols-2">
        <SelectInput
          label={t('settings.interface_language')}
          value={preferenceForm.locale}
          onChange={(e) => handleLocaleChange(e.target.value)}
        >
          <option value="en">English</option>
          <option value="ar">العربية</option>
        </SelectInput>
        <SelectInput
          label={t('settings.measurements')}
          value={preferenceForm.measurement}
          onChange={(e) => handlePreferenceChange("measurement", e.target.value)}
        >
          <option value="metric">{t('settings.metric_units')}</option>
          <option value="imperial">{t('settings.imperial_units')}</option>
        </SelectInput>
        <div className="md:col-span-2">
          <TextAreaInput
            label={t('settings.delivery_notes')}
            value={preferenceForm.deliveryNotes}
            onChange={(e) => handlePreferenceChange("deliveryNotes", e.target.value)}
            placeholder="Example: contact farm foreman before arrival."
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => handlePreferenceChange("reset", null)}
          className="inline-flex items-center rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-white dark:border-slate-700 dark:text-slate-200"
        >
          {t('settings.reset_defaults')}
        </button>
        <button
          type="submit"
          disabled={isSavingPreferences}
          className="inline-flex items-center rounded-xl bg-green-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-green-700 disabled:opacity-70 dark:bg-green-500 dark:hover:bg-green-600"
        >
          {isSavingPreferences ? "Saving..." : t('settings.save_display_settings')}
        </button>
      </div>
    </form>
  </SectionCard>
 );
};

export default PreferencesSection;

