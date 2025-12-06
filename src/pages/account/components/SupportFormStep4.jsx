import React from "react";
import { useTranslation } from "react-i18next";
import { Clock } from "lucide-react";

const SupportFormStep4 = ({ formData, selectedCategory, isDark }) => {
  const { t } = useTranslation();

  return (
    <div className="p-8">
      <div className="text-center mb-8">
        <h2 className={`text-2xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
          {t("support.step4.title")}
        </h2>
        <p className={`text-lg ${isDark ? 'text-slate-300' : 'text-gray-600'}`}>
          {t("support.step4.subtitle")}
        </p>
      </div>

      <div className="max-w-2xl mx-auto space-y-6">
        {/* Summary Cards */}
        <div className={`p-6 rounded-xl ${isDark ? 'bg-slate-700' : 'bg-gray-50'}`}>
          <h3 className={`font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {t("support.review")}
          </h3>

          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className={`text-sm ${isDark ? 'text-slate-300' : 'text-gray-600'}`}>{t("support.category")}:</span>
              <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {selectedCategory?.title}
              </span>
            </div>

            <div className="flex justify-between items-start">
              <span className={`text-sm ${isDark ? 'text-slate-300' : 'text-gray-600'}`}>{t("support.subject")}:</span>
              <span className={`font-medium text-right ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {formData.subject}
              </span>
            </div>

            <div className="flex justify-between items-start">
              <span className={`text-sm ${isDark ? 'text-slate-300' : 'text-gray-600'}`}>{t("support.phoneNumber")}:</span>
              <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {formData.phoneNumber}
              </span>
            </div>
          </div>
        </div>

        {/* Description Preview */}
        <div className={`p-6 rounded-xl ${isDark ? 'bg-slate-700' : 'bg-gray-50'}`}>
          <h3 className={`font-semibold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {t("support.description")}
          </h3>
          <p className={`text-sm leading-relaxed ${isDark ? 'text-slate-300' : 'text-gray-600'}`}>
            {formData.description}
          </p>
        </div>

        {/* Response Time Notice */}
        <div className={`p-4 rounded-lg border ${
          isDark ? 'bg-blue-900/20 border-blue-700' : 'bg-blue-50 border-blue-200'
        }`}>
          <div className="flex items-start space-x-3">
            <Clock className={`w-5 h-5 mt-0.5 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
            <div>
              <h4 className={`font-medium ${isDark ? 'text-blue-300' : 'text-blue-800'}`}>
                {t("support.expectedResponse")}
              </h4>
              <p className={`text-sm mt-1 ${isDark ? 'text-blue-200' : 'text-blue-700'}`}>
                {t("support.within24Hours")}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SupportFormStep4;