//  src/components/checkout/CheckoutPaymentSection.jsx
import React from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { UseTheme } from "../../theme/ThemeProvider";

export default function CheckoutPaymentSection({
    paymentMethod,
    handlePaymentSelection,
    paymentOptions,
    savedCards,
}) {
    const { t } = useTranslation();
    const { theme } = UseTheme();
    const isDark = theme === "dark";

    const cardSurface = isDark
        ? "bg-[#0f1d1d]/60 border-white/10 hover:bg-white/10"
        : "bg-white/90 border-slate-200 hover:bg-slate-50";

    const activeSurface = isDark
        ? "border-emerald-900/40 bg-emerald-900/20 shadow-md"
        : "border-emerald-300 bg-emerald-50 shadow-md";

    const subtitleColor = isDark ? "text-slate-400" : "text-slate-500";
    const linkColor = isDark ? "text-emerald-300" : "text-emerald-600";
    const titleColor = isDark ? "text-white" : "text-slate-900";

    return (
        <section className="space-y-4">
            {/* Header */}
            <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className={`text-lg font-semibold ${titleColor}`}>
                    {t("checkout.sections.payment")}
                </h2>

                {savedCards.length > 0 && (
                    <Link
                        to="/account/payments"
                        className={`text-sm font-semibold hover:underline ${linkColor}`}
                    >
                        {t("checkout.payment.manageMethods", "Manage payment methods")}
                    </Link>
                )}
            </div>

            {/* Payment Options */}
            <div className={`grid gap-4 ${paymentOptions.length > 1 ? "sm:grid-cols-2" : ""}`}>
                {paymentOptions.map((option) => {
                    const isActive = paymentMethod === option.value;

                    return (
                        <label
                            key={option.value}
                            className={`flex cursor-pointer flex-col gap-2 rounded-2xl px-4 py-3 text-sm transition 
                                border backdrop-blur-md 
                                ${isActive ? activeSurface : cardSurface}`}
                        >
                            <div className="flex items-center gap-3">
                                <input
                                    type="radio"
                                    name="payment"
                                    checked={isActive}
                                    onChange={() => handlePaymentSelection(option.value)}
                                    className="accent-emerald-500"
                                />

                                <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                        <p className={`font-semibold ${titleColor}`}>
                                            {option.title}
                                        </p>

                                        {option.badge && (
                                            <span
                                                className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide
                                                    ${isDark
                                                        ? "bg-emerald-900/50 text-emerald-200"
                                                        : "bg-emerald-100 text-emerald-700"
                                                    }`}
                                            >
                                                {option.badge}
                                            </span>
                                        )}
                                    </div>

                                    <p className={`text-xs ${subtitleColor}`}>
                                        {option.subtitle}
                                    </p>
                                </div>
                            </div>
                        </label>
                    );
                })}
            </div>
        </section>
    );
}
