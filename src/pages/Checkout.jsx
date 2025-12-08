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
import Footer from "../Authcomponents/Footer";

// ✅ خدمات الدفع للويب
import { createPaymobCardPayment } from "../services/paymob";
import { createPaypalOrder } from "../services/paypal";

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

const hashCardNumber = async (number) => {
  const encoder = new TextEncoder();
  const data = encoder.encode(number);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
};

export default function Checkout() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();

  const { theme } = UseTheme();
  const isDark = theme === "dark";
  const isRTL = i18n.language === "ar";

  const cartItems = useSelector((state) => state.cart.items || []);
  const storeUser = useSelector(selectCurrentUser);
  const firebaseUser = auth.currentUser;
  const user = storeUser || firebaseUser;
  const userEmail = user?.email || firebaseUser?.email || "";
  const userName =
    user?.name || user?.displayName || user?.username || userEmail || "";

  // form hooks
  const {
    form,
    setForm,
    errors,
    formErrors,
    validate,
    handlePhoneChange,
  } = useCheckoutForm(user);

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
        (prev === NEW_CARD_OPTION || savedCards.some((card) => card.id === prev))
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
  const { cardForm, validateCard, resetCard, detectBrand } = cardValidation;

  const [loading, setLoading] = useState(false);

  // 🔸 طرق الدفع:
  // cod = دفع عند الاستلام (زي الأول)
  // card = الكروت المتخزنة/الجديدة (زي الأول)
  // paymob = الدفع أونلاين عن طريق Paymob
  // paypal = الدفع عن طريق PayPal
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [showCardModal, setShowCardModal] = useState(false);
  const [saveCardForLater, setSaveCardForLater] = useState(false);
  const [showOrderConfirm, setShowOrderConfirm] = useState(false);

  const paymentOptions = useMemo(
    () => [
      {
        value: "cod",
        type: "cod",
        title: t("checkout.payment.cod.title"),
        subtitle: t("checkout.payment.cod.subtitle"),
      },
      {
        value: "paymob",
        type: "paymob",
        title: t(
          "checkout.payment.paymobTitle",
          "Pay with card (Paymob)"
        ),
        subtitle: t(
          "checkout.payment.paymobSubtitle",
          "Secure Visa/Mastercard via Paymob"
        ),
      },
      {
        value: "paypal",
        type: "paypal",
        title: t("checkout.payment.paypalTitle", "Pay with PayPal"),
        subtitle: t(
          "checkout.payment.paypalSubtitle",
          "Use your PayPal balance or saved cards"
        ),
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
    if (paymentMethod === "paymob") {
      return {
        type: "paymob",
        label: t(
          "checkout.payment.paymobLabel",
          "Pay with card (Paymob)"
        ),
      };
    }

    if (paymentMethod === "paypal") {
      return {
        type: "paypal",
        label: t("checkout.payment.paypalLabel", "PayPal"),
      };
    }

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
      const brand = detectBrand(digits);
      const formattedBrand = brand.charAt(0).toUpperCase() + brand.slice(1);
      return {
        type: "card",
        label: `${formattedBrand} **** ${digits.slice(-4)}`,
        holder: (cardDetails.holder || "").trim(),
        last4: digits.slice(-4),
      };
    }
    return {
      type: "cod",
      label: t("checkout.payment.cod.title"),
    };
  };

  // ✅ بنبني draft للأوردر (بدون تفاصيل الدفع)
  const buildOrderDraft = () => {
    const shipping = {
      fullName: form.fullName.trim(),
      addressLine1: form.address.trim(),
      city: form.city.trim(),
      phone: form.phone.trim(),
      email: userEmail,
      notes: form.notes.trim(),
    };

    return {
      uid: user?.uid || firebaseUser?.uid,
      userId: user?.uid || firebaseUser?.uid,
      userEmail,
      userName,
      shipping,
      totals: summary,
      items: cartItems,
      notes: form.notes.trim(),
    };
  };

  // ✅ نفس منطق الأوردر القديم (لـ COD و card فقط)
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
      const draft = buildOrderDraft();

      const { id } = await createOrder({
        ...draft,
        paymentMethod: paymentDetails.type,
        paymentSummary: paymentDetails.label,
        paymentDetails,
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

  // ✅ Paymob flow (الويب) – بس بنبدأ العملية، الأوردر هيتعمل في callback
  const startPaymobPayment = async () => {
    setLoading(true);
    try {
      const orderRef = `WEB-${Date.now()}`;

      const session = await createPaymobCardPayment({
        amount: summary.total,
        cartItems,
        form,
        user: {
          email: userEmail,
          displayName: userName,
        },
        merchantOrderId: orderRef,
      });

      // نخزن بيانات Paymob علشان نستخدمها في callback
      try {
        localStorage.setItem(
          "farmvet_last_paymob_session",
          JSON.stringify({
            paymobOrderId: session.paymobOrderId,
            paymentKey: session.paymentKey,
            amountCents: session.amountCents,
          })
        );
      } catch (e) {
        console.warn("Failed to persist Paymob session", e);
      }

      window.location.href = session.paymentUrl;
    } catch (err) {
      console.error("Failed to initialize Paymob payment", err);
      toast.error(
        err?.message ||
          t(
            "checkout.payment.paymobInitError",
            "Could not start Paymob checkout. Please try again."
          )
      );
    } finally {
      setLoading(false);
    }
  };

  // ✅ PayPal flow – نفس فكرة الموبايل (نكمّل الكابتشر في callback)
  const startPaypalPayment = async () => {
    setLoading(true);
    try {
      const orderRef = `WEB-${Date.now()}`;

      const session = await createPaypalOrder({
        amountEGP: summary.total,
        reference: orderRef,
      });

      if (!session?.approvalUrl) {
        throw new Error("Missing PayPal approval link");
      }

      window.location.href = session.approvalUrl;
    } catch (err) {
      console.error("Failed to initialize PayPal order", err);
      toast.error(
        err?.message ||
          t(
            "checkout.payment.paypalInitError",
            "Could not start PayPal checkout. Please try again."
          )
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

    setShowOrderConfirm(true);
  };

  const handleCardSubmit = async (cardData, shouldSave) => {
    if (!cardData) return;
    if (!validateCard()) return;

    const sanitized = cardData.number.replace(/\s+/g, "");
    const hashed = await hashCardNumber(sanitized);
    const isDuplicate = methods.some(
      (m) => m.type === "card" && m.cardHash === hashed
    );
    if (isDuplicate) {
      toast.error(
        t(
          "payments.duplicateCardError",
          "This card already exists in your saved payment methods."
        )
      );
      return;
    }

    setShowCardModal(false);

    if (shouldSave && user?.uid) {
      try {
        await addCard(cardData, detectBrand, generatePaymentMethodId);
        toast.success(
          t(
            "payments.form.saveCard",
            "Card saved to your payment methods"
          )
        );
      } catch (err) {
        console.error("Failed to save card from checkout", err);
        toast.error(
          t(
            "payments.form.saveFailed",
            "Card used for this order but not saved."
          )
        );
      }
    }

    setShowOrderConfirm(true);
  };

  // ✅ دي اللي بتقرر هنعمل إيه بعد ما اليوزر يوافق في المودال
  const handleConfirmOrder = async () => {
    setShowOrderConfirm(false);

    // لو Paymob / PayPal → نخزن draft في localStorage وبعدين نروح لبوابة الدفع
    if (paymentMethod === "paymob" || paymentMethod === "paypal") {
      const draft = buildOrderDraft();

      try {
        localStorage.setItem(
          "farmvet_pending_order",
          JSON.stringify(draft)
        );
        localStorage.setItem(
          "farmvet_pending_payment_method",
          paymentMethod
        );
      } catch (err) {
        console.warn("Failed to persist pending order", err);
      }

      if (paymentMethod === "paymob") {
        await startPaymobPayment();
      } else {
        await startPaypalPayment();
      }
      return;
    }

    // COD / card العادي → نشتغل بنفس اللوجيك القديم
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
    <div className={`min-h-screen ${pageBg} py-10`} dir={isRTL ? "rtl" : "ltr"}>
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

            <CheckoutContactForm
              form={form}
              setForm={setForm}
              errors={errors}
              handlePhoneChange={handlePhoneChange}
            />
            <CheckoutShippingForm
              form={form}
              setForm={setForm}
              errors={errors}
            />

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

          {/* Order confirmation modal */}
          {showOrderConfirm && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <div
                className={`rounded-3xl border shadow-xl max-w-lg w-full p-6 ${
                  isDark
                    ? "bg-slate-900 border-slate-700 text-white"
                    : "bg-white border-slate-200 text-slate-900"
                }`}
              >
                <div className="text-center">
                  <h3 className="text-lg font-semibold mb-4">
                    {t(
                      "checkout.confirmOrder.title",
                      "Confirm Your Order"
                    )}
                  </h3>
                  <p className="text-sm mb-6">
                    {t(
                      "checkout.confirmOrder.message",
                      "Are you sure you want to place this order?"
                    )}
                  </p>

                  {/* Order Summary */}
                  <div
                    className={`rounded-xl p-4 mb-6 ${
                      isDark ? "bg-slate-800" : "bg-slate-50"
                    }`}
                  >
                    <h4 className="font-semibold mb-3">
                      {t(
                        "checkout.summary.title",
                        "Order Summary"
                      )}
                    </h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>
                          {t(
                            "checkout.summary.subtotal",
                            "Subtotal"
                          )}
                          :
                        </span>
                        <span>
                          {summary.subtotal?.toLocaleString()} EGP
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>
                          {t(
                            "checkout.summary.shipping",
                            "Shipping"
                          )}
                          :
                        </span>
                        <span>
                          {summary.shipping?.toLocaleString()} EGP
                        </span>
                      </div>
                      <div className="flex justify-between font-semibold border-t pt-2">
                        <span>
                          {t("checkout.summary.total", "Total")}:
                        </span>
                        <span>
                          {summary.total?.toLocaleString()} EGP
                        </span>
                      </div>
                      <div className="text-xs text-slate-500 mt-2">
                        {t("checkout.summary.note", "Items: {{count}}", {
                          count: cartItems.length,
                        })}
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => setShowOrderConfirm(false)}
                      className={`flex-1 rounded-xl px-4 py-2 text-sm font-semibold border ${
                        isDark
                          ? "border-slate-700 text-slate-300 hover:bg-slate-800"
                          : "border-slate-300 text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      {t("common.cancel", "Cancel")}
                    </button>
                    <button
                      onClick={handleConfirmOrder}
                      disabled={loading}
                      className="flex-1 rounded-xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-600 disabled:opacity-70"
                    >
                      {loading
                        ? t(
                            "checkout.actions.processing",
                            "Processing..."
                          )
                        : paymentMethod === "card"
                        ? t(
                            "checkout.confirmOrder.confirmDeduction",
                            "Confirm Deduction"
                          )
                        : t(
                            "checkout.actions.confirmOrder",
                            "Confirm Order"
                          )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}
