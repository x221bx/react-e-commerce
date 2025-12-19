// src/pages/Checkout.jsx
import React, { useMemo, useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";

import CheckoutContactForm from "../components/checkout/CheckoutContactForm";
import CheckoutShippingForm from "../components/checkout/CheckoutShippingForm";
import CheckoutPaymentSection from "../components/checkout/CheckoutPaymentSection";
import CheckoutSummary from "../components/checkout/CheckoutSummary";
import CheckoutEmpty from "../components/checkout/CheckoutEmpty";
import CheckoutLoginPrompt from "../components/checkout/CheckoutLoginPrompt";
import OrderConfirmModal from "../components/checkout/OrderConfirmModal";
import PaymobSheet from "../components/checkout/PaymobSheet";
import PaypalSheet from "../components/checkout/PaypalSheet";

import { clearCart } from "../features/cart/cartSlice";
import { selectCurrentUser } from "../features/auth/authSlice";
import { createOrder } from "../services/ordersService";
import { auth } from "../services/firebase";

import { useCheckoutForm } from "../hooks/useCheckoutForm";
import { useUserProfile } from "../hooks/useUserProfile";
import { useOrderSummary } from "../hooks/useOrderSummary";
import { usePaymobGateway } from "../hooks/usePaymobGateway";
import { usePaypalGateway } from "../hooks/usePaypalGateway";
import { UseTheme } from "../theme/ThemeProvider";
import Footer from "../Authcomponents/Footer";
import { ensureProductLocalization } from "../utils/productLocalization";

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

  const {
    form,
    setForm,
    errors,
    formErrors,
    validate,
    handlePhoneChange,
  } = useCheckoutForm(user);
  useUserProfile(user?.uid, form, setForm);

  const summary = useOrderSummary(cartItems);

  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [showOrderConfirm, setShowOrderConfirm] = useState(false);
  const [walletNumber, setWalletNumber] = useState("");

  const paypalClientId =
    import.meta.env.VITE_PAYPAL_CLIENT_ID ||
    import.meta.env.PAYPAL_CLIENT_ID ||
    "";
  const paypalCurrency = import.meta.env.VITE_PAYPAL_CURRENCY || "USD";

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
        title: t("checkout.payment.paymobTitle", "Pay with card (Paymob)"),
        subtitle: t(
          "checkout.payment.paymobSubtitle",
          "Secure Visa/Mastercard via Paymob"
        ),
      },
      {
        value: "paymob_wallet",
        type: "paymob_wallet",
        title: t("checkout.payment.paymobWalletTitle", "Paymob Wallet"),
        subtitle: t(
          "checkout.payment.paymobWalletSubtitle",
          "Pay using your Paymob-supported mobile wallet"
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
    ],
    [t]
  );

  const buildPaymentDetails = () => {
    if (paymentMethod === "paymob" || paymentMethod === "paymob_wallet") {
      return {
        type: paymentMethod,
        label:
          paymentMethod === "paymob_wallet"
            ? t("checkout.payment.paymobWalletTitle", "Paymob Wallet")
            : t("checkout.payment.paymobLabel", "Pay with card (Paymob)"),
      };
    }
    if (paymentMethod === "paypal") {
      return { type: "paypal", label: t("checkout.payment.paypalLabel", "PayPal") };
    }
    return { type: "cod", label: t("checkout.payment.cod.title") };
  };

  const buildOrderDraft = useCallback(() => {
    const normalizedItems = cartItems.map((item) => {
      const normalized = ensureProductLocalization(item);
      return {
        ...normalized,
        name:
          normalized.name ||
          normalized.titleEn ||
          normalized.titleAr ||
          normalized.title ||
          normalized.productName,
      };
    });

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
      items: normalizedItems,
      notes: form.notes.trim(),
    };
  }, [cartItems, firebaseUser?.uid, form.address, form.city, form.fullName, form.notes, form.phone, summary, user?.uid, userEmail, userName]);

  const placeOrder = useCallback(async () => {
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
      const draft = buildOrderDraft();

      const { id } = await createOrder({
        ...draft,
        paymentMethod: paymentDetails.type,
        paymentSummary: paymentDetails.label,
        paymentDetails,
      });

      dispatch(clearCart());
      toast.success(t("checkout.messages.success"));
      navigate(`/account/invoice/${id}`, { state: { orderId: id } });
    } catch (err) {
      console.error("Checkout error:", err);
      toast.error(err?.message || t("checkout.messages.failure", "Something went wrong."));
    } finally {
      setLoading(false);
    }
  }, [buildOrderDraft, buildPaymentDetails, cartItems, dispatch, firebaseUser?.uid, navigate, t, user?.uid]);

  const {
    paymobSession,
    showPaymobSheet,
    startPaymobPayment,
    closePaymobSheet,
  } = usePaymobGateway({
    t,
    paymentMethod,
    walletNumber,
    summary,
    cartItems,
    form,
    userEmail,
    userName,
    navigate,
    dispatch,
    clearCart,
    createOrderFn: createOrder,
    setLoading,
  });

  const {
    showPaypalSheet,
    paypalOrderRef,
    paypalError,
    openPaypalSheet,
    closePaypalSheet,
    handlePaypalSuccess,
    handlePaypalError,
  } = usePaypalGateway({
    t,
    summary,
    createOrderFn: createOrder,
    navigate,
    dispatch,
    clearCart,
    setLoading,
  });

  const handleSubmit = (event) => {
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
    setShowOrderConfirm(true);
  };

  const handleConfirmOrder = async () => {
    setShowOrderConfirm(false);

    if (paymentMethod === "paymob_wallet") {
      const digits = walletNumber.replace(/\D/g, "");
      const isValidEgyptian = /^01[0-9]{9}$/.test(digits);
      if (!isValidEgyptian) {
        toast.error(
          t("checkout.payment.paymobWalletNumberError", "Please enter a valid wallet number.")
        );
        return;
      }
    }

    if (paymentMethod === "paymob" || paymentMethod === "paymob_wallet") {
      const draft = buildOrderDraft();
      try {
        localStorage.setItem("farmvet_pending_order", JSON.stringify(draft));
        localStorage.setItem("farmvet_pending_payment_method", paymentMethod);
        if (paymentMethod === "paymob_wallet") {
          localStorage.setItem("farmvet_paymob_wallet_number", walletNumber);
        }
      } catch (err) {
        console.warn("Failed to persist pending order", err);
      }
      await startPaymobPayment();
      return;
    }

    if (paymentMethod === "paypal") {
      if (!paypalClientId) {
        toast.error(
          t("checkout.payment.paypalMissingClient", "PayPal client ID is missing in environment config.")
        );
        return;
      }
      const draft = buildOrderDraft();
      openPaypalSheet(draft);
      return;
    }

    await placeOrder();
  };

  const handlePaymentSelection = (value) => {
    setPaymentMethod(value);
  };

  const headingColor = "text-[var(--color-text)]";
  const muted = "text-[var(--color-text-muted)]";
  const shellSurface =
    "bg-[var(--color-surface)] border border-[var(--color-border)] shadow-[var(--shadow-sm)]";
  const summarySurface =
    "bg-[var(--color-surface)] border border-[var(--color-border)] shadow-[var(--shadow-sm)]";
  const pillBg =
    "bg-[var(--color-accent)]/10 text-[var(--color-accent)] border border-[var(--color-border)]";

  if (!cartItems.length) return <CheckoutEmpty t={t} isRTL={isRTL} muted={muted} />;
  if (!user) return <CheckoutLoginPrompt t={t} isRTL={isRTL} />;

  return (
    <main
      dir={isRTL ? "rtl" : "ltr"}
      className="
        min-h-screen flex flex-col
        bg-[var(--color-bg)] text-[var(--color-text)]
        transition-colors duration-300
      "
    >
      <div className="border-b border-[var(--color-border)] bg-[var(--color-surface)]/60">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-8 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3 text-sm font-semibold text-[var(--color-accent)]">
            <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-[var(--color-accent)] text-white text-[11px]">
              1
            </span>
            {t("checkout.header.eyebrow", "Checkout")}
          </div>
          <div className={`flex items-center gap-3 rounded-[var(--radius-md)] px-3 py-2 text-xs md:text-[13px] ${pillBg}`}>
            <span className="inline-flex h-6 w-6 items-center justify-center rounded-xl bg-[var(--color-accent)] text-white text-[11px] font-bold">
              3
            </span>
            <div className="flex flex-col">
              <span className="font-semibold text-[var(--color-text)]">
                {t("checkout.progress.title", "Almost there")}
              </span>
              <span className={`text-[11px] ${muted}`}>
                {t("checkout.progress.caption", "Complete your details and place your order securely.")}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 sm:px-6 pt-6">
        <h1 className={`text-3xl md:text-4xl font-semibold ${headingColor}`}>
          {t("checkout.header.title", "Review and confirm")}
        </h1>
        <p className={`mt-2 text-sm md:text-[15px] ${muted}`}>
          {t("checkout.header.subtitle", "Confirm your contact info, address, and payment method to place your order.")}
        </p>
      </div>

      <div className="flex-1 pb-10 pt-2">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="grid gap-6 lg:grid-cols-[2fr,1fr] lg:items-start">
            <form
              className={`rounded-3xl border p-6 md:p-7 space-y-6 ${shellSurface}`}
              onSubmit={handleSubmit}
            >
              {formErrors && (
                <div
                  className={`rounded-2xl border px-4 py-3 text-sm flex items-start gap-2 ${
                    isDark
                      ? "border-red-900/50 bg-red-950/70 text-red-200"
                      : "border-red-200 bg-red-50 text-red-700"
                  }`}
                >
                  <span className="mt-0.5 inline-block h-2 w-2 rounded-full bg-red-500" />
                  <span>{formErrors}</span>
                </div>
              )}

              <CheckoutContactForm
                form={form}
                setForm={setForm}
                errors={errors}
                handlePhoneChange={handlePhoneChange}
              />

              <div className="border-t border-[var(--color-border)] pt-5">
                <CheckoutShippingForm form={form} setForm={setForm} errors={errors} />
              </div>

              <div className="border-t border-[var(--color-border)] pt-5 space-y-4">
                <CheckoutPaymentSection
                  paymentMethod={paymentMethod}
                  handlePaymentSelection={handlePaymentSelection}
                  paymentOptions={paymentOptions}
                  walletNumber={walletNumber}
                  onWalletNumberChange={setWalletNumber}
                />
              </div>

              <div className="flex flex-wrap gap-3 pt-3">
                <Link
                  to="/cart"
                  className="rounded-[var(--radius-md)] border border-[var(--color-border)] px-5 py-2 text-sm font-semibold text-[var(--color-text)] transition hover:bg-[var(--color-surface-muted)]"
                >
                  {t("checkout.actions.backToCart", "Back to Cart")}
                </Link>
                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex items-center rounded-[var(--radius-md)] bg-[var(--color-accent)] px-6 py-2 text-sm font-semibold text-white shadow-[var(--shadow-sm)] hover:brightness-95 disabled:opacity-70"
                >
                  {loading
                    ? t("checkout.actions.processing", "Processing...")
                    : t("checkout.actions.confirmOrder", "Confirm Order")}
                </button>
              </div>
            </form>

            <aside className="space-y-4">
              <div className={`rounded-3xl border p-6 ${summarySurface}`}>
                <CheckoutSummary cartItems={cartItems} summary={summary} />
              </div>
              <div className="rounded-[var(--radius-md)] px-4 py-3 text-xs md:text-[13px] flex items-start gap-3 border border-[var(--color-border)] bg-[var(--color-surface-muted)] text-[var(--color-text)]">
                <span className="mt-0.5 inline-flex h-5 w-5 items-center justify-center rounded-full bg-[var(--color-accent)] text-white text-[10px] font-bold">
                  *
                </span>
                <p>
                  {t(
                    "checkout.securityNote",
                    "Your payment information is encrypted and processed securely. We never store full card numbers on our servers."
                  )}
                </p>
              </div>
            </aside>
          </div>
        </div>

        <OrderConfirmModal
          isOpen={showOrderConfirm}
          onCancel={() => setShowOrderConfirm(false)}
          onConfirm={handleConfirmOrder}
          loading={loading}
          summary={summary}
          cartItems={cartItems}
          mutedClass={muted}
          t={t}
        />
      </div>

      <Footer />

      <PaymobSheet
        isOpen={showPaymobSheet}
        session={paymobSession}
        onClose={closePaymobSheet}
        mutedClass={muted}
        t={t}
      />

      <PaypalSheet
        isOpen={showPaypalSheet}
        onClose={closePaypalSheet}
        summary={summary}
        paypalClientId={paypalClientId}
        paypalCurrency={paypalCurrency}
        paypalOrderRef={paypalOrderRef}
        onSuccess={handlePaypalSuccess}
        onError={handlePaypalError}
        errorMessage={paypalError}
        mutedClass={muted}
        t={t}
      />
    </main>
  );
}
