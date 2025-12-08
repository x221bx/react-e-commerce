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

      if (!meta.token || !meta.payer) {
        setState({
          status: "error",
          message: t(
            "checkout.payment.paypalMissingInfo",
            "Missing approval information from PayPal."
          ),
        });
        return;
      }

      const storedOrderId = localStorage.getItem("lastPaypalOrderId");
      const orderId = storedOrderId || meta.token;

      try {
        const capture = await capturePaypalOrder({
          orderId,
          token: meta.token,
          payerId: meta.payer,
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

        const { id } = await createOrder({
          ...draft,
          paymentMethod: "paypal",
          paymentSummary: paymentDetails.label,
          paymentDetails,
        });

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

        // ⭐⭐⭐ التعديل الوحيد المطلوب ⭐⭐⭐
        // احفظ ID علشان نستخدمه في صفحة التتبع
        localStorage.setItem("latestOrderId", id);

        // تحويل مباشر لصفحة التتبع مع تفعيل البادج
        navigate(`/order-tracking/${id}`, {
          state: { showPaymentBadge: true },
        });

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
