// src/components/orderTracking/OrderTimeline.jsx
import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";

const BASE_STEPS = [
    { key: "pending", label: "tracking.steps.orderPlaced", estimatedDays: 0 },
    { key: "processing", label: "tracking.steps.processing", estimatedDays: 1 },
    { key: "shipped", label: "tracking.steps.shipped", estimatedDays: 3 },
    { key: "out_for_delivery", label: "tracking.steps.outForDelivery", estimatedDays: 5 },
    { key: "delivered", label: "tracking.steps.delivered", estimatedDays: 7 },
];

export default function OrderTimeline({ order, isDark }) {
    const { t } = useTranslation();

    const timelineSteps = useMemo(() => {
        const toKey = (val = "") => val.toLowerCase().replace(/[\s-]+/g, "_");
        const statusOrder = BASE_STEPS.map((step) => step.key);
        const currentStatusKey = order ? toKey(order.status || "pending") : "pending";
        const currentStatusIndex = statusOrder.indexOf(currentStatusKey) !== -1
            ? statusOrder.indexOf(currentStatusKey)
            : 0;

        const statusTimestamps = {};
        if (order?.statusHistory) {
            order.statusHistory.forEach(history => {
                statusTimestamps[toKey(history.status)] = history.changedAt;
            });
        }

        return BASE_STEPS.map((step, index) => {
            const state =
                index < currentStatusIndex
                    ? "done"
                    : index === currentStatusIndex
                    ? "current"
                    : "pending";

            let actualTimestamp = statusTimestamps[step.key] || null;
            let estimatedTimestamp = null;

            if (!actualTimestamp && index > currentStatusIndex) {
                const orderCreated = new Date(order?.createdAt || Date.now());
                const estimated = new Date(orderCreated);
                estimated.setDate(orderCreated.getDate() + step.estimatedDays);
                estimatedTimestamp = estimated.toISOString();
            }

            return {
                ...step,
                state,
                actualTimestamp,
                estimatedTimestamp,
                isEstimated: !actualTimestamp && index > currentStatusIndex,
            };
        });
    }, [order]);

    // UI COLORS
    const strong = isDark ? "text-white" : "text-slate-900";
    const muted = isDark ? "text-white/60" : "text-slate-500";

    // Glow colors
    const connectorColor = isDark ? "bg-slate-700/50" : "bg-slate-200";

    // Indicator UI
    const indicatorStyle = (state) => {
        if (state === "done" || state === "current") {
            return `
                border-emerald-500 bg-emerald-600 text-white
                shadow-[0_0_12px_rgba(16,185,129,0.45)]
                hover:shadow-[0_0_18px_rgba(16,185,129,0.7)]
            `;
        }
        return isDark
            ? "border-slate-600 bg-slate-900 text-slate-300"
            : "border-slate-300 bg-slate-100 text-slate-600";
    };

    const labelColor = (state) => {
        if (state === "done" || state === "current")
            return isDark ? "text-emerald-300" : "text-emerald-700";
        return isDark ? "text-amber-200" : "text-amber-700";
    };

    const formatDateTime = (step) =>
        step.actualTimestamp
            ? new Date(step.actualTimestamp).toLocaleString()
            : step.estimatedTimestamp
            ? `Est. ${new Date(step.estimatedTimestamp).toLocaleDateString()}`
            : t("tracking.awaitingUpdate", "Awaiting update");

    const dateStyle = (step) => {
        if (step.actualTimestamp) return labelColor(step.state);
        if (step.isEstimated) return isDark ? "text-amber-200" : "text-amber-700";
        return muted;
    };

    return (
        <section className="relative">
            <h2
                className={`
                    text-xs font-semibold uppercase tracking-wide mb-4
                    ${muted}
                `}
            >
                {t("tracking.trackingStatus", "Tracking Status")}
            </h2>

            <ol className="space-y-6">
                {timelineSteps.map((step, index) => (
                    <li
                        key={step.key}
                        className={`
                            flex gap-4 items-start
                            animate-in fade-in slide-in-from-left-3 duration-500
                        `}
                        style={{ animationDelay: `${index * 120}ms` }}
                    >
                        {/* -------- LEFT COLUMN: INDICATOR -------- */}
                        <div className="flex flex-col items-center">
                            <div
                                className={`
                                    flex h-11 w-11 items-center justify-center rounded-full border-2
                                    font-semibold transition-all duration-300
                                    hover:scale-110
                                    ${indicatorStyle(step.state)}
                                `}
                            >
                                {step.state === "done"
                                    ? "✓"
                                    : step.isEstimated
                                    ? "~"
                                    : index + 1}
                            </div>

                            {/* Connector line */}
                            {index !== timelineSteps.length - 1 && (
                                <div
                                    className={`mt-2 h-14 w-1 rounded-full ${connectorColor}`}
                                />
                            )}
                        </div>

                        {/* -------- RIGHT COLUMN: LABELS -------- */}
                        <div className="pt-1 space-y-1.5">
                            <p
                                className={`font-semibold capitalize ${labelColor(
                                    step.state
                                )}`}
                            >
                                {t(step.label)}
                                {step.isEstimated && (
                                    <span className="ml-2 text-xs opacity-70">
                                        ({t("tracking.estimated", "Estimated")})
                                    </span>
                                )}
                            </p>

                            <p className={`text-sm ${dateStyle(step)}`}>
                                {formatDateTime(step)}
                            </p>
                        </div>
                    </li>
                ))}
            </ol>
        </section>
    );
}
