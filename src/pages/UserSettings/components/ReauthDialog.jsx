// src/pages/UserSettings/components/ReauthDialog.jsx
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Shield, Eye, EyeOff } from "lucide-react";

export default function ReauthDialog({ open, onCancel, onConfirm, isLoading }) {
  const { t } = useTranslation();
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!password.trim()) {
      setError(t("settings.reauth.passwordRequired", "Password is required"));
      return;
    }
    setError("");
    onConfirm(password.trim());
  };

  const handleCancel = () => {
    setPassword("");
    setError("");
    setShowPassword(false);
    onCancel();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 px-4">
      <div className="w-full max-w-md rounded-3xl border border-slate-100 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center gap-3 text-amber-600 dark:text-amber-300">
          <Shield className="h-5 w-5" />
          <p className="text-sm font-semibold uppercase tracking-wide text-amber-600 dark:text-amber-300">
            {t("settings.reauth.title", "Security Verification")}
          </p>
        </div>

        <h3 className="mt-2 text-lg font-semibold text-slate-900 dark:text-white">
          {t("settings.reauth.confirmIdentity", "Confirm your identity")}
        </h3>

        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
          {t("settings.reauth.enterPassword", "Please enter your password to proceed with account deletion.")}
        </p>

        <form onSubmit={handleSubmit} className="mt-4">
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                {t("settings.reauth.password", "Password")}
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (error) setError("");
                  }}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 pr-10 text-sm focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500 dark:border-slate-600 dark:bg-slate-800 dark:text-white"
                  placeholder={t("settings.reauth.passwordPlaceholder", "Enter your password")}
                  disabled={isLoading}
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                  disabled={isLoading}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {error && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{error}</p>
              )}
            </div>
          </div>

          <div className="mt-6 flex flex-wrap justify-end gap-3">
            <button
              type="button"
              onClick={handleCancel}
              disabled={isLoading}
              className="inline-flex items-center rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-white dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800/70 disabled:opacity-50"
            >
              {t("common.cancel", "Cancel")}
            </button>
            <button
              type="submit"
              disabled={isLoading || !password.trim()}
              className="inline-flex items-center rounded-xl px-4 py-2 text-sm font-semibold text-white transition bg-red-600 hover:bg-red-500 disabled:opacity-50"
            >
              {isLoading ? t("settings.reauth.verifying", "Verifying...") : t("settings.reauth.confirm", "Confirm Deletion")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}