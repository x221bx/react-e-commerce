// src/components/checkout/PaymobSheet.jsx
import React from "react";
import paymobLogo from "../../assets/paymob.png";

export default function PaymobSheet({ isOpen, session, mutedClass = "", onClose, t }) {
  if (!isOpen || !session?.url) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-6 bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-3xl rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-[var(--shadow-md)] text-[var(--color-text)]">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex items-start gap-3">
            <img src={paymobLogo} alt="Paymob" className="h-8 w-auto object-contain" />
            <div>
              <h3 className="text-lg font-semibold">
                {session.label || t("checkout.payment.paymobTitle", "Pay with card (Paymob)")}
              </h3>
              <p className={`text-sm ${mutedClass}`}>
                {t(
                  "checkout.payment.paymobInlineNote",
                  "Complete your card payment securely without leaving the page."
                )}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-[var(--radius-sm)] px-3 py-1 text-sm border border-[var(--color-border)] text-[var(--color-text)] hover:bg-[var(--color-surface-muted)]"
          >
            {t("common.close", "Close")}
          </button>
        </div>

        <div className="rounded-[var(--radius-lg)] overflow-hidden border border-[var(--color-border)] shadow-inner">
          <iframe
            src={session.url}
            title="Paymob"
            className="w-full h-[70vh] border-0"
            allow="payment *; fullscreen; clipboard-write"
            sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-modals allow-top-navigation allow-top-navigation-by-user-activation"
          />
        </div>
      </div>
    </div>
  );
}
