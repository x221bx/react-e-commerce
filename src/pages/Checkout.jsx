// src/pages/Checkout.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";

import CheckoutContactForm from "../components/checkout/CheckoutContactForm";
import CheckoutShippingForm from "../components/checkout/CheckoutShippingForm";
import CheckoutPaymentSection from "../components/checkout/CheckoutPaymentSection";
import CheckoutSavedCards, {
  NEW_CARD_OPTION,
} from "../components/checkout/CheckoutSavedCards";
import CheckoutCardModal from "../components/checkout/CheckoutCardModal";
import CheckoutSummary from "../components/checkout/CheckoutSummary";

import { clearCart } from "../features/cart/cartSlice";
import { selectCurrentUser } from "../features/auth/authSlice";
import { createOrder } from "../services/ordersService";
import { auth } from "../services/firebase";

import { useCheckoutForm } from "../hooks/useCheckoutForm";
import { usePaymentMethods } from "../hooks/usePaymentMethods";
import { useUserProfile } from "../hooks/useUserProfile";
import { useOrderSummary } from "../hooks/useOrderSummary";
import { useCardValidation } from "../hooks/useCardValidation";
import { UseTheme } from "../theme/ThemeProvider";

const formatSavedMethod = (method) => {
  if (!method) return "";
  if (method.type === "card") {
    const brand = method.brand
      ? method.brand.charAt(0).toUpperCase() + method.brand.slice(1)
      : "Card";
    return `${brand} **** ${method.last4 || "----"}`;
  }
  if (method.type === "wallet") {
    const provider = method.provider
      ? method.provider.charAt(0).toUpperCase() + method.provider.slice(1)
      : "Wallet";
    return `${provider} (${method.email})`;
  }
  return method.nickname || "Saved method";
};

const generatePaymentMethodId = () => {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `payment-${Date.now()}-${Math.random().toString(16).slice(2)}`;
};

