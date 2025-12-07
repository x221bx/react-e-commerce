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

export default function OrderHistory() {
  const { theme } = UseTheme();
  const isDark = theme === "dark";

  const navigate = useNavigate();
  const { t } = useTranslation();
  const user = auth.currentUser;
  const { orders, loading } = useOrders(user?.uid);
  const [expandedId, setExpandedId] = useState(null);

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
      </div>
    );

  if (!orders.length)
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center p-8">
        <FiPackage className="h-16 w-16 text-slate-400 mb-4" />
        <h2 className="text-2xl font-bold text-slate-600 mb-2">
          {t("account.orderHistory.noOrders")}
        </h2>
        <p className="text-slate-500">
          {t("account.orderHistory.noOrdersDesc")}
        </p>
      </div>
    );

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "processing":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "shipped":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "delivered":
        return "bg-emerald-100 text-emerald-800 border-emerald-200";
      case "canceled":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-slate-100 text-slate-800 border-slate-200";
    }
  };

  // Products-style theme
  const containerBg = isDark
    ? "bg-slate-950 text-white"
    : "bg-white text-slate-900";

  const cardBg = isDark
    ? "bg-[#0f1d1d]/70 border border-white/10 shadow-md hover:shadow-lg"
    : "bg-white border border-gray-200 shadow-md hover:shadow-lg";

  const smallCardBg = isDark
    ? "bg-slate-800/50 border border-white/10"
    : "bg-slate-50 border border-gray-200";

  const textColor = isDark ? "text-white" : "text-slate-900";
  const mutedText = isDark ? "text-white/60" : "text-slate-600";

  return (
    <div className="space-y-8 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className={`text-3xl font-bold ${textColor} mb-2`}>
            {t("account.orderHistory.title")}
          </h1>
          <p className={mutedText}>{t("account.orderHistory.subtitle")}</p>
        </div>

        {/* Orders Grid */}
        <div className="space-y-4">
          {orders.map((order) => (
            <div
              key={order.id}
              className={`rounded-2xl overflow-hidden transition-all duration-300 ${cardBg}`}
            >
              {/* Order Header */}
              <div className="p-6">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">

                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center flex-shrink-0">
                      <FiPackage className="w-6 h-6 text-emerald-600" />
                    </div>

                    <div>
                      <h3 className={`text-lg font-semibold ${textColor}`}>
                        {t("account.orderHistory.orderNumber")}{" "}
                        {order.orderNumber || order.id.slice(-8)}
                      </h3>

                      <p className={`text-sm ${mutedText}`}>
                        {new Date(order.createdAt).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    {/* Total */}
                    <div className="text-right">
                      <p className={`text-sm ${mutedText}`}>
                        {t("account.orderHistory.total")}
                      </p>
                      <p className={`text-xl font-bold ${textColor}`}>
                        {order.total?.toLocaleString()} EGP
                      </p>
                    </div>

                    {/* Status */}
                    <span
                      className={`px-4 py-2 rounded-full text-sm font-semibold border ${getStatusColor(
                        order.status
                      )}`}
                    >
                      {order.status}
                    </span>

                    {/* Actions */}
                    <div className="flex gap-2 card-actions">
                      <button
                        onClick={() =>
                          navigate(`/account/invoice/${order.id}`)
                        }
                        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-500 text-white hover:bg-emerald-600 transition-colors text-sm font-medium"
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
                          className="flex items-center gap-2 px-3 py-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition-colors text-sm font-medium"
                        >
                          <FiTruck className="w-4 h-4" />
                          {t("account.orderHistory.track")}
                        </button>
                      )}

                      <button
                        onClick={() =>
                          setExpandedId(
                            expandedId === order.id ? null : order.id
                          )
                        }
                        className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      >
                        {expandedId === order.id ? (
                          <FiChevronUp className="w-5 h-5" />
                        ) : (
                          <FiChevronDown className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Expanded Details */}
              {expandedId === order.id && (
                <div className="border-t border-slate-200 dark:border-slate-700 px-6 pb-6">
                  <div className="pt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Order Items */}
                    <div>
                      <h4
                        className={`text-lg font-semibold ${textColor} mb-4 flex items-center gap-2`}
                      >
                        <FiPackage className="w-5 h-5" />
                        {t("account.orderHistory.orderItems")} (
                        {order.items?.length || 0})
                      </h4>

                      <div className="space-y-3">
                        {order.items?.map((item, idx) => (
                          <div
                            key={idx}
                            className={`flex items-center gap-4 p-3 rounded-xl ${smallCardBg}`}
                          >
                            <img
                              src={
                                item.imageUrl ||
                                item.image ||
                                item.thumbnailUrl ||
                                item.img ||
                                "/placeholder.png"
                              }
                              alt={item.name}
                              className="w-16 h-16 rounded-lg object-cover border border-slate-200 dark:border-slate-700"
                            />

                            <div className="flex-1">
                              <p className={`font-medium ${textColor}`}>
                                {item.name}
                              </p>
                              <p className={`text-sm ${mutedText}`}>
                                {item.price?.toLocaleString()} EGP ×{" "}
                                {item.quantity}
                              </p>
                            </div>

                            <div className={`text-right ${textColor}`}>
                              <p className="font-semibold">
                                {(item.price * item.quantity)?.toLocaleString()}{" "}
                                EGP
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Order Details */}
                    <div className="space-y-6">
                      {/* Shipping Info */}
                      <div>
                        <h4
                          className={`text-lg font-semibold ${textColor} mb-4 flex items-center gap-2`}
                        >
                          <FiMapPin className="w-5 h-5" />
                          {t("account.orderHistory.shippingInfo")}
                        </h4>

                        <div
                          className={`p-4 rounded-xl ${smallCardBg}`}
                        >
                          <p className={`font-medium ${textColor}`}>
                            {order.fullName || order.shipping?.fullName}
                          </p>
                          <p className={mutedText}>
                            {order.address || order.shipping?.addressLine1}
                          </p>
                          <p className={mutedText}>
                            {order.city || order.shipping?.city}
                          </p>
                          <p className={mutedText}>
                            {order.phone || order.shipping?.phone}
                          </p>
                        </div>
                      </div>

                      {/* Payment Info */}
                      <div>
                        <h4
                          className={`text-lg font-semibold ${textColor} mb-4 flex items-center gap-2`}
                        >
                          <FiCreditCard className="w-5 h-5" />
                          {t("account.orderHistory.paymentInfo")}
                        </h4>

                        <div className={`p-4 rounded-xl ${smallCardBg}`}>
                          <p className={`font-medium ${textColor}`}>
                            {order.paymentSummary || order.paymentMethod}
                          </p>
                          <p className={mutedText}>
                            Reference: {order.reference}
                          </p>
                        </div>
                      </div>

                      {/* Status Timeline */}
                      <div>
                        <h4
                          className={`text-lg font-semibold ${textColor} mb-4 flex items-center gap-2`}
                        >
                          <FiClock className="w-5 h-5" />
                          {t("account.orderHistory.orderTimeline")}
                        </h4>

                        <div className="space-y-3">
                          {order.statusHistory
                            ?.slice()
                            .reverse()
                            .map((history, i) => (
                              <div
                                key={i}
                                className={`flex items-center gap-3 p-3 rounded-xl ${smallCardBg}`}
                              >
                                <div
                                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                                    history.actor === "customer"
                                      ? "bg-blue-100 text-blue-600"
                                      : "bg-emerald-100 text-emerald-600"
                                  }`}
                                >
                                  {history.actor === "customer"
                                    ? "👤"
                                    : "👨‍💼"}
                                </div>

                                <div className="flex-1">
                                  <p className={`font-medium ${textColor}`}>
                                    {history.status}
                                  </p>

                                  <p className={`text-sm ${mutedText}`}>
                                    {new Date(
                                      history.changedAt
                                    ).toLocaleString()}
                                    {history.actor && (
                                      <span className="ml-2 text-xs">
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
                    </div>
                  </div>
                </div>
              )}

            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
