import React from "react";

const SupportFormProgress = ({ currentStep, isDark }) => {
  return (
    <div className="mb-8">
      <div className="flex items-center justify-center space-x-4">
        {[1, 2, 3, 4].map((step) => (
          <div key={step} className="flex items-center">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold ${
              step <= currentStep
                ? 'bg-emerald-600 text-white'
                : isDark ? 'bg-slate-700 text-slate-400' : 'bg-gray-200 text-gray-400'
            }`}>
              {step}
            </div>
            {step < 4 && (
              <div className={`w-12 h-0.5 mx-2 ${
                step < currentStep ? 'bg-emerald-600' : isDark ? 'bg-slate-600' : 'bg-gray-200'
              }`} />
            )}
          </div>
        ))}
      </div>
      <div className="flex justify-center mt-2 space-x-8 text-sm">
        <span className={currentStep >= 1 ? 'text-emerald-600 font-medium' : 'text-gray-400'}>Category</span>
        <span className={currentStep >= 2 ? 'text-emerald-600 font-medium' : 'text-gray-400'}>Details</span>
        <span className={currentStep >= 3 ? 'text-emerald-600 font-medium' : 'text-gray-400'}>Contact</span>
        <span className={currentStep >= 4 ? 'text-emerald-600 font-medium' : 'text-gray-400'}>Review</span>
      </div>
    </div>
  );
};

export default SupportFormProgress;