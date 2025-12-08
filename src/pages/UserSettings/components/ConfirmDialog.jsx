// src/pages/UserSettings/components/ConfirmDialog.jsx
import { AlertTriangle } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function ConfirmDialog({ open, intent, onCancel, onConfirm }) {
  const { t } = useTranslation();

  if (!open) return null;

  return (
    <div
      className="
        fixed inset-0 z-[999] flex items-center justify-center 
        bg-black/70 backdrop-blur-sm 
        animate-in fade-in duration-200
      "
    >
      {/* Dialog Card */}
      <div
        className="
          relative w-full max-w-md 
          rounded-3xl overflow-hidden p-6
          bg-gradient-to-br from-red-950/80 to-red-900/40 
          border border-red-800/50 
          shadow-[0_0_20px_rgba(255,0,0,0.3)] 
          backdrop-blur-xl 
          animate-in zoom-in-95 slide-in-from-bottom-4 duration-300
        "
      >
        {/* Floating Red Glow Effects */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-10 right-0 h-40 w-40 bg-red-600/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute -bottom-6 left-0 h-32 w-32 bg-red-500/10 rounded-full blur-2xl" />
        </div>

        {/* Header */}
        <div className="relative z-[5] flex items-center gap-3">
          <div
            className="
              h-10 w-10 flex items-center justify-center 
              rounded-xl bg-red-500/20 border border-red-600/40
              shadow-[0_0_10px_rgba(255,0,0,0.2)]
            "
          >
            <AlertTriangle className="h-5 w-5 text-red-300" />
          </div>
          <p
            className="
              text-sm font-bold uppercase tracking-wide 
              text-red-300
            "
          >
            {t("settings.confirmDialog.title", "Confirmation required")}
          </p>
        </div>

        {/* Title */}
        <h3
          className="
            mt-4 text-xl font-bold 
            text-red-100
          "
        >
          {t(
            "settings.confirmDialog.deleteTitle",
            "Delete your account now?"
          )}
        </h3>

        {/* Description */}
        <p
          className="
            mt-2 text-sm leading-relaxed 
            text-red-200/90
          "
        >
          {t(
            "settings.confirmDialog.deleteBody",
            "We will erase your saved profile and cancel any pending orders. You will need to create a new account to return."
          )}
        </p>

        {/* Action Buttons */}
        <div className="relative z-[5] mt-6 flex justify-end gap-3">
          {/* Cancel */}
          <button
            type="button"
            onClick={onCancel}
            className="
              rounded-xl border border-red-600/40 
              bg-red-900/30 text-red-200 
              px-4 py-2 text-sm font-semibold 
              hover:bg-red-900/50 
              active:scale-[0.97] 
              transition-all
            "
          >
            {t("settings.confirmDialog.keepAccount", "Keep my account")}
          </button>

          {/* Confirm */}
          <button
            type="button"
            onClick={onConfirm}
            className="
              rounded-xl px-4 py-2 text-sm font-bold text-white 
              bg-gradient-to-r from-red-600 to-red-700 
              hover:from-red-500 hover:to-red-600 
              active:scale-[0.96] transition-all 
              shadow-[0_0_15px_rgba(255,0,0,0.35)]
            "
          >
            {t(
              "settings.confirmDialog.deleteAction",
              "Yes, delete everything"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
