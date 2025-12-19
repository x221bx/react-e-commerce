// src/pages/account/PaymentMethods.jsx
import { useState } from "react";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import { selectCurrentUser } from "../../features/auth/authSlice";
import { useCardValidation } from "../../hooks/useCardValidation";
import { usePaymentMethods } from "../../hooks/usePaymentMethods";
import ConfirmDialog from "../../admin/ConfirmDialog";
import PaymentMethodsList from "../../components/payment/PaymentMethodsList";
import Section from "../../components/ui/Section";
import EmptyState from "../../components/ui/EmptyState";
import Button from "../../components/ui/Button";

function generateId() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `payment-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

const hashCardNumber = async (number) => {
  const encoder = new TextEncoder();
  const data = encoder.encode(number);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
};

export default function PaymentMethods() {
  const { t } = useTranslation();
  const user = useSelector(selectCurrentUser);
  const cardValidation = useCardValidation();

  const { methods, loading, defaultMethod, addCard, deleteMethod, setDefault } = usePaymentMethods(user?.uid);

  const [isAddingCard, setIsAddingCard] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const handleAddCard = async (cardForm) => {
    if (!user?.uid) return;

    const sanitized = cardForm.number.replace(/\s+/g, "");
    const hashed = await hashCardNumber(sanitized);
    const isDuplicate = methods.some((method) => method.type === "card" && method.cardHash === hashed);

    if (isDuplicate) {
      toast.error(t("payments.duplicateCardError", "This card already exists in your saved payment methods."));
      return;
    }

    setIsAddingCard(true);
    try {
      await addCard(cardForm, cardValidation.detectBrand, generateId);
      cardValidation.resetCard();
      toast.success(t("payments.cardAddedSuccess", "Card added successfully!"));
    } catch (err) {
      console.error("Failed to save card", err);
      toast.error(t("payments.cardAddedError", "Failed to add card. Please try again."));
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
      <Section title={t("account.payment_methods", "Payment Methods")}>
        <EmptyState
          title={t("account.login_required_title", "Please log in to view your payment methods")}
          message={t("account.login_required_subtitle", "Sign in to manage your saved cards and preferences.")}
          action={<Button onClick={() => (window.location.href = "/login")}>{t("common.login", "Login")}</Button>}
        />
      </Section>
    );
  }

  return (
    <div className="space-y-6">
      <Section
        title={t("account.payment_methods", "Payment Methods")}
        subtitle={t("account.payment_description", "Manage saved cards and choose your default payment option.")}
      >
        <PaymentMethodsList
          methods={methods}
          defaultMethod={defaultMethod}
          loading={loading}
          onDelete={(id) => setDeleteConfirm(id)}
          onSetDefault={handleSetDefault}
        />

        <div className="mt-4 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface-muted)] p-4 text-sm text-[var(--color-text-muted)]">
          {t("payments.info.note", "Payments are processed securely at checkout via Paymob/PayPal. Saved cards here are informational and not charged directly.")}
        </div>
      </Section>

      <ConfirmDialog
        isOpen={!!deleteConfirm}
        title={t("payments.deleteTitle", "Remove payment method?")}
        message={t("payments.deleteBody", "This action cannot be undone.")}
        onConfirm={handleDeleteMethod}
        onCancel={() => setDeleteConfirm(null)}
        confirmText={t("common.delete", "Delete")}
        cancelText={t("common.cancel", "Cancel")}
      />
    </div>
  );
}
