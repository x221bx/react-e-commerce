import React from "react";
import { useTranslation } from "react-i18next";
import { Phone } from "lucide-react";

const SupportFormStep3 = ({ formData, updateFormData, errors, isDark }) => {
  const { t } = useTranslation();

  return (
    <div className="p-8">
      <div className="text-center mb-8">
        <h2 className={`text-2xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
          {t("support.step3.title")}
        </h2>
        <p className={`text-lg ${isDark ? 'text-slate-300' : 'text-gray-600'}`}>
          {t("support.step3.subtitle")}
        </p>
      </div>

      <div className="max-w-md mx-auto space-y-6">
        <div>
          <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-white' : 'text-gray-700'}`}>
            {t("support.phoneNumber")} *
          </label>
          <div className="relative">
            <Phone className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${
              isDark ? 'text-slate-400' : 'text-gray-400'
            }`} />
            <input
              type="tel"
              value={formData.phoneNumber}
              onChange={(e) => updateFormData('phoneNumber', e.target.value.replace(/\D/g, "").slice(0, 11))}
              className={`w-full pl-12 pr-4 py-3 rounded-lg border focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 ${
                isDark
                  ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400'
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
              }`}
              placeholder={t("support.phonePlaceholder")}
            />
          </div>
          {errors.phoneNumber && <p className="text-red-500 text-sm mt-1">{errors.phoneNumber}</p>}
          <p className={`text-xs mt-2 ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
            {t("support.phoneHelp")}
          </p>
        </div>
      </div>
    </div>
  );
};

export default SupportFormStep3;