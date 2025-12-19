// src/components/checkout/PaypalSheet.jsx
import React from "react";
import PayPalButton from "../payment/PayPalButton";

export default function PaypalSheet({
  isOpen,
  onClose,
  summary,
  paypalClientId,
  paypalCurrency,
  paypalOrderRef,
  onSuccess,
  onError,
  errorMessage,
  mutedClass = "",
  t,
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-6 bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-xl rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-[var(--shadow-md)] text-[var(--color-text)]">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <h3 className="text-lg font-semibold">
              {t("checkout.payment.paypalTitle", "Pay with PayPal")}
            </h3>
            <p className={`text-sm ${mutedClass}`}>
              {t(
                "checkout.payment.paypalInlineNote",
                "Complete your payment with the PayPal button below."
              )}
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-[var(--radius-sm)] px-3 py-1 text-sm border border-[var(--color-border)] text-[var(--color-text)] hover:bg-[var(--color-surface-muted)]"
          >
            {t("common.close", "Close")}
          </button>
        </div>

        <PayPalButton
          clientId={paypalClientId}
          amount={Number(summary.total || 0)}
          currency={paypalCurrency}
          orderRef={paypalOrderRef}
          onSuccess={onSuccess}
          onError={onError}
        />

        {errorMessage && <p className="mt-3 text-sm text-red-500">{errorMessage}</p>}
      </div>
    </div>
  );
}
