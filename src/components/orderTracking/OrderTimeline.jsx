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
        const lookupIndex = statusOrder.indexOf(currentStatusKey);
        const currentStatusIndex = lookupIndex === -1 ? 0 : lookupIndex;

        const statusTimestamps = {};
        if (order?.statusHistory) {
            order.statusHistory.forEach(history => {
                statusTimestamps[toKey(history.status)] = history.changedAt;
            });
        }

        return BASE_STEPS.map((step, index) => {
            let state = "pending";
            if (index < currentStatusIndex) state = "done";
            if (index === currentStatusIndex) state = "current";

            let actualTimestamp = null;
            let estimatedTimestamp = null;

            if (statusTimestamps[step.key]) {
                actualTimestamp = statusTimestamps[step.key];
            } else if (index > currentStatusIndex) {
                const orderCreated = new Date(order?.createdAt || Date.now());
                const estimatedDate = new Date(orderCreated);
                estimatedDate.setDate(orderCreated.getDate() + step.estimatedDays);
                estimatedTimestamp = estimatedDate.toISOString();
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

    // 🎨 Colors from Products.jsx
    const strongText = isDark ? "text-white" : "text-slate-900";
    const muted = isDark ? "text-white/60" : "text-slate-500";

    const connectorColor = isDark ? "bg-slate-700" : "bg-slate-200";

    // 🎨 Indicator styling adapted visually to match Product cards
    const timelineIndicator = (state) => {
        if (state === "done" || state === "current") {
            return "border-emerald-500 bg-emerald-500 text-white shadow-md";
        }
        return isDark
            ? "border-amber-800/60 bg-amber-900/20 text-amber-200/80"
            : "border-amber-200 bg-amber-50 text-amber-700/70";
    };

    const labelTone = (state) => {
        if (state === "done" || state === "current")
            return isDark ? "text-emerald-300" : "text-emerald-700";
        if (state === "pending")
            return isDark ? "text-amber-200" : "text-amber-700";
        return strongText;
    };

    const formatDateTime = (step) => {
        if (step.actualTimestamp) {
            return new Date(step.actualTimestamp).toLocaleString();
        } else if (step.estimatedTimestamp) {
            return `Est. ${new Date(step.estimatedTimestamp).toLocaleDateString()}`;
        }
        return t("tracking.awaitingUpdate", "Awaiting update");
    };

    const getDateStyle = (step) => {
        if (step.actualTimestamp) return labelTone(step.state);
        if (step.estimatedTimestamp)
            return isDark ? "text-amber-200/90" : "text-amber-700";
        return muted;
    };

    return (
        <section>
            <h2 className={`text-sm font-semibold uppercase tracking-wide ${muted}`}>
                {t("tracking.trackingStatus", "Tracking Status")}
            </h2>

            <ol className="mt-6 space-y-6">
                {timelineSteps.map((step, index) => (
                    <li
                        key={step.key}
                        className="flex gap-4 transition-all animate-in slide-in-from-left-4 duration-500"
                        style={{ animationDelay: `${index * 100}ms` }}
                    >
                        {/* Left Column: Indicator */}
                        <div className="flex flex-col items-center">
                            <div
                                className={`
                                    flex h-10 w-10 items-center justify-center rounded-full border-2 
                                    font-semibold transition-all duration-300 hover:scale-110
                                    ${timelineIndicator(step.state)}
                                `}
                            >
                                {step.state === "done"
                                    ? "✓"
                                    : step.isEstimated
                                    ? "~"
                                    : index + 1}
                            </div>

                            {index !== timelineSteps.length - 1 && (
                                <div className={`mt-2 h-14 w-0.5 ${connectorColor}`} />
                            )}
                        </div>

                        {/* Right Column: Labels */}
                        <div className="pt-1">
                            <p className={`font-semibold ${labelTone(step.state)}`}>
                                {t(step.label)}
                                {step.isEstimated && (
                                    <span className={`ml-2 text-xs ${muted}`}>
                                        Estimated
                                    </span>
                                )}
                            </p>

                            <p className={`text-sm ${getDateStyle(step)}`}>
                                {formatDateTime(step)}
                            </p>
                        </div>
                    </li>
                ))}
            </ol>
        </section>
    );
}
