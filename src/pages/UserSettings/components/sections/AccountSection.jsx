// src/pages/UserSettings/components/sections/AccountSection.jsx
import React from "react";
import { useTranslation } from "react-i18next";
import SectionCard from "../SectionCard";
import { AlertTriangle, ShieldOff, Skull, LockKeyhole } from "lucide-react";

const AccountSection = ({
  sectionId,
  accountRef,
  pendingAccountAction,
  openConfirmDialog,
}) => {
  const { t } = useTranslation();
  const isDeleting = pendingAccountAction === "delete";

  return (
    <SectionCard
      sectionId={sectionId}
      innerRef={accountRef}
      eyebrow={t("settings.dangerZone.eyebrow", "Delete account")}
      title={t("settings.dangerZone.title", "Permanently delete this account")}
      description={t(
        "settings.dangerZone.description",
        "Remove your profile and cancel any active orders linked to it."
      )}
      tone="danger"
      className="
        relative overflow-hidden
        border border-red-800/40 
        bg-[#260606]/60 
        backdrop-blur-xl
        shadow-[0_0_25px_rgba(220,38,38,0.25)]
        rounded-3xl
      "
    >
      {/* Floating RED effects */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-10 right-0 h-40 w-40 rounded-full bg-red-600/20 blur-3xl animate-pulse" />
        <div className="absolute -bottom-12 left-0 h-36 w-36 rounded-full bg-red-500/10 blur-2xl" />
      </div>

      <div className="relative z-[5] space-y-6">
        
        {/* Warning Box */}
        <div
          className="
            rounded-2xl border border-red-700/50 
            p-5 
            bg-red-900/20 
            shadow-[0_0_18px_rgba(255,0,0,0.15)]
            backdrop-blur-sm
            animate-in fade-in slide-in-from-left-2
          "
        >
          <div className="flex items-start gap-4">
            <div
              className="
                h-10 w-10 
                flex items-center justify-center 
                rounded-xl 
                bg-red-500/20 
                border border-red-600/40
                shadow-[0_0_12px_rgba(255,0,0,0.2)]
              "
            >
              <AlertTriangle className="h-5 w-5 text-red-300" />
            </div>

            <div className="space-y-3 text-red-200 text-sm">
              <h3 className="text-base font-semibold flex items-center gap-2">
                <Skull className="h-4 w-4 text-red-400" />
                {t("settings.dangerZone.readBefore", "Before you delete")}
              </h3>

              <ul className="space-y-2 list-disc pl-5">
                <li>
                  {t(
                    "settings.dangerZone.deleteDataNotice",
                    "All saved details (name, email, phone, addresses, and preferences) will be erased."
                  )}
                </li>
                <li>
                  {t(
                    "settings.dangerZone.orderCancelNotice",
                    "Any open or pending orders on this account will be cancelled automatically."
                  )}
                </li>
                <li className="font-semibold text-red-300 flex items-center gap-2">
                  <LockKeyhole className="h-4 w-4" />
                  {t(
                    "settings.dangerZone.irreversible",
                    "This action is immediate and cannot be undone."
                  )}
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Delete Button */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            type="button"
            onClick={() => openConfirmDialog("delete")}
            disabled={isDeleting}
            className="
              flex-1 inline-flex items-center justify-center gap-3
              rounded-2xl px-5 py-3
              font-bold text-white text-sm
              bg-gradient-to-r from-red-700 to-red-800 
              hover:from-red-600 hover:to-red-700
              active:scale-[0.97]
              shadow-[0_0_15px_rgba(255,0,0,0.25)]
              transition-all
              disabled:opacity-60
            "
          >
            <ShieldOff className="h-5 w-5" />
            {isDeleting
              ? t("settings.dangerZone.requesting", "Deleting…")
              : t("settings.dangerZone.delete", "Delete account now")}
          </button>
        </div>
      </div>
    </SectionCard>
  );
};

export default AccountSection;
