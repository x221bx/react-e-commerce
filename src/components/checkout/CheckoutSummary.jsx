// src/components/checkout/CheckoutSummary.jsx
import React from "react";
import { useTranslation } from "react-i18next";
import { UseTheme } from "../../theme/ThemeProvider";

export default function CheckoutSummary({ cartItems, summary }) {
    const { t } = useTranslation();
    const { theme } = UseTheme();
    const isDark = theme === "dark";

    // unified green-themed surfaces
    const shellSurface = isDark
        ? "bg-emerald-900/20 border-emerald-900/40 text-white"
        : "bg-emerald-50/70 border-emerald-200 text-slate-900";

    const itemSurface = isDark
        ? "border-emerald-900/40 bg-emerald-900/10"
        : "border-emerald-200 bg-white";

    const muted = isDark ? "text-slate-300" : "text-slate-600";

    return (
        <>
            {/* Desktop Summary */}
            <aside
                className={`rounded-3xl border p-6 shadow-sm lg:block hidden ${shellSurface}`}
            >
                <h2 className="text-lg font-semibold">
                    {t("checkout.summary.title", "Order Summary")}
                </h2>

                <div className="mt-4 space-y-4">
                    {cartItems.map((item) => (
                        <div
                            key={item.id}
                            className={`flex items-center gap-3 rounded-2xl border p-3 ${itemSurface}`}
                        >
                            <img
                                src={item.thumbnailUrl || item.img}
                                alt={item.name || item.title}
                                className="h-16 w-16 rounded-xl object-cover"
                            />
                            <div className="flex-1">
                                <p className="text-sm font-semibold">
                                    {item.name || item.title}
                                </p>
                                <p className={`text-xs ${muted}`}>
                                    {t("checkout.summary.qty", { count: item.quantity ?? 1 })}
                                </p>
                            </div>
                            <p className="text-sm font-semibold">
                                {`${Number(item.price).toLocaleString()} EGP`}
                            </p>
                        </div>
                    ))}
                </div>

                <div className="mt-6 space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                        <span>{t("checkout.summary.subtotal", "Subtotal")}</span>
                        <span>{`${summary.subtotal.toLocaleString()} EGP`}</span>
                    </div>
                    <div className="flex items-center justify-between">
                        <span>{t("checkout.summary.shipping", "Shipping")}</span>
                        <span>{`${summary.shipping.toLocaleString()} EGP`}</span>
                    </div>
                    <div className="flex items-center justify-between text-base font-semibold">
                        <span>{t("checkout.summary.total", "Total")}</span>
                        <span>{`${summary.total.toLocaleString()} EGP`}</span>
                    </div>
                </div>
            </aside>

            {/* Mobile Summary */}
            <div className="lg:hidden mt-6">
                <h2 className="text-lg font-semibold mb-2">
                    {t("checkout.summary.title", "Order Summary")}
                </h2>

                {cartItems.map((item) => (
                    <div
                        key={item.id}
                        className={`flex items-center gap-3 rounded-2xl border p-3 mb-2 ${itemSurface}`}
                    >
                        <img
                            src={item.thumbnailUrl || item.img}
                            alt={item.name || item.title}
                            className="h-16 w-16 rounded-xl object-cover"
                        />
                        <div className="flex-1">
                            <p className="text-sm font-semibold">
                                {item.name || item.title}
                            </p>
                            <p className={`text-xs ${muted}`}>
                                {t("checkout.summary.qty", { count: item.quantity ?? 1 })}
                            </p>
                        </div>
                        <p className="text-sm font-semibold">
                            {`${Number(item.price).toLocaleString()} EGP`}
                        </p>
                    </div>
                ))}

                <div className="mt-4 flex justify-between font-semibold">
                    <span>{t("checkout.summary.total", "Total")}:</span>
                    <span>{`${summary.total.toLocaleString()} EGP`}</span>
                </div>
            </div>
        </>
    );
}
