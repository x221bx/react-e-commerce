// src/components/checkout/OrderConfirmModal.jsx
import React from "react";

export default function OrderConfirmModal({
  isOpen,
  onCancel,
  onConfirm,
  loading,
  summary,
  cartItems = [],
  mutedClass = "",
  t,
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-6 bg-black/40 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] shadow-[var(--shadow-md)] p-6 md:p-7 transform transition-all text-[var(--color-text)]">
        <div className="text-center">
          <h3 className="text-lg font-semibold mb-3">
            {t("checkout.confirmOrder.title", "Confirm Your Order")}
          </h3>
          <p className={`text-sm mb-6 ${mutedClass}`}>
            {t(
              "checkout.confirmOrder.message",
              "Are you sure you want to place this order?"
            )}
          </p>

          <div className="rounded-[var(--radius-md)] p-4 mb-6 text-left bg-[var(--color-surface-muted)] border border-[var(--color-border)]">
            <h4 className="font-semibold mb-3 text-sm">
              {t("checkout.summary.title", "Order Summary")}
            </h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>{t("checkout.summary.subtotal", "Subtotal")}:</span>
                <span>{summary.subtotal?.toLocaleString()} EGP</span>
              </div>
              <div className="flex justify-between">
                <span>{t("checkout.summary.shipping", "Shipping")}:</span>
                <span>{summary.shipping?.toLocaleString()} EGP</span>
              </div>
              <div className="flex justify-between font-semibold border-t pt-2 border-[var(--color-border)]">
                <span>{t("checkout.summary.total", "Total")}:</span>
                <span>{summary.total?.toLocaleString()} EGP</span>
              </div>
              <div className={`text-xs ${mutedClass} mt-2`}>
                {t("checkout.summary.note", "Items: {{count}}", {
                  count: cartItems.length,
                })}
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={onCancel}
              className="flex-1 rounded-[var(--radius-md)] px-4 py-2 text-sm font-semibold border border-[var(--color-border)] text-[var(--color-text)] hover:bg-[var(--color-surface-muted)] transition"
            >
              {t("common.cancel", "Cancel")}
            </button>
            <button
              onClick={onConfirm}
              disabled={loading}
              className="flex-1 rounded-[var(--radius-md)] bg-[var(--color-accent)] px-4 py-2 text-sm font-semibold text-white hover:brightness-95 disabled:opacity-70 shadow-[var(--shadow-sm)]"
            >
              {loading
                ? t("checkout.actions.processing", "Processing...")
                : t("checkout.actions.confirmOrder", "Confirm Order")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
