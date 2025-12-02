// src/components/orderTracking/ShippingInfoCard.jsx
import React from "react";
import { useTranslation } from "react-i18next";

export default function ShippingInfoCard({
    shippingInfo,
    trackingUrl,
    isDark,
}) {
    const { t } = useTranslation();

    // Neutral + Green palette
    const muted = isDark ? "text-white/60" : "text-slate-600";
    const strongText = isDark ? "text-white" : "text-slate-900";

    // 🟩 خلفية وبوردر متنسقة مع الأخضر
    const infoSurface = isDark
        ? "bg-[#0b1b17]/70 border-emerald-900/30 backdrop-blur"
        : "bg-emerald-50/40 border-emerald-200";

    const divider = isDark ? "border-emerald-900/30" : "border-emerald-200";

    const linkColor = isDark ? "text-emerald-300" : "text-emerald-700";

    return (
        <section
            className={`rounded-2xl border p-6 shadow-sm ${infoSurface}`}
        >
            <h2 className={`text-xl font-semibold ${strongText}`}>
                {t("tracking.shippingInfo", "Shipping Information")}
            </h2>

            <dl className="mt-6 space-y-6">
                {/* Recipient */}
                <div className={`pb-5 border-b ${divider}`}>
                    <dt className={`text-xs font-semibold uppercase tracking-widest ${muted}`}>
                        {t("tracking.shippingTo", "Shipping To")}
                    </dt>
                    <dd className={`mt-2 text-sm font-semibold ${strongText}`}>
                        {shippingInfo.recipient}
                    </dd>
                    <dd className={`text-sm ${muted}`}>
                        {shippingInfo.address}
                    </dd>
                </div>

                {/* Carrier */}
                <div className={`pb-5 border-b ${divider}`}>
                    <dt className={`text-xs font-semibold uppercase tracking-widest ${muted}`}>
                        {t("tracking.carrier", "Carrier")}
                    </dt>
                    <dd className={`mt-2 text-sm font-semibold ${strongText}`}>
                        {shippingInfo.carrier}
                    </dd>
                </div>

                {/* Tracking Number */}
                <div>
                    <dt className={`text-xs font-semibold uppercase tracking-widest ${muted}`}>
                        {t("tracking.trackingNumber", "Tracking Number")}
                    </dt>
                    <dd className={`mt-2 text-sm font-mono font-semibold ${strongText}`}>
                        {shippingInfo.trackingNumber ||
                            t("tracking.awaitingUpdate", "Awaiting update")}
                    </dd>

                    {trackingUrl && (
                        <dd className="mt-3">
                            <a
                                href={trackingUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={`inline-flex items-center gap-2 text-sm font-semibold ${linkColor} hover:underline`}
                            >
                                {t("tracking.trackCarrier", "Track on carrier site")}
                                <span>↗</span>
                            </a>
                        </dd>
                    )}
                </div>
            </dl>
        </section>
    );
}
