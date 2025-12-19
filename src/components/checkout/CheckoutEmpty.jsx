// src/components/checkout/CheckoutEmpty.jsx
import React from "react";
import { Link } from "react-router-dom";

export default function CheckoutEmpty({ t, isRTL, muted }) {
  return (
    <main
      dir={isRTL ? "rtl" : "ltr"}
      className="min-h-screen flex flex-col bg-[var(--color-bg)] text-[var(--color-text)] transition-colors duration-300"
    >
      <div className="flex-1 flex items-center justify-center px-4 py-16">
        <section className="mx-auto w-full max-w-2xl rounded-[var(--radius-lg)] border border-dashed border-[var(--color-border)] bg-[var(--color-surface)] p-10 text-center shadow-[var(--shadow-sm)]">
          <p className="text-xl font-semibold">
            {t("checkout.empty.title", "Your cart is empty")}
          </p>
          <p className={`mt-2 text-sm ${muted}`}>
            {t("checkout.empty.subtitle", "Please add some products first.")}
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <Link
              to="/products"
              className="rounded-[var(--radius-md)] bg-[var(--color-accent)] px-5 py-2 text-sm font-semibold text-white shadow-[var(--shadow-sm)] hover:brightness-95"
            >
              {t("checkout.empty.cta", "Go to Products")}
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
