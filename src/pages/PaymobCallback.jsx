// src/pages/PaymobCallback.jsx
import React, { useEffect, useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { useDispatch } from "react-redux";
import { useTranslation } from "react-i18next";
import { CheckCircle, AlertTriangle, Loader2 } from "lucide-react";

import { parsePaymobRedirect } from "../services/paymob";
import { createOrder } from "../services/ordersService";
import { clearCart } from "../features/cart/cartSlice";

const StatusIcon = ({ status }) => {
  if (status === "success") return <CheckCircle className="h-12 w-12 text-emerald-500" />;
  if (status === "failed" || status === "error") return <AlertTriangle className="h-12 w-12 text-red-500" />;
  return <Loader2 className="h-12 w-12 animate-spin text-emerald-500" />;
};

export default function PaymobCallback() {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { t } = useTranslation();

  const [state, setState] = useState({
    status: "pending",
    message: t("checkout.payment.paymobChecking", "Confirming card payment..."),
    orderId: null,
  });

  useEffect(() => {
    const run = async () => {
      const meta = parsePaymobRedirect(window.location.href);

      if (meta.status !== "success") {
        const codeText = meta.txnCode ? ` (code ${meta.txnCode})` : "";
        setState({
          status: "failed",
          message:
            t("checkout.payment.paymobFailed", "Payment was not completed. Please try again.") +
            codeText,
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
          label: t("checkout.payment.paymobLabel", "Pay with card (Paymob)"),
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
          orderId: id,
        });

        navigate(`/account/invoice/${id}`, { state: { orderId: id } });
      } catch (err) {
        console.error("Paymob callback error", err);
        setState({
          status: "error",
          message:
            err?.message ||
            t("checkout.payment.paymobCaptureError", "Could not finalize order after Paymob payment."),
        });
      }
    };

    run();
  }, [location, navigate, dispatch, t]);

  const bg =
    state.status === "success"
      ? "from-emerald-50 to-white"
      : state.status === "failed" || state.status === "error"
      ? "from-rose-50 to-white"
      : "from-emerald-50 to-white";

  return (
    <div className={`min-h-screen bg-gradient-to-b ${bg} px-4 py-10`}>
      <div className="mx-auto flex max-w-2xl flex-col items-center gap-6 rounded-3xl border border-emerald-100 bg-white/80 p-8 shadow-xl backdrop-blur">
        <StatusIcon status={state.status} />

        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold text-slate-900">
            {state.status === "success"
              ? t("checkout.payment.paymobSuccessTitle", "Payment Approved")
              : state.status === "pending"
              ? t("checkout.payment.paymobChecking", "Confirming card payment...")
              : t("checkout.payment.paymobFailedTitle", "Payment Issue")}
          </h1>
          <p className="text-slate-600">{state.message}</p>
        </div>

        {state.status === "success" && state.orderId && (
          <Link
            to={`/account/invoice/${state.orderId}`}
            className="rounded-xl bg-emerald-600 px-5 py-2 text-white font-semibold shadow hover:bg-emerald-700 transition"
          >
            {t("checkout.payment.viewInvoice", "View Invoice")}
          </Link>
        )}

        {state.status !== "success" && (
          <div className="flex flex-wrap justify-center gap-3">
            <Link
              to="/checkout"
              className="rounded-xl bg-emerald-600 px-5 py-2 text-white font-semibold shadow hover:bg-emerald-700 transition"
            >
              {t("checkout.payment.retry", "Try Again")}
            </Link>
            <Link
              to="/"
              className="rounded-xl border border-slate-200 px-5 py-2 text-slate-700 font-semibold hover:bg-slate-50 transition"
            >
              {t("checkout.payment.backHome", "Back to Home")}
            </Link>
          </div>
        )}

        <div className="mt-2 w-full rounded-2xl border border-emerald-100 bg-emerald-50/60 p-4 text-sm text-emerald-800">
          <p className="font-semibold">
            {t("checkout.payment.paymobNoteTitle", "What’s happening now?")}
          </p>
          <ul className="mt-2 list-disc pl-4 space-y-1">
            <li>{t("checkout.payment.paymobNote1", "We verify the payment status with Paymob.")}</li>
            <li>{t("checkout.payment.paymobNote2", "Your order is created once payment is confirmed.")}</li>
            <li>{t("checkout.payment.paymobNote3", "You will see the order in your account once done.")}</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
