// src/pages/UserSettings/components/ReauthDialog.jsx
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Shield, Eye, EyeOff, Lock } from "lucide-react";

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
    <div
      className="
        fixed inset-0 z-[999] flex items-center justify-center 
        bg-black/70 backdrop-blur-sm
        animate-in fade-in duration-200
      "
    >
      {/* Glass Card */}
      <div
        className="
          relative w-full max-w-md 
          overflow-hidden rounded-3xl p-6
          border border-amber-700/40 
          bg-gradient-to-br from-[#1e1602]/80 to-[#261b06]/50 
          shadow-[0_0_25px_rgba(255,200,50,0.25)]
          backdrop-blur-xl 
          animate-in slide-in-from-bottom-4 zoom-in-95 duration-300
        "
      >
        {/* Floating Lights */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-10 right-0 h-40 w-40 bg-amber-500/20 blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-10 left-0 h-32 w-32 bg-amber-400/10 blur-2xl"></div>
        </div>

        {/* Header */}
        <div className="relative z-[5] flex items-center gap-3">
          <div
            className="
              h-10 w-10 flex items-center justify-center 
              rounded-xl bg-amber-500/20 border border-amber-600/40 
              shadow-[0_0_12px_rgba(255,200,50,0.25)]
            "
          >
            <Shield className="h-5 w-5 text-amber-300" />
          </div>

          <p className="text-sm font-semibold uppercase tracking-wide text-amber-300">
            {t("settings.reauth.title", "Security Verification")}
          </p>
        </div>

        {/* Title */}
        <h3 className="relative z-[5] mt-3 text-lg font-bold text-amber-100">
          {t("settings.reauth.confirmIdentity", "Confirm your identity")}
        </h3>

        {/* Description */}
        <p className="relative z-[5] mt-1 text-sm text-amber-200/80">
          {t(
            "settings.reauth.enterPassword",
            "Please enter your password to proceed with account deletion."
          )}
        </p>

        {/* Form */}
        <form onSubmit={handleSubmit} className="relative z-[5] mt-5 space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-amber-200 flex items-center gap-2">
              <Lock className="h-4 w-4 text-amber-400" />
              {t("settings.reauth.password", "Password")}
            </label>

            {/* Password Field */}
            <div className="relative group">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (error) setError("");
                }}
                className="
                  w-full rounded-xl px-3 py-2 pr-11 text-sm 
                  bg-black/20 text-amber-100
                  border border-amber-700/40 
                  focus:border-amber-400 focus:ring-1 focus:ring-amber-400
                  placeholder:text-amber-300/40
                  dark:bg-black/30
                  backdrop-blur-sm
                  transition-all
                "
                placeholder={t(
                  "settings.reauth.passwordPlaceholder",
                  "Enter your password"
                )}
                disabled={isLoading}
                autoFocus
              />

              {/* Toggle Button */}
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                disabled={isLoading}
                className="
                  absolute right-3 top-1/2 -translate-y-1/2 
                  text-amber-300/70 hover:text-amber-200 
                  transition-all group-hover:scale-110
                "
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>

              {/* Glow on hover */}
              <div className="pointer-events-none absolute inset-0 rounded-xl opacity-0 group-hover:opacity-20 bg-amber-500/20 blur-xl transition-all"></div>
            </div>

            {/* Error Message */}
            {error && (
              <p className="text-sm text-red-400 animate-in fade-in duration-200">
                {error}
              </p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-3">
            {/* Cancel */}
            <button
              type="button"
              onClick={handleCancel}
              disabled={isLoading}
              className="
                rounded-xl border border-amber-600/40 
                bg-amber-900/20 text-amber-200 
                px-4 py-2 text-sm font-semibold
                hover:bg-amber-900/40 
                active:scale-[0.97]
                transition-all disabled:opacity-50
              "
            >
              {t("common.cancel", "Cancel")}
            </button>

            {/* Confirm */}
            <button
              type="submit"
              disabled={isLoading || !password.trim()}
              className="
                rounded-xl px-4 py-2 text-sm font-bold text-white 
                bg-gradient-to-r from-red-600 to-red-700
                hover:from-red-500 hover:to-red-600 
                active:scale-[0.96] transition-all
                shadow-[0_0_18px_rgba(255,0,0,0.35)]
                disabled:opacity-50
              "
            >
              {isLoading
                ? t("settings.reauth.verifying", "Verifying...")
                : t("settings.reauth.confirm", "Confirm Deletion")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
