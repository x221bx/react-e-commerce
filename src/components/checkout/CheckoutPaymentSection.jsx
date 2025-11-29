import React from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

export default function CheckoutPaymentSection({
    paymentMethod,
    handlePaymentSelection,
    paymentOptions,
    savedCards,
}) {
    const { t } = useTranslation();

    return (
        <section className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="text-lg font-semibold">
                    {t("checkout.sections.payment")}
                </h2>
                {savedCards.length > 0 && (
                    <Link
                        to="/account/payments"
                        className="text-sm font-semibold text-emerald-600 hover:underline"
                    >
                        {t("checkout.payment.manageMethods", "Manage payment methods")}
                    </Link>
                )}
            </div>

            <div
                className={`grid gap-4 ${paymentOptions.length > 1 ? "sm:grid-cols-2" : ""
                    }`}
            >
                {paymentOptions.map((option) => {
                    const isActive = paymentMethod === option.value;
                    return (
                        <label
                            key={option.value}
                            className={`flex cursor-pointer flex-col gap-2 rounded-2xl border px-4 py-3 text-sm ${isActive
                                    ? "border-emerald-500 bg-emerald-50/60"
                                    : "border-slate-200"
                                }`}
                        >
                            <div className="flex items-center gap-3">
                                <input
                                    type="radio"
                                    name="payment"
                                    checked={isActive}
                                    onChange={() => handlePaymentSelection(option.value)}
                                />
                                <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                        <p className="font-semibold">{option.title}</p>
                                        {option.badge && (
                                            <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-emerald-700">
                                                {option.badge}
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-xs text-slate-500">{option.subtitle}</p>
                                </div>
                            </div>
                        </label>
                    );
                })}
            </div>
        </section>
    );
}
