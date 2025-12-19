// src/components/payment/PaymentMethodsList.jsx
import React from "react";
import { ShieldCheck } from "lucide-react";
import { useTranslation } from "react-i18next";
import PaymentMethodCard from "./PaymentMethodCard";
import EmptyState from "../ui/EmptyState";

export default function PaymentMethodsList({
  methods = [],
  loading,
  onDelete,
  onSetDefault,
}) {
  const { t } = useTranslation();

  return (
    <section className="space-y-4 rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-[var(--shadow-sm)]">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-[var(--color-text)]">
            {t("payments.activeMethods", "Active methods")}
          </p>
          <p className="text-xs text-[var(--color-text-muted)]">
            {t("payments.savedCount", "{{count}} saved | {{cards}} cards", {
              count: methods.length,
              cards: methods.filter((m) => m.type === "card").length,
            })}
          </p>
        </div>
        <ShieldCheck className="h-5 w-5 text-[var(--color-accent)]" />
      </div>

      <div className="space-y-3">
        {methods.map((method) => (
          <PaymentMethodCard
            key={method.id}
            method={method}
            onMakeDefault={() => onSetDefault(method.id)}
            onDelete={() => onDelete(method.id)}
            t={t}
          />
        ))}

        {methods.length === 0 && (
          <EmptyState
            title={
              loading
                ? t("common.loading", "Loading...")
                : t("payments.noMethods", "No payment methods saved yet.")
            }
            message={t(
              "payments.noMethodsHint",
              "Use the forms on the right to add one."
            )}
          />
        )}
      </div>
    </section>
  );
}
