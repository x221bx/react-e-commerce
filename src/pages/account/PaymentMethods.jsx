import { useState } from "react";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { UseTheme } from "../../theme/ThemeProvider";
import { selectCurrentUser } from "../../features/auth/authSlice";
import ConfirmDialog from "../../admin/ConfirmDialog";
import { useCardValidation } from "../../hooks/useCardValidation";
import { usePaymentMethods } from "../../hooks/usePaymentMethods";
import { usePaymentMethodsTheme } from "../../hooks/usePaymentMethodsTheme";
import CardPreview from "../../components/payment/CardPreview";
import CardForm from "../../components/payment/CardForm";
import PaymentMethodsList from "../../components/payment/PaymentMethodsList";

function generateId() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `payment-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export default function PaymentMethods() {
  const { theme } = UseTheme();
  const { t } = useTranslation();
  const user = useSelector(selectCurrentUser);
  const isDark = theme === "dark";
  const cardValidation = useCardValidation();
  const themes = usePaymentMethodsTheme(isDark);

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

    setIsAddingCard(true);
    try {
      await addCard(cardForm, cardValidation.detectBrand, generateId);
      cardValidation.resetCard();
    } catch (err) {
      console.error("Failed to save card", err);
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
      <header className="space-y-3">
        <p className={`text-sm font-semibold uppercase tracking-wide ${themes.accentText}`}>
          {t("payments.eyebrow", "Billing & payments")}
        </p>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className={`text-3xl font-semibold ${themes.headingColor}`}>
              {t("payments.title", "Payment Methods")}
            </h1>
            <p className={`text-sm ${themes.subText}`}>
              {t(
                "payments.subtitle",
                "Manage cards and wallets used for faster checkout."
              )}
            </p>
          </div>
          <div className={`rounded-2xl border px-4 py-2 text-xs font-semibold ${themes.badgeSurface}`}>
            {defaultMethod
              ? `Default: ${defaultMethod.type === "card"
                ? `${defaultMethod.brand?.charAt(0).toUpperCase() + defaultMethod.brand?.slice(1)} **** ${defaultMethod.last4}`
                : defaultMethod.email
              }`
              : "No default method"}
          </div>
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-[2fr,1fr]">
        <PaymentMethodsList
          methods={methods}
          loading={loading}
          onDelete={(id) => setDeleteConfirm(id)}
          onSetDefault={handleSetDefault}
          isDark={isDark}
          t={t}
          headingColor={themes.headingColor}
          subText={themes.subText}
          dashedSurface={themes.dashedSurface}
        />

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
