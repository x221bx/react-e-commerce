import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../services/firebase";
import { FiArrowLeft } from "react-icons/fi";

export default function AdminOrderDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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
            <strong>Payment:</strong> {order.paymentMethod}
          </div>
          <div>
            <strong>Total:</strong> {order.totals?.total || order.total} EGP
          </div>
        </div>
        <div>
          <strong>Address:</strong> {order.shipping?.addressLine1 || order.address}, {order.shipping?.city || order.city}
        </div>
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