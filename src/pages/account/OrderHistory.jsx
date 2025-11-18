import { UseTheme } from "../../theme/ThemeProvider";

const orders = [
  {
    id: "#AGRI-2024-00128",
    date: "Jul 26, 2024",
    total: "$245.50",
    items: 4,
    status: "Shipped",
  },
  {
    id: "#AGRI-2024-00114",
    date: "Jul 12, 2024",
    total: "$132.40",
    items: 2,
    status: "Delivered",
  },
  {
    id: "#AGRI-2024-00098",
    date: "Jun 28, 2024",
    total: "$480.00",
    items: 6,
    status: "Delivered",
  },
];

export default function OrderHistory() {
  const { theme } = UseTheme();
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
  const badgeClass = (status) => {
    if (status === "Shipped") {
      return isDark
        ? "bg-amber-900/30 text-amber-200"
        : "bg-amber-100 text-amber-700";
    }
    return isDark
      ? "bg-emerald-900/30 text-emerald-200"
      : "bg-emerald-100 text-emerald-700";
  };

  return (
    <div className="space-y-6">
      <header>
        <p className={`text-sm font-semibold uppercase tracking-wide ${accent}`}>
          Overview
        </p>
        <h1 className={`text-3xl font-semibold ${headingColor}`}>Order History</h1>
        <p className={`text-sm ${subText}`}>
          Track invoices, statuses, and totals for every transaction.
        </p>
      </header>

      {/* Desktop Table View */}
      <div className={`hidden overflow-hidden rounded-3xl border shadow-sm lg:block ${tableShell}`}>
        <table className={`min-w-full divide-y text-sm ${tableDivider}`}>
          <thead className={tableHeaderBg}>
            <tr
              className={`text-left text-xs font-semibold uppercase tracking-wide ${tableHeaderText}`}
            >
              <th className="px-6 py-3">Order</th>
              <th className="px-6 py-3">Date</th>
              <th className="px-6 py-3">Items</th>
              <th className="px-6 py-3">Total</th>
              <th className="px-6 py-3">Status</th>
              <th className="px-6 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className={`divide-y ${tableDivider}`}>
            {orders.map((order) => (
              <tr key={order.id} className={rowText}>
                <td className={`px-6 py-4 font-semibold ${rowPrimary}`}>
                  {order.id}
                </td>
                <td className="px-6 py-4">{order.date}</td>
                <td className="px-6 py-4">{order.items}</td>
                <td className="px-6 py-4">{order.total}</td>
                <td className="px-6 py-4">
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold ${badgeClass(order.status)}`}>
                    {order.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <button className={`text-sm font-semibold hover:underline ${linkColor}`}>
                    View details
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="space-y-4 lg:hidden">
        {orders.map((order) => (
          <div key={order.id} className={`rounded-3xl border p-4 shadow-sm ${cardSurface}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm font-semibold ${rowPrimary}`}>{order.id}</p>
                <p className={`text-xs ${subText}`}>{order.date}</p>
              </div>
              <span className={`rounded-full px-3 py-1 text-xs font-semibold ${badgeClass(order.status)}`}>
                {order.status}
              </span>
            </div>
            <div className="mt-3 flex items-center justify-between text-sm">
              <div className="flex gap-4">
                <span className={rowText}>{order.items} items</span>
                <span className={`font-semibold ${rowPrimary}`}>{order.total}</span>
              </div>
              <button className={`text-sm font-semibold hover:underline ${linkColor}`}>
                View details
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
