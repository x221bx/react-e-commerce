import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import { selectCurrentUser } from "../../features/auth/authSlice";
import { useUserOrders } from "../../hooks/useUserOrders";
import { UseTheme } from "../../theme/ThemeProvider";
import { Link } from "react-router-dom";

const formatCurrency = (value) => `${Number(value || 0).toLocaleString()} EGP`;

export default function OrderHistory() {
  const { t } = useTranslation();
  const { theme } = UseTheme();
  const user = useSelector(selectCurrentUser);
  const { orders, loading } = useUserOrders(user?.uid);

  const isDark = theme === "dark";
  const accent = isDark ? "text-emerald-300" : "text-emerald-600";
  const headingColor = isDark ? "text-white" : "text-slate-900";
  const subText = isDark ? "text-slate-400" : "text-slate-500";
  const tableShell = isDark
    ? "border-slate-800 bg-slate-900/80"
    : "border-slate-100 bg-white";
  const tableDivider = isDark ? "divide-slate-800" : "divide-slate-100";
  const tableHeaderBg = isDark ? "bg-slate-900" : "bg-slate-50";
  const tableHeaderText = isDark ? "text-slate-400" : "text-slate-500";
  const rowText = isDark ? "text-slate-200" : "text-slate-700";
  const rowPrimary = isDark ? "text-white" : "text-slate-900";
  const cardSurface = isDark
    ? "border-slate-800 bg-slate-900/70"
    : "border-slate-100 bg-white";
  const linkColor = isDark ? "text-emerald-300" : "text-emerald-600";

  const badgeClass = (status = "") => {
    switch (status.toLowerCase()) {
      case "shipped":
      case "processing":
        return isDark
          ? "bg-amber-900/30 text-amber-200"
          : "bg-amber-100 text-amber-700";
      case "delivered":
        return isDark
          ? "bg-emerald-900/30 text-emerald-200"
          : "bg-emerald-100 text-emerald-700";
      default:
        return isDark
          ? "bg-slate-800 text-slate-200"
          : "bg-slate-100 text-slate-600";
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <header>
          <div className="h-4 w-32 rounded bg-slate-200 dark:bg-slate-700 animate-pulse"></div>
          <div className="mt-2 h-8 w-64 rounded bg-slate-200 dark:bg-slate-700 animate-pulse"></div>
          <div className="mt-2 h-4 w-96 rounded bg-slate-200 dark:bg-slate-700 animate-pulse"></div>
        </header>

        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <div className="h-5 w-24 rounded bg-slate-200 dark:bg-slate-700 animate-pulse"></div>
                  <div className="h-4 w-20 rounded bg-slate-200 dark:bg-slate-700 animate-pulse"></div>
                </div>
                <div className="h-6 w-16 rounded-full bg-slate-200 dark:bg-slate-700 animate-pulse"></div>
              </div>
              <div className="mt-4 flex items-center justify-between">
                <div className="flex gap-4">
                  <div className="h-4 w-12 rounded bg-slate-200 dark:bg-slate-700 animate-pulse"></div>
                  <div className="h-4 w-16 rounded bg-slate-200 dark:bg-slate-700 animate-pulse"></div>
                </div>
                <div className="h-4 w-12 rounded bg-slate-200 dark:bg-slate-700 animate-pulse"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!orders.length) {
    return (
      <div className="space-y-4 text-center">
        <h1 className={`text-3xl font-semibold ${headingColor}`}>
          {t("orders.empty.title")}
        </h1>
        <p className={`text-sm ${subText}`}>{t("orders.empty.subtitle")}</p>
        <div className="mt-4 flex justify-center gap-3">
          <Link
            to="/products"
            className="rounded-2xl bg-emerald-500 px-5 py-2 text-sm font-semibold text-white shadow hover:bg-emerald-600"
          >
            {t("orders.empty.cta")}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-5 min-h-screen bg-green-50">
      <header>
        <p className={`text-sm font-semibold uppercase tracking-wide ${accent}`}>
          {t("orders.overview.eyebrow")}
        </p>
        <h1 className={`text-3xl font-semibold ${headingColor}`}>
          {t("orders.overview.title")}
        </h1>
        <p className={`text-sm ${subText}`}>
          {t("orders.overview.subtitle")}
        </p>
      </header>

      <div className={`hidden overflow-hidden rounded-3xl border shadow-sm lg:block ${tableShell}`}>
        <table className={`min-w-full divide-y text-sm ${tableDivider}`}>
          <thead className={tableHeaderBg}>
            <tr className={`text-left text-xs font-semibold uppercase tracking-wide ${tableHeaderText}`}>
              <th className="px-6 py-3">{t("orders.table.order")}</th>
              <th className="px-6 py-3">{t("orders.table.date")}</th>
              <th className="px-6 py-3">{t("orders.table.items")}</th>
              <th className="px-6 py-3">{t("orders.table.total")}</th>
              <th className="px-6 py-3">{t("orders.table.status")}</th>
              <th className="px-6 py-3 text-right">{t("orders.table.actions")}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {orders.map((order) => (
              <tr key={order.id} className={rowText}>
                <td className={`px-6 py-4 font-semibold ${rowPrimary}`}>
                  {order.reference}
                </td>
                <td className="px-6 py-4">
                  {order.createdAt
                    ? new Date(order.createdAt).toLocaleDateString()
                    : t("orders.table.pending")}
                </td>
                <td className="px-6 py-4">{order.items.length}</td>
                <td className="px-6 py-4">{formatCurrency(order.totals?.total)}</td>
                <td className="px-6 py-4">
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold ${badgeClass(order.status)}`}>
                    {t(`orders.status.${order.status || "processing"}`, order.status)}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <Link
                    to={`/checkout/confirmation?orderId=${order.id}`}
                    className={`text-sm font-semibold hover:underline ${linkColor}`}
                  >
                    {t("orders.table.view")}
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="space-y-4 lg:hidden">
        {orders.map((order) => (
          <div key={order.id} className={`rounded-2xl border p-5 shadow-sm transition hover:shadow-md ${cardSurface}`}>
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <p className={`text-lg font-bold ${rowPrimary} mb-1`}>
                  {order.reference}
                </p>
                <p className={`text-sm ${subText}`}>
                  {order.createdAt
                    ? new Date(order.createdAt).toLocaleDateString()
                    : t("orders.table.pending")}
                </p>
              </div>
              <span className={`rounded-full px-3 py-1.5 text-xs font-semibold ${badgeClass(order.status)}`}>
                {t(`orders.status.${order.status || "processing"}`, order.status)}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-6">
                <div className="text-center">
                  <p className={`text-2xl font-bold ${rowPrimary}`}>
                    {order.items.length}
                  </p>
                  <p className={`text-xs ${subText}`}>
                    {t("orders.table.items")}
                  </p>
                </div>
                <div className="text-center">
                  <p className={`text-xl font-bold ${accent}`}>
                    {formatCurrency(order.totals?.total)}
                  </p>
                  <p className={`text-xs ${subText}`}>
                    {t("orders.table.total")}
                  </p>
                </div>
              </div>

              <Link
                to={`/checkout/confirmation?orderId=${order.id}`}
                className={`inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-semibold transition hover:bg-emerald-50 ${linkColor} border-current`}
              >
                {t("orders.table.view")}
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
