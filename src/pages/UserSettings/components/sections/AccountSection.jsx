import React from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import SectionCard from "../SectionCard";
import { AlertTriangle } from "lucide-react";

const AccountSection = ({
  sectionId,
  accountRef,
  pendingAccountAction,
  openConfirmDialog
}) => {
  const { t } = useTranslation();

  const isDeactivating = pendingAccountAction === "deactivate";
  const isDeleting = pendingAccountAction === "delete";

  return (
    <SectionCard
      sectionId={sectionId}
      innerRef={accountRef}
      eyebrow={t("settings.dangerZone.eyebrow", "Danger zone")}
      title={t("settings.dangerZone.title", "Manage your account status")}
      description={t(
        "settings.dangerZone.description",
        "Deactivate temporarily or request full deletion."
      )}
      tone="danger"
    >
      <div className="space-y-6">
        {/* Warning Banner */}
        <div className="rounded-2xl border-2 border-red-200 bg-gradient-to-r from-red-50 to-red-100 p-5 dark:border-red-800 dark:from-red-950/50 dark:to-red-900/30">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0">
              <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-red-900 dark:text-red-100 mb-2">
                {t("settings.dangerZone.readBefore", "⚠️ Critical Actions")}
              </h3>
              <div className="space-y-3 text-sm text-red-800 dark:text-red-200">
                <p className="font-medium">
                  {t(
                    "settings.dangerZone.readBeforeDescription",
                    "These actions cannot be undone. Please read carefully:"
                  )}
                </p>
                <ul className="space-y-2 ml-4">
                  <li className="flex items-start gap-2">
                    <span className="text-red-600 dark:text-red-400 mt-1">•</span>
                    <span><strong>{t("settings.dangerZone.deactivateLabel", "Deactivate:")}</strong> {t("settings.dangerZone.deactivateDesc", "Temporarily hide your account. You can reactivate anytime.")}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-600 dark:text-red-400 mt-1">•</span>
                    <span><strong>{t("settings.dangerZone.deleteLabel", "Delete:")}</strong> {t("settings.dangerZone.deleteDesc", "Permanently remove all data. Requires support review.")}</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            type="button"
            onClick={() => openConfirmDialog("deactivate")}
            disabled={isDeactivating}
            className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl border-2 border-amber-300 bg-amber-50 px-4 py-3 text-sm font-bold text-amber-800 transition hover:bg-amber-100 hover:border-amber-400 disabled:opacity-70 dark:border-amber-700 dark:bg-amber-950/30 dark:text-amber-200 dark:hover:bg-amber-900/50"
          >
            <AlertTriangle className="h-4 w-4" />
            {isDeactivating
              ? t("settings.dangerZone.processing", "Processing...")
              : t("settings.dangerZone.deactivate", "Deactivate Account")}
          </button>
          <button
            type="button"
            onClick={() => openConfirmDialog("delete")}
            disabled={isDeleting}
            className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-red-600 to-red-700 px-4 py-3 text-sm font-bold text-white transition hover:from-red-700 hover:to-red-800 disabled:opacity-70 shadow-lg"
          >
            <AlertTriangle className="h-4 w-4" />
            {isDeleting
              ? t("settings.dangerZone.requesting", "Requesting...")
              : t("settings.dangerZone.delete", "Request Permanent Deletion")}
          </button>
        </div>
        <p className="text-xs text-slate-600 dark:text-slate-400">
          {t("settings.dangerZone.needHelp", "Need help first?")}{" "}
          <Link
            to="/account/support"
            className="font-semibold text-red-600 underline-offset-2 hover:underline dark:text-red-300"
          >
            {t("settings.dangerZone.contactSupport", "Contact support")}
          </Link>
        </p>
      </div>
    </SectionCard>
  );
};

export default AccountSection;
