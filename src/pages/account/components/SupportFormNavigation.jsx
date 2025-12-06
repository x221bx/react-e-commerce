import React from "react";
import { ArrowRight, ArrowLeft, Send } from "lucide-react";

const SupportFormNavigation = ({
  currentStep,
  totalSteps,
  handlePrev,
  handleNext,
  handleSubmit,
  isSubmitting
}) => {
  return (
    <div className="px-8 py-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-slate-800">
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
          <span>Previous</span>
        </button>

        <div className="text-sm text-gray-500 dark:text-slate-400">
          Step {currentStep} of {totalSteps}
        </div>

        {currentStep < totalSteps ? (
          <button
            onClick={handleNext}
            className="flex items-center space-x-2 px-6 py-3 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 transition"
          >
            <span>Next</span>
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
                <span>Submitting...</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>Submit Request</span>
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
};

export default SupportFormNavigation;