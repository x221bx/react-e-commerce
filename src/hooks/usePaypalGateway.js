// src/hooks/usePaypalGateway.js
import { useCallback, useState } from "react";

/**
 * Encapsulates PayPal inline flow: open sheet, handle success/error, and create order.
 */
export function usePaypalGateway({
  t,
  summary,
  createOrderFn,
  navigate,
  dispatch,
  clearCart,
  setLoading,
}) {
  const [showPaypalSheet, setShowPaypalSheet] = useState(false);
  const [paypalOrderRef, setPaypalOrderRef] = useState("");
  const [paypalError, setPaypalError] = useState("");
  const [pendingPaypalDraft, setPendingPaypalDraft] = useState(null);

  const closePaypalSheet = useCallback(() => {
    setShowPaypalSheet(false);
    setPendingPaypalDraft(null);
    setPaypalError("");
  }, []);

  const openPaypalSheet = useCallback((draft) => {
    setPendingPaypalDraft(draft);
    setPaypalOrderRef(`WEB-${Date.now()}`);
    setPaypalError("");
    setShowPaypalSheet(true);
  }, []);

  const handlePaypalSuccess = useCallback(
    async (capture) => {
      setShowPaypalSheet(false);
      setLoading(true);
      try {
        const paypalOrderId =
          capture?.orderId || capture?.token || capture?.raw?.id || null;
        const paypalCaptureId =
          capture?.captureId ??
          capture?.id ??
          capture?.raw?.id ??
          capture?.raw?.purchase_units?.[0]?.payments?.captures?.[0]?.id ??
          null;

        const paymentDetails = {
          type: "paypal",
          label: t("checkout.payment.paypalLabel", "PayPal"),
          provider: "paypal",
          paypalOrderId,
          paypalCaptureId,
          status: capture?.status || capture?.raw?.status || null,
          payerEmail:
            capture?.raw?.payer?.email_address ||
            capture?.payer?.email_address ||
            null,
        };

        const draft = pendingPaypalDraft;
        if (!draft) {
          throw new Error(
            t("checkout.payment.orderDraftMissing", "Payment approved but no pending order data was found.")
          );
        }

        const { id } = await createOrderFn({
          ...draft,
          paymentMethod: "paypal",
          paymentSummary: paymentDetails.label,
          paymentDetails,
        });

        dispatch(clearCart());
        toastSuccess(t, "checkout.payment.paypalSuccess", "Payment completed and your order has been created.");
        navigate(`/account/invoice/${id}`, { state: { orderId: id } });
      } catch (err) {
        console.error("PayPal completion error", err);
        toastError(
          t,
          err?.message ||
            t(
              "checkout.payment.paypalCaptureError",
              "Could not confirm PayPal payment."
            )
        );
      } finally {
        setLoading(false);
        setPendingPaypalDraft(null);
      }
    },
    [clearCart, createOrderFn, dispatch, navigate, pendingPaypalDraft, setLoading, t]
  );

  const handlePaypalError = useCallback(
    (message) => {
      const msg =
        message ||
        t(
          "checkout.payment.paypalInitError",
          "Could not start PayPal checkout. Please try again."
        );
      setPaypalError(msg);
      toastError(t, msg);
    },
    [t]
  );

  return {
    showPaypalSheet,
    paypalOrderRef,
    paypalError,
    openPaypalSheet,
    closePaypalSheet,
    handlePaypalSuccess,
    handlePaypalError,
  };
}

const toastError = (t, msg) => {
  const message = msg || t("common.error", "Error");
  if (window?.toast?.error) window.toast.error(message);
  else console.error(message);
};

const toastSuccess = (t, key, def) => {
  const message = t(key, def);
  if (window?.toast?.success) window.toast.success(message);
  else console.log(message);
};
