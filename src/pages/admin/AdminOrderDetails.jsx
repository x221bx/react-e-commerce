import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { doc, getDoc, updateDoc, arrayUnion, Timestamp } from "firebase/firestore";
import Modal from "../../components/ui/Modal";
import { db } from "../../services/firebase";
import { FiArrowLeft } from "react-icons/fi";

export default function AdminOrderDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isCommentOpen, setIsCommentOpen] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [savingComment, setSavingComment] = useState(false);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const docRef = doc(db, "orders", id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setOrder({ id: docSnap.id, ...docSnap.data() });
        } else {
          setError("Order not found");
        }
      } catch (err) {
        console.error("Error fetching order:", err);
        setError("Failed to load order");
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [id]);

  if (loading) return <div className="p-6">Loading...</div>;
  if (error) return <div className="p-6 text-red-500">{error}</div>;
  if (!order) return <div className="p-6">No order data</div>;
  const toDate = (ts) => {
    if (!ts) return "-";
    if (ts?.toDate) return ts.toDate().toLocaleString();
    try {
      return new Date(ts).toLocaleString();
    } catch (e) {
      return String(ts);
    }
  };

  const openCommentModal = () => {
    setCommentText("");
    setIsCommentOpen(true);
  };

  const submitComment = async () => {
    if (!commentText || !commentText.trim()) return;
    setSavingComment(true);
    try {
      await updateDoc(doc(db, "orders", order.id), {
        comments: arrayUnion({ text: commentText.trim(), author: "admin", authorName: "Admin", createdAt: Timestamp.now() }),
      });
      // refresh local copy
      const docSnap = await getDoc(doc(db, "orders", order.id));
      if (docSnap.exists()) setOrder({ id: docSnap.id, ...docSnap.data() });
      setIsCommentOpen(false);
    } catch (err) {
      console.error("Add comment failed", err);
      alert("Failed to add comment");
    } finally {
      setSavingComment(false);
    }
  };
  const paymentSummary =
    order.paymentSummary ||
    order.paymentDetails?.label ||
    order.paymentMethod;
  return (
    <div className="p-6">
      <button
        onClick={() => navigate("/admin/orders")}
        className="flex items-center gap-2 mb-4 text-blue-600 hover:text-blue-800"
      >
        <FiArrowLeft /> Back to Orders
      </button>
      <h1 className="text-2xl font-bold mb-4">Order Details - {order.id}</h1>
      <div className="bg-white p-6 rounded shadow">
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <strong>Customer:</strong> {order.shipping?.fullName || order.fullName}
          </div>
        {/* Status history and cancellation reason */}
        <div className="mt-4">
          <h4 className="font-semibold mb-2">Status History</h4>
          <div className="space-y-2">
            {(order.statusHistory || []).map((h, i) => (
              <div key={i} className="p-2 rounded border bg-white">
                <div className="flex justify-between">
                  <div className="font-medium">{h.status}</div>
                  <div className="text-xs text-gray-500">{toDate(h.changedAt)}</div>
                </div>
                {h.note && <div className="text-sm text-slate-700 italic">Reason: {h.note}</div>}
                {h.actorName && <div className="text-xs text-slate-500">By: {h.actorName} ({h.actor})</div>}
              </div>
            ))}
          </div>
        </div>

        {/* Comments */}
        <div className="mt-4">
            <div className="flex items-center justify-between">
            <h4 className="font-semibold">Comments</h4>
            <button onClick={openCommentModal} className="px-3 py-1 bg-emerald-600 text-white rounded-md">Add comment</button>
          </div>
          <div className="mt-2 space-y-2">
            {(!order.comments || order.comments.length === 0) && (
              <div className="text-sm text-gray-600">No comments yet.</div>
            )}
            {(order.comments || []).map((c, idx) => (
              <div key={idx} className="p-2 border rounded bg-white">
                <div className="text-xs text-slate-500">{c.authorName || c.author} • {toDate(c.createdAt)}</div>
                <div className="mt-1">{c.text}</div>
              </div>
            ))}
          </div>
        </div>
        <Modal isOpen={isCommentOpen} onClose={() => setIsCommentOpen(false)} title="Add admin comment">
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
          <div>
            <strong>Email:</strong> {order.userEmail || order.email}
          </div>
          <div>
            <strong>Phone:</strong> {order.shipping?.phone || order.phone}
          </div>
          <div>
            <strong>Status:</strong> {order.status}
          </div>
          <div>
            <strong>Payment:</strong> {paymentSummary}
          </div>
          <div>
            <strong>Total:</strong> {order.totals?.total || order.total} EGP
          </div>
        </div>
          <div>
            <strong>Address:</strong> {order.shipping?.addressLine1 || order.address}, {order.shipping?.city || order.city}
          </div>
        {order.cancellationNote && (order.status === "Cancelled" || order.status === "Canceled") && (
          <div className="mt-4 p-3 bg-rose-50 rounded-md text-sm text-rose-700 border border-rose-200">
            <div className="font-semibold mb-1">⚠️ Order Cancelled</div>
            <div><strong>Reason:</strong> {order.cancellationNote}</div>
            {order.paymentMethod && order.paymentMethod !== "cod" && (
              <div className="mt-1 text-xs italic">
                💳 <strong>Refund:</strong> Customer's payment will be refunded to the original payment method. Please process refund within 3-5 business days.
              </div>
            )}
            {order.paymentMethod === "cod" && (
              <div className="mt-1 text-xs italic">
                💵 <strong>Cash on Delivery:</strong> No payment was processed. The delivery was cancelled due to the reason above.
              </div>
            )}
          </div>
        )}
        <div className="mt-4">
          <strong>Items:</strong>
          <ul className="mt-2">
            {order.items?.map((item, idx) => (
              <li key={item.productId || idx} className="border-b py-2">
                {item.name} - Qty: {item.quantity} - Price: {item.price} EGP
              </li>
            ))}
          </ul>
        </div>
        {order.notes && (
          <div className="mt-4">
            <strong>Notes:</strong> {order.notes}
          </div>
        )}
      </div>
    </div>
  );
}
