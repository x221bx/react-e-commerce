import React from "react";

const NotificationToggle = ({ label, description, enabled, onToggle }) => (
  <div className="flex items-center justify-between gap-4 rounded-2xl border border-slate-200/80 bg-white/95 p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900/40">
    <div>
      <p className="font-semibold text-slate-900 dark:text-white">{label}</p>
      <p className="text-sm text-slate-500 dark:text-slate-400">{description}</p>
    </div>
    <button
      type="button"
      role="switch"
      aria-checked={enabled}
      onClick={onToggle}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
        enabled ? "bg-emerald-500" : "bg-slate-300 dark:bg-slate-700"
      }`}
    >
      <span
        className={`inline-block h-5 w-5 transform rounded-full bg-white transition ${
          enabled ? "translate-x-5" : "translate-x-1"
        }`}
      />
    </button>
  </div>
);

export default NotificationToggle;