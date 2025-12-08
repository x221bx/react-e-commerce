// src/pages/PaymobCallback.jsx
import React, { useEffect, useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { useDispatch } from "react-redux";
import { useTranslation } from "react-i18next";

import { parsePaymobRedirect } from "../services/paymob";
import { createOrder } from "../services/ordersService";
import { clearCart } from "../features/cart/cartSlice";

export default function PaymobCallback() {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { t } = useTranslation();

  const [state, setState] = useState({
    status: "pending",
    message: t(
      "checkout.payment.paymobChecking",
      "Confirming card payment..."
    ),
  });

  useEffect(() => {
    const run = async () => {
      const meta = parsePaymobRedirect(window.location.href);

      // أي حاجة غير success → مفيش أوردر
      if (meta.status !== "success") {
        const codeText = meta.txnCode ? ` (code ${meta.txnCode})` : "";
        setState({
          status: "failed",
          message:
            t(
              "checkout.payment.paymobFailed",
              "Payment was not completed. Please try again."
            ) + codeText,
        });
        localStorage.removeItem("farmvet_pending_order");
        localStorage.removeItem("farmvet_pending_payment_method");
        return;
      }

      try {
        const rawDraft = localStorage.getItem("farmvet_pending_order");
        if (!rawDraft) {
          setState({
            status: "error",
            message: t(
              "checkout.payment.orderDraftMissing",
              "Payment approved but no pending order data was found."
            ),
          });
          return;
        }

        const draft = JSON.parse(rawDraft);

        let session = null;
        try {
          const rawSession = localStorage.getItem("farmvet_last_paymob_session");
          if (rawSession) session = JSON.parse(rawSession);
        } catch (err) {
          console.warn("Failed to parse Paymob session", err);
        }

        const paymentDetails = {
          type: "paymob",
          label: t(
            "checkout.payment.paymobLabel",
            "Pay with card (Paymob)"
          ),
          provider: "paymob",
          paymobOrderId: session?.paymobOrderId,
          paymentKey: session?.paymentKey,
          amountCents: session?.amountCents,
          transactionId: meta.transactionId,
          txnCode: meta.txnCode,
          status: meta.status,
        };

        const { id } = await createOrder({
          ...draft,
          paymentMethod: "paymob",
          paymentSummary: paymentDetails.label,
          paymentDetails,
        });

        localStorage.removeItem("farmvet_pending_order");
        localStorage.removeItem("farmvet_pending_payment_method");
        localStorage.removeItem("farmvet_last_paymob_session");

        dispatch(clearCart());

        setState({
          status: "success",
          message: t(
            "checkout.payment.paymobSuccess",
            "Payment approved and your order has been created."
          ),
        });

        navigate(`/account/invoice/${id}`, { state: { orderId: id } });
      } catch (err) {
        console.error("Paymob callback error", err);
        setState({
          status: "error",
          message:
            err?.message ||
            t(
              "checkout.payment.paymobCaptureError",
              "Could not finalize order after Paymob payment."
            ),
        });
      }
    };

    run();
  }, [location, navigate, dispatch, t]);

  return (
    <div style={{ padding: 20 }}>
      <h1>Paymob Result</h1>
      <p>Status: {state.status}</p>
      <p>{state.message}</p>
      {state.status !== "success" && (
        <p style={{ marginTop: 12 }}>
          <Link to="/checkout">Back to checkout</Link>
        </p>
      )}
    </div>
  );
}