export default function Checkout() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const { theme } = UseTheme();
  const isDark = theme === "dark";

  const cartItems = useSelector((state) => state.cart.items || []);
  const storeUser = useSelector(selectCurrentUser);
  const firebaseUser = auth.currentUser;
  const user = storeUser || firebaseUser;
  const userEmail = user?.email || firebaseUser?.email || "";
  const userName =
    user?.name || user?.displayName || user?.username || userEmail || "";

  // form hooks
  const { form, setForm, errors, formErrors, validate } = useCheckoutForm(user);

  const {
    methods,
    loading: savedPaymentLoading,
    defaultMethod,
    addCard,
  } = usePaymentMethods(user?.uid);

  const savedCards = useMemo(
    () => methods.filter((method) => method.type === "card"),
    [methods]
  );

  const [selectedSavedCardId, setSelectedSavedCardId] = useState(() => {
    const defaultCard =
      defaultMethod?.type === "card"
        ? defaultMethod
        : savedCards.find((card) => card.isDefault);
    return defaultCard?.id || savedCards[0]?.id || NEW_CARD_OPTION;
  });

  useEffect(() => {
    setSelectedSavedCardId((prev) => {
      if (
        prev &&
        (prev === NEW_CARD_OPTION ||
          savedCards.some((card) => card.id === prev))
      ) {
        return prev;
      }
      const defaultCard =
        defaultMethod?.type === "card"
          ? defaultMethod
          : savedCards.find((card) => card.isDefault);
      return defaultCard?.id || savedCards[0]?.id || NEW_CARD_OPTION;
    });
  }, [defaultMethod, savedCards]);

  useUserProfile(user?.uid, form, setForm);

  const summary = useOrderSummary(cartItems);

  const cardValidation = useCardValidation();
  const {
    cardForm,
    validateCard,
    resetCard,
    detectBrand,
  } = cardValidation;

  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [showCardModal, setShowCardModal] = useState(false);
  const [saveCardForLater, setSaveCardForLater] = useState(false);

  const paymentOptions = useMemo(
    () => [
      {
        value: "cod",
        type: "cod",
        title: t("checkout.payment.cod.title"),
        subtitle: t("checkout.payment.cod.subtitle"),
      },
      {
        value: "card",
        type: "card",
        title: t("checkout.payment.card.title"),
        subtitle: savedCards.length
          ? t(
              "checkout.payment.card.dropdownHint",
              "Choose an existing card or add a new one."
            )
          : t("checkout.payment.card.subtitle"),
      },
    ],
    [savedCards.length, t]
  );

  const buildPaymentDetails = (cardDetailsOverride) => {
    if (
      paymentMethod === "card" &&
      selectedSavedCardId &&
      selectedSavedCardId !== NEW_CARD_OPTION
    ) {
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
    }
    if (paymentMethod === "card") {
      const cardDetails = cardDetailsOverride || cardForm || {};
      const digits = (cardDetails.number || "").replace(/\D/g, "");
      return {
        type: "card",
        label: t("checkout.payment.card.title"),
        holder: (cardDetails.holder || "").trim(),
        last4: digits.slice(-4),
      };
    }
    return {
      type: "cod",
      label: t("checkout.payment.cod.title"),
    };
  };

  const placeOrder = async (cardDetailsOverride) => {
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
      toast.error(
        t("checkout.messages.stockIssue", "Some items exceed stock.")
      );
      return;
    }

    setLoading(true);
    try {
      const paymentDetails = buildPaymentDetails(cardDetailsOverride);
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
      resetCard();
      toast.success(t("checkout.messages.success"));
      setSaveCardForLater(false);
      navigate(`/account/invoice/${id}`, { state: { orderId: id } });
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

    if (
      paymentMethod === "card" &&
      (!selectedSavedCardId || selectedSavedCardId === NEW_CARD_OPTION)
    ) {
      setShowCardModal(true);
      return;
    }

    await placeOrder();
  };

  const handleCardSubmit = async (cardData, shouldSave) => {
    if (!cardData) return;
    if (!validateCard()) return;
    setShowCardModal(false);

    if (shouldSave && user?.uid) {
      try {
        await addCard(cardData, detectBrand, generatePaymentMethodId);
        toast.success(t("payments.form.saveCard", "Card saved to your payment methods"));
      } catch (err) {
        console.error("Failed to save card from checkout", err);
        toast.error(t("payments.form.saveFailed", "Card used for this order but not saved."));
      }
    }

    await placeOrder(cardData);
  };

  const handlePaymentSelection = (value) => {
    setPaymentMethod(value);
    if (value !== "card") return;
    setSelectedSavedCardId((prev) => {
      if (
        prev &&
        (prev === NEW_CARD_OPTION ||
          savedCards.some((card) => card.id === prev))
      ) {
        return prev;
      }
      return savedCards[0]?.id || NEW_CARD_OPTION;
    });
  };

  // unified page background like Products
  const pageBg = isDark
    ? "bg-gradient-to-b from-transparent to-slate-800/30"
    : "bg-gradient-to-b from-transparent to-gray-50/50";

  const shellSurface = isDark
    ? "bg-[#0f1d1d]/60 border-white/10 shadow-lg"
    : "bg-white/95 border-slate-200 shadow-md";

  const summarySurface = isDark
    ? "bg-[#0f1d1d]/60 border-white/10 shadow-lg"
    : "bg-white/95 border-slate-200 shadow-md";

  const headingColor = isDark ? "text-white" : "text-slate-900";
  const muted = isDark ? "text-slate-300" : "text-slate-500";

  if (!cartItems.length) {
    return (
      <section
        className={`mx-auto mt-20 max-w-2xl rounded-3xl border border-dashed p-10 text-center shadow-sm ${
          isDark
            ? "border-emerald-900/40 bg-[#0f1d1d]/50 text-slate-100"
            : "border-emerald-200 bg-emerald-50/70 text-slate-800"
        }`}
      >
        <p className="text-xl font-semibold">
          {t("checkout.empty.title", "Your cart is empty")}
        </p>
        <p className={`mt-2 text-sm ${muted}`}>
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
      <section
        className={`mx-auto mt-20 max-w-2xl rounded-3xl border p-10 text-center shadow-sm ${
          isDark
            ? "border-amber-900/40 bg-[#0f1d1d]/60 text-amber-100"
            : "border-amber-200 bg-amber-50/80 text-amber-900"
        }`}
      >
        <p className="text-lg font-semibold">
          {t("checkout.loginRequired.title", "You need to login")}
        </p>
        <p className="mt-2 text-sm">
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
    <div className={`min-h-screen ${pageBg} py-10`}>
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        {/* Page header */}
        <header className="mb-6">
          <p
            className={`text-xs font-semibold uppercase tracking-[0.18em] ${
              isDark ? "text-emerald-300" : "text-emerald-600"
            }`}
          >
            {t("checkout.header.eyebrow", "Checkout")}
          </p>
          <h1 className={`mt-2 text-3xl font-semibold ${headingColor}`}>
            {t("checkout.header.title", "Review and confirm")}
          </h1>
          <p className={`mt-1 text-sm ${muted}`}>
            {t(
              "checkout.header.subtitle",
              "Confirm your contact info, address, and payment method to place your order."
            )}
          </p>
        </header>

        <div className="grid gap-6 lg:grid-cols-[2fr,1fr]">
          {/* Left column - form */}
          <form
            className={`rounded-3xl border p-6 space-y-6 ${shellSurface}`}
            onSubmit={handleSubmit}
          >
            {formErrors && (
              <div
                className={`rounded-2xl border px-4 py-3 text-sm ${
                  isDark
                    ? "border-red-900/50 bg-red-950/60 text-red-200"
                    : "border-red-200 bg-red-50 text-red-700"
                }`}
              >
                {formErrors}
              </div>
            )}

            <CheckoutContactForm form={form} setForm={setForm} errors={errors} />
            <CheckoutShippingForm form={form} setForm={setForm} errors={errors} />

            <CheckoutPaymentSection
              paymentMethod={paymentMethod}
              handlePaymentSelection={handlePaymentSelection}
              paymentOptions={paymentOptions}
              savedCards={savedCards}
            />

            <CheckoutSavedCards
              paymentMethod={paymentMethod}
              savedCards={savedCards}
              selectedSavedCardId={selectedSavedCardId}
              setSelectedSavedCardId={setSelectedSavedCardId}
              savedPaymentLoading={savedPaymentLoading}
            />

            <div className="flex flex-wrap gap-3 pt-3">
              <Link
                to="/cart"
                className={`rounded-2xl border px-5 py-2 text-sm font-semibold transition ${
                  isDark
                    ? "border-slate-700 text-slate-200 hover:bg-slate-800/70"
                    : "border-slate-200 text-slate-600 hover:bg-slate-50"
                }`}
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

          {/* Right column - summary */}
          <div className={`rounded-3xl border p-6 h-fit ${summarySurface}`}>
            <CheckoutSummary cartItems={cartItems} summary={summary} />
          </div>

          {/* Card modal */}
          <CheckoutCardModal
            isOpen={showCardModal}
            onClose={() => setShowCardModal(false)}
            onSubmit={handleCardSubmit}
            cardValidation={cardValidation}
            saveCardForLater={saveCardForLater}
            onSaveCardToggle={setSaveCardForLater}
          />
        </div>
      </div>
    </div>
  );
}
