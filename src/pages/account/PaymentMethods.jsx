import { useState } from "react";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import { UseTheme } from "../../theme/ThemeProvider";
import { selectCurrentUser } from "../../features/auth/authSlice";
import ConfirmDialog from "../../admin/ConfirmDialog";
import { useCardValidation } from "../../hooks/useCardValidation";
import { usePaymentMethods } from "../../hooks/usePaymentMethods";
import CardPreview from "../../components/payment/CardPreview";
import CardForm from "../../components/payment/CardForm";
import PaymentMethodsList from "../../components/payment/PaymentMethodsList";

function generateId() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `payment-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

const hashCardNumber = async (number) => {
  const encoder = new TextEncoder();
  const data = encoder.encode(number);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
};

export default function PaymentMethods() {
  const { theme } = UseTheme();
  const { t } = useTranslation();
  const user = useSelector(selectCurrentUser);
  const isDark = theme === "dark";
  const cardValidation = useCardValidation();

  const {
    methods,
    loading,
    defaultMethod,
    addCard,
    deleteMethod,
    setDefault,
  } = usePaymentMethods(user?.uid);

  const [isAddingCard, setIsAddingCard] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const handleAddCard = async (cardForm) => {
    if (!user?.uid) return;

    // Check for duplicate card
    const sanitized = cardForm.number.replace(/\s+/g, "");
    const hashed = await hashCardNumber(sanitized);
    const isDuplicate = methods.some(
      (method) => method.type === "card" && method.cardHash === hashed
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

    setIsAddingCard(true);
    try {
      await addCard(cardForm, cardValidation.detectBrand, generateId);
      cardValidation.resetCard();
      toast.success(
        t("payments.cardAddedSuccess", "Card added successfully!")
      );
    } catch (err) {
      console.error("Failed to save card", err);
      toast.error(
        t("payments.cardAddedError", "Failed to add card. Please try again.")
      );
    } finally {
      setIsAddingCard(false);
    }
  };

  const handleDeleteMethod = async () => {
    if (!user?.uid || !deleteConfirm) return;

    try {
      await deleteMethod(deleteConfirm);
    } catch (err) {
      console.error("Failed to delete method", err);
    } finally {
      setDeleteConfirm(null);
    }
  };

  const handleSetDefault = async (methodId) => {
    try {
      await setDefault(methodId);
    } catch (err) {
      console.error("Failed to set default", err);
    }
  };

  if (!user) {
    return (
      <div className="p-6 text-center text-slate-600 dark:text-slate-300">
        {t(
          "account.login_required_title",
          "Please log in to view your payment methods"
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">

      {/* HEADER */}
      <header className="space-y-3">

        {/* Eyebrow */}
        <p
          className={`
            text-sm font-semibold uppercase tracking-wide
            ${isDark ? "text-emerald-300" : "text-emerald-700"}
          `}
        >
          {t("payments.eyebrow", "Billing & payments")}
        </p>

        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>

            {/* Title */}
            <h1
              className={`
                text-3xl font-semibold 
                ${isDark ? "text-white" : "text-slate-900"}
              `}
            >
              {t("payments.title", "Payment Methods")}
            </h1>

            {/* Subtitle */}
            <p
              className={`
                text-sm
                ${isDark ? "text-emerald-200/80" : "text-emerald-700/70"}
              `}
            >
              {t(
                "payments.subtitle",
                "Manage cards and wallets used for faster checkout."
              )}
            </p>
          </div>

          {/* Default Method Box */}
          <div
            className={`
              rounded-2xl border px-4 py-2 text-xs font-semibold
              ${
                isDark
                  ? "bg-emerald-900/20 border-emerald-900/40 text-emerald-200"
                  : "bg-emerald-50 border-emerald-200 text-emerald-700"
              }
            `}
          >
            {defaultMethod
              ? `Default: ${
                  defaultMethod.type === "card"
                    ? `${defaultMethod.brand
                        ?.charAt(0)
                        .toUpperCase() + defaultMethod.brand?.slice(1)} **** ${
                        defaultMethod.last4
                      }`
                    : defaultMethod.email
                }`
              : "No default method"}
          </div>
        </div>
      </header>

      {/* MAIN LAYOUT */}
      <div className="grid gap-6 lg:grid-cols-[2fr,1fr]">
        
        {/* PAYMENT METHODS LIST */}
        <PaymentMethodsList
          methods={methods}
          loading={loading}
          onDelete={(id) => setDeleteConfirm(id)}
          onSetDefault={handleSetDefault}
          isDark={isDark}
          t={t}
          headingColor={isDark ? "text-white" : "text-slate-900"}
          subText={isDark ? "text-emerald-200/80" : "text-emerald-700/70"}
          dashedSurface={
            isDark
              ? "border-2 border-dashed border-emerald-900/40"
              : "border-2 border-dashed border-emerald-300"
          }
        />

        {/* CARD PREVIEW + FORM */}
        <aside className="space-y-5">
          <CardPreview
            cardForm={cardValidation.cardForm}
            detectBrand={cardValidation.detectBrand}
            formatCardNumber={cardValidation.formatCardNumber}
            formatExpiry={cardValidation.formatExpiry}
            isDark={isDark}
          />

          <CardForm
            cardValidation={cardValidation}
            onSubmit={handleAddCard}
            isLoading={isAddingCard}
            isDark={isDark}
          />
        </aside>
      </div>

      {/* DELETE DIALOG */}
      <ConfirmDialog
        open={!!deleteConfirm}
        title={t("payments.confirmDeleteTitle", "Delete Payment Method")}
        message={t(
          "payments.confirmDeleteMessage",
          "Are you sure you want to delete this payment method? This action cannot be undone."
        )}
        confirmText={t("common.delete", "Delete")}
        cancelText={t("common.cancel", "Cancel")}
        onConfirm={handleDeleteMethod}
        onCancel={() => setDeleteConfirm(null)}
        confirmTone="danger"
      />
    </div>
  );
}
