import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import Modal from "../components/ui/Modal";
import { clearCart } from "../features/cart/cartSlice";
import { selectCurrentUser } from "../features/auth/authSlice";
import { createOrder } from "../services/ordersService";
import { auth, db } from "../services/firebase";
import { collection, doc, getDoc, getDocs, query, orderBy } from "firebase/firestore";

const phoneRegex = /^(01)[0-9]{9}$/;

const normalizePhone = (value = "") => value.replace(/\D/g, "").slice(0, 11);

const formatSavedMethod = (method) => {
  if (!method) return "";
  if (method.type === "card") {
    const brand = method.brand
      ? method.brand.charAt(0).toUpperCase() + method.brand.slice(1)
      : "Card";
    return `${brand} •••• ${method.last4 || "----"}`;
  }
  if (method.type === "wallet") {
    const provider = method.provider
      ? method.provider.charAt(0).toUpperCase() + method.provider.slice(1)
      : "Wallet";
    return `${provider} (${method.email})`;
  }
  return method.nickname || "Saved method";
};

const buildInitialForm = (user) => {
  const phone =
    user?.phone ||
    user?.phoneNumber ||
    user?.profile?.phone ||
    user?.profileForm?.phone ||
    "";
  return {
    fullName: user?.name || user?.displayName || "",
    phone: normalizePhone(phone),
    address: "",
    city: "",
    notes: "",
  };
};

