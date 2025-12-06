import React from "react";
import { useTranslation } from "react-i18next";

const SupportFormStep2 = ({ formData, updateFormData, errors, isDark }) => {
  const { t } = useTranslation();

  return (
    <div className="p-8">
      <div className="text-center mb-8">
        <h2 className={`text-2xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
          {t("support.step2.title")}
        </h2>
        <p className={`text-lg ${isDark ? 'text-slate-300' : 'text-gray-600'}`}>
          {t("support.step2.subtitle")}
        </p>
      </div>

      <div className="space-y-6">
        {/* Subject */}
        <div>
          <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-white' : 'text-gray-700'}`}>
            {t("support.subject")} *
          </label>
          <input
            type="text"
            value={formData.subject}
            onChange={(e) => updateFormData('subject', e.target.value)}
            className={`w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 ${
              isDark
                ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400'
                : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
            }`}
            placeholder={t("support.placeholder")}
          />
          {errors.subject && <p className="text-red-500 text-sm mt-1">{errors.subject}</p>}
        </div>

        {/* Description */}
        <div>
          <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-white' : 'text-gray-700'}`}>
            {t("support.description")} *
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => updateFormData('description', e.target.value)}
            rows={6}
            className={`w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 resize-none ${
              isDark
                ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400'
                : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
            }`}
            placeholder={t("support.message")}
          />
          {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
        </div>
      </div>
    </div>
  );
};

export default SupportFormStep2;