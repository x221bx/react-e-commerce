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

      // إذا كان الدفع مفتوح داخل overlay أو popup، أرسل النتيجة للصفحة الأصلية واتركها تتولى إنشاء الطلب
      const targetOrigin = window.location.origin;
      if (window.opener || window.parent !== window) {
        try {
          window.opener?.postMessage({ provider: "paymob", ...meta }, targetOrigin);
          if (window.parent !== window) {
            window.parent.postMessage({ provider: "paymob", ...meta }, targetOrigin);
          }
        } catch (err) {
          console.warn("Paymob callback postMessage failed", err);
        }
        return;
      }

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


        // Avoid duplicate order creation if callback fires twice
        try {
          const createdFlagRaw = localStorage.getItem("paymob_created_order");
          const createdFlag = createdFlagRaw ? JSON.parse(createdFlagRaw) : null;
          if (createdFlag?.paymobOrderId && createdFlag.paymobOrderId === session?.paymobOrderId) {
            setState({
              status: "success",
              message: t(
                "checkout.payment.paymobSuccess",
                "Payment approved and your order has been created."
              ),
            });
            navigate(`/account/tracking/${createdFlag.orderId}`, {
              state: { showPaymentBadge: true },
            });
            return;
          }
        } catch (err) {
          console.warn("Paymob duplicate guard parse error", err);
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

        localStorage.setItem(
          "paymob_created_order",
          JSON.stringify({ paymobOrderId: session?.paymobOrderId, orderId: id })
        );

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

        // ⭐⭐⭐ التعديل الوحيد المطلوب ⭐⭐⭐
        // احفظ ID علشان نستخدمه في صفحة التتبع
        localStorage.setItem("latestOrderId", id);

        // تحويل مباشر لصفحة التتبع مع تفعيل البادج
        navigate(`/account/tracking/${id}`, {
          state: { showPaymentBadge: true },
        });

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

  const isSuccess = state.status === "success";
  const isPending = state.status === "pending";

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-emerald-900/40 to-slate-950 text-white flex items-center justify-center px-4">
      <div className="w-full max-w-xl">
        <div className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-[0_25px_80px_rgba(0,0,0,0.45)] p-8">
          <div className="flex items-center gap-3 mb-6">
            <div
              className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl ${
                isSuccess
                  ? "bg-emerald-500/20 text-emerald-300 border border-emerald-400/40"
                  : isPending
                  ? "bg-amber-500/15 text-amber-300 border border-amber-300/40"
                  : "bg-rose-500/15 text-rose-300 border border-rose-300/40"
              }`}
            >
              {isSuccess ? "✓" : isPending ? "…" : "!"}
            </div>
            <div>
              <p className="text-sm uppercase tracking-[0.25em] text-white/70">
                Paymob Result
              </p>
              <h1 className="text-2xl font-semibold">
                {isSuccess
                  ? t("checkout.payment.paymobSuccess", "Payment confirmed")
                  : isPending
                  ? t("checkout.payment.paymobChecking", "Confirming payment")
                  : t("checkout.payment.paymobFailed", "Payment issue")}
              </h1>
            </div>
          </div>

          <div className="space-y-3 text-white/90">
            <div className="flex items-center gap-2 text-sm">
              <span className="text-white/60">{t("common.status", "Status")}:</span>
              <span
                className={
                  isSuccess
                    ? "text-emerald-300"
                    : isPending
                    ? "text-amber-200"
                    : "text-rose-300"
                }
              >
                {state.status}
              </span>
            </div>
            <p className="leading-relaxed text-base">{state.message}</p>
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            {state.status !== "success" && (
              <Link
                to="/checkout"
                className="inline-flex items-center justify-center px-4 py-2.5 rounded-xl bg-rose-500/20 text-rose-100 border border-rose-400/40 hover:bg-rose-500/30 transition"
              >
                {t("checkout.actions.retry", "Back to checkout")}
              </Link>
            )}
            <Link
              to="/"
              className="inline-flex items-center justify-center px-4 py-2.5 rounded-xl bg-white/10 text-white border border-white/10 hover:bg-white/15 transition"
            >
              {t("common.backHome", "Go to Home")}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
