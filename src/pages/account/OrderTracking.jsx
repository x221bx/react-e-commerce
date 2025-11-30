import React from "react";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { UseTheme } from "../../theme/ThemeProvider";
import { selectCurrentUser } from "../../features/auth/authSlice";
import { useOrderTracking } from "../../hooks/useOrderTracking";
import OrderTrackingHeader from "../../components/orderTracking/OrderTrackingHeader";
import OrderTimeline from "../../components/orderTracking/OrderTimeline";
import OrderItemsList from "../../components/orderTracking/OrderItemsList";
import ShippingInfoCard from "../../components/orderTracking/ShippingInfoCard";

export default function OrderTracking() {
  const { theme } = UseTheme();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const isDark = theme === "dark";
  const user = useSelector(selectCurrentUser);

  const {
    orders,
    order,
    loading,
    orderConnectionError,
    ordersConnectionError,
    handleSelectOrder,
    buildTrackingUrl,
  } = useOrderTracking(user?.uid);

  const headingColor = isDark ? "text-white" : "text-slate-900";
  const headerMuted = isDark ? "text-slate-400" : "text-slate-500";
  const accent = isDark ? "text-emerald-300" : "text-emerald-600";
  const shellSurface = isDark
    ? "border-slate-800 bg-slate-900/50"
    : "border-slate-100 bg-white";

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
        <p
          className={`text-sm font-semibold uppercase tracking-wide ${accent}`}
        >
          Connection Blocked
        </p>
        <h1 className={`text-3xl font-semibold ${headingColor}`}>
          Unable to Load Order Data
        </h1>
        <p className={`text-sm ${headerMuted}`}>
          Real-time connections are blocked by your browser. Please disable ad
          blockers for this site.
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
        <p
          className={`text-sm font-semibold uppercase tracking-wide ${accent}`}
        >
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
          {t(
            "tracking.selectOrder",
            "Select an order to display live updates."
          )}
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
