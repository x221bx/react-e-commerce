import React, { useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import CheckoutContactForm from "../components/checkout/CheckoutContactForm";
import CheckoutShippingForm from "../components/checkout/CheckoutShippingForm";
import CheckoutPaymentSection from "../components/checkout/CheckoutPaymentSection";
import CheckoutSavedCards from "../components/checkout/CheckoutSavedCards";
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

  // ...custom hooks...
  const {
    form,
    setForm,
    errors,
    formErrors,
    validate,
  } = useCheckoutForm(user);

  const {
    savedCards,
    savedPaymentLoading,
    selectedSavedCardId,
    setSelectedSavedCardId,
    NEW_CARD_OPTION,
  } = usePaymentMethods(user?.uid);

  useUserProfile(user?.uid, form, setForm);

  const summary = useOrderSummary(cartItems);

  const {
    cardForm,
    setCardForm,
    cardErrors,
    validateCard,
    resetCard,
  } = useCardValidation();

  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [showCardModal, setShowCardModal] = useState(false);

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

  const buildPaymentDetails = () => {
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
      resetCard();
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

    if (
      paymentMethod === "card" &&
      (!selectedSavedCardId || selectedSavedCardId === NEW_CARD_OPTION)
    ) {
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
              {t("checkout.header.title", "Review and confirm")}
            </h1>
          </header>
          {formErrors && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
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

        <CheckoutSummary cartItems={cartItems} summary={summary} />

        <CheckoutCardModal
          isOpen={showCardModal}
          onClose={() => setShowCardModal(false)}
          cardForm={cardForm}
          setCardForm={setCardForm}
          cardErrors={cardErrors}
          onSubmit={handleCardSubmit}
        />
      </div>
    </div>
  );
}
