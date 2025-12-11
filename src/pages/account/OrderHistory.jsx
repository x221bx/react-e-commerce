// src/pages/account/OrderHistory.jsx
import React, { useState } from "react";
import {
  FiClock,
  FiChevronDown,
  FiChevronUp,
  FiPackage,
  FiMapPin,
  FiCreditCard,
  FiTruck,
  FiFileText,
} from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { auth } from "../../services/firebase";
import useOrders from "../../hooks/useOrders";
import { UseTheme } from "../../theme/ThemeProvider";
import { ensureProductLocalization, getLocalizedProductTitle } from "../../utils/productLocalization";

export default function OrderHistory() {
  const { theme } = UseTheme();
  const isDark = theme === "dark";

  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const lang = i18n.language || "en";
  const user = auth.currentUser;
  const { orders, loading } = useOrders(user?.uid);
  const [expandedId, setExpandedId] = useState(null);

  // ============ THEME STYLES ============

  const pageBg = isDark
    ? "bg-slate-950"
    : "bg-gradient-to-b from-emerald-50/80 via-white to-emerald-50/60";

  const headerTitle = isDark ? "text-white" : "text-emerald-950";
  const headerMuted = isDark ? "text-slate-300" : "text-emerald-800/80";

  const cardBase = isDark
    ? `
        relative overflow-hidden rounded-3xl
        border border-emerald-900/40 
        bg-[#031615]/80
        backdrop-blur-xl
        shadow-[0_0_25px_rgba(16,185,129,0.25)]
        transition-all duration-300
        hover:shadow-[0_0_35px_rgba(16,185,129,0.35)]
        hover:border-emerald-500/60
      `
    : `
        relative overflow-hidden rounded-3xl
        border border-emerald-100 
        bg-gradient-to-br from-white via-emerald-50/50 to-emerald-100/40
        shadow-[0_6px_20px_rgba(16,185,129,0.16)]
        transition-all duration-300
        hover:shadow-[0_12px_30px_rgba(16,185,129,0.28)]
        hover:border-emerald-400
      `;

  const smallCard = isDark
    ? "bg-[#061b19]/90 border border-emerald-900/40"
    : "bg-white/90 border border-emerald-100 shadow-sm";

  const mainText = isDark ? "text-slate-50" : "text-slate-900";
  const mutedText = isDark ? "text-slate-300" : "text-slate-600";

  const pillBg = isDark
    ? "bg-emerald-900/40 text-emerald-200 border border-emerald-700/60"
    : "bg-emerald-50 text-emerald-700 border border-emerald-200";

  const expandBtnBg = isDark
    ? "hover:bg-emerald-950/50 text-slate-200"
    : "hover:bg-emerald-50 text-emerald-800";

  const statusPillBase =
    "inline-flex items-center rounded-full px-4 py-1.5 text-xs font-semibold border shadow-sm";

  const getStatusColor = (statusRaw) => {
    const status = statusRaw?.toLowerCase();
    if (!status) {
      return `${statusPillBase} bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800/70 dark:text-slate-200 dark:border-slate-700`;
    }

    switch (status) {
      case "pending":
        return `${statusPillBase} bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-900/40 dark:text-amber-200 dark:border-amber-700/60`;
      case "processing":
        return `${statusPillBase} bg-sky-50 text-sky-800 border-sky-200 dark:bg-sky-900/40 dark:text-sky-200 dark:border-sky-700/60`;
      case "shipped":
        return `${statusPillBase} bg-violet-50 text-violet-800 border-violet-200 dark:bg-violet-900/40 dark:text-violet-200 dark:border-violet-700/60`;
      case "delivered":
        return `${statusPillBase} bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-900/40 dark:text-emerald-200 dark:border-emerald-700/60`;
      case "canceled":
        return `${statusPillBase} bg-rose-50 text-rose-800 border-rose-200 dark:bg-rose-900/40 dark:text-rose-200 dark:border-rose-700/60`;
      default:
        return `${statusPillBase} bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800/70 dark:text-slate-200 dark:border-slate-700`;
    }
  };

  // ============ LOADING STATE ============

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${pageBg}`}>
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="h-14 w-14 rounded-full border-2 border-emerald-500/60 border-t-transparent animate-spin" />
            <div className="absolute inset-2 rounded-full border border-emerald-400/30 blur-[1px]" />
          </div>
          <p className={`text-sm font-medium ${headerMuted}`}>
            {t("account.orderHistory.loading", "Loading your orders...")}
          </p>
        </div>
      </div>
    );
  }

  // ============ EMPTY STATE ============

  if (!orders.length) {
    return (
      <div
        className={`min-h-screen flex items-center justify-center px-4 ${pageBg}`}
      >
        <div
          className={`
            max-w-md w-full text-center rounded-3xl p-8
            border border-emerald-200/60 bg-white/80 shadow-xl
            dark:border-emerald-900/50 dark:bg-[#031615]/90
          `}
        >
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">
            <FiPackage className="h-8 w-8" />
          </div>
          <h2 className={`text-2xl font-bold mb-2 ${headerTitle}`}>
            {t("account.orderHistory.noOrders")}
          </h2>
          <p className={`${headerMuted} text-sm`}>
            {t("account.orderHistory.noOrdersDesc")}
          </p>
          <button
            onClick={() => navigate("/products")}
            className="mt-6 inline-flex items-center justify-center rounded-2xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white shadow hover:bg-emerald-500 active:scale-[0.98] transition"
          >
            {t("account.orderHistory.shopNow", "Start shopping")}
          </button>
        </div>
      </div>
    );
  }

  // ============ MAIN RENDER ============

  return (
    <div
      className={`min-h-screen ${pageBg} py-8 px-4 sm:px-6 lg:px-8`}
    >
      <div className="max-w-7xl mx-auto space-y-8">
        {/* HEADER */}
        <header className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-500">
            {t("account.orderHistory.eyebrow", "Purchase History")}
          </p>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h1 className={`text-3xl sm:text-4xl font-bold ${headerTitle}`}>
                {t("account.orderHistory.title")}
              </h1>
              <p className={`mt-2 text-sm ${headerMuted}`}>
                {t(
                  "account.orderHistory.subtitle",
                  "Review all your previous orders, invoices, and delivery progress."
                )}
              </p>
            </div>

            <div
              className={`
                inline-flex items-center gap-3 rounded-2xl px-4 py-2 text-xs 
                ${pillBg}
              `}
            >
              <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500/90 text-white text-[11px] shadow">
                {orders.length}
              </span>
              <span className="font-semibold tracking-wide">
                {t("account.orderHistory.ordersCountLabel", "Total orders")}
              </span>
            </div>
          </div>
        </header>

        {/* ORDERS LIST */}
        <div className="space-y-5">
          {orders.map((order, index) => {
            const isExpanded = expandedId === order.id;
            const createdAtDate = order.createdAt
              ? new Date(order.createdAt)
              : null;
            const orderItems = (order.items || []).map((item) =>
              ensureProductLocalization(item)
            );

            return (
              <div
                key={order.id}
                className={`${cardBase} animate-in slide-in-from-bottom-2 duration-300`}
                style={{ animationDelay: `${index * 40}ms` }}
              >
                {/* Floating glow (decor) - subtle */}
                {isDark && (
                  <div className="pointer-events-none absolute inset-0">
                    <div className="absolute -top-10 right-0 h-32 w-32 rounded-full bg-emerald-600/20 blur-3xl" />
                  </div>
                )}

                {/* ORDER HEADER */}
                <div className="relative z-[2] p-6">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    {/* Left: Meta */}
                    <div className="flex items-center gap-4">
                      <div
                        className={`
                          flex h-12 w-12 items-center justify-center rounded-2xl
                          bg-emerald-500/10 text-emerald-500
                          ring-1 ring-emerald-400/40
                        `}
                      >
                        <FiPackage className="w-6 h-6" />
                      </div>

                      <div className="space-y-1">
                        <h3 className={`text-lg font-semibold ${mainText}`}>
                          {t("account.orderHistory.orderNumber", "Order")}{" "}
                          <span className="font-mono">
                            #{order.orderNumber || order.id.slice(-8)}
                          </span>
                        </h3>

                        <div className="flex flex-wrap items-center gap-3 text-xs">
                          {createdAtDate && (
                            <span className={mutedText}>
                              {createdAtDate.toLocaleDateString("en-US", {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                              })}
                            </span>
                          )}
                          <span className="hidden sm:inline h-1 w-1 rounded-full bg-emerald-400/60" />
                          <span className={`${mutedText}`}>
                            {t("account.orderHistory.itemsCount", {
                              count: orderItems.length || 0,
                            })}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Right: Totals + status + actions */}
                    <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
                      {/* Total */}
                      <div className="text-right sm:text-left sm:order-2 lg:order-1">
                        <p className={`text-xs ${mutedText}`}>
                          {t("account.orderHistory.total")}
                        </p>
                        <p className={`text-xl font-bold ${mainText}`}>
                          {order.total?.toLocaleString()} EGP
                        </p>
                      </div>

                      {/* Status */}
                      <div className="sm:order-3 lg:order-2">
                        <span className={getStatusColor(order.status)}>
                          <span className="inline-block h-1.5 w-1.5 rounded-full bg-current/70 mr-2" />
                          {order.status}
                        </span>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2 sm:order-1 lg:order-3 justify-end">
                        <button
                          onClick={() => navigate(`/account/invoice/${order.id}`)}
                          className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-3 py-2 text-xs sm:text-sm font-semibold text-white shadow hover:bg-emerald-400 active:scale-[0.97] transition"
                        >
                          <FiFileText className="w-4 h-4" />
                          {t("account.orderHistory.invoice")}
                        </button>

                        {!["delivered", "canceled"].includes(
                          order.status?.toLowerCase()
                        ) && (
                          <button
                            onClick={() =>
                              navigate(`/account/tracking/${order.id}`)
                            }
                            className="inline-flex items-center gap-2 rounded-xl bg-emerald-900 px-3 py-2 text-xs sm:text-sm font-semibold text-emerald-50 shadow hover:bg-emerald-800 active:scale-[0.97] transition"
                          >
                            <FiTruck className="w-4 h-4" />
                            {t("account.orderHistory.track")}
                          </button>
                        )}

                        <button
                          onClick={() =>
                            setExpandedId(isExpanded ? null : order.id)
                          }
                          className={`inline-flex items-center justify-center rounded-xl p-2 text-sm transition ${expandBtnBg}`}
                          aria-expanded={isExpanded}
                        >
                          {isExpanded ? (
                            <FiChevronUp className="w-5 h-5" />
                          ) : (
                            <FiChevronDown className="w-5 h-5" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* EXPANDED DETAILS */}
                {isExpanded && (
                  <div className="relative z-[1] border-t border-emerald-900/30 bg-black/5/10 dark:bg-black/20 px-6 pb-6 pt-4">
                    <div className="pt-4 grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {/* ORDER ITEMS */}
                      <div>
                        <h4
                          className={`mb-3 flex items-center gap-2 text-base font-semibold ${mainText}`}
                        >
                          <span className="inline-flex h-7 w-7 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-500">
                            <FiPackage className="w-4 h-4" />
                          </span>
                          {t("account.orderHistory.orderItems")} (
                          {orderItems.length || 0})
                        </h4>

                        <div className="space-y-3">
                          {orderItems.map((item, idx) => (
                            <div
                              key={idx}
                              className={`flex items-center gap-4 p-3 rounded-2xl ${smallCard}`}
                            >
                              <div className="relative h-14 w-14 flex-shrink-0 overflow-hidden rounded-xl">
                                <img
                                  src={
                                    item.imageUrl ||
                                    item.image ||
                                    item.thumbnailUrl ||
                                    item.img ||
                                    "/placeholder.png"
                                  }
                                  alt={getLocalizedProductTitle(item, lang)}
                                  className="h-full w-full object-cover"
                                />
                              </div>

                              <div className="flex-1">
                                <p className={`text-sm font-semibold ${mainText}`}>
                                  {getLocalizedProductTitle(item, lang)}
                                </p>
                                <p className={`text-xs ${mutedText}`}>
                                  {item.price?.toLocaleString()} EGP ×{" "}
                                  {item.quantity}
                                </p>
                              </div>

                              <div className="text-right">
                                <p className={`text-sm font-semibold ${mainText}`}>
                                  {(item.price * item.quantity)?.toLocaleString()}{" "}
                                  EGP
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* RIGHT SIDE PANELS */}
                      <div className="space-y-5">
                        {/* SHIPPING */}
                        <div>
                          <h4
                            className={`mb-3 flex items-center gap-2 text-base font-semibold ${mainText}`}
                          >
                            <span className="inline-flex h-7 w-7 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-500">
                              <FiMapPin className="w-4 h-4" />
                            </span>
                            {t("account.orderHistory.shippingInfo")}
                          </h4>

                          <div className={`p-4 rounded-2xl ${smallCard}`}>
                            <p className={`font-semibold ${mainText}`}>
                              {order.fullName || order.shipping?.fullName}
                            </p>
                            <p className={`text-sm ${mutedText}`}>
                              {order.address || order.shipping?.addressLine1}
                            </p>
                            <p className={`text-sm ${mutedText}`}>
                              {order.city || order.shipping?.city}
                            </p>
                            <p className={`text-sm ${mutedText}`}>
                              {order.phone || order.shipping?.phone}
                            </p>
                          </div>
                        </div>

                        {/* PAYMENT */}
                        <div>
                          <h4
                            className={`mb-3 flex items-center gap-2 text-base font-semibold ${mainText}`}
                          >
                            <span className="inline-flex h-7 w-7 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-500">
                              <FiCreditCard className="w-4 h-4" />
                            </span>
                            {t("account.orderHistory.paymentInfo")}
                          </h4>

                          <div className={`p-4 rounded-2xl ${smallCard}`}>
                            <p className={`font-semibold ${mainText}`}>
                              {order.paymentSummary || order.paymentMethod}
                            </p>
                            <p className={`text-xs ${mutedText} mt-1`}>
                              Reference:{" "}
                              <span className="font-mono">{order.reference}</span>
                            </p>
                          </div>
                        </div>

                        {/* TIMELINE */}
                        {order.statusHistory && order.statusHistory.length > 0 && (
                          <div>
                            <h4
                              className={`mb-3 flex items-center gap-2 text-base font-semibold ${mainText}`}
                            >
                              <span className="inline-flex h-7 w-7 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-500">
                                <FiClock className="w-4 h-4" />
                              </span>
                              {t("account.orderHistory.orderTimeline")}
                            </h4>

                            <div className="space-y-3">
                              {order.statusHistory
                                ?.slice()
                                .reverse()
                                .map((history, i) => (
                                  <div
                                    key={i}
                                    className={`flex items-center gap-3 p-3 rounded-2xl ${smallCard}`}
                                  >
                                    <div
                                      className={`
                                        flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-xs font-semibold
                                        ${
                                          history.actor === "customer"
                                            ? "bg-sky-500/15 text-sky-500"
                                            : "bg-emerald-500/15 text-emerald-500"
                                        }
                                      `}
                                    >
                                      {history.actor === "customer" ? "U" : "Admin"}
                                    </div>

                                    <div className="flex-1">
                                      <p className={`text-sm font-semibold ${mainText}`}>
                                        {history.status}
                                      </p>
                                      <p className={`text-xs ${mutedText}`}>
                                        {new Date(
                                          history.changedAt
                                        ).toLocaleString()}
                                        {history.actor && (
                                          <span className="ml-2">
                                            •{" "}
                                            {t("account.orderHistory.by")}{" "}
                                            {history.actor === "customer"
                                              ? t("common.customer")
                                              : t("common.admin")}
                                          </span>
                                        )}
                                      </p>
                                    </div>
                                  </div>
                                ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
