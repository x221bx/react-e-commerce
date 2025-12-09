// src/pages/account/OrderTracking.jsx
import React, { useState } from "react";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { useNavigate, useLocation } from "react-router-dom"; // ⭐ تمت الإضافة هنا
import { UseTheme } from "../../theme/ThemeProvider";
import { selectCurrentUser } from "../../features/auth/authSlice";
import { useOrderTracking } from "../../hooks/useOrderTracking";
import OrderTrackingHeader from "../../components/orderTracking/OrderTrackingHeader";
import OrderTimeline from "../../components/orderTracking/OrderTimeline";
import OrderItemsList from "../../components/orderTracking/OrderItemsList";
import ShippingInfoCard from "../../components/orderTracking/ShippingInfoCard";
import { CheckCircle, FileText } from "lucide-react";
import toast from "react-hot-toast";

export default function OrderTracking() {
  const { theme } = UseTheme();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation(); // ⭐ تمت الإضافة
  const isDark = theme === "dark";
  const user = useSelector(selectCurrentUser);

  // ⭐ قراءة حالة البادج القادمة من الدفع
  const showPaymentBadge = location.state?.showPaymentBadge;

  const {
    orders,
    order,
    loading,
    orderConnectionError,
    ordersConnectionError,
    handleSelectOrder,
    buildTrackingUrl,
    confirmDelivery,
  } = useOrderTracking(user?.uid);

  const [confirmingDelivery, setConfirmingDelivery] = useState(false);

  const handleConfirmDelivery = async () => {
    if (!order || order.status !== "Shipped") return;

    try {
      setConfirmingDelivery(true);
      await confirmDelivery(order.id);
      toast.success("Order marked as delivered! Thank you for confirming.");
    } catch (err) {
      console.error("Confirm delivery error:", err);
      toast.error(err.message || "Failed to confirm delivery");
    } finally {
      setConfirmingDelivery(false);
    }
  };

  const headingColor = isDark ? "text-white" : "text-slate-900";
  const headerMuted = isDark ? "text-slate-400" : "text-slate-500";
  const accent = isDark ? "text-emerald-300" : "text-emerald-600";
  const shellSurface = isDark
    ? "bg-gradient-to-br from-emerald-950/60 via-slate-900/50 to-slate-950/60 border-emerald-900/40 shadow-[0_20px_60px_rgba(0,0,0,0.45)] backdrop-blur"
    : "bg-gradient-to-br from-white via-emerald-50/60 to-slate-50 border-emerald-100 shadow-[0_20px_60px_rgba(16,185,129,0.18)]";


  const Shell = ({ children }) => (
    <div
      className={`min-h-screen ${isDark ? "bg-gradient-to-b from-slate-950 via-emerald-950/40 to-slate-950 text-white" : "bg-gradient-to-b from-emerald-50 via-white to-slate-50 text-slate-900"}`}
    >
      <div className="max-w-6xl mx-auto px-4 py-10 space-y-6">{children}</div>
    </div>
  );

  // ...loading state...
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 rounded bg-slate-200 dark:bg-slate-700 animate-pulse" />
        <div className="h-6 w-80 rounded bg-slate-200 dark:bg-slate-700 animate-pulse" />
      </div>
    );
  }

  // ...connection error state...
  if (ordersConnectionError || orderConnectionError) {
    return (
      <div className="space-y-4 text-center py-12">
        <p className={`text-sm font-semibold uppercase tracking-wide ${accent}`}>
          Connection Blocked
        </p>
        <h1 className={`text-3xl font-semibold ${headingColor}`}>
          Unable to Load Order Data
        </h1>
        <p className={`text-sm ${headerMuted}`}>
          Real-time connections are blocked by your browser. Please disable ad blockers for this site.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="rounded-2xl bg-emerald-500 px-6 py-2 text-sm font-semibold text-white hover:bg-emerald-600"
        >
          Refresh Page
        </button>
      </div>
    );
  }

  // ...no orders state...
  if (!orders || !orders.length) {
    return (
      <div className="space-y-4 text-center py-12">
        <p className={`text-sm font-semibold uppercase tracking-wide ${accent}`}>
          {t("tracking.eyebrow", "Track your recent purchases")}
        </p>
        <h1 className={`text-3xl font-semibold ${headingColor}`}>
          {t("tracking.noOrders.title", "No tracked orders yet")}
        </h1>
        <p className={`text-sm ${headerMuted}`}>
          {t(
            "tracking.noOrders.subtitle",
            "Place an order and we'll display live tracking updates here."
          )}
        </p>
        <button
          onClick={() => navigate("/products")}
          className="rounded-2xl bg-emerald-500 px-6 py-2 text-sm font-semibold text-white hover:bg-emerald-600"
        >
          {t("tracking.noOrders.cta", "Shop now")}
        </button>
      </div>
    );
  }

  // ...no selected order state...
  if (!order) {
    return (
      <div className="space-y-4">
        <OrderTrackingHeader
          orders={orders}
          selectedOrder={null}
          onSelectOrder={handleSelectOrder}
          isDark={isDark}
        />
        <p className={`text-sm ${headerMuted}`}>
          {t("tracking.selectOrder", "Select an order to display live updates.")}
        </p>
      </div>
    );
  }

  const shippingInfo = order?.shipping || {
    recipient: order?.shippingTo || "Not specified",
    address: order?.shippingAddress || "Not specified",
    carrier: order?.shippingCarrier || "Pending",
    trackingNumber: order?.trackingNumber || "",
  };

  const trackingUrl = shippingInfo.trackingNumber
    ? buildTrackingUrl(shippingInfo.trackingNumber)
    : null;

  return (
    <div className="space-y-8">

      {/* ⭐⭐⭐ البادج الاحترافية بعد الدفع ⭐⭐⭐ */}
      {showPaymentBadge && (
        <div className="rounded-2xl border px-6 py-4 shadow-md bg-emerald-600/10 border-emerald-500/50 animate-in slide-in-from-top duration-300">
          <div className="flex items-center gap-3">
            <span className="px-4 py-1.5 rounded-full bg-emerald-600 text-white font-semibold text-sm shadow">
              ✅ Payment Successful
            </span>

            <span className="px-4 py-1.5 rounded-full bg-emerald-700 text-white font-semibold text-sm shadow">
              📦 Tracking Activated
            </span>

            <span className="px-4 py-1.5 rounded-full bg-slate-900 text-white font-medium text-sm shadow">
              🕒 {new Date().toLocaleString()}
            </span>
          </div>

          <p className={`mt-3 text-sm ${isDark ? "text-emerald-200" : "text-emerald-800"}`}>
            Your payment has been confirmed and your order is now being tracked in real time.
          </p>
        </div>
      )}

      {/* Header */}
      <OrderTrackingHeader
        orders={orders}
        selectedOrder={order}
        onSelectOrder={handleSelectOrder}
        isDark={isDark}
      />

      <div className={`rounded-3xl border shadow-sm ${shellSurface}`}>

        {/* Order Header Info */}
        <div
          className={`flex flex-wrap items-center justify-between gap-4 border-b px-6 py-5 ${
            isDark ? "border-slate-800" : "border-slate-100"
          }`}
        >
          <div>
            <p
              className={`text-xs font-semibold uppercase tracking-wide ${
                isDark ? "text-slate-500" : "text-slate-400"
              }`}
            >
              {t("tracking.order", "Order")}
            </p>
            <p className={`mt-1 text-lg font-semibold ${headingColor}`}>
              {order.reference}
            </p>
            <p className={`text-xs ${headerMuted}`}>
              {order.createdAt
                ? new Date(order.createdAt).toLocaleString()
                : t("tracking.awaitingUpdate", "Awaiting update")}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(`/account/invoice/${order.id}`)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-500 text-white hover:bg-emerald-600 transition-colors text-sm font-medium"
            >
              <FileText size={16} />
              {t("confirmation.actions.viewInvoice", "View Invoice")}
            </button>
            <div className="text-right">
              <p
                className={`text-xs font-semibold uppercase tracking-wide ${
                  isDark ? "text-slate-500" : "text-slate-400"
                }`}
              >
                {t("tracking.total", "Total")}
              </p>
              <p className={`mt-1 text-3xl font-bold ${headingColor}`}>
                {order.totals?.total
                  ? `${Number(order.totals.total).toLocaleString()} EGP`
                  : "-"}
              </p>
            </div>
          </div>
        </div>

        {/* Delivery Confirmation */}
        {order.status === "Shipped" && (
          <div
            className={`border-b px-6 py-4 ${
              isDark ? "border-slate-800" : "border-slate-100"
            }`}
          >
            <div className="flex items-center justify-between animate-in slide-in-from-top-2 duration-500">
              <div>
                <p className={`text-sm font-semibold ${headingColor}`}>
                  Package Delivered?
                </p>
                <p className={`text-xs ${headerMuted}`}>
                  Confirm that you've received your order
                </p>
              </div>
              <button
                onClick={handleConfirmDelivery}
                disabled={confirmingDelivery}
                className="flex items-center gap-2 rounded-2xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-600 hover:scale-105 disabled:opacity-70 transition-all duration-200 shadow-lg hover:shadow-xl active:scale-95"
              >
                <CheckCircle
                  size={16}
                  className={confirmingDelivery ? "animate-spin" : ""}
                />
                {confirmingDelivery ? "Confirming..." : "Mark as Delivered"}
              </button>
            </div>
          </div>
        )}

        {/* Timeline and Shipping Grid */}
        <div className="grid gap-8 p-6 lg:grid-cols-[2fr,1fr]">
          <div className="space-y-8">
            <OrderTimeline order={order} isDark={isDark} />
            <OrderItemsList items={order.items} isDark={isDark} />
          </div>

          <ShippingInfoCard
            shippingInfo={shippingInfo}
            trackingUrl={trackingUrl}
            isDark={isDark}
          />
        </div>
      </div>
    </div>
  );
}
