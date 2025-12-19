// src/components/payment/PaymentMethodCard.jsx
import React from "react";
import { CreditCard, WalletCards, Star, Trash2 } from "lucide-react";

const brandCopy = {
  visa: { label: "Visa" },
  mastercard: { label: "Mastercard" },
  amex: { label: "American Express" },
};

const walletLabels = {
  paypal: "PayPal",
  apple: "Apple Pay",
  google: "Google Wallet",
};

export default function PaymentMethodCard({ method, onMakeDefault, onDelete, t }) {
  const isCard = method.type === "card";
  const badge =
    isCard && brandCopy[method.brand]
      ? brandCopy[method.brand]
      : { label: walletLabels[method.provider] || "Wallet" };

  const getLabel = () => {
    if (isCard) return method.nickname || t("payments.cardLabel", "Card");
    const label = walletLabels[method.provider] || "Wallet";
    return method.nickname || `${label} (${method.email})`;
  };

  return (
    <div className="rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface-muted)] p-4 shadow-[var(--shadow-sm)]">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          {isCard ? (
            <CreditCard className="h-5 w-5 text-[var(--color-accent)]" />
          ) : (
            <WalletCards className="h-5 w-5 text-[var(--color-accent)]" />
          )}
          <div>
            <p className="text-sm font-semibold text-[var(--color-text)]">{getLabel()}</p>
            <p className="text-xs text-[var(--color-text-muted)]">
              {isCard ? `${badge.label} **** ${method.last4 || ""}` : `${badge.label} - ${method.email}`}
            </p>
            {isCard && method.holder && (
              <p className="text-xs text-[var(--color-text-muted)] mt-1">
                {t("payments.cardHolder", "Card holder")}: {method.holder}
              </p>
            )}
          </div>
        </div>

        {method.isDefault && (
          <span className="inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold bg-[var(--color-accent)]/10 text-[var(--color-accent)]">
            <Star className="h-3 w-3" />
            {t("payments.status.defaultBadge", "Default")}
          </span>
        )}
      </div>

      <div className="mt-3 flex flex-wrap gap-2 text-xs font-semibold">
        {!method.isDefault && onMakeDefault && (
          <button
            type="button"
            onClick={onMakeDefault}
            className="inline-flex items-center gap-1 rounded-full border border-[var(--color-border)] px-3 py-1 transition hover:bg-[var(--color-surface)]"
          >
            <Star className="h-3 w-3" />
            {t("payments.actions.makeDefault", "Make default")}
          </button>
        )}
        {onDelete && (
          <button
            type="button"
            onClick={onDelete}
            className="inline-flex items-center gap-1 rounded-full border border-[var(--color-border)] px-3 py-1 transition hover:bg-[var(--color-surface)] text-red-600"
          >
            <Trash2 className="h-3 w-3" />
            {t("payments.actions.delete", "Delete")}
          </button>
        )}
      </div>
    </div>
  );
}
