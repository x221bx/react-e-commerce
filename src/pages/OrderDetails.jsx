// src/pages/OrderDetails.jsx
import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { doc, onSnapshot, updateDoc } from "firebase/firestore";
import { db } from "../services/firebase";

import {
  FiPackage,
  FiMapPin,
  FiClock,
  FiTruck,
  FiCheckCircle,
  FiArrowLeft,
  FiCalendar,
  FiLayers,
} from "react-icons/fi";

export default function OrderDetails() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);

  // Convert ANY Firestore / JS time format → Date object
  const toDateObj = (ts) => {
    if (!ts) return null;

    if (typeof ts === "object" && ts.seconds) {
      return new Date(ts.seconds * 1000);
    }

    if (typeof ts === "string") return new Date(ts);

    if (typeof ts === "number") return new Date(ts);

    return null;
  };

  // Format date only
  const formatDateOnly = (ts) => {
    const d = toDateObj(ts);
    if (!d) return "";
    return d.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  // Format time only
  const formatTimeOnly = (ts) => {
    const d = toDateObj(ts);
    if (!d) return "";
    return d.toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  useEffect(() => {
    if (!id) return;

    const unsub = onSnapshot(doc(db, "orders", id), (snap) => {
      if (snap.exists()) {
        setOrder({ id: snap.id, ...snap.data() });
      }
      setLoading(false);
    });

    return () => unsub();
  }, [id]);

  const cancelOrder = async () => {
    if (!order) return;
    if (!window.confirm("Are you sure you want to cancel this order?")) return;

    try {
      setCancelling(true);
      const orderRef = doc(db, "orders", order.id);
      await updateDoc(orderRef, {
        status: "Cancelled",
        statusHistory: [
          ...(order.statusHistory || []),
          { status: "Cancelled", changedAt: new Date() },
        ],
      });
      setCancelling(false);
      alert("Order cancelled successfully.");
    } catch (err) {
      console.error("Cancel order error:", err);
      setCancelling(false);
      alert("Failed to cancel order.");
    }
  };

  if (loading)
    return (
      <div className="text-center py-10 text-green-800 text-lg">
        Loading order...
      </div>
    );

  if (!order)
    return (
      <div className="text-center py-10 text-red-600 font-semibold">
        Order not found.
      </div>
    );

  return (
    <div className="max-w-3xl mx-auto py-10 px-4">
      {/* Back */}
      <Link
        to="/orders"
        className="flex items-center text-green-700 hover:text-green-900 mb-6 font-medium"
      >
        <FiArrowLeft className="mr-2" /> Back to My Orders
      </Link>

      {/* Title */}
      <h1 className="text-3xl font-bold text-green-800 flex items-center gap-2">
        <FiPackage /> Order Details
      </h1>

      <div className="mt-6 bg-white shadow-lg rounded-xl p-6 border border-green-100">
        {/* Header */}
        <div className="mb-6 border-b pb-3">
          <h2 className="text-xl font-semibold text-green-700">
            Order #{order.orderNumber || order.id}
          </h2>

          {/* Date + Time */}
          <div className="flex items-center gap-4 mt-2 text-gray-700 text-sm">
            <div className="flex items-center gap-1">
              <FiCalendar className="text-green-700" />
              <b>Date:</b> {formatDateOnly(order.createdAt)}
            </div>

            <div className="flex items-center gap-1">
              <FiClock className="text-green-700" />
              <b>Time:</b> {formatTimeOnly(order.createdAt)}
            </div>
          </div>

          <p className="text-gray-700 font-semibold mt-3">
            Status:
            <span className="ml-2 px-3 py-1 rounded-full text-sm bg-green-100 text-green-700">
              {order.status}
            </span>
          </p>

          {/* Cancel Order Button */}
          {order.status !== "Shipped" &&
            order.status !== "Delivered" &&
            order.status !== "Cancelled" && (
              <button
                onClick={cancelOrder}
                disabled={cancelling}
                className="mt-3 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition disabled:opacity-50"
              >
                {cancelling ? "Cancelling..." : "Cancel Order"}
              </button>
            )}
        </div>

        {/* Address */}
        <div className="mb-6">
          <h3 className="flex items-center gap-2 text-lg font-bold text-green-700">
            <FiMapPin /> Delivery Address
          </h3>
          <p className="text-gray-700 mt-1">{order.address}</p>
        </div>

        {/* Items */}
        <div className="mb-6">
          <h3 className="flex items-center gap-2 text-lg font-bold text-green-700">
            <FiTruck /> Items
          </h3>

          <div className="space-y-3 mt-3">
            {order.items?.map((item, i) => (
              <div
                key={i}
                className="p-4 bg-green-50 rounded-xl border border-green-200 flex gap-4"
              >
                <img
                  src={item.imageUrl}
                  className="w-16 h-16 rounded-lg object-cover border"
                  alt={item.name}
                />

                <div className="flex-1">
                  <p className="font-semibold text-green-900 text-lg">
                    {item.name}
                  </p>

                  {/* Category */}
                  <div className="flex items-center gap-1 text-sm text-green-700 mt-1">
                    <FiLayers />
                    <span>{item.category || "Uncategorized"}</span>
                  </div>

                  <p className="text-gray-700 text-sm mt-1">
                    Qty: {item.quantity} × {item.price} EGP
                  </p>
                </div>

                <div className="text-right font-bold text-green-900">
                  {(item.quantity * item.price).toFixed(2)} EGP
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Total */}
        <div className="text-right mt-4 border-t pt-3">
          <p className="text-2xl font-bold text-green-900">
            Total: {order.total || order.totalprice} EGP
          </p>
        </div>

        {/* Status Timeline */}
        <div className="mt-10">
          <h3 className="flex items-center gap-2 text-lg font-bold text-green-700">
            <FiClock /> Status Timeline
          </h3>

          <div className="mt-4 pl-4 border-l-4 border-green-300 space-y-6">
            {order.statusHistory?.map((h, i) => (
              <div key={i} className="flex gap-4 relative">
                <FiCheckCircle className="text-green-600 text-xl absolute -left-6 top-1" />

                <div>
                  <p className="font-semibold text-green-900">{h.status}</p>

                  <div className="text-gray-600 text-sm mt-1">
                    <div>
                      <b>Date:</b> {formatDateOnly(h.changedAt)}
                    </div>
                    <div>
                      <b>Time:</b> {formatTimeOnly(h.changedAt)}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
