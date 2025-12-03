import React from "react";
import { NavLink } from "react-router-dom";
import { useLowStockProducts } from "../hooks/useLowStockProducts";
import { useOrdersToday } from "../hooks/useOrdersToday";

export default function AlertsPanel() {
  const { data: lowStock = [], loading: loadingStock } = useLowStockProducts();
  const { data: ordersToday = [], loading: loadingOrders } = useOrdersToday();

  return (
    <section className="mt-8 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      <h2 className="mb-4 text-base font-semibold text-gray-900">Alerts</h2>

      {/* Low stock products */}
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-gray-700">
          Low Stock Products
        </h3>
        {loadingStock ? (
          <p>Loading...</p>
        ) : lowStock.length === 0 ? (
          <p className="text-xs text-gray-500 mt-1">
            All products are sufficiently stocked.
          </p>
        ) : (
          <ul className="mt-1 text-sm">
            {lowStock.map((p) => (
              <li key={p.id} className="flex justify-between">
                <span>{p.title}</span>
                <span className="font-bold text-red-600">{p.stock}</span>
              </li>
            ))}
          </ul>
        )}
        <NavLink
          to="/admin/products?filter=outofstock"
          className="mt-2 inline-block text-xs font-medium text-admin-teal hover:underline"
        >
          Manage Products →
        </NavLink>
      </div>

      {/* New orders today */}
      <div>
        <h3 className="text-sm font-semibold text-gray-700">
          New Orders Today
        </h3>
        {loadingOrders ? (
          <p>Loading...</p>
        ) : ordersToday.length === 0 ? (
          <p className="text-xs text-gray-500 mt-1">No new orders today.</p>
        ) : (
          <ul className="mt-1 text-sm">
            {ordersToday.map((o) => (
              <li key={o.id} className="flex justify-between">
                <span>Order #{o.id}</span>
                <span>{o.status}</span>
              </li>
            ))}
          </ul>
        )}
        <NavLink
          to="/admin/orders"
          className="mt-2 inline-block text-xs font-medium text-admin-teal hover:underline"
        >
          View All Orders →
        </NavLink>
      </div>
    </section>
  );
}
