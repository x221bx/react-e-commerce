import React from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

export default function OrderTrackingHeader({
    orders,
    selectedOrder,
    onSelectOrder,
    isDark,
}) {
    const { t } = useTranslation();
    const navigate = useNavigate();

    const accent = isDark ? "text-emerald-300" : "text-emerald-600";
    const headingColor = isDark ? "text-white" : "text-slate-900";
    const subtleButton = isDark
        ? "border-slate-700 text-slate-200 hover:bg-slate-800/70"
        : "border-slate-200 text-slate-600 hover:bg-slate-50";

    return (
        <header className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="space-y-2">
                    <p className={`text-sm font-semibold uppercase tracking-wide ${accent}`}>
                        {t("tracking.eyebrow", "Track your recent purchases")}
                    </p>
                    <h1 className={`text-3xl font-semibold ${headingColor}`}>
                        {t("tracking.title", "Order Tracking")}
                    </h1>
                    <p className={`text-sm ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                        {t(
                            "tracking.subtitle",
                            "We watch your order for updates and refresh the timeline live."
                        )}
                    </p>
                </div>
                <button
                    onClick={() => navigate("/account/OrderHistory")}
                    className={`rounded-xl border px-4 py-2 text-sm font-semibold transition ${subtleButton}`}
                >
                    {t("tracking.viewAllOrders", "View all orders")}
                </button>
            </div>

            {/* Order Selection Tabs */}
            <div className="flex flex-wrap gap-2">
                {orders?.map((order) => (
                    <button
                        key={order.id}
                        type="button"
                        onClick={() => onSelectOrder(order.id)}
                        className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${selectedOrder?.id === order.id
                                ? "border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-300"
                                : isDark
                                    ? "border-slate-700 text-slate-300 hover:border-slate-600"
                                    : "border-slate-300 text-slate-600 hover:border-slate-400"
                            }`}
                    >
                        {order.reference}
                    </button>
                ))}
            </div>
        </header>
    );
}
