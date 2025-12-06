import React from "react";
import { ArrowRight, ArrowLeft, Send } from "lucide-react";
import { useTranslation } from "react-i18next";

const SupportFormNavigation = ({
  currentStep,
  totalSteps,
  handlePrev,
  handleNext,
  handleSubmit,
  isSubmitting
}) => {
  const { t } = useTranslation();

  return (
    <div className="px-8 py-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 ">
      <div className="flex justify-between items-center">
        <button
          onClick={handlePrev}
          disabled={currentStep === 1}
          className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition ${
            currentStep === 1
              ? 'opacity-50 cursor-not-allowed'
              : 'hover:bg-gray-100 dark:hover:bg-slate-700'
          }`}
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{t("support.navigation.previous")}</span>
        </button>

        <div className="text-sm text-gray-500 dark:text-slate-400">
          {t("support.navigation.step")} {currentStep} {t("support.navigation.of")} {totalSteps}
        </div>

        {currentStep < totalSteps ? (
          <button
            onClick={handleNext}
            className="flex items-center space-x-2 px-6 py-3 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 transition"
          >
            <span>{t("support.navigation.next")}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="flex items-center space-x-2 px-6 py-3 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>{t("support.navigation.submitting")}</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>{t("support.navigation.submitRequest")}</span>
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
};

export default SupportFormNavigation;