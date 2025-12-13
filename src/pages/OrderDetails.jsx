// src/pages/OrderDetails.jsx
import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { doc, onSnapshot, updateDoc, arrayUnion, Timestamp } from "firebase/firestore";
import Modal from "../components/ui/Modal";
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
import { useTranslation } from "react-i18next";
import { RiChatSmileLine } from "react-icons/ri";
import Footer from "../Authcomponents/Footer";
import { ensureProductLocalization, getLocalizedProductTitle } from "../utils/productLocalization";

export default function OrderDetails() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);
  const [isCommentOpen, setIsCommentOpen] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [savingComment, setSavingComment] = useState(false);

  const { i18n } = useTranslation();
  const isRTL = i18n.language === "ar";
  const lang = i18n.language || "en";

  // Convert ANY Firestore / JS time format → Date object
  const toDateObj = (ts) => {
    if (!ts) return null;
    if (typeof ts === "object" && ts.seconds)
      return new Date(ts.seconds * 1000);
    if (typeof ts === "string") return new Date(ts);
    if (typeof ts === "number") return new Date(ts);
    return null;
  };

  const formatDateOnly = (ts) => {
    const d = toDateObj(ts);
    if (!d) return "";
    return d.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

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
      if (snap.exists()) setOrder({ id: snap.id, ...snap.data() });
      setLoading(false);
    });
    return () => unsub();
  }, [id]);

  const cancelOrder = async () => {
    if (!order) return;
    if (!window.confirm("Are you sure you want to cancel this order?")) return;
    const reason = window.prompt("Cancellation reason (required):");
    if (!reason || !reason.trim()) {
      alert("Cancellation requires a reason");
      return;
    }
    try {
      setCancelling(true);
      const orderRef = doc(db, "orders", order.id);
      const now = Timestamp.now ? Timestamp.now() : new Date();
      await updateDoc(orderRef, {
        status: "Cancelled",
        statusHistory: [
          ...(order.statusHistory || []),
          { status: "Cancelled", changedAt: now, note: reason, actor: "admin", actorName: "Admin" },
        ],
        cancellationNote: reason,
        cancellationBy: "admin",
        cancellationAt: now,
      });
      setCancelling(false);
      alert("Order cancelled successfully.");
    } catch (err) {
      console.error(err);
      setCancelling(false);
      alert("Failed to cancel order.");
    }
  };

  const addComment = async () => {
    // deprecated: use modal flow
    return;
  };
  const openCommentModal = () => {
    setCommentText("");
    setIsCommentOpen(true);
  };

  const submitComment = async () => {
    if (!order) return;
    if (!commentText || !commentText.trim()) return;
    setSavingComment(true);
    try {
      await updateDoc(doc(db, "orders", order.id), {
        comments: arrayUnion({ text: commentText.trim(), author: "admin", authorName: "Admin", createdAt: Timestamp.now() }),
      });
      setIsCommentOpen(false);
    } catch (err) {
      console.error("Add comment failed", err);
      alert("Failed to add comment");
    } finally {
      setSavingComment(false);
    }
  };

  // Status Steps for timeline
  const statusSteps = [
    "Placed",
    "Confirmed",
    "Shipped",
    "Delivered",
    "Cancelled",
  ];
  const currentStepIndex = order
    ? statusSteps.findIndex((s) => s === order.status)
    : -1;

  // Skeleton Loader Component
  const Skeleton = ({ className }) => (
    <div className={`animate-pulse bg-gray-200 rounded ${className}`}></div>
  );

  if (loading)
    return (
      <div dir={isRTL ? "rtl" : "ltr"} className="max-w-5xl mx-auto py-10 px-4">
        <Skeleton className="h-6 w-32 mb-4" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
        <Skeleton className="h-6 w-48 mb-4" />
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full rounded-xl" />
          ))}
        </div>
      </div>
    );

  if (!order)
    return (
      <div dir={isRTL ? "rtl" : "ltr"} className="min-h-screen flex items-center justify-center text-red-600 font-semibold">
        Order not found.
      </div>
    );

  const orderItems = (order.items || []).map((item) =>
    ensureProductLocalization(item)
  );

  return (
    <div dir={isRTL ? "rtl" : "ltr"} className="max-w-5xl mx-auto py-10 px-4">
      {/* Breadcrumb */}
      <div className="flex items-center text-sm text-gray-500 mb-6">
        <Link
          to="/admin/AdminOrders"
          className="hover:underline flex items-center gap-1"
        >
          <FiArrowLeft /> Back to Orders
        </Link>
      </div>

      {/* Title */}
      <h1 className="text-3xl font-bold text-green-800 flex items-center gap-2 mb-6">
        <FiPackage /> Order #{order.orderNumber || order.id}
      </h1>

      {/* Order Info Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="bg-white p-5 rounded-xl shadow border border-green-100 hover:shadow-lg transition">
          <h3 className="text-lg font-semibold text-green-700 flex items-center gap-2">
            <FiCalendar /> Date & Time
          </h3>
          <p className="text-gray-700 mt-2">
            {formatDateOnly(order.createdAt)} -{" "}
            {formatTimeOnly(order.createdAt)}
          </p>
        </div>

        <div className="bg-white p-5 rounded-xl shadow border border-green-100 hover:shadow-lg transition">
          <h3 className="text-lg font-semibold text-green-700 flex items-center gap-2">
            <FiMapPin /> Delivery Address
          </h3>
          <p className="text-gray-700 mt-2">{order.address}</p>
        </div>

        <div className="bg-white p-5 rounded-xl shadow border border-green-100 flex flex-col justify-between hover:shadow-lg transition">
          <div>
            <h3 className="text-lg font-semibold text-green-700 flex items-center gap-2">
              <FiClock /> Status
            </h3>
            <span
              className={`inline-block mt-2 px-3 py-1 rounded-full text-sm font-medium ${order.status === "Cancelled"
                  ? "bg-red-100 text-red-700"
                  : "bg-green-100 text-green-700"
                }`}
            >
              {order.status}
            </span>
            {order.cancellationNote && (order.status === "Cancelled" || order.status === "Canceled") && (
              <div className="mt-2 p-3 bg-rose-50 rounded-md text-sm text-rose-700">
                <strong>Cancellation reason:</strong> {order.cancellationNote}
              </div>
            )}
          </div>
          {order.status !== "Shipped" &&
            order.status !== "Delivered" &&
            order.status !== "Cancelled" && (
              <button
                onClick={cancelOrder}
                disabled={cancelling}
                className="mt-4 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition disabled:opacity-50"
              >
                {cancelling ? "Cancelling..." : "Cancel Order"}
              </button>
            )}
        </div>
      </div>

      {/* Status Timeline */}
      <div className="mb-10">
        <h3 className="text-lg font-bold text-green-700 flex items-center gap-2 mb-4">
          <FiClock /> Order Progress
        </h3>
        <div className="flex items-center gap-6 overflow-x-auto">
          {statusSteps.map((step, i) => {
            const isActive = i <= currentStepIndex;
            return (
              <div key={i} className="flex flex-col items-center relative">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${isActive ? "bg-green-600" : "bg-gray-300"
                    }`}
                >
                  {i + 1}
                </div>
                <span
                  className={`mt-2 text-xs ${isActive ? "text-green-700" : "text-gray-400"
                    }`}
                >
                  {step}
                </span>
                {i < statusSteps.length - 1 && (
                  <div
                    className={`absolute top-3 left-10 w-16 h-1 ${i < currentStepIndex ? "bg-green-600" : "bg-gray-300"
                      }`}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>
      {/* Status History + notes */}
      <div className="mb-10">
        <h3 className="text-lg font-bold text-green-700 flex items-center gap-2 mb-4">
          <FiClock /> Status History
        </h3>
        <div className="space-y-3">
          {(order.statusHistory || []).map((h, idx) => (
            <div key={idx} className="p-3 rounded-lg border bg-white">
              <div className="flex items-center justify-between">
                <div className="font-semibold">{h.status}</div>
                <div className="text-sm text-gray-600">{formatDateOnly(h.changedAt)} {formatTimeOnly(h.changedAt)}</div>
              </div>
              {h.note && <div className="mt-2 text-sm text-slate-700 italic">Reason: {h.note}</div>}
              {h.actorName && <div className="mt-1 text-xs text-slate-500">By: {h.actorName} ({h.actor || "system"})</div>}
            </div>
          ))}
        </div>
      </div>

      {/* Admin comments section */}
      <div className="mb-10">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-bold text-green-700">Comments</h3>
          <div>
            <button onClick={openCommentModal} className="px-3 py-2 bg-emerald-600 text-white rounded-md">Add comment</button>
          </div>
        </div>
        {(!order.comments || order.comments.length === 0) ? (
          <div className="p-4 rounded-lg border bg-green-50 text-sm text-gray-700">No comments yet.</div>
        ) : (
          <div className="space-y-3">
            {order.comments.map((c, i) => (
              <div key={i} className="p-3 rounded-lg border bg-white">
                <div className="text-xs text-slate-500">{c.authorName || c.author} • {c.createdAt?.toDate ? new Date(c.createdAt.toDate()).toLocaleString() : (c.createdAt ? new Date(c.createdAt).toLocaleString() : "-")}</div>
                <div className="mt-1">{c.text}</div>
              </div>
            ))}
          </div>
        )}
        <Modal isOpen={isCommentOpen} onClose={() => setIsCommentOpen(false)} title="Add comment">
          <div>
            <textarea
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              rows={5}
              className="w-full rounded-xl border px-3 py-2 text-sm"
              placeholder="Write your comment here..."
            />
            <div className="mt-4 flex items-center justify-end gap-2">
              <button onClick={() => setIsCommentOpen(false)} className="px-3 py-2 rounded-xl border">Cancel</button>
              <button onClick={submitComment} disabled={savingComment} className="px-3 py-2 rounded-xl bg-emerald-600 text-white">{savingComment ? 'Saving...' : 'Add comment'}</button>
            </div>
          </div>
        </Modal>
      </div>

      {/* Product Grid */}
      <div className="bg-white p-5 rounded-xl shadow border border-green-100 mb-10">
        <h3 className="text-lg font-bold text-green-700 flex items-center gap-2 mb-4">
          <FiTruck /> Items
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {orderItems?.map((item, i) => (
            <div
              key={i}
              className="flex gap-4 border rounded-xl p-4 bg-green-50 hover:bg-green-100 transition"
            >
              <img
                src={item.imageUrl || item.image || item.thumbnailUrl || item.img || "/placeholder.png"}
                alt={getLocalizedProductTitle(item, lang)}
                className="w-20 h-20 rounded-lg object-cover"
              />
              <div className="flex-1">
                <p className="font-semibold text-green-900">
                  {getLocalizedProductTitle(item, lang)}
                </p>
                <p className="text-sm text-green-700 flex items-center gap-1">
                  <FiLayers /> {item.category || item.categoryName || "Uncategorized"}
                </p>
                <p className="text-gray-700 mt-1 text-sm">
                  Qty: {item.quantity} × {item.price} EGP
                </p>
              </div>
              <div className="font-bold text-green-900 text-right">
                {(item.quantity * item.price).toFixed(2)} EGP
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Total Summary */}
      <div className="bg-white p-5 rounded-xl shadow border border-green-100 mb-10 max-w-sm ml-auto">
        <h3 className="text-lg font-bold text-green-700 mb-4">Order Summary</h3>
        <div className="flex justify-between text-gray-700 mb-2">
          <span>Subtotal:</span>
          <span>{order.total || order.totalprice} EGP</span>
        </div>
        {order.shipping && (
          <div className="flex justify-between text-gray-700 mb-2">
            <span>Shipping:</span>
            <span>{order.shipping} EGP</span>
          </div>
        )}
        {order.tax && (
          <div className="flex justify-between text-gray-700 mb-2">
            <span>Tax:</span>
            <span>{order.tax} EGP</span>
          </div>
        )}
        <div className="flex justify-between font-bold text-green-900 text-lg mt-4">
          <span>Total:</span>
          <span>{order.total || order.totalprice} EGP</span>
        </div>
      </div>

      {/* Support / Chat */}
      <div className="fixed bottom-5 right-5">
        <button className="bg-green-600 hover:bg-green-700 text-white p-4 rounded-full shadow-lg flex items-center justify-center">
          <RiChatSmileLine size={24} />
        </button>
      </div>

      <Footer />
    </div>
  );
}
