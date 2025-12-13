// src/pages/PaypalCallback.jsx
import React, { useEffect, useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { useDispatch } from "react-redux";
import { useTranslation } from "react-i18next";

import { capturePaypalOrder, parsePaypalRedirect } from "../services/paypal";
import { createOrder } from "../services/ordersService";
import { clearCart } from "../features/cart/cartSlice";

export default function PaypalCallback() {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { t } = useTranslation();

  const [state, setState] = useState({
    status: "pending",
    message: t(
      "checkout.payment.paypalChecking",
      "Confirming PayPal payment..."
    ),
  });

  useEffect(() => {
    const run = async () => {
      const meta = parsePaypalRedirect(window.location.href);
      
      // Only proceed with capture if status is success AND we have payer ID
      if (meta.status === "cancel") {
        setState({
          status: "cancel",
          message: t(
            "checkout.payment.paypalCancelled",
            "Payment was cancelled."
          ),
        });
        localStorage.removeItem("farmvet_pending_order");
        localStorage.removeItem("farmvet_pending_payment_method");
        return;
      }
      
      // If no payer ID, the order was not approved
      if (!meta.token || !meta.payer) {
        setState({
          status: "error",
          message: t(
            "checkout.payment.paypalMissingInfo",
            "Payment was not approved. Please try again."
          ),
        });
        localStorage.removeItem("farmvet_pending_order");
        localStorage.removeItem("farmvet_pending_payment_method");
        return;
      }

      const storedOrderId = localStorage.getItem("lastPaypalOrderId");
      const storedReference = localStorage.getItem("lastPaypalReference");
      const orderId = meta.token || storedOrderId;

      try {
        const capture = await capturePaypalOrder({
          orderId,
          reference: storedReference,
        });

        if (capture.status !== "COMPLETED") {
          setState({
            status: "pending",
            message: t(
              "checkout.payment.paypalNotCompleted",
              "Payment not completed. Status: {{status}}",
              { status: capture.status || "UNKNOWN" }
            ),
          });
          return;
        }

        const rawDraft = localStorage.getItem("farmvet_pending_order");
        if (!rawDraft) {
          setState({
            status: "error",
            message: t(
              "checkout.payment.orderDraftMissing",
              "Payment captured but no pending order data was found."
            ),
          });
          return;
        }

        const draft = JSON.parse(rawDraft);

        const paymentDetails = {
          type: "paypal",
          label: t("checkout.payment.paypalLabel", "PayPal"),
          provider: "paypal",
          paypalOrderId: orderId,
          paypalCaptureId: capture.captureId,
          status: capture.status,
        };

        // Prevent duplicate creation (in case redirect and inline handlers both run)
        const inflightPaypal = localStorage.getItem("paypal_inflight");
        if (inflightPaypal) {
          try {
            const createdFlagRaw = localStorage.getItem("paypal_created_order");
            const createdFlag = createdFlagRaw ? JSON.parse(createdFlagRaw) : null;
            if (createdFlag && createdFlag.orderId) {
              setState({
                status: "success",
                message: t(
                  "checkout.payment.paypalSuccess",
                  "Payment completed and your order has been created."
                ),
              });
              navigate(`/order-tracking/${createdFlag.orderId}`, {
                state: { showPaymentBadge: true },
              });
              return;
            }
          } catch (err) {
            console.warn("paypal created flag parse error", err);
          }
          setState({ status: "pending", message: t("checkout.payment.paypalChecking", "Confirming PayPal payment...") });
          return;
        }

        try {
          localStorage.setItem(
            "paypal_inflight",
            JSON.stringify({ paypalOrderId: orderId, ts: Date.now() })
          );

          const { id } = await createOrder({
            ...draft,
            paymentMethod: "paypal",
            paymentSummary: paymentDetails.label,
            paymentDetails,
          });

          localStorage.setItem(
            "paypal_created_order",
            JSON.stringify({ paypalOrderId: orderId, orderId: id })
          );

          // cleanup created flag after 5 minutes
          setTimeout(() => {
            localStorage.removeItem("paypal_created_order");
          }, 5 * 60 * 1000);

          localStorage.removeItem("farmvet_pending_order");
          localStorage.removeItem("farmvet_pending_payment_method");
          localStorage.removeItem("lastPaypalOrderId");

          dispatch(clearCart());

          setState({
            status: "success",
            message: t(
              "checkout.payment.paypalSuccess",
              "Payment completed and your order has been created."
            ),
          });

          localStorage.setItem("latestOrderId", id);

          navigate(`/order-tracking/${id}`, {
            state: { showPaymentBadge: true },
          });
        } finally {
          try {
            localStorage.removeItem("paypal_inflight");
          } catch (e) {}
        }

      } catch (err) {
        console.error("PayPal callback error", err);
        setState({
          status: "error",
          message:
            err?.message ||
            t(
              "checkout.payment.paypalCaptureError",
              "Could not confirm PayPal payment."
            ),
        });
      }
    };

    run();
  }, [location, navigate, dispatch, t]);

  return (
    <div style={{ padding: 20 }}>
      <h1>PayPal Result</h1>
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
