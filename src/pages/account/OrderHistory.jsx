// src/pages/UserOrders.jsx
import React, { useState } from "react";
import { FiClock } from "react-icons/fi";
import { auth } from "../../services/firebase";
import useOrders from "../../hooks/useOrders";
import { UseTheme } from "../../theme/ThemeProvider"; // استيراد ThemeProvider

export default function UserOrders() {
  const { isDark } = UseTheme(); // <--- هنا عرفنا isDark
  const user = auth.currentUser;
  const { orders, loading } = useOrders(user?.uid);

  const [expandedId, setExpandedId] = useState(null);

  if (loading)
    return (
      <div className="p-10 text-center text-green-800 text-lg">
        Loading orders...
      </div>
    );

  if (!orders.length)
    return (
      <div className="p-10 text-center text-green-900 text-xl font-semibold">
        No orders yet.
      </div>
    );

  const containerBg = isDark ? "bg-slate-950" : "bg-white";

  return (
    <div className={`space-y-6 p-5 min-h-screen ${containerBg}`}>
      <header>
        <p className="text-sm font-semibold uppercase tracking-wide text-emerald-600">
          Overview
        </p>
        <h1 className="text-3xl font-semibold text-slate-900">Order History</h1>
        <p className="text-sm text-slate-500">
          Track invoices, statuses, and totals for every transaction.
        </p>
      </header>

      {/* Desktop Table */}
      <div className="hidden lg:block overflow-hidden rounded-3xl border shadow-sm border-slate-100 bg-white">
        <table className="min-w-full divide-y divide-slate-100 text-sm">
          <thead className="bg-slate-50">
            <tr className="text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
              <th className="px-6 py-3">Order</th>
              <th className="px-6 py-3">Date</th>
              <th className="px-6 py-3">Items</th>
              <th className="px-6 py-3">Total</th>
              <th className="px-6 py-3">Status</th>
              <th className="px-6 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {orders.map((order) => (
              <tr key={order.id} className="text-slate-700">
                <td className="px-6 py-4 font-semibold text-slate-900">
                  {order.orderNumber || order.id}
                </td>
                <td className="px-6 py-4">
                  {new Date(order.createdAt).toLocaleString()}
                </td>
                <td className="px-6 py-4">{order.items?.length || 0}</td>
                <td className="px-6 py-4">{order.total} EGP</td>
                <td className="px-6 py-4">
                  <span className="rounded-full px-3 py-1 text-xs font-semibold bg-emerald-100 text-emerald-700">
                    {order.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <button
                    className="text-sm font-semibold text-emerald-600 hover:underline"
                    onClick={() =>
                      setExpandedId(expandedId === order.id ? null : order.id)
                    }
                  >
                    View details
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="space-y-4 lg:hidden">
        {orders.map((order) => (
          <div
            key={order.id}
            className="rounded-3xl border p-4 shadow-sm border-slate-100 bg-white"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-900">
                  {order.orderNumber || order.id}
                </p>
                <p className="text-xs text-slate-500">
                  {new Date(order.createdAt).toLocaleString()}
                </p>
              </div>
              <span className="rounded-full px-3 py-1 text-xs font-semibold bg-emerald-100 text-emerald-700">
                {order.status}
              </span>
            </div>

            <button
              className="text-sm text-emerald-600 hover:underline mt-2"
              onClick={() =>
                setExpandedId(expandedId === order.id ? null : order.id)
              }
            >
              View details
            </button>

            {expandedId === order.id && (
              <div className="mt-3 space-y-3">
                {order.items?.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-4 bg-green-50 p-3 rounded-xl"
                  >
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      className="w-16 h-16 rounded-lg border border-green-200 object-cover"
                    />
                    <div>
                      <p className="font-medium text-green-900">{item.name}</p>
                      <p className="text-green-700 text-sm">
                        {item.price} EGP × {item.quantity}
                      </p>
                    </div>
                  </div>
                ))}
                <div className="bg-green-50 p-3 rounded-lg">
                  <p className="text-green-800 text-sm">Shipping Address:</p>
                  <p className="font-semibold text-green-900">
                    {order.address}
                  </p>
                </div>
                <div>
                  <p className="font-medium text-green-900 mb-2">
                    Status Updates:
                  </p>
                  <ul className="space-y-2">
                    {order.statusHistory?.map((h, i) => (
                      <li
                        key={i}
                        className="flex items-center gap-2 bg-white rounded-lg p-2 border border-green-200"
                      >
                        <FiClock className="text-green-700" />
                        <span className="font-semibold text-green-900">
                          {h.status}
                        </span>
                        <span className="text-sm text-green-700">
                          {new Date(h.changedAt).toLocaleString()}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
