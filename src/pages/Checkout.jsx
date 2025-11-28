import React, { useState, useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db, auth } from "../services/firebase";
import { clearCart } from "../features/cart/cartSlice";
import useOrders from "../hooks/useOrders";
import toast from "react-hot-toast";
import Modal from "../components/ui/Modal";
import { useTranslation } from "react-i18next";

export default function Checkout() {
   const dispatch = useDispatch();
   const navigate = useNavigate();
   const { items } = useSelector((state) => state.cart);
   const { reduceStock } = useOrders();
   const user = auth.currentUser;
   const { t } = useTranslation();

   // Build initial form data
   const buildInitialForm = (user) => ({
     fullName: user?.displayName || "",
     phone: "",
     address: "",
     city: "",
     notes: "",
   });

   const [form, setForm] = useState(() => buildInitialForm(user));
   const [errors, setErrors] = useState({});
   const [formErrors, setFormErrors] = useState("");
   const [loading, setLoading] = useState(false);
   const [paymentMethod, setPaymentMethod] = useState("cod"); // COD by default
   const [showCardModal, setShowCardModal] = useState(false);
   const [cardForm, setCardForm] = useState({
     holder: "",
     number: "",
     expiry: "",
     cvv: "",
   });
   const [cardErrors, setCardErrors] = useState({});

  // Validation logic
  const validate = () => {
    const err = {};
    if (!form.fullName.trim()) err.fullName = t("checkout.errors.fullName");
    if (!/^(01)[0-9]{9}$/.test(form.phone)) err.phone = t("checkout.errors.phone");
    if (!form.address.trim()) err.address = t("checkout.errors.address");
    if (!form.city.trim()) err.city = t("checkout.errors.city");
    setErrors(err);
    return Object.keys(err).length === 0;
  };

  // Card validation
  const validateCard = () => {
    const err = {};
    if (!cardForm.holder.trim()) err.holder = t("payments.errors.holder");
    if (!/^\d{16}$/.test(cardForm.number.replace(/\s/g, ''))) err.number = t("payments.errors.number");
    if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(cardForm.expiry)) err.expiry = t("payments.errors.expiry");
    if (!/^\d{3,4}$/.test(cardForm.cvv)) err.cvv = t("payments.errors.cvv");
    setCardErrors(err);
    return Object.keys(err).length === 0;
  };

  const placeOrder = async () => {
    setLoading(true);
    try {
      // Reduce stock first
      await reduceStock(
        items.map((i) => ({ id: i.id, quantity: i.quantity ?? 0 }))
      );

      // Prepare order data
      const subtotal = items.reduce(
        (sum, i) => sum + (i.price ?? 0) * (i.quantity ?? 0),
        0
      );
      const shipping = items.length > 0 ? 50 : 0;
      const total = subtotal + shipping;

      const orderData = {
        uid: user.uid,
        userEmail: user.email,
        shipping: {
          fullName: form.fullName,
          addressLine1: form.address,
          city: form.city,
          phone: form.phone,
        },
        notes: form.notes || "",
        paymentMethod,
        items: items.map((i) => ({
          id: i.id || "unknown-id",
          name: i.name || i.title || "Unnamed Product",
          category: i.category || "—",
          quantity: i.quantity ?? 0,
          price: i.price ?? 0,
          image: i.imageUrl || i.thumbnailUrl || "",
        })),
        totals: {
          subtotal,
          shipping,
          total,
        },
        status: "Pending",
        statusHistory: [
          { status: "Pending", changedAt: new Date().toISOString() },
        ],
        createdAt: serverTimestamp(),
      };

      // Add order to Firebase
      const docRef = await addDoc(collection(db, "orders"), orderData);

      dispatch(clearCart());
      alert(t("checkout.messages.success"));
      navigate(`/order-confirmation?orderId=${docRef.id}`);
    } catch (err) {
      console.error("Checkout error:", err);
      alert(t("checkout.messages.failure"));
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setFormErrors("");
    if (!user) {
      alert(t("checkout.messages.loginRequired"));
      return;
    }
    if (!items.length) {
      alert(t("checkout.messages.emptyCart"));
      return;
    }
    if (!validate()) {
      setFormErrors(Object.values(errors).join(', '));
      return;
    }

    if (paymentMethod === "card") {
      setShowCardModal(true);
      return;
    }

    await placeOrder();
  };

  const handleCardSubmit = async (event) => {
    event.preventDefault();
    if (!validateCard()) return;
    setShowCardModal(false);
    await placeOrder();
  };

  // Summary calculations
  const summary = useMemo(() => {
    const subtotal = items.reduce(
      (sum, i) => sum + (i.price ?? 0) * (i.quantity ?? 0),
      0
    );
    const shipping = items.length > 0 ? 50 : 0;
    const total = subtotal + shipping;
    return { subtotal, shipping, total };
  }, [items]);

  const inputClasses =
    "w-full rounded-2xl border px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 transition";

  if (!items.length) {
    return (
      <section className="mx-auto mt-20 max-w-2xl rounded-3xl border border-dashed border-emerald-200 bg-white/80 p-10 text-center shadow-sm">
        <p className="text-xl font-semibold text-slate-800">
          Your cart is empty
        </p>
        <p className="mt-2 text-sm text-slate-500">
          Please add some products first.
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <Link
            to="/products"
            className="rounded-2xl bg-emerald-500 px-5 py-2 text-sm font-semibold text-white shadow hover:bg-emerald-600"
          >
            Go to Products
          </Link>
        </div>
      </section>
    );
  }

  if (!user) {
    return (
      <section className="mx-auto mt-20 max-w-2xl rounded-3xl border border-amber-200 bg-amber-50/80 p-10 text-center shadow-sm">
        <p className="text-lg font-semibold text-amber-900">
          You need to login
        </p>
        <p className="mt-2 text-sm text-amber-800">
          Please login to complete your order.
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <Link
            to="/login"
            className="rounded-2xl bg-emerald-500 px-5 py-2 text-sm font-semibold text-white shadow hover:bg-emerald-600"
          >
            Login
          </Link>
        </div>
      </section>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-10">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 sm:px-6 lg:grid-cols-[2fr,1fr]">
        <form className="rounded-3xl border bg-white p-6 shadow-sm space-y-6">
          <header>
            <h1 className="text-2xl font-semibold">{t("checkout.header.title")}</h1>
          </header>
          {formErrors && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {formErrors}
            </div>
          )}

          {/* Contact Info */}
          <section className="space-y-4">
            <h2 className="text-lg font-semibold">{t("checkout.sections.contact")}</h2>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="text-sm font-medium">{t("checkout.fields.fullName")}</label>
                <input
                  type="text"
                  value={form.fullName}
                  onChange={(e) =>
                    setForm({ ...form, fullName: e.target.value })
                  }
                  className={`${inputClasses} ${
                    errors.fullName ? "border-red-400" : "border-slate-200"
                  }`}
                />
                {errors.fullName && (
                  <p className="mt-1 text-xs text-red-500">{errors.fullName}</p>
                )}
              </div>
              <div>
                <label className="text-sm font-medium">{t("checkout.fields.phone")}</label>
                <input
                  type="tel"
                  inputMode="numeric"
                  maxLength={11}
                  value={form.phone}
                  onChange={(e) => {
                    const digitsOnly = e.target.value.replace(/\D/g, "").slice(0, 11);
                    setForm({ ...form, phone: digitsOnly });
                  }}
                  className={`${inputClasses} ${
                    errors.phone ? "border-red-400" : "border-slate-200"
                  }`}
                />
                {errors.phone && (
                  <p className="mt-1 text-xs text-red-500">{errors.phone}</p>
                )}
              </div>
            </div>
          </section>

          {/* Shipping Info */}
          <section className="space-y-4">
            <h2 className="text-lg font-semibold">{t("checkout.sections.shipping")}</h2>
            <div className="grid gap-4">
              <div>
                <label className="text-sm font-medium">{t("checkout.fields.addressLine1")}</label>
                <input
                  type="text"
                  value={form.address}
                  onChange={(e) =>
                    setForm({ ...form, address: e.target.value })
                  }
                  className={`${inputClasses} ${
                    errors.address ? "border-red-400" : "border-slate-200"
                  }`}
                />
                {errors.address && (
                  <p className="mt-1 text-xs text-red-500">{errors.address}</p>
                )}
              </div>
              <div>
                <label className="text-sm font-medium">{t("checkout.fields.city")}</label>
                <input
                  type="text"
                  value={form.city}
                  onChange={(e) => setForm({ ...form, city: e.target.value })}
                  className={`${inputClasses} ${
                    errors.city ? "border-red-400" : "border-slate-200"
                  }`}
                />
                {errors.city && (
                  <p className="mt-1 text-xs text-red-500">{errors.city}</p>
                )}
              </div>
              <div>
                <label className="text-sm font-medium">{t("checkout.fields.notes", "Notes (optional)")}</label>
                <textarea
                  rows="3"
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  className={inputClasses}
                ></textarea>
              </div>
            </div>
          </section>

          {/* Payment Method */}
          <section className="space-y-4">
            <h2 className="text-lg font-semibold">{t("checkout.sections.payment")}</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {["cod", "card"].map((method) => (
                <label
                  key={method}
                  className={`flex cursor-pointer flex-col gap-2 rounded-2xl border px-4 py-3 text-sm ${
                    paymentMethod === method
                      ? "border-emerald-500 bg-emerald-50/50"
                      : "border-slate-200"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="payment"
                      checked={paymentMethod === method}
                      onChange={() => setPaymentMethod(method)}
                    />
                    <div>
                      <p className="font-semibold">
                        {method === "cod" ? t("checkout.payment.cod.title") : t("checkout.payment.card.title")}
                      </p>
                      <p className="text-xs text-slate-500">
                        {method === "cod" ? t("checkout.payment.cod.subtitle") : t("checkout.payment.card.subtitle")}
                      </p>
                    </div>
                  </div>
                </label>
              ))}
            </div>
          </section>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3 pt-2">
            <Link
              to="/cart"
              className="rounded-2xl border border-slate-200 px-5 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50"
            >
              Back to Cart
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center rounded-2xl bg-emerald-500 px-6 py-2 text-sm font-semibold text-white shadow hover:bg-emerald-600 disabled:opacity-70"
            >
              {loading ? "Processing..." : "Confirm Order"}
            </button>
          </div>
        </form>

        {/* Order Summary (Sidebar on large screens, full width on mobile) */}
        <aside className="rounded-3xl border bg-white p-6 shadow-sm lg:block hidden">
          <h2 className="text-lg font-semibold">Order Summary</h2>
          <div className="mt-4 space-y-4">
            {items.map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-3 rounded-2xl border border-slate-100 p-3"
              >
                <img
                  src={item.thumbnailUrl || item.img}
                  alt={item.name || item.title}
                  className="h-16 w-16 rounded-xl object-cover"
                />
                <div className="flex-1">
                  <p className="text-sm font-semibold">
                    {item.name || item.title}
                  </p>
                  <p className="text-xs text-slate-500">
                    Qty: {item.quantity ?? 1}
                  </p>
                </div>
                <p className="text-sm font-semibold">{`${Number(
                  item.price
                ).toLocaleString()} EGP`}</p>
              </div>
            ))}
          </div>

          <div className="mt-6 space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span>Subtotal</span>
              <span>{`${summary.subtotal.toLocaleString()} EGP`}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Shipping</span>
              <span>{`${summary.shipping.toLocaleString()} EGP`}</span>
            </div>
            <div className="flex items-center justify-between text-base font-semibold">
              <span>Total</span>
              <span>{`${summary.total.toLocaleString()} EGP`}</span>
            </div>
          </div>
        </aside>

        {/* Mobile Order Details (visible only on small screens) */}
        <div className="lg:hidden mt-6">
          <h2 className="text-lg font-semibold mb-2">Order Summary</h2>
          {items.map((item) => (
            <div
              key={item.id}
              className="flex items-center gap-3 rounded-2xl border border-slate-100 p-3 mb-2"
            >
              <img
                src={item.thumbnailUrl || item.img}
                alt={item.name || item.title}
                className="h-16 w-16 rounded-xl object-cover"
              />
              <div className="flex-1">
                <p className="text-sm font-semibold">
                  {item.name || item.title}
                </p>
                <p className="text-xs text-slate-500">
                  Qty: {item.quantity ?? 1}
                </p>
              </div>
              <p className="text-sm font-semibold">{`${Number(
                item.price
              ).toLocaleString()} EGP`}</p>
            </div>
          ))}
          <div className="mt-4 flex justify-between font-semibold">
            <span>Total:</span>
            <span>{`${summary.total.toLocaleString()} EGP`}</span>
          </div>
        </div>

        {showCardModal && (
          <Modal isOpen={showCardModal} onClose={() => setShowCardModal(false)}>
            <div className="p-6">
              <h2 className="text-lg font-semibold mb-4">{t("payments.form.cardTitle")}</h2>
              <form onSubmit={handleCardSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium">{t("payments.form.cardHolder")}</label>
                  <input
                    type="text"
                    value={cardForm.holder}
                    onChange={(e) => setCardForm({ ...cardForm, holder: e.target.value })}
                    className={`w-full border px-3 py-2 rounded ${cardErrors.holder ? 'border-red-500' : 'border-gray-300'}`}
                  />
                  {cardErrors.holder && <p className="text-red-500 text-xs">{cardErrors.holder}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium">{t("payments.form.cardNumber")}</label>
                  <input
                    type="text"
                    value={cardForm.number}
                    onChange={(e) => setCardForm({ ...cardForm, number: e.target.value })}
                    className={`w-full border px-3 py-2 rounded ${cardErrors.number ? 'border-red-500' : 'border-gray-300'}`}
                  />
                  {cardErrors.number && <p className="text-red-500 text-xs">{cardErrors.number}</p>}
                </div>
                <div className="flex gap-4">
                  <div className="flex-1">
                    <label className="block text-sm font-medium">{t("payments.form.expiry")}</label>
                    <input
                      type="text"
                      placeholder={t("payments.expPlaceholder")}
                      value={cardForm.expiry}
                      onChange={(e) => setCardForm({ ...cardForm, expiry: e.target.value })}
                      className={`w-full border px-3 py-2 rounded ${cardErrors.expiry ? 'border-red-500' : 'border-gray-300'}`}
                    />
                    {cardErrors.expiry && <p className="text-red-500 text-xs">{cardErrors.expiry}</p>}
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm font-medium">{t("payments.form.cvv")}</label>
                    <input
                      type="text"
                      value={cardForm.cvv}
                      onChange={(e) => setCardForm({ ...cardForm, cvv: e.target.value })}
                      className={`w-full border px-3 py-2 rounded ${cardErrors.cvv ? 'border-red-500' : 'border-gray-300'}`}
                    />
                    {cardErrors.cvv && <p className="text-red-500 text-xs">{cardErrors.cvv}</p>}
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <button type="button" onClick={() => setShowCardModal(false)} className="px-4 py-2 border rounded">{t("common.cancel")}</button>
                  <button type="submit" className="px-4 py-2 bg-emerald-500 text-white rounded">{t("checkout.actions.completeOrder")}</button>
                </div>
              </form>
            </div>
          </Modal>
        )}
      </div>
    </div>
  );
};