export default function Checkout() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const cartItems = useSelector((state) => state.cart.items || []);
  const storeUser = useSelector(selectCurrentUser);
  const firebaseUser = auth.currentUser;
  const user = storeUser || firebaseUser;
  const userEmail = user?.email || firebaseUser?.email || "";
  const userName =
    user?.name || user?.displayName || user?.username || userEmail || "";

  const [form, setForm] = useState(() => buildInitialForm(user));
  const [errors, setErrors] = useState({});
  const [formErrors, setFormErrors] = useState("");
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [showCardModal, setShowCardModal] = useState(false);
  const [cardForm, setCardForm] = useState({
    holder: "",
    number: "",
    expiry: "",
    cvv: "",
  });
  const [cardErrors, setCardErrors] = useState({});
  const [savedCards, setSavedCards] = useState([]);
  const [savedPaymentLoading, setSavedPaymentLoading] = useState(false);
  const [selectedSavedCardId, setSelectedSavedCardId] = useState(null);

  useEffect(() => {
    setForm(buildInitialForm(user));
  }, [user?.uid]);

  useEffect(() => {
    if (!user?.uid) return;
    let mounted = true;
    const fetchProfile = async () => {
      try {
        const snap = await getDoc(doc(db, "users", user.uid));
        if (!snap.exists() || !mounted) return;
        const data = snap.data() || {};
        const fullName =
          data.fullName ||
          data.name ||
          [data.firstName, data.lastName].filter(Boolean).join(" ") ||
          "";
        const phoneValue =
          data.phone ||
          data.phoneNumber ||
          data.contactPhone ||
          data.mobile ||
          "";
        setForm((prev) => ({
          ...prev,
          fullName: prev.fullName || fullName,
          phone: prev.phone || normalizePhone(phoneValue),
          address:
            prev.address ||
            data.address ||
            data.addressLine1 ||
            data.location ||
            "",
          city: prev.city || data.city || data.addressCity || "",
        }));
      } catch (err) {
        console.error("Failed to load user profile for checkout", err);
      }
    };
    fetchProfile();
    return () => {
      mounted = false;
    };
  }, [user?.uid]);

  useEffect(() => {
    const fetchSavedMethods = async () => {
      if (!user?.uid) {
        setSavedCards([]);
        setSelectedSavedCardId(null);
        setSavedPaymentLoading(false);
        return;
      }
      setSavedPaymentLoading(true);
      try {
        const methodsRef = collection(db, "users", user.uid, "paymentMethods");
        const snap = await getDocs(query(methodsRef, orderBy("createdAt", "desc")));
        const methods = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        const cards = methods.filter((method) => method.type === "card");
        cards.sort((a, b) => {
          if (a.isDefault && !b.isDefault) return -1;
          if (!a.isDefault && b.isDefault) return 1;
          const aDate = a.createdAt?.toMillis?.() || a.createdAt || 0;
          const bDate = b.createdAt?.toMillis?.() || b.createdAt || 0;
          return bDate - aDate;
        });
        setSavedCards(cards);
        const defaultCard = cards.find((card) => card.isDefault) || cards[0];
        setSelectedSavedCardId((prev) =>
          prev && cards.some((card) => card.id === prev)
            ? prev
            : defaultCard?.id || null
        );
      } catch (err) {
        console.error("Failed to load payment methods", err);
        setSavedCards([]);
        setSelectedSavedCardId(null);
      } finally {
        setSavedPaymentLoading(false);
      }
    };

    fetchSavedMethods();
  }, [user?.uid]);

  const summary = useMemo(() => {
    const subtotal = cartItems.reduce(
      (sum, item) =>
        sum + Number(item.price || 0) * Number(item.quantity || 0),
      0
    );
    const shipping = cartItems.length ? 50 : 0;
    return {
      subtotal,
      shipping,
      total: subtotal + shipping,
    };
  }, [cartItems]);

  const paymentOptions = useMemo(() => {
    const options = [
      {
        value: "cod",
        type: "cod",
        title: t("checkout.payment.cod.title"),
        subtitle: t("checkout.payment.cod.subtitle"),
      },
    ];
    savedCards.forEach((card) => {
      options.push({
        value: `saved-card:${card.id}`,
        type: "saved-card",
        cardId: card.id,
        title: formatSavedMethod(card),
        subtitle:
          card.nickname ||
          t("checkout.payment.saved.subtitle", "Use this card instantly."),
        badge: card.isDefault
          ? t("checkout.payment.saved.badge", "Default")
          : t("checkout.payment.saved.extra", "Saved"),
      });
    });
    options.push({
      value: "card",
      type: "card",
      title: t("checkout.payment.card.title"),
      subtitle: t("checkout.payment.card.subtitle"),
    });
    return options;
  }, [savedCards, t]);

  useEffect(() => {
    if (paymentMethod !== "saved-card") return;
    if (!savedCards.length) {
      setPaymentMethod("cod");
      setSelectedSavedCardId(null);
      return;
    }
    if (!selectedSavedCardId || !savedCards.some((card) => card.id === selectedSavedCardId)) {
      setSelectedSavedCardId(savedCards[0].id);
    }
  }, [paymentMethod, savedCards, selectedSavedCardId]);

  const validate = () => {
    const nextErrors = {};
    if (!form.fullName.trim()) nextErrors.fullName = t("checkout.errors.fullName");
    if (!phoneRegex.test(form.phone))
      nextErrors.phone = t("checkout.errors.phone");
    if (!form.address.trim()) nextErrors.address = t("checkout.errors.address");
    if (!form.city.trim()) nextErrors.city = t("checkout.errors.city");

    setErrors(nextErrors);
    setFormErrors(
      Object.keys(nextErrors).length ? Object.values(nextErrors).join(", ") : ""
    );
    return Object.keys(nextErrors).length === 0;
  };

  const validateCard = () => {
    const nextErrors = {};
    if (!cardForm.holder.trim())
      nextErrors.holder = t("payments.errors.holder");
    if (!/^\d{16}$/.test(cardForm.number.replace(/\s/g, "")))
      nextErrors.number = t("payments.errors.number");
    if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(cardForm.expiry))
      nextErrors.expiry = t("payments.errors.expiry");
    if (!/^\d{3,4}$/.test(cardForm.cvv))
      nextErrors.cvv = t("payments.errors.cvv");
    setCardErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const buildPaymentDetails = () => {
    if (paymentMethod === "saved-card") {
      const selectedCard = savedCards.find(
        (card) => card.id === selectedSavedCardId
      );
      if (selectedCard) {
        return {
          type: "saved-card",
          label: formatSavedMethod(selectedCard),
          methodId: selectedCard.id,
          brand: selectedCard.brand || "",
          last4: selectedCard.last4 || "",
          nickname: selectedCard.nickname || "",
        };
      }
      return {
        type: "cod",
        label: t("checkout.payment.cod.title"),
      };
    }
    if (paymentMethod === "card") {
      const digits = cardForm.number.replace(/\D/g, "");
      return {
        type: "card",
        label: t("checkout.payment.card.title"),
        holder: cardForm.holder.trim(),
        last4: digits.slice(-4),
      };
    }
    return {
      type: "cod",
      label: t("checkout.payment.cod.title"),
    };
  };

  const placeOrder = async () => {
    if (!user?.uid && !firebaseUser?.uid) {
      toast.error(t("checkout.messages.loginRequired"));
      return;
    }

    const stockIssue = cartItems.some((item) => {
      const requested = Number(item.quantity || 0);
      const available = Number(
        item.stock ?? item.available ?? Number.POSITIVE_INFINITY
      );
      return requested > available;
    });
    if (stockIssue) {
      toast.error(t("checkout.messages.stockIssue", "Some items exceed stock."));
      return;
    }

    setLoading(true);
    try {
      const paymentDetails = buildPaymentDetails();
      const shipping = {
        fullName: form.fullName.trim(),
        addressLine1: form.address.trim(),
        city: form.city.trim(),
        phone: form.phone.trim(),
        email: userEmail,
        notes: form.notes.trim(),
      };

      const { id } = await createOrder({
        uid: user?.uid || firebaseUser?.uid,
        userId: user?.uid || firebaseUser?.uid,
        userEmail,
        userName,
        shipping,
        paymentMethod: paymentDetails.type,
        paymentSummary: paymentDetails.label,
        paymentDetails,
        totals: summary,
        items: cartItems,
        notes: form.notes.trim(),
      });

      dispatch(clearCart());
      toast.success(t("checkout.messages.success"));
      navigate(`/order-confirmation?orderId=${id}`, {
        state: { orderId: id },
      });
    } catch (err) {
      console.error("Checkout error:", err);
      toast.error(
        err?.message || t("checkout.messages.failure", "Something went wrong.")
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!user) {
      toast.error(t("checkout.messages.loginRequired"));
      return;
    }
    if (!cartItems.length) {
      toast.error(t("checkout.messages.emptyCart"));
      return;
    }
    if (!validate()) return;

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

  const handlePaymentSelection = (value) => {
    if (value.startsWith("saved-card:")) {
      const [, cardId] = value.split(":");
      setPaymentMethod("saved-card");
      setSelectedSavedCardId(cardId || null);
    } else {
      setPaymentMethod(value);
      setSelectedSavedCardId(null);
    }
  };

  const inputClasses =
    "w-full rounded-2xl border px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 transition";

  if (!cartItems.length) {
    return (
      <section className="mx-auto mt-20 max-w-2xl rounded-3xl border border-dashed border-emerald-200 bg-white/80 p-10 text-center shadow-sm">
        <p className="text-xl font-semibold text-slate-800">
          {t("checkout.empty.title", "Your cart is empty")}
        </p>
        <p className="mt-2 text-sm text-slate-500">
          {t("checkout.empty.subtitle", "Please add some products first.")}
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <Link
            to="/products"
            className="rounded-2xl bg-emerald-500 px-5 py-2 text-sm font-semibold text-white shadow hover:bg-emerald-600"
          >
            {t("checkout.empty.cta", "Go to Products")}
          </Link>
        </div>
      </section>
    );
  }

  if (!user) {
    return (
      <section className="mx-auto mt-20 max-w-2xl rounded-3xl border border-amber-200 bg-amber-50/80 p-10 text-center shadow-sm">
        <p className="text-lg font-semibold text-amber-900">
          {t("checkout.loginRequired.title", "You need to login")}
        </p>
        <p className="mt-2 text-sm text-amber-800">
          {t("checkout.loginRequired.subtitle", "Please login to continue.")}
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <Link
            to="/login"
            className="rounded-2xl bg-emerald-500 px-5 py-2 text-sm font-semibold text-white shadow hover:bg-emerald-600"
          >
            {t("checkout.loginRequired.cta", "Login")}
          </Link>
        </div>
      </section>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-10">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 sm:px-6 lg:grid-cols-[2fr,1fr]">
        <form
          className="rounded-3xl border bg-white p-6 shadow-sm space-y-6"
          onSubmit={handleSubmit}
        >
          <header>
            <h1 className="text-2xl font-semibold">
              {t("checkout.header.title", "Checkout")}
            </h1>
          </header>
          {formErrors && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {formErrors}
            </div>
          )}

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
                  value={form.fullName}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, fullName: e.target.value }))
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
                <label className="text-sm font-medium">
                  {t("checkout.fields.phone")}
                </label>
                <input
                  type="tel"
                  inputMode="numeric"
                  maxLength={11}
                  value={form.phone}
                  onChange={(e) => {
                    const digitsOnly = e.target.value.replace(/\D/g, "").slice(0, 11);
                    setForm((prev) => ({ ...prev, phone: digitsOnly }));
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

          <section className="space-y-4">
            <h2 className="text-lg font-semibold">
              {t("checkout.sections.shipping")}
            </h2>
            <div className="grid gap-4">
              <div>
                <label className="text-sm font-medium">
                  {t("checkout.fields.address", "Address")}
                </label>
                <input
                  type="text"
                  value={form.address}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, address: e.target.value }))
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
                <label className="text-sm font-medium">
                  {t("checkout.fields.city")}
                </label>
                <input
                  type="text"
                  value={form.city}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, city: e.target.value }))
                  }
                  className={`${inputClasses} ${
                    errors.city ? "border-red-400" : "border-slate-200"
                  }`}
                />
                {errors.city && (
                  <p className="mt-1 text-xs text-red-500">{errors.city}</p>
                )}
              </div>
              <div>
                <label className="text-sm font-medium">
                  {t("checkout.fields.notes", "Notes (optional)")}
                </label>
                <textarea
                  rows="3"
                  value={form.notes}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, notes: e.target.value }))
                  }
                  className={inputClasses}
                ></textarea>
              </div>
            </div>
          </section>

          <section className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-lg font-semibold">
                {t("checkout.sections.payment")}
              </h2>
              {savedCards.length > 0 && (
                <Link
                  to="/account/payments"
                  className="text-sm font-semibold text-emerald-600 hover:underline"
                >
                  {t("checkout.payment.manageMethods", "Manage payment methods")}
                </Link>
              )}
            </div>
            {savedPaymentLoading && (
              <div className="rounded-2xl border border-dashed border-slate-200 bg-white/70 p-3 text-xs text-slate-500">
                {t("checkout.payment.loadingSuggestion", "Looking for saved cards...")}
              </div>
            )}
            <div
              className={`grid gap-4 ${
                paymentOptions.length > 1 ? "sm:grid-cols-2" : ""
              }`}
            >
              {paymentOptions.map((option) => (
                <label
                  key={option.value}
                  className={`flex cursor-pointer flex-col gap-2 rounded-2xl border px-4 py-3 text-sm ${
                    (option.type === "saved-card"
                      ? paymentMethod === "saved-card" &&
                        selectedSavedCardId === option.cardId
                      : paymentMethod === option.value)
                      ? "border-emerald-500 bg-emerald-50/60"
                      : "border-slate-200"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="payment"
                      checked={
                        option.type === "saved-card"
                          ? paymentMethod === "saved-card" &&
                            selectedSavedCardId === option.cardId
                          : paymentMethod === option.value
                      }
                      onChange={() => handlePaymentSelection(option.value)}
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold">{option.title}</p>
                        {option.badge && (
                          <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-emerald-700">
                            {option.badge}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500">{option.subtitle}</p>
                    </div>
                  </div>
                </label>
              ))}
            </div>
          </section>

          <div className="flex flex-wrap gap-3 pt-2">
            <Link
              to="/cart"
              className="rounded-2xl border border-slate-200 px-5 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50"
            >
              {t("checkout.actions.backToCart", "Back to Cart")}
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center rounded-2xl bg-emerald-500 px-6 py-2 text-sm font-semibold text-white shadow hover:bg-emerald-600 disabled:opacity-70"
            >
              {loading
                ? t("checkout.actions.processing", "Processing...")
                : t("checkout.actions.confirmOrder", "Confirm Order")}
            </button>
          </div>
        </form>

        <aside className="rounded-3xl border bg-white p-6 shadow-sm lg:block hidden">
          <h2 className="text-lg font-semibold">
            {t("checkout.summary.title", "Order Summary")}
          </h2>
          <div className="mt-4 space-y-4">
            {cartItems.map((item) => (
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
                    {t("checkout.summary.qty", { count: item.quantity ?? 1 })}
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
              <span>{t("checkout.summary.subtotal", "Subtotal")}</span>
              <span>{`${summary.subtotal.toLocaleString()} EGP`}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>{t("checkout.summary.shipping", "Shipping")}</span>
              <span>{`${summary.shipping.toLocaleString()} EGP`}</span>
            </div>
            <div className="flex items-center justify-between text-base font-semibold">
              <span>{t("checkout.summary.total", "Total")}</span>
              <span>{`${summary.total.toLocaleString()} EGP`}</span>
            </div>
          </div>
        </aside>

        <div className="lg:hidden mt-6">
          <h2 className="text-lg font-semibold mb-2">
            {t("checkout.summary.title", "Order Summary")}
          </h2>
          {cartItems.map((item) => (
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
                  {t("checkout.summary.qty", { count: item.quantity ?? 1 })}
                </p>
              </div>
              <p className="text-sm font-semibold">{`${Number(
                item.price
              ).toLocaleString()} EGP`}</p>
            </div>
          ))}
          <div className="mt-4 flex justify-between font-semibold">
            <span>{t("checkout.summary.total", "Total")}:</span>
            <span>{`${summary.total.toLocaleString()} EGP`}</span>
          </div>
        </div>

        {showCardModal && (
          <Modal
            isOpen={showCardModal}
            onClose={() => setShowCardModal(false)}
            title={t("payments.form.cardTitle")}
            footer={false}
          >
            <form onSubmit={handleCardSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium">
                    {t("payments.form.cardHolder")}
                  </label>
                  <input
                    type="text"
                    value={cardForm.holder}
                    onChange={(e) =>
                      setCardForm((prev) => ({
                        ...prev,
                        holder: e.target.value,
                      }))
                    }
                    className={`w-full border px-3 py-2 rounded ${
                      cardErrors.holder ? "border-red-500" : "border-gray-300"
                    }`}
                  />
                  {cardErrors.holder && (
                    <p className="text-red-500 text-xs">
                      {cardErrors.holder}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium">
                    {t("payments.form.cardNumber")}
                  </label>
                  <input
                    type="text"
                    value={cardForm.number}
                    onChange={(e) =>
                      setCardForm((prev) => ({
                        ...prev,
                        number: e.target.value,
                      }))
                    }
                    className={`w-full border px-3 py-2 rounded ${
                      cardErrors.number ? "border-red-500" : "border-gray-300"
                    }`}
                  />
                  {cardErrors.number && (
                    <p className="text-red-500 text-xs">
                      {cardErrors.number}
                    </p>
                  )}
                </div>
                <div className="flex gap-4">
                  <div className="flex-1">
                    <label className="block text-sm font-medium">
                      {t("payments.form.expiry")}
                    </label>
                    <input
                      type="text"
                      placeholder={t("payments.expPlaceholder")}
                      value={cardForm.expiry}
                      onChange={(e) =>
                        setCardForm((prev) => ({
                          ...prev,
                          expiry: e.target.value,
                        }))
                      }
                      className={`w-full border px-3 py-2 rounded ${
                        cardErrors.expiry ? "border-red-500" : "border-gray-300"
                      }`}
                    />
                    {cardErrors.expiry && (
                      <p className="text-red-500 text-xs">
                        {cardErrors.expiry}
                      </p>
                    )}
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm font-medium">
                      {t("payments.form.cvv")}
                    </label>
                    <input
                      type="text"
                      value={cardForm.cvv}
                      onChange={(e) =>
                        setCardForm((prev) => ({
                          ...prev,
                          cvv: e.target.value,
                        }))
                      }
                      className={`w-full border px-3 py-2 rounded ${
                        cardErrors.cvv ? "border-red-500" : "border-gray-300"
                      }`}
                    />
                    {cardErrors.cvv && (
                      <p className="text-red-500 text-xs">
                        {cardErrors.cvv}
                      </p>
                    )}
                  </div>
                </div>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCardModal(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200"
                >
                  {t("common.cancel", "Cancel")}
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-emerald-600"
                >
                  {t("checkout.actions.completeOrder", "Complete Order")}
                </button>
              </div>
            </form>
          </Modal>
        )}
      </div>
    </div>
  );
}
