import React from "react";
import { useTranslation } from "react-i18next";
import SectionCard from "../SectionCard";
import { AlertTriangle } from "lucide-react";

const AccountSection = ({
  sectionId,
  accountRef,
  pendingAccountAction,
  openConfirmDialog
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
    >
      <div className="space-y-5">
        <div className="rounded-2xl border-2 border-red-200 bg-gradient-to-r from-red-50 to-red-100 p-5 dark:border-red-800 dark:from-red-950/50 dark:to-red-900/30">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400 flex-shrink-0" />
            <div className="space-y-2 text-sm text-red-800 dark:text-red-200">
              <h3 className="text-base font-semibold">
                {t("settings.dangerZone.readBefore", "Before you delete")}
              </h3>
              <ul className="space-y-2 list-disc pl-4">
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
                <li>
                  {t(
                    "settings.dangerZone.irreversible",
                    "This action is immediate and cannot be undone."
                  )}
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            type="button"
            onClick={() => openConfirmDialog("delete")}
            disabled={isDeleting}
            className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-red-600 to-red-700 px-4 py-3 text-sm font-bold text-white transition hover:from-red-700 hover:to-red-800 disabled:opacity-70 shadow-lg"
          >
            <AlertTriangle className="h-4 w-4" />
            {isDeleting
              ? t("settings.dangerZone.requesting", "Deleting...")
              : t("settings.dangerZone.delete", "Delete account now")}
          </button>
        </div>
      </div>
    </SectionCard>
  );
};

export default AccountSection;
