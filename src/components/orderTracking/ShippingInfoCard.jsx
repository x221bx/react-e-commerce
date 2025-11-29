import React from "react";
import { useTranslation } from "react-i18next";

export default function ShippingInfoCard({
    shippingInfo,
    trackingUrl,
    isDark,
}) {
    const { t } = useTranslation();

    const muted = isDark ? "text-slate-400" : "text-slate-500";
    const strongText = isDark ? "text-white" : "text-slate-900";
    const infoSurface = isDark
        ? "border-slate-800 bg-slate-900"
        : "border-slate-100 bg-white";
    const linkColor = isDark ? "text-emerald-300" : "text-emerald-600";

    return (
        <section className={`rounded-2xl border p-6 ${infoSurface}`}>
            <h2 className={`text-lg font-semibold ${strongText}`}>
                {t("tracking.shippingInfo", "Shipping Information")}
            </h2>
            <dl className="mt-6 space-y-5">
                {/* Recipient */}
                <div className="border-b border-slate-200 dark:border-slate-700 pb-4">
                    <dt className={`text-xs font-semibold uppercase tracking-widest ${muted}`}>
                        {t("tracking.shippingTo", "Shipping To")}
                    </dt>
                    <dd className={`mt-2 text-sm font-semibold ${strongText}`}>
                        {shippingInfo.recipient}
                    </dd>
                    <dd className={`text-sm ${muted}`}>{shippingInfo.address}</dd>
                </div>

                {/* Carrier */}
                <div className="border-b border-slate-200 dark:border-slate-700 pb-4">
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
