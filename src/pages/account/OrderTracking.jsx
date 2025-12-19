// src/pages/account/OrderTracking.jsx
import React, { useEffect } from "react";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import { FiClock, FiTruck, FiMapPin, FiCreditCard } from "react-icons/fi";
import toast from "react-hot-toast";

import { selectCurrentUser } from "../../features/auth/authSlice";
import { useOrderTracking } from "../../hooks/useOrderTracking";
import OrderTrackingHeader from "../../components/orderTracking/OrderTrackingHeader";
import OrderTimeline from "../../components/orderTracking/OrderTimeline";
import OrderItemsList from "../../components/orderTracking/OrderItemsList";
import ShippingInfoCard from "../../components/orderTracking/ShippingInfoCard";

import Section from "../../components/ui/Section";
import EmptyState from "../../components/ui/EmptyState";
import Button from "../../components/ui/Button";
import Badge from "../../components/ui/Badge";
import LoadingGrid from "../../components/ui/LoadingGrid";

const statusTone = (statusRaw) => {
  const status = statusRaw?.toLowerCase();
  if (status === "shipped" || status === "processing") return "accent";
  if (status === "delivered") return "success";
  if (status === "canceled") return "danger";
  return "neutral";
};

const formatDate = (val) => {
  if (!val) return "";
  try {
    const d = val.seconds ? new Date(val.seconds * 1000) : new Date(val);
    return d.toLocaleString();
  } catch {
    return "";
  }
};

export default function OrderTracking() {
  const { t, i18n } = useTranslation();
  const isRTL = (i18n.language || "en").startsWith("ar");
  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams();
  const user = useSelector(selectCurrentUser);

  const orderIdQuery = params.orderId;
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

  useEffect(() => {
    if (orderIdQuery && orders?.length) {
      const exists = orders.find((o) => String(o.id) === String(orderIdQuery));
      if (exists) handleSelectOrder(exists);
    }
  }, [orderIdQuery, orders, handleSelectOrder]);

  const handleConfirmDelivery = async () => {
    if (!order || order.status !== "Shipped") return;
    try {
      await confirmDelivery(order.id);
      toast.success(t("tracking.confirmed", "Order marked as delivered!"));
    } catch (err) {
      toast.error(err.message || t("tracking.confirmFailed", "Failed to confirm delivery"));
    }
  };

  // Loading
  if (loading) {
    return (
      <div dir={isRTL ? "rtl" : "ltr"} className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)]">
        <div className="mx-auto max-w-6xl px-4 py-10 space-y-4">
          <LoadingGrid items={3} />
          <div className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-4 animate-pulse h-48" />
        </div>
      </div>
    );
  }

  // Connection blocked
  if (ordersConnectionError || orderConnectionError) {
    return (
      <div dir={isRTL ? "rtl" : "ltr"} className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)]">
        <div className="mx-auto max-w-6xl px-4 py-12">
          <EmptyState
            title={t("tracking.connectionBlocked", "Unable to load order data")}
            message={t("tracking.disableBlockers", "Real-time connections are blocked. Disable ad blockers and try again.")}
            action={
              <Button onClick={() => window.location.reload()} size="md">
                {t("common.refresh", "Refresh")}
              </Button>
            }
          />
        </div>
      </div>
    );
  }

  // No orders
  if (!orders || !orders.length) {
    if (!orderIdQuery) {
      return (
        <div dir={isRTL ? "rtl" : "ltr"} className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)]">
          <div className="mx-auto max-w-6xl px-4 py-12">
            <EmptyState
              title={t("tracking.noOrders.title", "No tracked orders yet")}
              message={t("tracking.noOrders.subtitle", "After you place an order, it will appear here for tracking.")}
              action={
                <Button onClick={() => navigate("/products")} size="md">
                  {t("tracking.noOrders.cta", "Shop products")}
                </Button>
              }
            />
          </div>
        </div>
      );
    }
  }

  const status = order?.status || order?.payment_status || "pending";
  const trackingUrl = order ? buildTrackingUrl(order) : null;

  return (
    <div dir={isRTL ? "rtl" : "ltr"} className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)]">
      <div className="mx-auto max-w-6xl px-4 py-10 space-y-6">
        <Section
          title={t("tracking.title", "Order Tracking")}
          subtitle={t("tracking.subtitle", "Check your recent purchases, status, and delivery details.")}
          actions={
            order && showPaymentBadge ? (
              <Badge tone="success">{t("tracking.paymentReceived", "Payment received")}</Badge>
            ) : null
          }
        >
          <div className="grid gap-4 lg:grid-cols-[320px,1fr]">
            {/* Orders list */}
            <div className="space-y-2">
              {orders.map((o) => (
                <button
                  key={o.id}
                  onClick={() => handleSelectOrder(o)}
                  className={`w-full text-left rounded-[var(--radius-md)] border px-4 py-3 transition hover:bg-[var(--color-surface-muted)] ${
                    order?.id === o.id ? "border-[var(--color-accent)] bg-[var(--color-accent)]/10" : "border-[var(--color-border)] bg-[var(--color-surface)]"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-semibold text-[var(--color-text)]">
                      {t("tracking.orderLabel", "Order")} #{o.id}
                    </span>
                    <Badge tone={statusTone(o.status || o.payment_status)}>{o.status || o.payment_status || "pending"}</Badge>
                  </div>
                  <p className="text-xs text-[var(--color-text-muted)] mt-1">
                    <FiClock className="inline-block mr-1" /> {formatDate(o.createdAt)}
                  </p>
                </button>
              ))}
            </div>

            {/* Order detail */}
            {order ? (
              <div className="space-y-4">
                <div className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
                  <div className="flex flex-wrap items-center gap-3 justify-between">
                    <div className="space-y-1">
                      <p className="text-xs uppercase tracking-wide text-[var(--color-text-muted)]">
                        {t("tracking.orderLabel", "Order")} #{order.id}
                      </p>
                      <h3 className="text-xl font-semibold text-[var(--color-text)]">
                        <FiTruck className="inline-block mr-2" />
                        {t("tracking.status", "Status")}: {status}
                      </h3>
                      <p className="text-sm text-[var(--color-text-muted)]">
                        <FiClock className="inline-block mr-2" />
                        {formatDate(order.updatedAt || order.createdAt)}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Badge tone={statusTone(status)}>{status}</Badge>
                      {trackingUrl && (
                        <Button size="sm" onClick={() => window.open(trackingUrl, "_blank")}>
                          {t("tracking.viewTracking", "View tracking")}
                        </Button>
                      )}
                      {status === "Shipped" && (
                        <Button size="sm" onClick={handleConfirmDelivery}>
                          {t("tracking.confirmDelivery", "Confirm delivery")}
                        </Button>
                      )}
                    </div>
                  </div>

                  <div className="mt-4 grid gap-3 md:grid-cols-2 text-sm text-[var(--color-text-muted)]">
                    <div className="flex items-center gap-2">
                      <FiMapPin /> {order.address || t("tracking.noAddress", "No address provided")}
                    </div>
                    <div className="flex items-center gap-2">
                      <FiCreditCard /> {order.payment_method || t("tracking.paymentMethod", "Payment method")}
                    </div>
                  </div>
                </div>

                <OrderTrackingHeader order={order} />
                <OrderTimeline order={order} />
                <ShippingInfoCard order={order} />
                <OrderItemsList order={order} />
              </div>
            ) : (
              <EmptyState
                title={t("tracking.selectOrder", "Select an order")}
                message={t("tracking.selectOrderMessage", "Choose an order on the left to view details.")}
              />
            )}
          </div>
        </Section>
      </div>
    </div>
  );
}
