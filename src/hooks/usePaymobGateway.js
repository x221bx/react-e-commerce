// src/hooks/usePaymobGateway.js
import { useCallback, useEffect, useState } from "react";
import { createPaymobCardPayment, createPaymobWalletPayment } from "../services/paymob";

/**
 * Encapsulates Paymob session lifecycle: start payment, listen for callback, finalize order.
 */
export function usePaymobGateway({
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
  createOrderFn,
  setLoading,
}) {
  const [showPaymobSheet, setShowPaymobSheet] = useState(false);
  const [paymobSession, setPaymobSession] = useState({
    url: "",
    orderId: "",
    label: "",
    integrationId: null,
  });

  const closePaymobSheet = useCallback(() => {
    setShowPaymobSheet(false);
    setPaymobSession({ url: "", orderId: "", label: "", integrationId: null });
  }, []);

  const startPaymobPayment = useCallback(async () => {
    setLoading(true);
    try {
      const orderRef = `WEB-${Date.now()}`;
      const isWallet = paymentMethod === "paymob_wallet";
      const basePayload = {
        amount: summary.total,
        cartItems,
        form,
        user: {
          email: userEmail,
          displayName: userName,
        },
        merchantOrderId: orderRef,
      };

      const session = isWallet
        ? await createPaymobWalletPayment({
            ...basePayload,
            walletNumber,
          })
        : await createPaymobCardPayment(basePayload);

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

      setPaymobSession({
        url: session.paymentUrl,
        orderId: session.paymobOrderId,
        label: isWallet
          ? t("checkout.payment.paymobWalletTitle", "Paymob Wallet")
          : t("checkout.payment.paymobTitle", "Pay with card (Paymob)"),
        integrationId: isWallet ? import.meta.env.VITE_PAYMOB_WALLET_INTEGRATION_ID : null,
      });
      setShowPaymobSheet(true);
    } catch (err) {
      console.error("Failed to initialize Paymob payment", err);
      toastError(t, err?.message, "checkout.payment.paymobInitError", "Could not start Paymob checkout. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [cartItems, form, paymentMethod, setLoading, summary.total, t, userEmail, userName, walletNumber]);

  // Handle Paymob iframe callback
  useEffect(() => {
    const onPaymobMessage = async (event) => {
      if (!event?.data || event.origin !== window.location.origin) return;
      if (event.data.provider !== "paymob") return;

      setShowPaymobSheet(false);

      const meta = event.data;
      if (meta.status !== "success") {
        const codeText = meta.txnCode ? ` (code ${meta.txnCode})` : "";
        toastError(
          t,
          t("checkout.payment.paymobFailed", "Payment was not completed. Please try again.") + codeText
        );
        localStorage.removeItem("farmvet_pending_order");
        localStorage.removeItem("farmvet_pending_payment_method");
        return;
      }

      try {
        const rawDraft = localStorage.getItem("farmvet_pending_order");
        if (!rawDraft) {
          toastError(
            t,
            t(
              "checkout.payment.orderDraftMissing",
              "Payment approved but no pending order data was found."
            )
          );
          return;
        }

        const draft = JSON.parse(rawDraft);
        const pendingMethod = localStorage.getItem("farmvet_pending_payment_method");
        const isWalletPayment = pendingMethod === "paymob_wallet";
        const storedWalletNumber =
          localStorage.getItem("farmvet_paymob_wallet_number") || "";

        let session = null;
        try {
          const rawSession = localStorage.getItem("farmvet_last_paymob_session");
          if (rawSession) session = JSON.parse(rawSession);
        } catch (err) {
          console.warn("Failed to parse Paymob session", err);
        }

        // Prevent concurrent handlers from creating duplicate orders
        try {
          const inflight = localStorage.getItem("paymob_inflight");
          if (inflight) {
            const createdFlagRaw = localStorage.getItem("paymob_created_order");
            const createdFlag = createdFlagRaw ? JSON.parse(createdFlagRaw) : null;
            if (createdFlag && createdFlag.orderId) {
              toastSuccess(t, "checkout.payment.paymobSuccess", "Payment approved and your order has been created.");
              navigate(`/account/tracking/${createdFlag.orderId}`, {
                state: { showPaymentBadge: true },
              });
              return;
            }
            toastInfo(t, "checkout.payment.paymobChecking", "Confirming payment...");
            return;
          }

          localStorage.setItem(
            "paymob_inflight",
            JSON.stringify({ paymobOrderId: session?.paymobOrderId, ts: Date.now() })
          );

          const paymentDetails = {
            type: isWalletPayment ? "paymob_wallet" : "paymob",
            label: isWalletPayment
              ? t("checkout.payment.paymobWalletTitle", "Paymob Wallet")
              : t("checkout.payment.paymobLabel", "Pay with card (Paymob)"),
            provider: "paymob",
            paymobOrderId: session?.paymobOrderId,
            paymentKey: session?.paymentKey,
            amountCents: session?.amountCents,
            transactionId: meta.transactionId,
            txnCode: meta.txnCode,
            status: meta.status,
            walletNumber: isWalletPayment ? storedWalletNumber : undefined,
          };

          const { id } = await createOrderFn({
            ...draft,
            paymentMethod: isWalletPayment ? "paymob_wallet" : "paymob",
            paymentSummary: paymentDetails.label,
            paymentDetails,
          });

          localStorage.setItem(
            "paymob_created_order",
            JSON.stringify({ paymobOrderId: session?.paymobOrderId, orderId: id })
          );

          setTimeout(() => {
            localStorage.removeItem("paymob_created_order");
          }, 5 * 60 * 1000);

          localStorage.removeItem("farmvet_pending_order");
          localStorage.removeItem("farmvet_pending_payment_method");
          localStorage.removeItem("farmvet_last_paymob_session");
          localStorage.removeItem("farmvet_paymob_wallet_number");

          dispatch(clearCart());

          toastSuccess(t, "checkout.payment.paymobSuccess", "Payment approved and your order has been created.");
          navigate(`/account/invoice/${id}`, { state: { orderId: id } });
        } finally {
          try {
            localStorage.removeItem("paymob_inflight");
          } catch (e) {}
        }
      } catch (err) {
        console.error("Paymob completion error", err);
        toastError(
          t,
          err?.message ||
            t(
              "checkout.payment.paymobCaptureError",
              "Could not finalize order after Paymob payment."
            )
        );
      }
    };

    window.addEventListener("message", onPaymobMessage);
    return () => window.removeEventListener("message", onPaymobMessage);
  }, [clearCart, createOrderFn, dispatch, navigate, t]);

  return {
    paymobSession,
    showPaymobSheet,
    startPaymobPayment,
    closePaymobSheet,
  };
}

const toastError = (t, msg, key, def) => {
  const message = msg || (key ? t(key, def) : def);
  if (window?.toast?.error) window.toast.error(message);
  else console.error(message);
};

const toastSuccess = (t, key, def) => {
  const message = t(key, def);
  if (window?.toast?.success) window.toast.success(message);
  else console.log(message);
};

const toastInfo = (t, key, def) => {
  const message = t(key, def);
  if (window?.toast?.success) window.toast.success(message);
  else console.log(message);
};
