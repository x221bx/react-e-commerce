// src/pages/UserSettings/components/ConfirmDialog.jsx
import { AlertTriangle } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function ConfirmDialog({ open, intent, onCancel, onConfirm }) {
  const { t } = useTranslation();

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 px-4">
      <div className="w-full max-w-md rounded-3xl border border-slate-100 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center gap-3 text-red-600 dark:text-red-300">
          <AlertTriangle className="h-5 w-5" />
          <p className="text-sm font-semibold uppercase tracking-wide text-red-600 dark:text-red-300">
            {t("settings.confirmDialog.title", "Confirmation required")}
          </p>
        </div>
        <h3 className="mt-2 text-lg font-semibold text-slate-900 dark:text-white">
          {t("settings.confirmDialog.deleteTitle", "Delete your account now?")}
        </h3>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
          {t(
            "settings.confirmDialog.deleteBody",
            "We will erase your saved profile and cancel any pending orders. You will need to create a new account to return."
          )}
        </p>
        <div className="mt-6 flex flex-wrap justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="inline-flex items-center rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-white dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800/70"
          >
            {t("settings.confirmDialog.keepAccount", "Keep my account")}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="inline-flex items-center rounded-xl px-4 py-2 text-sm font-semibold text-white transition bg-red-600 hover:bg-red-500"
          >
            {t("settings.confirmDialog.deleteAction", "Yes, delete everything")}
          </button>
        </div>
      </div>
    </div>
  );
}
