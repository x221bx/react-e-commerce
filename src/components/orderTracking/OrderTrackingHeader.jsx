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

    // Green Brand Theme
    const accent = isDark ? "text-emerald-300" : "text-emerald-600";
    const headingColor = isDark ? "text-white" : "text-slate-900";
    const muted = isDark ? "text-white/60" : "text-slate-600";

    // View all orders button (neutral but green-compatible)
    const subtleButton = isDark
        ? "border-white/10 bg-white/5 text-white hover:bg-white/10"
        : "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100";

    // Tabs (neutral)
    const tabBase = isDark
        ? "border-white/10 text-white/60 hover:text-white hover:border-white/20"
        : "border-emerald-200 text-emerald-600 hover:border-emerald-400 hover:bg-emerald-50";

    // Active Tab (full green)
    const activeTab = isDark
        ? "border-emerald-400 bg-emerald-900/20 text-emerald-300"
        : "border-emerald-500 bg-emerald-100 text-emerald-700";

    return (
        <header className="space-y-5">
            {/* Heading */}
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="space-y-1.5">
                    <p className={`text-sm font-semibold uppercase tracking-wide ${accent}`}>
                        {t("tracking.eyebrow", "Track your recent purchases")}
                    </p>

                    <h1 className={`text-3xl font-bold ${headingColor}`}>
                        {t("tracking.title", "Order Tracking")}
                    </h1>

                    <p className={`text-sm ${muted}`}>
                        {t(
                            "tracking.subtitle",
                            "We watch your order for updates and refresh the timeline live."
                        )}
                    </p>
                </div>

                <button
                    onClick={() => navigate("/account/OrderHistory")}
                    className={`
                        rounded-xl px-4 py-2 text-sm font-semibold shadow-sm transition
                        backdrop-blur ${subtleButton}
                    `}
                >
                    {t("tracking.viewAllOrders", "View all orders")}
                </button>
            </div>

            {/* Selection Tabs */}
            <div className="flex flex-wrap gap-2">
                {orders?.map((order) => (
                    <button
                        key={order.id}
                        type="button"
                        onClick={() => onSelectOrder(order.id)}
                        className={`
                            rounded-full border px-4 py-2 text-sm font-semibold transition
                            ${selectedOrder?.id === order.id ? activeTab : tabBase}
                        `}
                    >
                        {order.reference}
                    </button>
                ))}
            </div>
        </header>
    );
}
