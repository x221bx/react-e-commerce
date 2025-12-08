// src/components/checkout/CheckoutPaymentSection.jsx
import React from "react";
import { useTranslation } from "react-i18next";
import { FaMoneyBillWave, FaPaypal, FaCreditCard } from "react-icons/fa";
import { MdLockOutline } from "react-icons/md";
import { UseTheme } from "../../theme/ThemeProvider";

export default function CheckoutPaymentSection({
  paymentMethod,
  handlePaymentSelection,
  paymentOptions,
  savedCards = [],
}) {
  const { t } = useTranslation();
  const { theme } = UseTheme();
  const isDark = theme === "dark";

  // --------------- CARD BACKGROUND + BORDER ---------------
  const baseCard = `
    relative flex items-start gap-3 rounded-2xl cursor-pointer transition px-4 py-4
    border shadow-sm
    ${isDark
      ? "bg-slate-800/60 border-slate-700 hover:bg-slate-800 hover:border-emerald-400/40 shadow-black/30"
      : "bg-white/80 border-emerald-100 hover:border-emerald-300 hover:bg-emerald-50/40 shadow-[0_4px_12px_rgba(0,0,0,0.06)]"}
  `;

  // --------------- ICON WRAPPER ---------------
  const iconWrapper = `
    mt-1 flex h-10 w-10 items-center justify-center rounded-full border transition
    ${isDark
      ? "bg-slate-900/70 border-slate-700 text-emerald-300"
      : "bg-emerald-50 border-emerald-200 text-emerald-600"}
  `;

  // --------------- RADIO STYLE ---------------
  const radioOuter = `
    mt-1 flex h-5 w-5 items-center justify-center rounded-full border transition
    ${isDark ? "border-slate-400" : "border-emerald-300"}
  `;
  const radioInner = "h-2.5 w-2.5 rounded-full";

  const getIcon = (type) => {
  if (type === "cod")
    return <FaMoneyBillWave className="text-emerald-500" />;

  if (type === "paypal")
    return <FaPaypal className="text-[#003087]" />; // PayPal Blue

  if (type === "paymob")
    return <MdLockOutline className="text-[#0f9d58]" />; // Paymob secure green

  return <FaCreditCard className="text-[#1a73e8]" />; // Visa/Mastercard blue
};


  return (
    <section
      aria-labelledby="checkout-payment-heading"
      className={`
        space-y-4 rounded-2xl px-4 py-5 border
        ${isDark
          ? "bg-slate-900/50 border-slate-700 shadow-[0_20px_45px_rgba(0,0,0,0.7)]"
          : "bg-emerald-50/40 border-emerald-200 shadow-[0_18px_40px_rgba(16,185,129,0.15)]"}
      `}
    >
      <h2
        id="checkout-payment-heading"
        className={`
          text-sm md:text-base font-semibold
          ${isDark ? "text-slate-100" : "text-slate-800"}
        `}
      >
        {t("checkout.payment.title", "Payment method")}
      </h2>

      <p className={`mt-1 text-xs ${isDark ? "text-slate-400" : "text-slate-600"}`}>
        {t(
          "checkout.payment.subtitle",
          "Choose how you'd like to pay for your order."
        )}
      </p>

      <div className="grid gap-3 md:grid-cols-2">
        {paymentOptions.map((option) => {
          const selected = paymentMethod === option.value;

          return (
            <button
              type="button"
              key={option.value}
              onClick={() => handlePaymentSelection(option.value)}
              className={`${baseCard} ${
                selected
                  ? isDark
                    ? "border-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.5)]"
                    : "border-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.3)]"
                  : ""
              }`}
            >
              {/* ICON */}
              <div
                className={`${iconWrapper} ${
                  selected ? "ring-2 ring-emerald-400/60" : ""
                }`}
              >
                {getIcon(option.type)}
              </div>

              <div className="flex-1 text-left">
                {/* TITLE + RADIO */}
                <div className="flex items-center justify-between gap-2">
                  <p
                    className={`text-sm font-semibold ${
                      isDark ? "text-slate-100" : "text-slate-900"
                    }`}
                  >
                    {option.title}
                  </p>

                  <div
                    className={`${radioOuter} ${
                      selected
                        ? isDark
                          ? "bg-emerald-500/20 border-emerald-400"
                          : "bg-emerald-200 border-emerald-500"
                        : ""
                    }`}
                  >
                    <span
                      className={`${radioInner} ${
                        selected
                          ? isDark
                            ? "bg-emerald-400"
                            : "bg-emerald-600"
                          : "bg-transparent"
                      }`}
                    />
                  </div>
                </div>

                {/* SUBTITLE */}
                <p
                  className={`mt-1 text-xs ${
                    isDark ? "text-slate-400" : "text-slate-600"
                  }`}
                >
                  {option.subtitle}
                </p>

                {/* SAVED CARDS HINT */}
                {option.type === "card" && !!savedCards.length && (
                  <p
                    className={`mt-1 text-xs ${
                      isDark ? "text-emerald-300" : "text-emerald-700"
                    }`}
                  >
                    {t("checkout.payment.savedCardsHint", {
                      defaultValue: "{{count}} saved card(s) available",
                      count: savedCards.length,
                    })}
                  </p>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}
