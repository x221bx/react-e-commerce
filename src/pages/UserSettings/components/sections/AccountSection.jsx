import React from "react";
import SectionCard from "../SectionCard";
import { AlertTriangle } from "lucide-react";

const AccountSection = ({
  sectionId,
  accountRef,
  pendingAccountAction,
  openConfirmDialog
}) => (
  <SectionCard
    sectionId={sectionId}
    innerRef={accountRef}
    eyebrow="Danger zone"
    title="Manage your account status"
    description="Deactivate temporarily or request full deletion."
    tone="danger"
  >
    <div className="space-y-5">
      <div className="flex items-start gap-3 rounded-2xl bg-white/80 p-4 text-sm text-slate-600 dark:bg-red-950/40 dark:text-slate-200">
        <AlertTriangle className="h-5 w-5 flex-shrink-0 text-red-500" />
        <div>
          <p className="text-base font-semibold text-slate-900 dark:text-white">
            Read before you continue
          </p>
          <p>
            Deactivation hides your storefront activity but lets you return later. Deletion is
            permanent and requires our support team to confirm ownership.
          </p>
        </div>
      </div>
      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => openConfirmDialog("deactivate")}
          disabled={pendingAccountAction === "deactivate"}
          className="inline-flex items-center rounded-xl border border-red-200/70 bg-white/95 px-4 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-50/80 disabled:opacity-70 dark:border-red-900/40 dark:bg-transparent dark:text-red-200 dark:hover:bg-red-900/30"
        >
          {pendingAccountAction === "deactivate"
            ? "Processing..."
            : "Deactivate account"}
        </button>
        <button
          type="button"
          onClick={() => openConfirmDialog("delete")}
          disabled={pendingAccountAction === "delete"}
          className="inline-flex items-center rounded-xl bg-red-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-600 disabled:opacity-70"
        >
          {pendingAccountAction === "delete"
            ? "Requesting..."
            : "Request delete"}
        </button>
      </div>
      <p className="text-xs text-slate-600 dark:text-slate-400">
        Need help first?{" "}
        <a
          href="/account/support"
          className="font-semibold text-red-600 underline-offset-2 hover:underline dark:text-red-300"
        >
          Contact support
        </a>
      </p>
    </div>
  </SectionCard>
);

export default AccountSection;