// src/pages/AdminOrders.jsx
import React, { useState, useMemo, useEffect } from "react";
import { FiRefreshCw, FiClock, FiTrash2, FiTruck } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import useOrders from "../../hooks/useOrders";
import { UseTheme } from "../../theme/ThemeProvider";
import { listDeliveryAccounts } from "../../services/deliveryService";
import { db } from "../../services/firebase";
import { doc, updateDoc, Timestamp, arrayUnion } from "firebase/firestore";
import toast from "react-hot-toast";

export default function AdminOrders() {
  const { theme } = UseTheme();
  const isDark = theme === "dark";
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
  const [deliveryUsers, setDeliveryUsers] = useState([]);
  const [assigning, setAssigning] = useState(null);

  useEffect(() => {
    const loadDelivery = async () => {
      try {
        const list = await listDeliveryAccounts();
        setDeliveryUsers(list);
      } catch (err) {
        console.error("Failed to load delivery accounts", err);
        toast.error("Failed to load delivery accounts");
      }
    };
    loadDelivery();
  }, []);

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

  const handleAssignDelivery = async (order, driverId) => {
    if (!order?.id) return;
    setAssigning(order.id);
    const driver = deliveryUsers.find((d) => d.id === driverId);
    try {
      await updateDoc(doc(db, "orders", order.id), {
        assignedDeliveryId: driverId || null,
        deliveryId: driverId || null,
        assignedDeliveryName: driver?.name || null,
        assignedDeliveryEmail: driver?.email || null,
        assignedDeliveryPhone: driver?.phone || null,
        assignedAt: driverId ? Timestamp.now() : null,
      });
      toast.success(driverId ? "Assigned to delivery" : "Assignment cleared");
    } catch (err) {
      console.error("Assign delivery failed", err);
      toast.error(err.message || "Failed to assign");
    } finally {
      setAssigning(null);
    }
  };

  const statusColorClass = (order) => {
    const normalize = (val = "") => val.toLowerCase().replace(/[_-]+/g, " ");
    const status = normalize(order.status);
    const lastHistory = order.statusHistory?.[order.statusHistory.length - 1];
    const isCustomerConfirmed = lastHistory?.confirmedBy === "customer";

    switch (status) {
      case "pending":
        return isDark
          ? "bg-amber-500/15 text-amber-200 ring-1 ring-amber-500/40"
          : "bg-yellow-100 text-yellow-800";
      case "processing":
        return isDark
          ? "bg-blue-500/15 text-blue-200 ring-1 ring-blue-500/40"
          : "bg-blue-100 text-blue-800";
      case "shipped":
        return isDark
          ? "bg-purple-500/15 text-purple-200 ring-1 ring-purple-500/40"
          : "bg-purple-100 text-purple-800";
      case "out for delivery":
        return isDark
          ? "bg-amber-500/15 text-amber-200 ring-1 ring-amber-500/40"
          : "bg-amber-100 text-amber-800";
      case "delivered":
        return isCustomerConfirmed
          ? isDark
            ? "bg-emerald-500/15 text-emerald-200 ring-1 ring-emerald-400/60"
            : "bg-emerald-100 text-emerald-800 border-2 border-emerald-300"
          : isDark
            ? "bg-green-500/15 text-green-200 ring-1 ring-green-500/40"
            : "bg-green-100 text-green-800";
      case "canceled":
        return isDark
          ? "bg-rose-500/15 text-rose-200 ring-1 ring-rose-500/40"
          : "bg-red-100 text-red-800";
      default:
        return isDark
          ? "bg-slate-700/40 text-slate-200 ring-1 ring-slate-600/60"
          : "bg-gray-100 text-gray-700";
    }
  };

  return (
    <div className={isDark ? "text-slate-100" : "text-gray-900"}>
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <h1 className="text-3xl font-bold text-emerald-600 dark:text-emerald-300">
            Orders Dashboard
          </h1>
          <div className="flex items-center gap-3 flex-wrap">
            <button
              onClick={handleRefresh}
              className={`px-3 py-2 rounded-md border flex items-center gap-2 shadow-sm transition ${
                isDark
                  ? "bg-slate-900 border-slate-700 text-slate-100 hover:bg-slate-800"
                  : "bg-white border-gray-300 text-gray-800 hover:bg-gray-50"
              }`}
            >
              <FiRefreshCw /> {refreshing ? "Refreshing..." : "Refresh"}
            </button>
            <button
              onClick={() => setSortDesc((s) => !s)}
              className={`px-3 py-2 rounded-md border flex items-center gap-2 shadow-sm transition ${
                isDark
                  ? "bg-slate-900 border-slate-700 text-slate-100 hover:bg-slate-800"
                  : "bg-white border-gray-300 text-gray-800 hover:bg-gray-50"
              }`}
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
            className={`w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-emerald-500/40 ${
              isDark
                ? "bg-slate-900 border-slate-700 text-slate-100 placeholder:text-slate-400"
                : "bg-white border-gray-300 text-gray-800 placeholder:text-gray-500"
            }`}
          />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-6 gap-3 mb-6">
          {filters.map((status) => {
            const isActive = activeFilter === status;
            const base = isDark
              ? "bg-slate-900 border-slate-700 text-slate-100"
              : "bg-white border-gray-300 text-gray-800";
            const active = isDark
              ? "bg-emerald-600 text-slate-50 border-emerald-500"
              : "bg-emerald-600 text-white border-emerald-600";
            return (
              <button
                key={status}
                onClick={() => setActiveFilter(status)}
                className={`flex justify-between items-center gap-2 p-3 rounded-lg border shadow-sm transition ${
                  isActive ? active : base
                }`}
              >
                <span className="font-medium">{status}</span>
                <span
                  className={`px-2 py-1 rounded-lg text-sm font-semibold ${
                    isDark
                      ? "bg-emerald-500/20 text-emerald-100"
                      : "bg-emerald-100 text-emerald-800"
                  }`}
                >
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
            <div className="text-center py-10 text-rose-600 dark:text-rose-300 font-semibold">
              No orders found.
            </div>
          ) : (
            filteredOrders.map((order) => (
              <div
                key={order.id}
                className={`rounded-2xl shadow-md p-5 border ${
                  isDark
                    ? "bg-slate-900 border-slate-800"
                    : "bg-white border-emerald-100"
                }`}
              >
                <div className="flex flex-col md:flex-row justify-between gap-4">
                  <div className="flex-1">
                    <h3
                      className={`text-lg font-bold ${
                        isDark ? "text-emerald-200" : "text-green-900"
                      }`}
                    >
                      #{order.orderNumber} - {order.fullName}
                    </h3>
                    <div className="mt-2 space-y-2">
                      {order.items?.map((item) => (
                        <div
                          key={item.productId}
                          className={`flex items-center gap-3 border p-2 rounded-md ${
                            isDark
                              ? "bg-slate-900 border-slate-700"
                              : "bg-green-50 border-emerald-100"
                          }`}
                        >
                          <img
                            src={item.imageUrl || item.image || item.thumbnailUrl || item.img || "/placeholder.png"}
                            alt={item.name}
                            className="w-12 h-12 object-cover rounded"
                          />
                          <div className="flex-1">
                            <p
                              className={`font-semibold ${
                                isDark ? "text-emerald-200" : "text-green-800"
                              }`}
                            >
                              {item.name}{" "}
                              <span
                                className={`text-sm ${
                                  isDark ? "text-slate-300" : "text-gray-600"
                                }`}
                              >
                                ({item.category || "-"})
                              </span>
                            </p>
                            <p
                              className={
                                isDark
                                  ? "text-sm text-emerald-200"
                                  : "text-sm text-green-700"
                              }
                            >
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
                      <span
                        className={`font-semibold ${
                          isDark ? "text-emerald-200" : "text-green-900"
                        }`}
                      >
                        Total: {order.total} EGP
                      </span>
                      <span
                        className={`flex items-center gap-2 text-sm px-2 py-1 rounded-md ${
                          isDark
                            ? "bg-slate-800 text-slate-200"
                            : "bg-emerald-50 text-emerald-800"
                        }`}
                      >
                        <FiTruck />
                        {order.assignedDeliveryName || order.assignedDeliveryEmail
                          ? `Assigned to ${order.assignedDeliveryName || order.assignedDeliveryEmail}`
                          : "Unassigned"}
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-2 mt-3 md:mt-0 items-center flex-wrap">
                    {/* الزرار ده هيوديك لصفحة التفاصيل */}
                    <button
                      onClick={() => navigate(`/admin/orders/${order.id}`)}
                      className={`px-3 py-2 rounded-md text-sm font-semibold border transition ${
                        isDark
                          ? "bg-slate-900 border-slate-700 text-slate-100 hover:bg-slate-800"
                          : "bg-white border-gray-300 text-gray-800 hover:bg-emerald-50"
                      }`}
                    >
                      View
                    </button>

                    <select
                      value={order.status}
                      onChange={async (e) => {
                        const val = e.target.value;
                        if (
                          val === "Canceled" &&
                          ["Shipped", "Delivered", "Out for delivery"].includes(order.status)
                        ) {
                          alert("Cannot cancel shipped/delivered/out-for-delivery order");
                          return;
                        }
                        try {
                          if (val === "Canceled") {
                            const reason = window.prompt("Cancellation reason (required):");
                            if (!reason || !reason.trim()) {
                              alert("Cancellation requires a reason");
                              return;
                            }
                            await updateOrderStatus(
                              order.id,
                              val,
                              restoreStock,
                              "admin",
                              { note: reason, actorName: "Admin" }
                            );
                          } else {
                            await updateOrderStatus(
                              order.id,
                              val,
                              val === "Canceled" ? restoreStock : undefined
                            );
                          }
                        } catch (err) {
                          alert(err.message || "Failed");
                        }
                      }}
                      className={`p-2 border rounded-md ${
                        isDark
                          ? "bg-slate-900 border-slate-700 text-slate-100"
                          : "bg-white border-gray-300 text-gray-800"
                      }`}
                    >
                      {filters
                        .filter((f) => f !== "All")
                        .map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                    </select>

                    <select
                      value={order.assignedDeliveryId || ""}
                      onChange={(e) =>
                        handleAssignDelivery(order, e.target.value || null)
                      }
                      disabled={assigning === order.id}
                      className={`p-2 border rounded-md ${
                        isDark
                          ? "bg-slate-900 border-slate-700 text-slate-100"
                          : "bg-white border-gray-300 text-gray-800"
                      }`}
                    >
                      <option value="">Assign delivery</option>
                      {deliveryUsers
                        .filter((u) => u.active !== false)
                        .map((u) => (
                          <option key={u.id} value={u.id}>
                            {u.name || u.email} {u.zone ? `(${u.zone})` : ""}
                          </option>
                        ))}
                    </select>

                    <button
                      onClick={() =>
                        setSelectedOrderId(
                          selectedOrderId === order.id ? null : order.id
                        )
                      }
                      className={`p-2 rounded-md flex items-center gap-1 border shadow-sm transition ${
                        isDark
                          ? "bg-slate-800 border-slate-600 text-slate-100 hover:bg-slate-700"
                          : "bg-white border-gray-300 text-gray-800 hover:bg-gray-100"
                      }`}
                    >
                      <FiClock /> History
                    </button>

                    {/* Comment button removed from Orders Dashboard - use Order Details page to add comments */}

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
                      className={`p-2 rounded-md text-white transition ${
                        isDark
                          ? "bg-rose-600 hover:bg-rose-700"
                          : "bg-red-500 hover:bg-red-600"
                      }`}
                      title="Delete"
                    >
                      <FiTrash2 />
                    </button>
                  </div>
                </div>

                {selectedOrderId === order.id &&
                  order.statusHistory?.length > 0 && (
                    <div
                      className={`mt-3 p-3 border-t rounded-lg ${
                        isDark
                          ? "bg-slate-900 border-slate-700"
                          : "bg-green-50 border-green-200"
                      }`}
                    >
                      <h4
                        className={`font-semibold mb-2 ${
                          isDark ? "text-emerald-200" : "text-green-800"
                        }`}
                      >
                        History:
                      </h4>
                      <ul
                        className={`text-sm space-y-1 ${
                          isDark ? "text-emerald-200" : "text-green-700"
                        }`}
                      >
                        {order.statusHistory.map((h, idx) => (
                          <li key={idx}>
                            <span className="font-medium">{h.status}</span> -{" "}
                            <span>
                              {new Date(h.changedAt).toLocaleString()}
                            </span>
                            {h.note && (
                              <div className="text-sm text-slate-500 mt-1 italic">
                                Reason: {h.note}
                              </div>
                            )}
                          </li>
                        ))}
                      </ul>
                      {order.comments && order.comments.length > 0 && (
                        <div className="mt-3">
                          <h5 className={`font-semibold ${isDark?"text-emerald-200":"text-green-800"}`}>Comments</h5>
                          <ul className="mt-2 space-y-2 text-sm">
                            {order.comments.map((c, i) => (
                              <li key={i} className="border p-2 rounded-md bg-white/60 dark:bg-slate-800">
                                <div className="text-xs text-slate-500">{c.authorName || c.author} • {c.createdAt?.toDate ? new Date(c.createdAt.toDate()).toLocaleString() : (c.createdAt ? new Date(c.createdAt).toLocaleString() : "-")}</div>
                                <div className="mt-1">{c.text}</div>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
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
