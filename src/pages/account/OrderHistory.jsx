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
import Section from "../../components/ui/Section";
import EmptyState from "../../components/ui/EmptyState";
import Badge from "../../components/ui/Badge";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import { ensureProductLocalization, getLocalizedProductTitle } from "../../utils/productLocalization";

const statusTone = (statusRaw) => {
  const status = statusRaw?.toLowerCase();
  if (status === "pending") return "warning";
  if (status === "processing" || status === "shipped") return "accent";
  if (status === "delivered") return "success";
  if (status === "canceled") return "danger";
  return "neutral";
};

const formatDate = (dateVal) => {
  if (!dateVal) return "";
  try {
    const d = dateVal.seconds ? new Date(dateVal.seconds * 1000) : new Date(dateVal);
    return d.toLocaleString();
  } catch {
    return "";
  }
};

export default function OrderHistory() {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const lang = i18n.language || "en";
  const user = auth.currentUser;
  const { orders, loading } = useOrders(user?.uid);
  const [expandedId, setExpandedId] = useState(null);
  const isRTL = lang.startsWith("ar");

  if (loading) {
    return (
      <div dir={isRTL ? "rtl" : "ltr"} className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)]">
        <div className="mx-auto max-w-5xl px-4 py-12 space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-5 animate-pulse">
              <div className="h-4 w-1/3 bg-[var(--color-border)]/70 rounded mb-3" />
              <div className="h-3 w-1/2 bg-[var(--color-border)]/70 rounded mb-2" />
              <div className="h-3 w-1/4 bg-[var(--color-border)]/70 rounded" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!loading && orders.length === 0) {
    return (
      <div dir={isRTL ? "rtl" : "ltr"} className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)]">
        <div className="mx-auto max-w-4xl px-4 py-12">
          <Section title={t("account.order_history", "Order History")} subtitle={t("account.order_description", "Track your past orders and their status.")}>
            <EmptyState
              title={t("account.orderHistory.empty", "No orders yet")}
              message={t("account.orderHistory.emptyHint", "Browse products and place your first order.")}
              action={
                <Button size="md" onClick={() => navigate("/products")}>
                  {t("account.orderHistory.shopNow", "Shop now")}
                </Button>
              }
            />
          </Section>
        </div>
      </div>
    );
  }

  return (
    <div dir={isRTL ? "rtl" : "ltr"} className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)]">
      <div className="mx-auto max-w-6xl px-4 py-10 space-y-5">
        <Section
          title={t("account.order_history", "Order History")}
          subtitle={t("account.order_description", "Track your past orders and their status.")}
        >
          <div className="space-y-4">
            {orders.map((order) => {
              const expanded = expandedId === order.id;
              const items = Array.isArray(order.items) ? order.items : [];
              const total = Number(order.total || order.amount || 0).toFixed(2);
              const status = order.status || order.payment_status || "pending";

              return (
                <Card key={order.id} className="relative overflow-hidden">
                  <div className="flex flex-col gap-3 border-b border-[var(--color-border)] px-5 py-4 md:flex-row md:items-center md:justify-between">
                    <div className="space-y-1">
                      <p className="text-sm text-[var(--color-text-muted)] flex items-center gap-2">
                        <FiClock /> {formatDate(order.createdAt)}
                      </p>
                      <h3 className="text-lg font-semibold flex items-center gap-2">
                        <FiPackage /> {t("account.orderHistory.order", "Order")} #{order.id}
                      </h3>
                      <p className="text-sm text-[var(--color-text-muted)] flex items-center gap-2">
                        <FiCreditCard /> {t("account.orderHistory.total", "Total")}: {total} {order.currency || "EGP"}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge tone={statusTone(status)}>{status}</Badge>
                      <button
                        onClick={() => setExpandedId(expanded ? null : order.id)}
                        className="inline-flex items-center gap-1 text-sm font-semibold text-[var(--color-text)] hover:text-[var(--color-accent)] transition"
                      >
                        {expanded ? <FiChevronUp /> : <FiChevronDown />} {expanded ? t("common.hide", "Hide") : t("common.details", "Details")}
                      </button>
                    </div>
                  </div>

                  {expanded && (
                    <div className="px-5 py-4 space-y-3">
                      <div className="flex flex-wrap gap-3 text-sm text-[var(--color-text-muted)]">
                        <span className="inline-flex items-center gap-2">
                          <FiTruck /> {t("account.orderHistory.shipping", "Shipping")}: {order.shipping_method || t("account.orderHistory.standard", "Standard")}
                        </span>
                        <span className="inline-flex items-center gap-2">
                          <FiMapPin /> {order.address || t("account.orderHistory.addressMissing", "No address provided")}
                        </span>
                      </div>

                      <div className="grid gap-3 md:grid-cols-2">
                        {items.map((item, idx) => {
                          const localized = ensureProductLocalization(item);
                          const title = getLocalizedProductTitle(localized, lang);
                          const qty = item.quantity || 1;
                          const price = Number(item.price || 0).toFixed(2);
                          return (
                            <div key={idx} className="rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface-muted)] p-3 flex items-start gap-3">
                              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[var(--radius-md)] bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-accent)]">
                                <FiFileText />
                              </div>
                              <div className="min-w-0">
                                <p className="text-sm font-semibold text-[var(--color-text)] truncate">{title}</p>
                                <p className="text-xs text-[var(--color-text-muted)]">
                                  {t("account.orderHistory.quantity", "Qty")}: {qty} • {price} {item.currency || "EGP"}
                                </p>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      <div className="flex flex-wrap justify-between items-center gap-3">
                        <div className="text-sm text-[var(--color-text-muted)] flex items-center gap-2">
                          <FiClock /> {t("account.orderHistory.updated", "Last update")}: {formatDate(order.updatedAt || order.createdAt)}
                        </div>
                        <Button size="sm" onClick={() => navigate(`/order-tracking/${order.id}`)}>
                          {t("account.orderHistory.track", "Track order")}
                        </Button>
                      </div>
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        </Section>
      </div>
    </div>
  );
}
