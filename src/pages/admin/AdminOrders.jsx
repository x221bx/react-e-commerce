// src/pages/AdminOrders.jsx
import React, { useState, useMemo } from "react";
import { FiRefreshCw, FiClock, FiTrash2 } from "react-icons/fi";
import { MdHistory, MdNotifications } from "react-icons/md";
import { useNavigate } from "react-router-dom";
// import useOrders from "../../hooks/useOrders";
import useOrders from "../../hooks/useOrders";

export default function AdminOrders() {
  const {
    orders,
    loading,
    updateOrderStatus,
    deleteOrder,
    refreshOrders,
    STATUS_FLOW,
    restoreStock,
  } = useOrders(null, true);

  const [activeFilter, setActiveFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortDesc, setSortDesc] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState(null);

  const navigate = useNavigate();
  const filters = ["All", ...STATUS_FLOW, "Canceled"];

  const counts = useMemo(() => {
    const c = {};
    filters.forEach((status) => {
      c[status] =
        status === "All"
          ? orders.length
          : orders.filter((o) => o.status === status).length;
    });
    return c;
  }, [orders, filters]);

  const filteredOrders = useMemo(() => {
    let filtered =
      activeFilter === "All"
        ? orders
        : orders.filter((o) => o.status === activeFilter);

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (o) =>
          (o.fullName || "").toLowerCase().includes(q) ||
          (o.orderNumber?.toString() || "").includes(q) ||
          (o.status || "").toLowerCase().includes(q) ||
          (o.items || []).some(
            (i) =>
              (i.name || "").toLowerCase().includes(q) ||
              (i.category || "").toLowerCase().includes(q)
          )
      );
    }

    return filtered.sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime() || 0;
      const dateB = new Date(b.createdAt).getTime() || 0;
      return sortDesc ? dateB - dateA : dateA - dateB;
    });
  }, [orders, activeFilter, searchQuery, sortDesc]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await refreshOrders();
    setRefreshing(false);
  };

  const statusColorClass = (order) => {
    const status = (order.status || "").toLowerCase();
    const lastHistory = order.statusHistory?.[order.statusHistory.length - 1];
    const isCustomerConfirmed = lastHistory?.confirmedBy === "customer";

    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "processing":
        return "bg-blue-100 text-blue-800";
      case "shipped":
        return "bg-purple-100 text-purple-800";
      case "delivered":
        return isCustomerConfirmed
          ? "bg-emerald-100 text-emerald-800 border-2 border-emerald-300"
          : "bg-green-100 text-green-800";
      case "canceled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <div>
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <h1 className="text-3xl font-bold text-green-800">
            Orders Dashboard
          </h1>
          <div className="flex items-center gap-3 flex-wrap">
            <button
              onClick={handleRefresh}
              className="px-3 py-2 rounded bg-white border flex items-center gap-2"
            >
              <FiRefreshCw /> {refreshing ? "Refreshing..." : "Refresh"}
            </button>
            <button
              onClick={() => setSortDesc((s) => !s)}
              className="px-3 py-2 rounded bg-white border flex items-center gap-2"
            >
              <FiClock /> {sortDesc ? "Desc" : "Asc"}
            </button>
          </div>
        </div>

        <div className="mb-6">
          <input
            type="text"
            placeholder="Search by customer, order, or product..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-2 rounded-lg border border-green-300 focus:outline-none focus:border-green-600"
          />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-6 gap-3 mb-6">
          {filters.map((status) => {
            const isActive = activeFilter === status;
            const bg = isActive
              ? "bg-green-800 text-white"
              : "bg-white text-green-800";
            const border = isActive ? "border-green-800" : "border-green-300";
            return (
              <button
                key={status}
                onClick={() => setActiveFilter(status)}
                className={`flex justify-between items-center gap-2 p-3 rounded-lg border ${border} ${bg}`}
              >
                <span className="font-medium">{status}</span>
                <span className="bg-green-100 text-green-800 px-2 py-1 rounded-lg text-sm font-semibold">
                  {counts[status]}
                </span>
              </button>
            );
          })}
        </div>

        <div className="space-y-4">
          {loading ? (
            <div>Loading...</div>
          ) : filteredOrders.length === 0 ? (
            <div className="text-center py-10 text-red-600 font-semibold">
              No orders found.
            </div>
          ) : (
            filteredOrders.map((order) => (
              <div
                key={order.id}
                className="bg-white rounded-2xl shadow-md p-5 border border-green-100"
              >
                <div className="flex flex-col md:flex-row justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-green-900">
                      #{order.orderNumber} - {order.fullName}
                    </h3>
                    <div className="mt-2 space-y-2">
                      {order.items?.map((item) => (
                        <div
                          key={item.productId}
                          className="flex items-center gap-3 border p-2 rounded-md bg-green-50"
                        >
                          <img
                            src={item.imageUrl || item.image || item.thumbnailUrl || item.img || "/placeholder.png"}
                            alt={item.name}
                            className="w-12 h-12 object-cover rounded"
                          />
                          <div className="flex-1">
                            <p className="font-semibold text-green-800">
                              {item.name}{" "}
                              <span className="text-sm text-gray-600">
                                ({item.category || "—"})
                              </span>
                            </p>
                            <p className="text-green-700 text-sm">
                              Qty: {item.quantity} • Price: {item.price} EGP
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="mt-3 flex gap-4 items-center flex-wrap">
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-semibold ${statusColorClass(
                          order
                        )}`}
                      >
                        {order.status}
                        {order.statusHistory?.[order.statusHistory.length - 1]?.confirmedBy === "customer" && (
                          <span className="ml-1 text-xs">✓</span>
                        )}
                      </span>
                      <span className="text-green-900 font-semibold">
                        Total: {order.total} EGP
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-2 mt-3 md:mt-0 items-center flex-wrap">
                    {/* الزرار ده هيوديك لصفحة التفاصيل */}
                    <button
                      onClick={() => navigate(`/admin/AdminOrders/${order.id}`)}
                      className="px-3 py-2 rounded-md bg-white border hover:bg-green-50 text-sm font-semibold"
                    >
                      View
                    </button>

                    <select
                      value={order.status}
                      onChange={async (e) => {
                        const val = e.target.value;
                        if (
                          val === "Canceled" &&
                          ["Shipped", "Delivered"].includes(order.status)
                        ) {
                          alert("Cannot cancel shipped/delivered order");
                          return;
                        }
                        try {
                          await updateOrderStatus(
                            order.id,
                            val,
                            val === "Canceled" ? restoreStock : undefined
                          );
                        } catch (err) {
                          alert(err.message || "Failed");
                        }
                      }}
                      className="p-2 border rounded-md"
                    >
                      {filters
                        .filter((f) => f !== "All")
                        .map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                    </select>

                    <button
                      onClick={() =>
                        setSelectedOrderId(
                          selectedOrderId === order.id ? null : order.id
                        )
                      }
                      className="p-2 rounded-md bg-white border hover:bg-green-50 flex items-center gap-1"
                    >
                      <MdHistory /> History
                    </button>

                    <button
                      onClick={async () => {
                        if (window.confirm("Delete this order?")) {
                          try {
                            await deleteOrder(order.id, restoreStock);
                          } catch (e) {
                            alert("Failed to delete");
                          }
                        }
                      }}
                      className="p-2 rounded-md bg-red-500 text-white hover:bg-red-600"
                      title="Delete"
                    >
                      <FiTrash2 />
                    </button>
                  </div>
                </div>

                {selectedOrderId === order.id &&
                  order.statusHistory?.length > 0 && (
                    <div className="mt-3 p-3 border-t border-green-200 rounded-lg bg-green-50">
                      <h4 className="font-semibold text-green-800 mb-2">
                        History:
                      </h4>
                      <ul className="text-sm text-green-700 space-y-1">
                        {order.statusHistory.map((h, idx) => (
                          <li key={idx}>
                            <span className="font-medium">{h.status}</span> -{" "}
                            <span>
                              {new Date(h.changedAt).toLocaleString()}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
