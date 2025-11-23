import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db, auth } from "../services/firebase";
import { finalizeOrderLocal } from "../features/cart/cartSlice";
import useOrders from "../hooks/useOrders";

export default function Checkout() {
  const { items } = useSelector((state) => state.cart);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { reduceStock } = useOrders();

  const [form, setForm] = useState({
    fullName: "",
    phone: "",
    address: "",
    city: "",
    notes: "",
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const user = auth.currentUser;

  const validate = () => {
    const err = {};
    if (!form.fullName.trim()) err.fullName = "Full name is required";
    if (!/^(01)[0-9]{9}$/.test(form.phone)) err.phone = "Invalid phone number";
    if (!form.address.trim()) err.address = "Address is required";
    if (!form.city.trim()) err.city = "City is required";

    setErrors(err);
    return Object.keys(err).length === 0;
  };

  const handleConfirm = async () => {
    if (!validate()) return;
    if (!user) return alert("User not logged in");

    setLoading(true);
    try {
      console.log("ITEMS BEFORE ORDER:", items);

      await reduceStock(
        items.map((i) => ({ id: i.id, quantity: i.quantity ?? 0 }))
      );

      const orderData = {
        uid: user.uid, // 🟢 مهم
        email: user.email, // 🟢 اختياري لكن مفيد
        fullName: form.fullName,
        phone: form.phone,
        address: form.address,
        city: form.city,
        notes: form.notes || "",
        items: items.map((i) => ({
          productId: i.id || "unknown-id",
          name: i.name || "Unknown product",
          category: i.category || "—",
          quantity: i.quantity ?? 0,
          price: i.price ?? 0,
          imageUrl: i.imageUrl || i.thumbnailUrl || "",
        })),
        total: items.reduce(
          (sum, i) => sum + (i.price ?? 0) * (i.quantity ?? 0),
          0
        ),
        status: "Pending",
        statusHistory: [
          { status: "Pending", changedAt: new Date().toISOString() },
        ],
        createdAt: serverTimestamp(),
      };

      console.log("ORDER DATA:", orderData);

      await addDoc(collection(db, "orders"), orderData);
      dispatch(finalizeOrderLocal());
      navigate("/success");
    } catch (err) {
      console.error("Checkout error:", err);
      alert("Failed to place order. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f5fff5] p-6">
      <div className="max-w-3xl mx-auto bg-white p-8 rounded-2xl shadow">
        <h1 className="text-3xl font-bold mb-6">Checkout</h1>

        <div className="space-y-5">
          {["fullName", "phone", "address", "city"].map((field) => (
            <div key={field}>
              <label className="font-medium">
                {field.replace(/([A-Z])/g, " $1")}
              </label>
              <input
                type="text"
                className="w-full p-3 border rounded mt-1"
                value={form[field]}
                onChange={(e) => setForm({ ...form, [field]: e.target.value })}
              />
              {errors[field] && (
                <p className="text-red-500 text-sm">{errors[field]}</p>
              )}
            </div>
          ))}

          <div>
            <label className="font-medium">Notes (optional)</label>
            <textarea
              className="w-full p-3 border rounded mt-1"
              rows="3"
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
            ></textarea>
          </div>
        </div>

        <button
          className="mt-6 w-full bg-green-600 text-white py-3 rounded text-lg font-semibold"
          onClick={handleConfirm}
          disabled={loading}
        >
          {loading ? "Processing..." : "Confirm Order"}
        </button>
      </div>
    </div>
  );
}
