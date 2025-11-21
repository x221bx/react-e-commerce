import React, { useEffect, useState } from "react";
import { Link, useLocation, useSearchParams } from "react-router-dom";
import { getOrderById } from "../services/ordersService";
import { UseTheme } from "../theme/ThemeProvider";
import { useTranslation } from "react-i18next";

const OrderConfirmation = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { theme } = UseTheme();

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

  const surface =
    theme === "dark"
      ? "border-slate-800 bg-slate-900/70 text-slate-100"
      : "border-slate-100 bg-white text-slate-900";

  return (
    <div className="min-h-screen bg-slate-50 py-14 dark:bg-slate-950">
      <div className="mx-auto flex max-w-4xl flex-col gap-6 rounded-3xl border px-6 py-8 shadow-sm sm:px-10 lg:px-16">
        {loading ? (
          <p className="text-center text-sm text-slate-500 dark:text-slate-300">
            {t("confirmation.messages.loading")}
          </p>
        ) : error ? (
          <div className="text-center">
            <p className="text-lg font-semibold text-red-600">{error}</p>
            <Link
              to="/products"
              className="mt-4 inline-flex items-center rounded-2xl bg-emerald-500 px-6 py-2 text-sm font-semibold text-white shadow hover:bg-emerald-600"
            >
              {t("confirmation.actions.goShopping")}
            </Link>
          </div>
        ) : (
          order && (
            <>
              <header className="text-center">
                <p className="text-sm font-semibold uppercase tracking-wide text-emerald-500">
                  {t("confirmation.header.eyebrow")}
                </p>
                <h1 className="text-3xl font-semibold">
                  {t("confirmation.header.title")}
                </h1>
                <p className="mt-2 text-sm text-slate-500 dark:text-slate-300">
                  {t("confirmation.header.subtitle")}
                </p>
              </header>

              <div className={`rounded-3xl border ${surface} p-6`}>
                <div className="grid gap-4 md:grid-cols-3">
                  <div>
                    <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
                      {t("confirmation.meta.reference")}
                    </p>
                    <p className="text-lg font-semibold">{order.reference}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
                      {t("confirmation.meta.date")}
                    </p>
                    <p className="text-lg font-semibold">
                      {order.createdAt
                        ? new Date(order.createdAt).toLocaleString()
                        : t("confirmation.meta.pending")}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
                      {t("confirmation.meta.status")}
                    </p>
                    <p className="text-lg font-semibold capitalize">
                      {order.status}
                    </p>
                  </div>
                </div>

                <div className="mt-6 grid gap-4 md:grid-cols-2">
                  <div>
                    <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
                      {t("confirmation.meta.shippingTo")}
                    </p>
                    <p className="mt-1 text-sm">
                      {order.shipping?.fullName}
                      <br />
                      {order.shipping?.addressLine1}
                      {order.shipping?.addressLine2
                        ? `, ${order.shipping.addressLine2}`
                        : ""}
                      <br />
                      {order.shipping?.city}
                      {order.shipping?.state ? `, ${order.shipping.state}` : ""}
                      <br />
                      {order.shipping?.postalCode}
                      {order.shipping?.country
                        ? `, ${order.shipping.country}`
                        : ""}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
                      {t("confirmation.meta.contact")}
                    </p>
                    <p className="mt-1 text-sm">
                      {order.shipping?.email || order.userEmail}
                      <br />
                      {order.shipping?.phone}
                    </p>
                  </div>
                </div>
              </div>

              <div className={`rounded-3xl border ${surface} p-6`}>
                <h2 className="text-lg font-semibold">
                  {t("confirmation.items.title")}
                </h2>
                <div className="mt-4 space-y-4">
                  {order.items.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center gap-4 rounded-2xl border border-slate-100 p-4 dark:border-slate-800"
                    >
                      <img
                        src={item.image}
                        alt={item.name}
                        className="h-16 w-16 rounded-xl object-cover"
                      />
                      <div className="flex-1">
                        <p className="text-sm font-semibold">{item.name}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          {t("confirmation.items.quantity", {
                            count: item.quantity,
                          })}
                        </p>
                      </div>
                      <p className="text-sm font-semibold">
                        {`${Number(item.price).toLocaleString()} EGP`}
                      </p>
                    </div>
                  ))}
                </div>
                <div className="mt-6 space-y-2 text-sm">
                  {(() => {
                    const totals = order.totals || {
                      subtotal: 0,
                      shipping: 0,
                      total: 0,
                    };
                    return (
                      <>
                        <div className="flex items-center justify-between">
                          <span>{t("confirmation.summary.subtotal")}</span>
                          <span>{`${(totals.subtotal || 0).toLocaleString()} EGP`}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>{t("confirmation.summary.shipping")}</span>
                          <span>{`${(totals.shipping || 0).toLocaleString()} EGP`}</span>
                        </div>
                        <div className="flex items-center justify-between text-base font-semibold">
                          <span>{t("confirmation.summary.total")}</span>
                          <span>{`${(totals.total || 0).toLocaleString()} EGP`}</span>
                        </div>
                      </>
                    );
                  })()}
                </div>
              </div>

              <div className="flex flex-wrap justify-center gap-4">
                <Link
                  to="/account/orders"
                  className="rounded-2xl border border-slate-200 px-5 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200"
                >
                  {t("confirmation.actions.viewOrders")}
                </Link>
                <Link
                  to="/products"
                  className="rounded-2xl bg-emerald-500 px-5 py-2 text-sm font-semibold text-white shadow hover:bg-emerald-600"
                >
                  {t("confirmation.actions.continueShopping")}
                </Link>
              </div>
            </>
          )
        )}
      </div>
    </div>
  );
};

export default OrderConfirmation;
