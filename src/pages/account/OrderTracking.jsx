import { useEffect, useMemo, useState } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { UseTheme } from "../../theme/ThemeProvider";
import { useTranslation } from "react-i18next";
import { useLocation, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { selectCurrentUser } from "../../features/auth/authSlice";
import { db } from "../../services/firebase";
import { useUserOrders } from "../../hooks/useUserOrders";

const buildTrackingUrl = (trackingNumber) =>
  `https://www.17track.net/en#nums=${encodeURIComponent(trackingNumber)}`;

export default function OrderTracking() {
  const { theme } = UseTheme();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const query = useMemo(() => new URLSearchParams(location.search), [location.search]);
  const orderIdQuery = query.get("orderId");
  const isDark = theme === "dark";
  const user = useSelector(selectCurrentUser);
  const { orders, loading } = useUserOrders(user?.uid);
  const [order, setOrder] = useState(null);

  const targetOrderId = useMemo(
    () => orderIdQuery || orders?.[0]?.id || null,
    [orderIdQuery, orders]
  );

  useEffect(() => {
    if (!targetOrderId) {
      setOrder(null);
      return undefined;
    }

    const orderRef = doc(db, "orders", targetOrderId);
    const unsubscribe = onSnapshot(orderRef, (snap) => {
      if (!snap.exists()) {
        setOrder(null);
        return;
      }
      const data = snap.data();
      setOrder({
        id: snap.id,
        ...data,
        createdAt: data.createdAt?.toDate?.() || null,
        updatedAt: data.updatedAt?.toDate?.() || null,
      });
    });

    return () => unsubscribe();
  }, [targetOrderId]);

  const handleSelectOrder = (id) => {
    navigate(`/account/tracking?orderId=${id}`);
  };

  const baseSteps = [
    { key: "processing", label: t("tracking.steps.processing", "Processing") },
    { key: "shipped", label: t("tracking.steps.shipped", "Shipped") },
    { key: "out_for_delivery", label: t("tracking.steps.outForDelivery", "Out for Delivery") },
    { key: "delivered", label: t("tracking.steps.delivered", "Delivered") },
  ];

  const statusOrder = baseSteps.map((step) => step.key);
  const currentStatusIndex = order
    ? statusOrder.indexOf(order.status || "processing")
    : 0;
  const timelineSteps = baseSteps.map((step, index) => {
    let state = "pending";
    if (index < currentStatusIndex) state = "done";
    if (index === currentStatusIndex) state = "current";
    return {
      ...step,
      state,
      updatedAt:
        order?.status === step.key
          ? order.updatedAt
          : step.key === "processing"
          ? order?.createdAt
          : order?.updatedAt,
    };
  });

  const accent = isDark ? "text-emerald-300" : "text-emerald-600";
  const headingColor = isDark ? "text-white" : "text-slate-900";
  const subtleButton = isDark
    ? "border-slate-700 text-slate-200 hover:bg-slate-800/70"
    : "border-slate-200 text-slate-600 hover:bg-slate-50";
  const shellSurface = isDark
    ? "border-slate-800 bg-slate-900/70"
    : "border-slate-100 bg-white";
  const headerMuted = isDark ? "text-slate-400" : "text-slate-500";
  const strongText = isDark ? "text-white" : "text-slate-900";
  const muted = isDark ? "text-slate-400" : "text-slate-500";
  const infoSurface = isDark
    ? "border-slate-800 bg-slate-900 text-slate-300"
    : "border-slate-100 bg-slate-50 text-slate-600";
  const infoHeading = isDark ? "text-white" : "text-slate-900";
  const connectorColor = isDark ? "bg-slate-800" : "bg-slate-200";
  const formatDateTime = (value, fallback) =>
    value ? new Date(value).toLocaleString() : fallback;

  const timelineIndicator = (state) => {
    if (state === "done") {
      return "border-emerald-500 bg-emerald-500 text-white";
    }
    if (state === "current") {
      return isDark
        ? "border-amber-400 bg-amber-900/40 text-amber-200"
        : "border-amber-400 bg-amber-50 text-amber-600";
    }
    return isDark
      ? "border-slate-700 bg-slate-900 text-slate-500"
      : "border-slate-200 bg-white text-slate-400";
  };

  const shippingInfo = order?.shipping || {
    recipient: "Farmhouse HQ",
    address: "123 Green Valley Rd",
    carrier: order?.shippingCarrier || "Agri-Logistics Express",
    trackingNumber: order?.shipping?.trackingNumber || order?.trackingNumber || "",
  };

  const trackingUrl = shippingInfo.trackingNumber
    ? buildTrackingUrl(shippingInfo.trackingNumber)
    : null;
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 rounded bg-slate-200 dark:bg-slate-700 animate-pulse" />
        <div className="h-6 w-80 rounded bg-slate-200 dark:bg-slate-700 animate-pulse" />
      </div>
    );
  }

  if (!orders || !orders.length) {
    return (
      <div className="space-y-4 text-center">
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
          type="button"
          onClick={() => navigate("/products")}
          className="rounded-2xl bg-emerald-500 px-5 py-2 text-sm font-semibold text-white hover:bg-emerald-600"
        >
          {t("tracking.noOrders.cta", "Shop now")}
        </button>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="space-y-4">
        <div className="flex flex-wrap gap-2">
          {orders.map((o) => (
            <button
              key={o.id}
              type="button"
              onClick={() => handleSelectOrder(o.id)}
              className="rounded-full border px-3 py-1 text-sm font-semibold border-slate-300 text-slate-600"
            >
              {o.reference}
            </button>
          ))}
        </div>
        <p className={`text-sm ${headerMuted}`}>
          {t("tracking.selectOrder", "Select an order to display live updates.")}
        </p>
      </div>
    );
  }

  const headerSummary = (
    <>
      <div>
        <p className={`text-sm font-semibold uppercase tracking-wide ${accent}`}>
          {t("tracking.eyebrow", "Track your recent purchases")}
        </p>
        <h1 className={`text-3xl font-semibold ${headingColor}`}>
          {t("tracking.title", "Order Tracking")}
        </h1>
        <p className={`text-sm ${headerMuted}`}>
          {t(
            "tracking.subtitle",
            "We watch your order for updates and refresh the timeline live."
          )}
        </p>
      </div>
      <button
        onClick={() => navigate("/account/orders")}
        className={`rounded-xl border px-4 py-2 text-sm font-semibold transition ${subtleButton}`}
      >
        {t("tracking.viewAllOrders", "View all orders")}
      </button>
    </>
  );

  return (
    <div className="space-y-8">
      <header className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-4">
          {headerSummary}
        </div>
        <div className="flex flex-wrap gap-2">
          {orders.map((o) => (
            <button
              key={o.id}
              type="button"
              onClick={() => handleSelectOrder(o.id)}
              className={`rounded-full border px-3 py-1 text-sm font-semibold ${
                o.id === order?.id
                  ? "border-emerald-500 bg-emerald-500/10 text-emerald-600"
                  : "border-slate-300 text-slate-600"
              }`}
            >
              {o.reference}
            </button>
          ))}
        </div>
      </header>

      <div className={`rounded-3xl border shadow-sm ${shellSurface}`}>
        <div
          className={`flex flex-wrap items-center justify-between gap-4 border-b px-6 py-4 text-sm ${headerMuted} ${
            isDark ? "border-slate-800" : "border-slate-100"
          }`}
        >
          <div>
            <p className="text-xs uppercase tracking-wide text-slate-400">
              {t("tracking.order", "Order")}
            </p>
            <p className={`text-base font-semibold ${headingColor}`}>{order.reference}</p>
            <p className={`text-xs ${muted}`}>
              {order.createdAt
                ? formatDateTime(order.createdAt, t("tracking.awaitingUpdate", "Awaiting update"))
                : t("tracking.awaitingUpdate", "Awaiting update")}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs uppercase tracking-wide text-slate-400">
              {t("tracking.total", "Total")}
            </p>
            <p className={`text-2xl font-semibold ${headingColor}`}>
              {order.totals?.total
                ? `${Number(order.totals.total).toLocaleString()} EGP`
                : "-"}
            </p>
          </div>
        </div>
        <div className="grid gap-6 p-6 lg:grid-cols-[2fr,1fr]">
          <section>
            <h2 className={`text-sm font-semibold uppercase tracking-wide ${muted}`}>
              {t("tracking.trackingStatus", "Tracking Status")}
            </h2>
            <ol className="mt-4 space-y-4">
              {timelineSteps.map((step, index) => (
                <li key={step.key} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <span
                      className={`flex h-8 w-8 items-center justify-center rounded-full border-2 ${timelineIndicator(
                        step.state
                      )}`}
                    >
                      {index + 1}
                    </span>
                    {index !== timelineSteps.length - 1 && (
                      <div className={`mt-1 h-12 w-px ${connectorColor}`} />
                    )}
                  </div>
                  <div>
                    <p className={`font-semibold ${strongText}`}>{step.label}</p>
                    <p className={`text-sm ${muted}`}>
                      {formatDateTime(step.updatedAt, t("tracking.awaitingUpdate", "Awaiting update"))}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </section>

          <section className={`rounded-2xl border p-4 text-sm ${infoSurface}`}>
            <h2 className={`text-base font-semibold ${infoHeading}`}>
              {t("tracking.shippingInfo", "Shipping Information")}
            </h2>
            <dl className="mt-4 space-y-3">
              <div>
                <dt className={`text-xs uppercase tracking-wide ${muted}`}>
                  {t("tracking.shippingTo", "Shipping To")}
                </dt>
                <dd className={`font-medium ${strongText}`}>{shippingInfo.recipient}</dd>
                <dd>{shippingInfo.address}</dd>
              </div>
              <div>
                <dt className={`text-xs uppercase tracking-wide ${muted}`}>
                  {t("tracking.carrier", "Carrier")}
                </dt>
                <dd className={`font-medium ${strongText}`}>{shippingInfo.carrier}</dd>
              </div>
              <div>
                <dt className={`text-xs uppercase tracking-wide ${muted}`}>
                  {t("tracking.trackingNumber", "Tracking Number")}
                </dt>
                <dd className={`font-medium ${strongText}`}>
                  {shippingInfo.trackingNumber || t("tracking.awaitingUpdate", "Awaiting update")}
                </dd>
                {trackingUrl && (
                  <dd>
                    <a
                      href={trackingUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`text-sm font-semibold hover:underline ${linkColor(isDark)}`}
                    >
                      {t("tracking.trackCarrier", "Track on carrier site")}
                    </a>
                  </dd>
                )}
              </div>
            </dl>
          </section>
        </div>
      </div>
    </div>
  );
}

function linkColor(isDark) {
  return isDark ? "text-emerald-300" : "text-emerald-600";
}
