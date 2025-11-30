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
        const statusOrder = BASE_STEPS.map((step) => step.key);
        const currentStatusIndex = order
            ? statusOrder.indexOf(order.status?.toLowerCase() || "pending")
            : 0;

        // Get the actual timestamp for each status from statusHistory
        const statusTimestamps = {};
        if (order?.statusHistory) {
            order.statusHistory.forEach(history => {
                statusTimestamps[history.status.toLowerCase()] = history.changedAt;
            });
        }

        return BASE_STEPS.map((step, index) => {
            let state = "pending";
            if (index < currentStatusIndex) state = "done";
            if (index === currentStatusIndex) state = "current";

            // Get actual timestamp if available, otherwise estimate
            let actualTimestamp = null;
            let estimatedTimestamp = null;

            if (statusTimestamps[step.key]) {
                actualTimestamp = statusTimestamps[step.key];
            } else if (index > currentStatusIndex) {
                // Estimate future dates based on order creation
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

    const timelineIndicator = (state) => {
        if (state === "done") {
            return "border-emerald-500 bg-emerald-500 text-white";
        }
        if (state === "current") {
            return isDark
                ? "border-amber-400 bg-amber-900/40 text-amber-200"
                : "border-amber-400 bg-amber-50 text-amber-600";
        }
        return isDark
            ? "border-slate-700 bg-slate-900 text-slate-500"
            : "border-slate-200 bg-white text-slate-400";
    };

    const formatDateTime = (step) => {
        if (step.actualTimestamp) {
            return new Date(step.actualTimestamp).toLocaleString();
        } else if (step.estimatedTimestamp) {
            return `Est. ${new Date(step.estimatedTimestamp).toLocaleDateString()}`;
        } else {
            return t("tracking.awaitingUpdate", "Awaiting update");
        }
    };

    const getDateStyle = (step) => {
        if (step.actualTimestamp) {
            return strongText;
        } else if (step.estimatedTimestamp) {
            return isDark ? "text-slate-500" : "text-slate-400";
        } else {
            return muted;
        }
    };

    const connectorColor = isDark ? "bg-slate-700" : "bg-slate-200";
    const muted = isDark ? "text-slate-400" : "text-slate-500";
    const strongText = isDark ? "text-white" : "text-slate-900";

    return (
        <section>
            <h2 className={`text-sm font-semibold uppercase tracking-wide ${muted}`}>
                {t("tracking.trackingStatus", "Tracking Status")}
            </h2>
            <ol className="mt-6 space-y-6">
                {timelineSteps.map((step, index) => (
                    <li key={step.key} className="flex gap-4 animate-in slide-in-from-left-4 duration-500" style={{ animationDelay: `${index * 100}ms` }}>
                        <div className="flex flex-col items-center">
                            {/* Circle Indicator */}
                            <div
                                className={`flex h-10 w-10 items-center justify-center rounded-full border-2 font-semibold transition-all duration-300 hover:scale-110 ${timelineIndicator(
                                    step.state
                                )}`}
                            >
                                {step.state === "done" ? "✓" : step.isEstimated ? "~" : index + 1}
                            </div>
                            {/* Connector Line */}
                            {index !== timelineSteps.length - 1 && (
                                <div className={`mt-2 h-14 w-0.5 ${connectorColor}`} />
                            )}
                        </div>
                        <div className="pt-1">
                            <p className={`font-semibold ${strongText}`}>
                                {t(step.label)}
                                {step.isEstimated && (
                                    <span className={`ml-2 text-xs ${muted}`}>Estimated</span>
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
