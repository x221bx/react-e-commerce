// src/components/checkout/CheckoutSummary.jsx
import React from "react";
import { useTranslation } from "react-i18next";
import { UseTheme } from "../../theme/ThemeProvider";
import { getLocalizedProductTitle } from "../../utils/productLocalization";

export default function CheckoutSummary({ cartItems, summary }) {
    const { t, i18n } = useTranslation();
    const lang = i18n.language || "en";
    const { theme } = UseTheme();
    const isDark = theme === "dark";

    // SURFACE STYLES
    const shellSurface = isDark
        ? "bg-slate-900/60 border-slate-700/60 text-white shadow-[0_8px_30px_rgba(0,0,0,0.45)] backdrop-blur-xl"
        : "bg-white/85 border-emerald-100 text-slate-900 shadow-[0_8px_30px_rgba(16,185,129,0.15)] backdrop-blur-xl";

    const itemSurface = isDark
        ? "bg-slate-900/40 border-slate-700/60 hover:bg-slate-900/60"
        : "bg-white border-emerald-100 hover:bg-emerald-50/60";

    const muted = isDark ? "text-slate-300" : "text-slate-600";

    return (
        <>
            {/* Desktop Summary */}
            <aside
                className={`
                    rounded-3xl border p-6 lg:block hidden
                    transition-all duration-300
                    ${shellSurface}
                `}
            >
                {/* Title */}
                <h2
                    className="text-lg font-semibold tracking-wide
                               animate-fadeSlideDown"
                >
                    {t("checkout.summary.title", "Order Summary")}
                </h2>

                {/* Cart Items */}
                <div className="mt-5 space-y-4 animate-fadeSlideUp">
                    {cartItems.map((item) => (
                        <div
                            key={item.id}
                            className={`
                                flex items-center gap-4 rounded-2xl border p-3
                                transition-all duration-300
                                hover:shadow-md hover:scale-[1.01]
                                ${itemSurface}
                            `}
                        >
                            <img
                                src={item.thumbnailUrl || item.img}
                                alt={getLocalizedProductTitle(item, lang)}
                                className="h-16 w-16 rounded-xl object-cover shadow-sm"
                            />

                            <div className="flex-1">
                                <p className="text-sm font-semibold">
                                    {getLocalizedProductTitle(item, lang)}
                                </p>

                                <p className={`text-xs ${muted}`}>
                                    {t("checkout.summary.qty", { count: item.quantity ?? 1 })}
                                </p>
                            </div>

                            <p className="text-sm font-semibold text-emerald-500">
                                {`${Number(item.price).toLocaleString()} EGP`}
                            </p>
                        </div>
                    ))}
                </div>

                {/* Totals */}
                <div
                    className="
                        mt-6 text-sm space-y-2 animate-fadeSlideUp delay-150
                    "
                >
                    <div className="flex items-center justify-between">
                        <span>{t("checkout.summary.subtotal", "Subtotal")}</span>
                        <span className="font-medium">
                            {summary.subtotal.toLocaleString()} EGP
                        </span>
                    </div>

                    <div className="flex items-center justify-between">
                        <span>{t("checkout.summary.shipping", "Shipping")}</span>
                        <span className="font-medium">
                            {summary.shipping.toLocaleString()} EGP
                        </span>
                    </div>

                    <div className="
                        flex items-center justify-between
                        text-base font-semibold pt-2 border-t
                        border-slate-200 dark:border-slate-700
                    ">
                        <span>{t("checkout.summary.total", "Total")}</span>
                        <span className="
                            text-emerald-500 text-lg font-bold
                            animate-pricePulse
                        ">
                            {summary.total.toLocaleString()} EGP
                        </span>
                    </div>
                </div>
            </aside>

            {/* Mobile Summary */}
            <div className="lg:hidden mt-6">
                <h2 className="text-lg font-semibold mb-3">
                    {t("checkout.summary.title", "Order Summary")}
                </h2>

                {cartItems.map((item) => (
                    <div
                        key={item.id}
                        className={`
                            flex items-center gap-3 rounded-2xl border p-3 mb-2
                            transition-all duration-300
                            active:scale-[0.98]
                            ${itemSurface}
                        `}
                    >
                        <img
                            src={item.thumbnailUrl || item.img}
                            alt={getLocalizedProductTitle(item, lang)}
                            className="h-14 w-14 rounded-xl object-cover shadow-sm"
                        />
                        <div className="flex-1">
                            <p className="text-sm font-semibold">
                                {getLocalizedProductTitle(item, lang)}
                            </p>
                            <p className={`text-xs ${muted}`}>
                                {t("checkout.summary.qty", { count: item.quantity ?? 1 })}
                            </p>
                        </div>

                        <p className="text-sm font-semibold text-emerald-500">
                            {`${Number(item.price).toLocaleString()} EGP`}
                        </p>
                    </div>
                ))}

                <div className="
                    mt-4 flex justify-between text-base font-semibold
                ">
                    <span>{t("checkout.summary.total", "Total")}:</span>
                    <span className="text-emerald-500 font-bold">
                        {summary.total.toLocaleString()} EGP
                    </span>
                </div>
            </div>
        </>
    );
}

/* ==============================
   ANIMATIONS (add to global CSS)
   ============================== */
/*
.fadeSlideUp {
  @apply opacity-0 translate-y-3;
}
.animate-fadeSlideUp {
  animation: fadeSlideUp .55s cubic-bezier(.34,.97,.58,1) forwards;
}
@keyframes fadeSlideUp {
  from { opacity: 0; transform: translateY(12px); }
  to   { opacity: 1; transform: translateY(0); }
}

.animate-fadeSlideDown {
  animation: fadeSlideDown .5s ease-out forwards;
}
@keyframes fadeSlideDown {
  from { opacity: 0; transform: translateY(-8px); }
  to   { opacity: 1; transform: translateY(0); }
}

.animate-pricePulse {
  animation: pricePulse 1.8s ease-in-out infinite;
}
@keyframes pricePulse {
  0%, 100% { transform: scale(1); opacity: 1; }
  50%      { transform: scale(1.05); opacity: .85; }
}
*/
