import React, { useEffect, useState } from "react";
import { Link, useLocation, useSearchParams } from "react-router-dom";
import { getOrderById } from "../services/ordersService";
import { useTranslation } from "react-i18next";
import Footer from "../Authcomponents/Footer";

const OrderConfirmation = () => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "ar";
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const mutedText = "text-[var(--color-text-muted)]";
  const labelColor = "text-[var(--color-text-muted)]";
  const accentColor = "text-[var(--color-accent)]";
  const dividerColor = "border-[var(--color-border)]";
  const ctaOutline = "border-[var(--color-border)] text-[var(--color-text)] hover:bg-[var(--color-surface-muted)]";
  const cardSurface = "border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text)]";

  const fallbackOrderId = location.state?.orderId;
  const orderId = searchParams.get("orderId") || fallbackOrderId || "";

  const [order, setOrder] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!orderId) {
      setLoading(false);
      setError(t("confirmation.messages.noOrder"));
      return;
    }

    let mounted = true;
    setLoading(true);
    getOrderById(orderId)
      .then((data) => {
        if (mounted) {
          setOrder(data);
          setError("");
        }
      })
      .catch(() => {
        if (mounted) {
          setError(t("confirmation.messages.notFound"));
        }
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [orderId, t]);

  return (
    <div dir={isRTL ? "rtl" : "ltr"} className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)] py-12 px-4 sm:px-8">
      <div className="mx-auto flex max-w-5xl flex-col gap-6">
        {loading && (
          <div
            className={`rounded-[var(--radius-lg)] border ${cardSurface} px-6 py-8 text-center shadow-[var(--shadow-sm)]`}
          >
            <p className={`text-sm ${mutedText}`}>
              {t("confirmation.messages.loading")}
            </p>
          </div>
        )}

        {!loading && error && (
          <div
            className={`rounded-[var(--radius-lg)] border ${cardSurface} px-6 py-8 text-center shadow-[var(--shadow-sm)]`}
          >
            <p className="text-lg font-semibold text-red-500">{error}</p>
            <Link
              to="/products"
              className="mt-4 inline-flex items-center rounded-[var(--radius-md)] bg-[var(--color-accent)] px-6 py-2 text-sm font-semibold text-white shadow-[var(--shadow-sm)] hover:brightness-95"
            >
              {t("confirmation.actions.goShopping")}
            </Link>
          </div>
        )}

        {!loading && !error && order && (
          <>
            <header className={`rounded-[var(--radius-lg)] border ${cardSurface} px-6 py-8 shadow-[var(--shadow-sm)]`}>
              <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:text-left">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[var(--color-accent)]/10 text-[var(--color-accent)]">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-8 w-8"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className={`text-sm font-semibold uppercase tracking-wide ${accentColor}`}>
                    {t("confirmation.header.eyebrow")}
                  </p>
                  <h1 className="text-3xl font-semibold">
                    {t("confirmation.header.title")}
                  </h1>
                  <p className={`mt-2 text-sm ${mutedText}`}>
                    {t("confirmation.header.subtitle")}
                  </p>
                </div>
                <div className="text-right text-sm">
                  <p className={`font-medium ${labelColor}`}>
                    {t("confirmation.meta.reference")}
                  </p>
                  <p className="text-lg font-semibold">{order.reference}</p>
                </div>
              </div>
            </header>

            <section className="grid gap-6 lg:grid-cols-[2fr,1fr]">
              <div className={`rounded-[var(--radius-lg)] border ${cardSurface} px-6 py-6 shadow-[var(--shadow-sm)]`}>
                <div className="grid gap-6 md:grid-cols-3">
                  <div>
                    <p className={`text-xs font-semibold ${labelColor}`}>
                      {t("confirmation.meta.date")}
                    </p>
                    <p className="mt-1 text-base font-semibold">
                      {order.createdAt
                        ? new Date(order.createdAt).toLocaleString()
                        : t("confirmation.meta.pending")}
                    </p>
                  </div>
                  <div>
                    <p className={`text-xs font-semibold ${labelColor}`}>
                      {t("confirmation.meta.status")}
                    </p>
                    <p className="mt-1 inline-flex rounded-full bg-[var(--color-accent)]/10 px-3 py-1 text-sm font-semibold text-[var(--color-accent)]">
                      {order.status}
                    </p>
                  </div>
                  <div>
                    <p className={`text-xs font-semibold ${labelColor}`}>
                      {t("confirmation.meta.payment", "Payment")}
                    </p>
                    <p className="mt-1 text-base font-semibold">
                      {order.paymentSummary ||
                        order.paymentDetails?.label ||
                        t("checkout.payment.cod.title")}
                    </p>
                  </div>
                </div>

                <div className={`mt-6 border-t ${dividerColor} pt-6`}>
                  <div className="grid gap-6 md:grid-cols-2">
                    <div>
                      <p className={`text-xs font-semibold ${labelColor}`}>
                        {t("confirmation.meta.shippingTo")}
                      </p>
                      <p className="mt-2 text-sm leading-relaxed">
                        {order.shipping?.fullName}
                        <br />
                        {order.shipping?.addressLine1}
                        {order.shipping?.addressLine2
                          ? `, ${order.shipping.addressLine2}`
                          : ""}
                        <br />
                        {order.shipping?.city}
                        {order.shipping?.state
                          ? `, ${order.shipping.state}`
                          : ""}
                        <br />
                        {order.shipping?.postalCode}
                        {order.shipping?.country
                          ? `, ${order.shipping.country}`
                          : ""}
                      </p>
                    </div>
                    <div>
                      <p className={`text-xs font-semibold ${labelColor}`}>
                        {t("confirmation.meta.contact")}
                      </p>
                      <p className="mt-2 text-sm leading-relaxed">
                        {order.shipping?.email || order.userEmail}
                        <br />
                        {order.shipping?.phone}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className={`rounded-[var(--radius-lg)] border ${cardSurface} px-6 py-6 shadow-[var(--shadow-sm)]`}>
                <p className={`text-xs font-semibold uppercase ${labelColor}`}>
                  {t("confirmation.summary.title", "Order summary")}
                </p>
                {(() => {
                  const totals = order.totals || {
                    subtotal: 0,
                    shipping: 0,
                    total: 0,
                  };
                  return (
                    <div className="mt-4 space-y-3 text-sm">
                      <div className="flex items-center justify-between">
                        <span>{t("confirmation.summary.subtotal")}</span>
                        <span>{`${(totals.subtotal || 0).toLocaleString()} EGP`}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>{t("confirmation.summary.shipping")}</span>
                        <span>{`${(totals.shipping || 0).toLocaleString()} EGP`}</span>
                      </div>
                      <div className="flex items-center justify-between border-t pt-3 text-base font-semibold">
                        <span>{t("confirmation.summary.total")}</span>
                        <span>{`${(totals.total || 0).toLocaleString()} EGP`}</span>
                      </div>
                    </div>
                  );
                })()}
                <div className={`mt-6 border-t ${dividerColor} pt-4 text-sm`}>
                  <p className={`font-semibold ${labelColor}`}>
                    {t("confirmation.summary.statusTimeline", "Status timeline")}
                  </p>
                  <div className="mt-4 space-y-3 text-xs">
                    {(order.statusHistory || []).map((entry) => (
                      <div key={`${entry.status}-${entry.changedAt}`} className="flex items-start gap-3">
                        <span className="mt-1 inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
                        <div className="flex-1">
                          <p className="font-semibold capitalize">
                            {entry.status}
                          </p>
                          <p className={mutedText}>
                            {entry.changedAt
                              ? new Date(entry.changedAt).toLocaleString()
                              : ""}
                          </p>
                        </div>
                      </div>
                    ))}
                    {(!order.statusHistory || !order.statusHistory.length) && (
                      <p className={mutedText}>
                        {t("confirmation.summary.awaitingUpdates", "We'll update this timeline once processing begins.")}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </section>

            <section className={`rounded-[var(--radius-lg)] border ${cardSurface} px-6 py-6 shadow-[var(--shadow-sm)]`}>
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">
                  {t("confirmation.items.title")}
                </h2>
                <span className={`text-sm ${mutedText}`}>
                  {t("confirmation.items.count", {
                    count: order.items.length,
                  })}
                </span>
              </div>
              <div className="mt-4 space-y-3">
                {order.items.map((item) => (
                  <div
                    key={item.productId || item.id}
                    className={`flex items-center gap-4 rounded-[var(--radius-md)] border px-4 py-3 text-sm ${dividerColor}`}
                  >
                    <img
                      src={item.image || item.imageUrl || item.thumbnailUrl || item.img || "/placeholder.png"}
                      alt={item.name}
                      className="h-16 w-16 rounded-xl object-cover"
                    />
                    <div className="flex-1">
                      <p className="font-semibold">{item.name}</p>
                      <p className={`text-xs ${mutedText}`}>
                        {t("confirmation.items.quantity", {
                          count: item.quantity,
                        })}
                      </p>
                    </div>
                    <p className="text-base font-semibold">
                      {`${Number(item.price).toLocaleString()} EGP`}
                    </p>
                  </div>
                ))}
              </div>
            </section>

            <div className="flex flex-wrap justify-center gap-4">
              <Link
                to={`/account/invoice/${orderId}`}
                className="rounded-[var(--radius-md)] bg-[var(--color-accent)] px-5 py-2 text-sm font-semibold text-white shadow-[var(--shadow-sm)] hover:brightness-95"
              >
                {t("confirmation.actions.viewInvoice", "View Invoice")}
              </Link>
              <Link
                to="/account/OrderHistory"
                className={`rounded-[var(--radius-md)] border px-5 py-2 text-sm font-semibold transition ${ctaOutline}`}
              >
                {t("confirmation.actions.viewOrders")}
              </Link>
              <Link
                to="/products"
                className="rounded-[var(--radius-md)] bg-[var(--color-accent)] px-5 py-2 text-sm font-semibold text-white shadow-[var(--shadow-sm)] hover:brightness-95"
              >
                {t("confirmation.actions.continueShopping")}
              </Link>
            </div>
          </>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default OrderConfirmation;
