import React from "react";
import { Eye, EyeOff } from "lucide-react";

export const SelectInput = ({ label, value, onChange, children, required, error }) => (
  <label className="flex flex-col gap-2 text-sm font-medium text-slate-700 dark:text-slate-200">
    <span className="flex items-center gap-1">
      {label}
      {required && <span className="text-red-500" aria-label="required">*</span>}
    </span>
    <div className="relative">
      <select
        value={value || ""}
        onChange={onChange}
        aria-label={label}
        aria-required={required}
        aria-invalid={!!error}
        className={`h-11 w-full appearance-none rounded-xl border px-3 pr-8 text-sm font-normal shadow-sm transition focus:outline-none focus:ring-2 ${error
            ? "border-red-300 bg-red-50 text-red-900 focus:border-red-500 focus:ring-red-100 dark:border-red-700 dark:bg-red-950/30 dark:text-red-100 dark:focus:border-red-500 dark:focus:ring-red-500/30"
            : "border-slate-300 bg-white text-slate-900 focus:border-emerald-500 focus:ring-emerald-100 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:focus:border-emerald-500 dark:focus:ring-emerald-500/30"
          }`}
      >
        {children}
      </select>
      <div className="pointer-events-none absolute ltr:right-3 rtl:left-3 top-1/2 -translate-y-1/2">
        <svg className="h-4 w-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    </div>
    {error && (
      <p className="text-sm text-red-600 dark:text-red-400" role="alert">
        {error}
      </p>
    )}
  </label>
);

export const TextAreaInput = ({ label, value, onChange, placeholder, required, error, maxLength }) => (
  <label className="flex flex-col gap-2 text-sm font-medium text-slate-700 dark:text-slate-200">
    <span className="flex items-center justify-between">
      <span className="flex items-center gap-1">
        {label}
        {required && <span className="text-red-500" aria-label="required">*</span>}
      </span>
      {maxLength && (
        <span className="text-xs text-slate-500 dark:text-slate-400">
          {(value || "").length}/{maxLength}
        </span>
      )}
    </span>
    <textarea
      value={value || ""}
      onChange={onChange}
      placeholder={placeholder}
      maxLength={maxLength}
      rows={3}
      aria-required={required}
      aria-invalid={!!error}
      className={`rounded-2xl border px-3 py-2 text-sm font-normal shadow-sm transition focus:outline-none focus:ring-2 resize-none ${error
          ? "border-red-300 bg-red-50 text-red-900 focus:border-red-500 focus:ring-red-100 dark:border-red-700 dark:bg-red-950/30 dark:text-red-100 dark:focus:border-red-500 dark:focus:ring-red-500/30"
          : "border-slate-200 bg-white text-slate-700 focus:border-emerald-400 focus:ring-emerald-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-emerald-500 dark:focus:ring-emerald-500/30"
        }`}
    />
    {error && (
      <p className="text-sm text-red-600 dark:text-red-400" role="alert">
        {error}
      </p>
    )}
  </label>
);

export const PasswordInput = ({
  label,
  name,
  value,
  onChange,
  showPassword,
  onToggleVisibility,
  error,
  required
}) => (
  <label className="flex flex-col gap-2 text-sm font-medium text-slate-700 dark:text-slate-200">
    <span className="flex items-center gap-1">
      {label}
      {required && <span className="text-red-500" aria-label="required">*</span>}
    </span>
    <div className="relative">
      <input
        type={showPassword ? "text" : "password"}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        aria-label={label}
        aria-required={required}
        aria-invalid={!!error}
        className={`h-11 w-full rounded-xl border px-3 pr-12 text-sm font-normal shadow-sm transition focus:outline-none focus:ring-2 ${error
            ? "border-red-300 bg-red-50 text-red-900 focus:border-red-500 focus:ring-red-100 dark:border-red-700 dark:bg-red-950/30 dark:text-red-100 dark:focus:border-red-500 dark:focus:ring-red-500/30"
            : "border-slate-300 bg-white text-slate-900 focus:border-emerald-500 focus:ring-emerald-100 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:focus:border-emerald-500 dark:focus:ring-emerald-500/30"
          }`}
      />
      <button
        type="button"
        onClick={onToggleVisibility}
        className={`absolute ltr:right-2 rtl:left-2 top-1/2 -translate-y-1/2 p-1 rounded-lg transition focus:outline-none focus:ring-2 focus:ring-emerald-500 ${error
            ? "text-red-600 hover:text-red-700 hover:bg-red-100 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-900/30"
            : "text-slate-500 hover:text-slate-700 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-700"
          }`}
        aria-label={showPassword ? "Hide password" : "Show password"}
        aria-expanded={showPassword}
      >
        {showPassword ? <Eye className="h-5 w-5" /> : <EyeOff className="h-5 w-5" />}
      </button>
    </div>
    {error && (
      <p className="text-sm text-red-600 dark:text-red-400" role="alert">
        {error}
      </p>
    )}
  </label>
);

export const PasswordStrengthIndicator = ({ strength }) => {
  if (!strength || strength.score === 0) return null;

  const getStrengthColor = (score) => {
    if (score <= 2) return "bg-red-500";
    if (score <= 3) return "bg-yellow-500";
    if (score <= 4) return "bg-blue-500";
    return "bg-green-500";
  };

  const getStrengthText = (score) => {
    if (score <= 2) return "Weak";
    if (score <= 3) return "Fair";
    if (score <= 4) return "Good";
    return "Strong";
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <div className="flex-1 h-2 bg-slate-200 rounded-full dark:bg-slate-700">
          <div
            className={`h-full rounded-full transition-all ${getStrengthColor(strength.score)}`}
            style={{ width: `${(strength.score / 5) * 100}%` }}
          />
        </div>
        <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
          {getStrengthText(strength.score)}
        </span>
      </div>
      {strength.feedback.length > 0 && (
        <ul className="text-xs text-slate-500 dark:text-slate-400 space-y-1">
          {strength.feedback.map((item, index) => (
            <li key={index}>• {item}</li>
          ))}
        </ul>
      )}
    </div>
  );
};