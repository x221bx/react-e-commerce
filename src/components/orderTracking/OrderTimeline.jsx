import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";

const BASE_STEPS = [
    { key: "pending", label: "tracking.steps.orderPlaced" },
    { key: "processing", label: "tracking.steps.processing" },
    { key: "shipped", label: "tracking.steps.shipped" },
    { key: "out_for_delivery", label: "tracking.steps.outForDelivery" },
    { key: "delivered", label: "tracking.steps.delivered" },
];

export default function OrderTimeline({ order, isDark }) {
    const { t } = useTranslation();

    const timelineSteps = useMemo(() => {
        const statusOrder = BASE_STEPS.map((step) => step.key);
        const currentStatusIndex = order
            ? statusOrder.indexOf(order.status?.toLowerCase() || "pending")
            : 0;

        return BASE_STEPS.map((step, index) => {
            let state = "pending";
            if (index < currentStatusIndex) state = "done";
            if (index === currentStatusIndex) state = "current";

            return {
                ...step,
                state,
                updatedAt:
                    order?.status === step.key
                        ? order.updatedAt
                        : step.key === "processing"
                            ? order?.createdAt
                            : order?.updatedAt,
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

    const formatDateTime = (value, fallback) =>
        value ? new Date(value).toLocaleString() : fallback;

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
                    <li key={step.key} className="flex gap-4">
                        <div className="flex flex-col items-center">
                            {/* Circle Indicator */}
                            <div
                                className={`flex h-10 w-10 items-center justify-center rounded-full border-2 font-semibold transition ${timelineIndicator(
                                    step.state
                                )}`}
                            >
                                {step.state === "done" ? "✓" : index + 1}
                            </div>
                            {/* Connector Line */}
                            {index !== timelineSteps.length - 1 && (
                                <div className={`mt-2 h-14 w-0.5 ${connectorColor}`} />
                            )}
                        </div>
                        <div className="pt-1">
                            <p className={`font-semibold ${strongText}`}>
                                {t(step.label)}
                            </p>
                            <p className={`text-sm ${muted}`}>
                                {formatDateTime(
                                    step.updatedAt,
                                    t("tracking.awaitingUpdate", "Awaiting update")
                                )}
                            </p>
                        </div>
                    </li>
                ))}
            </ol>
        </section>
    );
}
