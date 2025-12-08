// src/components/orderTracking/OrderTrackingHeader.jsx
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

    // Dynamic Theme Colors
    const accent = isDark ? "text-emerald-300" : "text-emerald-700";
    const heading = isDark ? "text-white" : "text-slate-900";
    const muted = isDark ? "text-white/60" : "text-slate-600";

    // Buttons
    const subtleButton = isDark
        ? "border-white/10 bg-white/5 text-white hover:bg-white/10 hover:border-emerald-500/30 hover:shadow-emerald-500/20"
        : "border-emerald-200 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 hover:border-emerald-400";

    const tabBase = isDark
        ? "border-white/10 text-white/60 hover:text-white hover:border-white/20 hover:bg-white/5"
        : "border-emerald-200 text-emerald-700 hover:border-emerald-400 hover:bg-emerald-50";

    const activeTab = isDark
        ? "border-emerald-400 bg-emerald-900/30 text-emerald-300 shadow-[0_0_6px_rgba(16,185,129,0.35)]"
        : "border-emerald-500 bg-emerald-100 text-emerald-700 shadow-sm";

    return (
        <header className="space-y-6">
            {/* ======================= TOP HEADER ======================= */}
            <div className="flex flex-wrap items-center justify-between gap-4">
                {/* LEFT REFERENCE TEXT */}
                <div className="space-y-1.5">
                    <p
                        className={`text-xs font-semibold uppercase tracking-wide ${accent}`}
                    >
                        {t("tracking.eyebrow", "Track your recent purchases")}
                    </p>

                    <h1
                        className={`text-3xl md:text-4xl font-bold tracking-tight ${heading}`}
                    >
                        {t("tracking.title", "Order Tracking")}
                    </h1>

                    <p className={`text-sm ${muted} max-w-xl`}>
                        {t(
                            "tracking.subtitle",
                            "We continuously monitor your order and refresh the timeline live."
                        )}
                    </p>
                </div>

                {/* VIEW ALL ORDERS BUTTON */}
                <button
                    onClick={() => navigate("/account/OrderHistory")}
                    className={`
                        rounded-2xl px-5 py-2.5 text-sm font-semibold transition-all
                        shadow-sm backdrop-blur border ${subtleButton}
                        hover:scale-[1.02] active:scale-95
                    `}
                >
                    {t("tracking.viewAllOrders", "View all orders")}
                </button>
            </div>

            {/* ======================= ORDER TABS ======================= */}
            <div
                className={`
                    flex flex-wrap gap-3 rounded-2xl p-3
                    ${isDark ? "bg-white/5 border border-white/10 backdrop-blur-sm" : "bg-emerald-50 border border-emerald-200"}
                `}
            >
                {orders?.map((order) => {
                    const isActive = selectedOrder?.id === order.id;
                    return (
                        <button
                            key={order.id}
                            type="button"
                            onClick={() => onSelectOrder(order.id)}
                            className={`
                                rounded-full border px-4 py-1.5 text-sm font-semibold
                                transition-all duration-200
                                ${isActive ? activeTab : tabBase}
                                hover:shadow-md active:scale-95
                            `}
                        >
                            {order.reference}
                        </button>
                    );
                })}
            </div>
        </header>
    );
}
