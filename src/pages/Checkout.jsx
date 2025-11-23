import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { selectCurrentUser } from "../features/auth/authSlice";
import { clearCart } from "../features/cart/cartSlice";
import { createOrder } from "../services/ordersService";
import { UseTheme } from "../theme/ThemeProvider";
import { useTranslation } from "react-i18next";

const buildInitialForm = (user) => ({
  fullName: user?.name || "",
  email: user?.email || "",
  phone: "",
  addressLine1: "",
  addressLine2: "",
  city: "",
  state: "",
  postalCode: "",
  country: "Egypt",
});

const Checkout = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { theme } = UseTheme();
  const user = useSelector(selectCurrentUser);
  const items = useSelector((state) => state.cart.items);

  useEffect(() => {
    setForm((prev) => ({
      ...prev,
      fullName: user?.name || prev.fullName,
      email: user?.email || prev.email,
    }));
  }, [user]);

  const [form, setForm] = useState(() => buildInitialForm(user));
  const [errors, setErrors] = useState({});
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const summary = useMemo(() => {
    const subtotal = items.reduce(
      (sum, i) => sum + Number(i.price || 0) * (i.quantity || 1),
      0
    );
    const shipping = items.length > 0 ? 50 : 0;
    const total = subtotal + shipping;
    return { subtotal, shipping, total };
  }, [items]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validate = () => {
    const nextErrors = {};
    if (!form.fullName.trim()) nextErrors.fullName = t("checkout.errors.fullName");
    if (!form.email.trim() || !/\S+@\S+\.\S+/.test(form.email)) {
      nextErrors.email = t("checkout.errors.email");
    }
    if (!form.phone.trim() || form.phone.replace(/\D/g, "").length < 7) {
      nextErrors.phone = t("checkout.errors.phone");
    }
    if (!form.addressLine1.trim()) nextErrors.addressLine1 = t("checkout.errors.address");
    if (!form.city.trim()) nextErrors.city = t("checkout.errors.city");
    if (!form.postalCode.trim()) nextErrors.postalCode = t("checkout.errors.postalCode");
    if (!form.country.trim()) nextErrors.country = t("checkout.errors.country");
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!user) {
      toast.error(t("checkout.messages.loginRequired"));
      return;
    }
    if (!items.length) {
      toast.error(t("checkout.messages.emptyCart"));
      return;
    }
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const orderId = await createOrder({
        userId: user.uid,
        userEmail: user.email,
        userName: user.name,
        shipping: form,
        paymentMethod,
        totals: summary,
        items,
      });
      dispatch(clearCart());
      toast.success(t("checkout.messages.success"));
      navigate(`/checkout/confirmation?orderId=${orderId}`, {
        state: { orderId },
        replace: true,
      });
    } catch (error) {
      console.error(error);
      toast.error(error.message || t("checkout.messages.failure"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const surface =
    theme === "dark"
      ? "border-slate-800 bg-slate-900/70 text-slate-100"
      : "border-slate-100 bg-white text-slate-900";

  const inputClasses =
    "w-full rounded-2xl border px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 transition";

  if (!items.length) {
    return (
      <section className="mx-auto mt-20 max-w-2xl rounded-3xl border border-dashed border-emerald-200 bg-white/80 p-10 text-center shadow-sm dark:border-emerald-900/30 dark:bg-slate-900/60">
        <p className="text-xl font-semibold text-slate-800 dark:text-slate-100">
          {t("checkout.empty.title")}
        </p>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-300">
          {t("checkout.empty.subtitle")}
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <Link
            to="/products"
            className="rounded-2xl bg-emerald-500 px-5 py-2 text-sm font-semibold text-white shadow hover:bg-emerald-600"
          >
            {t("checkout.empty.cta")}
          </Link>
        </div>
      </section>
    );
  }

  if (!user) {
    return (
      <section className="mx-auto mt-20 max-w-2xl rounded-3xl border border-amber-200 bg-amber-50/80 p-10 text-center shadow-sm dark:border-amber-900/40 dark:bg-slate-900/50">
        <p className="text-lg font-semibold text-amber-900 dark:text-amber-200">
          {t("checkout.authRequired.title")}
        </p>
        <p className="mt-2 text-sm text-amber-800 dark:text-amber-200/80">
          {t("checkout.authRequired.subtitle")}
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <Link
            to="/login"
            className="rounded-2xl bg-emerald-500 px-5 py-2 text-sm font-semibold text-white shadow hover:bg-emerald-600"
          >
            {t("checkout.authRequired.cta")}
          </Link>
        </div>
      </section>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-10 dark:bg-slate-950">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 sm:px-6 lg:grid-cols-[2fr,1fr]">
        <form onSubmit={handleSubmit} className={`rounded-3xl border ${surface} p-6 shadow-sm space-y-6`}>
          <header>
            <p className="text-sm font-semibold uppercase tracking-wide text-emerald-500">
              {t("checkout.header.eyebrow")}
            </p>
            <h1 className="text-2xl font-semibold">
              {t("checkout.header.title")}
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-300">
              {t("checkout.header.subtitle")}
            </p>
          </header>

          <section className="space-y-4">
            <h2 className="text-lg font-semibold">
              {t("checkout.sections.contact")}
            </h2>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="text-sm font-medium">
                  {t("checkout.fields.fullName")}
                </label>
                <input
                  type="text"
                  name="fullName"
                  value={form.fullName}
                  onChange={handleChange}
                  className={`${inputClasses} ${errors.fullName ? "border-red-400" : "border-slate-200 dark:border-slate-700"}`}
                />
                {errors.fullName && (
                  <p className="mt-1 text-xs text-red-500">{errors.fullName}</p>
                )}
              </div>
              <div>
                <label className="text-sm font-medium">
                  {t("checkout.fields.email")}
                </label>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  className={`${inputClasses} ${errors.email ? "border-red-400" : "border-slate-200 dark:border-slate-700"}`}
                />
                {errors.email && (
                  <p className="mt-1 text-xs text-red-500">{errors.email}</p>
                )}
              </div>
            </div>
            <div>
              <label className="text-sm font-medium">
                {t("checkout.fields.phone")}
              </label>
              <input
                type="tel"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                className={`${inputClasses} ${errors.phone ? "border-red-400" : "border-slate-200 dark:border-slate-700"}`}
              />
              {errors.phone && (
                <p className="mt-1 text-xs text-red-500">{errors.phone}</p>
              )}
            </div>
          </section>
          <section className="space-y-4">
            <h2 className="text-lg font-semibold">
              {t("checkout.sections.shipping")}
            </h2>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="text-sm font-medium">
                  {t("checkout.fields.addressLine1")}
                </label>
                <input
                  type="text"
                  name="addressLine1"
                  value={form.addressLine1}
                  onChange={handleChange}
                  className={`${inputClasses} ${
                    errors.addressLine1
                      ? "border-red-400"
                      : "border-slate-200 dark:border-slate-700"
                  }`}
                />
                {errors.addressLine1 && (
                  <p className="mt-1 text-xs text-red-500">
                    {errors.addressLine1}
                  </p>
                )}
              </div>
              <div>
                <label className="text-sm font-medium">
                  {t("checkout.fields.addressLine2")}
                </label>
                <input
                  type="text"
                  name="addressLine2"
                  value={form.addressLine2}
                  onChange={handleChange}
                  className={`${inputClasses} border-slate-200 dark:border-slate-700`}
                  placeholder={t("checkout.fields.optional")}
                />
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <label className="text-sm font-medium">
                  {t("checkout.fields.city")}
                </label>
                <input
                  type="text"
                  name="city"
                  value={form.city}
                  onChange={handleChange}
                  className={`${inputClasses} ${
                    errors.city
                      ? "border-red-400"
                      : "border-slate-200 dark:border-slate-700"
                  }`}
                />
                {errors.city && (
                  <p className="mt-1 text-xs text-red-500">{errors.city}</p>
                )}
              </div>
              <div>
                <label className="text-sm font-medium">
                  {t("checkout.fields.state")}
                </label>
                <input
                  type="text"
                  name="state"
                  value={form.state}
                  onChange={handleChange}
                  className={`${inputClasses} border-slate-200 dark:border-slate-700`}
                />
              </div>
              <div>
                <label className="text-sm font-medium">
                  {t("checkout.fields.postalCode")}
                </label>
                <input
                  type="text"
                  name="postalCode"
                  value={form.postalCode}
                  onChange={handleChange}
                  className={`${inputClasses} ${
                    errors.postalCode
                      ? "border-red-400"
                      : "border-slate-200 dark:border-slate-700"
                  }`}
                />
                {errors.postalCode && (
                  <p className="mt-1 text-xs text-red-500">
                    {errors.postalCode}
                  </p>
                )}
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="text-sm font-medium">
                  {t("checkout.fields.country")}
                </label>
                <input
                  type="text"
                  name="country"
                  value={form.country}
                  onChange={handleChange}
                  className={`${inputClasses} ${
                    errors.country
                      ? "border-red-400"
                      : "border-slate-200 dark:border-slate-700"
                  }`}
                />
                {errors.country && (
                  <p className="mt-1 text-xs text-red-500">{errors.country}</p>
                )}
              </div>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-lg font-semibold">
              {t("checkout.sections.payment")}
            </h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {["cod", "card"].map((method) => (
                <label
                  key={method}
                  className={`flex cursor-pointer flex-col gap-2 rounded-2xl border px-4 py-3 text-sm ${
                    paymentMethod === method
                      ? "border-emerald-500 bg-emerald-50/50 dark:bg-emerald-900/20"
                      : "border-slate-200 dark:border-slate-700"
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
                        {method === "cod"
                          ? t("checkout.payment.cod.title")
                          : t("checkout.payment.card.title")}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {method === "cod"
                          ? t("checkout.payment.cod.subtitle")
                          : t("checkout.payment.card.subtitle")}
                      </p>
                    </div>
                  </div>
                </label>
              ))}
            </div>
          </section>

          <div className="flex flex-wrap gap-3 pt-2">
            <Link
              to="/cart"
              className="rounded-2xl border border-slate-200 px-5 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200"
            >
              {t("checkout.actions.backToCart")}
            </Link>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center rounded-2xl bg-emerald-500 px-6 py-2 text-sm font-semibold text-white shadow hover:bg-emerald-600 disabled:opacity-70"
            >
              {isSubmitting
                ? t("checkout.actions.processing")
                : t("checkout.actions.completeOrder")}
            </button>
          </div>
        </form>

        <aside className={`rounded-3xl border ${surface} p-6 shadow-sm`}>
          <h2 className="text-lg font-semibold">
            {t("checkout.summary.title")}
          </h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-300">
            {t("checkout.summary.subtitle")}
          </p>

          <div className="mt-4 space-y-4">
            {items.map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-3 rounded-2xl border border-slate-100 p-3 dark:border-slate-800"
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
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {t("checkout.summary.quantity", {
                      count: item.quantity || 1,
                    })}
                  </p>
                </div>
                <p className="text-sm font-semibold">
                  {`${Number(item.price).toLocaleString()} EGP`}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-6 space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span>{t("checkout.summary.subtotal")}</span>
              <span>{`${summary.subtotal.toLocaleString()} EGP`}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>{t("checkout.summary.shipping")}</span>
              <span>{`${summary.shipping.toLocaleString()} EGP`}</span>
            </div>
            <div className="flex items-center justify-between text-base font-semibold">
              <span>{t("checkout.summary.total")}</span>
              <span>{`${summary.total.toLocaleString()} EGP`}</span>
            </div>
          </div>

          <div className="mt-6 rounded-2xl bg-emerald-50/70 p-4 text-sm text-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-200">
            {t("checkout.summary.note")}
          </div>
        </aside>
      </div>
    </div>
  );
};

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
