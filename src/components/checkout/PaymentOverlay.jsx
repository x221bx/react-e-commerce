// src/components/checkout/PaymentOverlay.jsx
import React from "react";

export default function PaymentOverlay({ visible, url, title = "Secure Payment", onClose }) {
  if (!visible || !url) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
    >
      <div className="relative w-[95vw] max-w-4xl h-[90vh] rounded-2xl overflow-hidden bg-white shadow-2xl">
        <div className="flex items-center justify-between px-4 py-3 border-b bg-slate-900 text-white">
          <div className="font-semibold text-sm">{title}</div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white text-sm px-2 py-1 rounded"
          >
            Close
          </button>
        </div>
        <iframe
          src={url}
          title="Payment"
          className="w-full h-full border-0"
          allow="payment *; fullscreen; clipboard-write"
        />
      </div>
    </div>
  );
}
