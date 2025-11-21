import React from "react";

const NotificationToggle = ({ label, description, enabled, onToggle }) => (
  <div className="flex items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-4 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700/70">
    <div className="flex-1">
      <p className="font-semibold text-slate-900 dark:text-slate-100">{label}</p>
      <p className="text-sm text-slate-600 dark:text-slate-300">{description}</p>
    </div>
    <button
      type="button"
      role="switch"
      aria-checked={enabled}
      aria-label={`${label}: ${enabled ? 'enabled' : 'disabled'}`}
      onClick={onToggle}
      className={`relative inline-flex h-7 w-12 items-center rounded-full border-2 transition focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 dark:focus:ring-offset-slate-800 ${
        enabled
          ? "border-emerald-500 bg-emerald-500"
          : "border-slate-300 bg-slate-200 dark:border-slate-600 dark:bg-slate-700"
      }`}
    >
      <span
        className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition ${
          enabled ? "translate-x-5" : "translate-x-0.5"
        }`}
      />
    </button>
  </div>
);

export default NotificationToggle;