// src/components/orderTracking/OrderItemsList.jsx
import React from "react";
import { useTranslation } from "react-i18next";
import { getLocalizedProductTitle } from "../../utils/productLocalization";

export default function OrderItemsList({ items, isDark }) {
    const { t, i18n } = useTranslation();
    const lang = i18n.language || "en";

    if (!items || items.length === 0) return null;

    // Colors
    const muted = isDark ? "text-white/60" : "text-slate-500";
    const strong = isDark ? "text-white" : "text-slate-900";

    // Card surface design
    const cardSurface = isDark
        ? `
            bg-gradient-to-br from-[#0d1616]/80 via-[#0e1b1b]/70 to-[#081010]/80 
            border border-emerald-900/30 
            shadow-[0_0_15px_rgba(0,0,0,0.4)] 
            hover:border-emerald-500/40 
            hover:shadow-[0_0_20px_rgba(16,185,129,0.25)] 
        `
        : `
            bg-white 
            border border-emerald-100 
            shadow-sm 
            hover:border-emerald-300 
            hover:shadow-md
        `;

    return (
        <div className="mt-8">
            <h3
                className={`
                    text-sm font-semibold uppercase tracking-wide mb-3
                    ${muted}
                `}
            >
                {t("tracking.orderItems", "Order Items")}
            </h3>

            <div className="space-y-4">
                {items.map((item, index) => (
                    <div
                        key={index}
                        className={`
                            group flex items-center gap-4 rounded-2xl p-4 transition-all cursor-pointer
                            backdrop-blur-sm 
                            hover:scale-[1.015] active:scale-[0.99]
                            duration-300
                            ${cardSurface}
                        `}
                    >
                        {/* Product Image */}
                        {item.thumbnailUrl || item.img || item.image || item.imageUrl ? (
                            <div className="relative">
                                <img
                                    src={
                                        item.thumbnailUrl ||
                                        item.img ||
                                        item.image ||
                                        item.imageUrl
                                    }
                                    alt={getLocalizedProductTitle(item, lang)}
                                    className="
                                        h-16 w-16 rounded-xl object-cover
                                        shadow-inner shadow-black/30
                                    "
                                />

                                {/* Glow effect on hover */}
                                {isDark && (
                                    <div
                                        className="
                                            absolute inset-0 rounded-xl 
                                            opacity-0 group-hover:opacity-40 
                                            transition-all duration-300
                                            bg-emerald-400/20 blur-sm
                                        "
                                    />
                                )}
                            </div>
                        ) : (
                            <div className="h-16 w-16 rounded-xl bg-slate-700/40" />
                        )}

                        {/* Info Section */}
                        <div className="flex-1 space-y-1">
                            <p
                                className={`
                                    text-base font-semibold leading-tight
                                    ${strong}
                                `}
                            >
                                {getLocalizedProductTitle(item, lang)}
                            </p>

                            <p className={`text-sm ${muted}`}>
                                {t("tracking.qty", { count: item.quantity || 1 })}
                            </p>
                        </div>

                        {/* Price */}
                        <div className="flex flex-col items-end">
                            <p
                                className={`
                                    text-lg font-bold tracking-wide
                                    ${strong}
                                `}
                            >
                                {item.price
                                    ? `${Number(item.price).toLocaleString()} EGP`
                                    : "-"}
                            </p>

                            {/* Divider line (only dark mode for premium look) */}
                            {isDark && (
                                <div className="mt-1 h-[2px] w-8 rounded-full bg-emerald-400/30 group-hover:bg-emerald-400/50 transition"></div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
