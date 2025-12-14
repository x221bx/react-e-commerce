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
        // But only if the order ID matches the current Paymob order
        try {
          const createdFlagRaw = localStorage.getItem("paymob_created_order");
          const createdFlag = createdFlagRaw ? JSON.parse(createdFlagRaw) : null;
          if (createdFlag && createdFlag.paymobOrderId === session?.paymobOrderId) {
            // Only skip if it's the same Paymob order
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

        // Prevent concurrent handlers from creating duplicate orders
        // But only if it's the same Paymob order
        const inflight = localStorage.getItem("paymob_inflight");
        if (inflight) {
          const inflightData = JSON.parse(inflight);
          // Only bail if it's the same Paymob order
          if (inflightData?.paymobOrderId === session?.paymobOrderId) {
            // If another handler is already processing, wait for created flag or bail
            try {
              const createdFlagRaw = localStorage.getItem("paymob_created_order");
              const createdFlag = createdFlagRaw ? JSON.parse(createdFlagRaw) : null;
              if (createdFlag && createdFlag.orderId) {
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
              console.warn("paymob created flag parse error", err);
            }
            // No created flag yet — show pending and bail
            setState({
              status: "pending",
              message: t(
                "checkout.payment.paymobChecking",
                "Confirming card payment..."
              ),
            });
            return;
          }
          // Different Paymob order - continue with creation
        }

        // mark inflight so other handlers won't attempt creation
        try {
          localStorage.setItem(
            "paymob_inflight",
            JSON.stringify({ paymobOrderId: session?.paymobOrderId, ts: Date.now() })
          );

          // Validate draft data before creating order
          if (!draft?.uid && !draft?.userId) {
            throw new Error("User ID is missing from order draft");
          }
          if (!draft?.items || !Array.isArray(draft.items) || draft.items.length === 0) {
            throw new Error("No items in order draft");
          }
          if (!draft?.totals?.total) {
            throw new Error("Total amount is missing from order draft");
          }

          console.log("Creating order with data:", {
            uid: draft.uid || draft.userId,
            itemCount: draft.items.length,
            total: draft.totals.total,
            paymentMethod: "paymob"
          });

          const { id } = await createOrder({
            ...draft,
            paymentMethod: "paymob",
            paymentSummary: paymentDetails.label,
            paymentDetails,
          });

          if (!id) {
            throw new Error("Order creation returned no ID");
          }

          console.log("Order created successfully with ID:", id);

          localStorage.setItem(
            "paymob_created_order",
            JSON.stringify({ paymobOrderId: session?.paymobOrderId, orderId: id })
          );

          // Clear the created flag after 5 minutes to handle edge cases
          setTimeout(() => {
            localStorage.removeItem("paymob_created_order");
          }, 5 * 60 * 1000);

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

          localStorage.setItem("latestOrderId", id);

          navigate(`/account/tracking/${id}`, {
            state: { showPaymentBadge: true },
          });
        } catch (orderError) {
          console.error("Order creation failed:", orderError);
          // Log detailed error information
          console.error("Draft data:", draft);
          console.error("Payment details:", paymentDetails);
          console.error("Session:", session);
          console.error("Meta:", meta);
          
          // Re-throw to be caught by the outer catch block
          throw orderError;
        } finally {
          try {
            localStorage.removeItem("paymob_inflight");
          } catch (e) {
            console.warn("Failed to remove paymob_inflight flag:", e);
          }
        }

      } catch (err) {
        console.error("Paymob callback error", err);
        
        // Log detailed error information for debugging
        console.error("Full error stack:", err.stack);
        console.error("Error name:", err.name);
        console.error("Error message:", err.message);
        
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
