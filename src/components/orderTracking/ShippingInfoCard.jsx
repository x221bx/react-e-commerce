// src/components/orderTracking/ShippingInfoCard.jsx
import React from "react";
import { useTranslation } from "react-i18next";

export default function ShippingInfoCard({
    shippingInfo,
    trackingUrl,
    isDark,
}) {
    const { t } = useTranslation();

    // Text colors
    const muted = isDark ? "text-white/60" : "text-slate-600";
    const strong = isDark ? "text-white" : "text-slate-900";

    // Card surface (High-end Dark Neon / Light mode)
    const surface = isDark
        ? `
            bg-gradient-to-br from-[#0c1616]/80 via-[#0b1b17]/70 to-[#091212]/80 
            border border-emerald-900/40 
            shadow-[0_0_15px_rgba(0,0,0,0.45)]
            backdrop-blur-sm
          `
        : `
            bg-emerald-50/60 
            border border-emerald-200 
            shadow-sm
          `;

    // Divider styling
    const divider = isDark ? "border-emerald-900/40" : "border-emerald-300";

    // Tracking link color
    const linkColor = isDark ? "text-emerald-300" : "text-emerald-700";

    return (
        <section
            className={`
                rounded-3xl p-6 transition-all duration-300 
                hover:shadow-[0_0_20px_rgba(16,185,129,0.25)]
                hover:border-emerald-500/40
                ${surface}
            `}
        >
            {/* Header */}
            <h2
                className={`
                    text-xl font-bold tracking-tight mb-4
                    ${strong}
                `}
            >
                {t("tracking.shippingInfo", "Shipping Information")}
            </h2>

            <dl className="space-y-6">

                {/* Recipient */}
                <div className={`pb-5 border-b ${divider}`}>
                    <dt className={`text-xs font-semibold uppercase tracking-widest ${muted}`}>
                        {t("tracking.shippingTo", "Shipping To")}
                    </dt>

                    <dd className={`mt-2 text-sm font-semibold ${strong}`}>
                        {shippingInfo.recipient}
                    </dd>

                    <dd className={`text-sm leading-relaxed ${muted}`}>
                        {shippingInfo.address}
                    </dd>
                </div>

                {/* Carrier */}
                <div className={`pb-5 border-b ${divider}`}>
                    <dt className={`text-xs font-semibold uppercase tracking-widest ${muted}`}>
                        {t("tracking.carrier", "Carrier")}
                    </dt>

                    <dd className={`mt-2 text-sm font-semibold ${strong}`}>
                        {shippingInfo.carrier || t("tracking.awaitingUpdate", "Awaiting update")}
                    </dd>

                    <dd className={`text-xs ${muted} mt-1`}>
                        🚚 {t("tracking.carrierNote", "Transfers to carrier may take time")}
                    </dd>
                </div>

                {/* Tracking Number */}
                <div className="space-y-2">
                    <dt className={`text-xs font-semibold uppercase tracking-widest ${muted}`}>
                        {t("tracking.trackingNumber", "Tracking Number")}
                    </dt>

                    <dd className={`mt-2 text-sm font-mono font-semibold ${strong}`}>
                        {shippingInfo.trackingNumber ||
                            t("tracking.awaitingUpdate", "Awaiting update")}
                    </dd>

                    {trackingUrl && (
                        <dd className="mt-3">
                            <a
                                href={trackingUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={`
                                    inline-flex items-center gap-2 text-sm font-semibold 
                                    hover:underline hover:opacity-100 transition
                                    ${linkColor}
                                `}
                            >
                                {t("tracking.trackCarrier", "Track on carrier site")}
                                <span className="text-lg">↗</span>
                            </a>
                        </dd>
                    )}
                </div>
            </dl>
        </section>
    );
}
