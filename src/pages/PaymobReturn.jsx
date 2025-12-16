// src/pages/PaymobReturn.jsx
import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { UseTheme } from "../theme/ThemeProvider";
import Footer from "../Authcomponents/Footer";
import { clearCart } from "../features/cart/cartSlice";
import { useDispatch } from "react-redux";
import toast from "react-hot-toast";

export default function PaymobReturn() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { theme } = UseTheme();
  const isDark = theme === "dark";

  const [status, setStatus] = useState("processing");
  const [orderData, setOrderData] = useState(null);

  useEffect(() => {
    const data = searchParams.get("data");
    const success = searchParams.get("success");
    
    if (data) {
      try {
        // Parse the Paymob response data
        const parsedData = JSON.parse(atob(data));
        setOrderData(parsedData);
        
        if (parsedData.success) {
          setStatus("success");
          // Clear the cart on successful payment
          dispatch(clearCart());
          toast.success(t("checkout.payment.success", "Payment completed successfully!"));
          
          // Navigate to order confirmation after a delay
          setTimeout(() => {
            navigate(`/account/invoice/${parsedData.order?.id || 'unknown'}`, {
              state: { orderId: parsedData.order?.id }
            });
          }, 2000);
        } else {
          setStatus("failed");
          toast.error(t("checkout.payment.failed", "Payment was cancelled or failed."));
          
          // Navigate back to checkout after a delay
          setTimeout(() => {
            navigate("/checkout");
          }, 3000);
        }
      } catch (error) {
        console.error("Error parsing Paymob response:", error);
        setStatus("error");
        toast.error(t("checkout.payment.error", "An error occurred processing the payment response."));
        
        setTimeout(() => {
          navigate("/checkout");
        }, 3000);
      }
    } else {
      setStatus("error");
      toast.error(t("checkout.payment.invalidResponse", "Invalid payment response."));
      
      setTimeout(() => {
        navigate("/checkout");
      }, 3000);
    }
  }, [searchParams, navigate, t, dispatch]);

  const pageBg = isDark
    ? "bg-gradient-to-b from-transparent to-slate-800/30"
    : "bg-gradient-to-b from-transparent to-gray-50/50";

  const surface = isDark
    ? "bg-[#0f1d1d]/60 border-white/10 shadow-lg"
    : "bg-white/95 border-slate-200 shadow-md";

  const textColor = isDark ? "text-white" : "text-slate-900";
  const muted = isDark ? "text-slate-300" : "text-slate-500";

  const getStatusConfig = () => {
    switch (status) {
      case "processing":
        return {
          title: t("checkout.payment.processing", "Processing Payment..."),
          message: t("checkout.payment.processingMessage", "Please wait while we confirm your payment."),
          icon: "⏳",
          color: "text-blue-500"
        };
      case "success":
        return {
          title: t("checkout.payment.successTitle", "Payment Successful!"),
          message: t("checkout.payment.successMessage", "Your order has been confirmed and you will be redirected shortly."),
          icon: "✅",
          color: "text-green-500"
        };
      case "failed":
        return {
          title: t("checkout.payment.failedTitle", "Payment Failed"),
          message: t("checkout.payment.failedMessage", "Your payment was cancelled or failed. You will be redirected back to checkout."),
          icon: "❌",
          color: "text-red-500"
        };
      case "error":
        return {
          title: t("checkout.payment.errorTitle", "Error"),
          message: t("checkout.payment.errorMessage", "An error occurred. You will be redirected back to checkout."),
          icon: "⚠️",
          color: "text-yellow-500"
        };
      default:
        return {
          title: t("checkout.payment.unknown", "Unknown Status"),
          message: t("checkout.payment.unknownMessage", "Something went wrong."),
          icon: "❓",
          color: "text-gray-500"
        };
    }
  };

  const statusConfig = getStatusConfig();

  return (
    <div className={`min-h-screen ${pageBg} py-10`}>
      <div className="mx-auto max-w-2xl px-4 sm:px-6">
        <div className={`rounded-3xl border p-8 text-center ${surface}`}>
          <div className="text-6xl mb-4">{statusConfig.icon}</div>
          
          <h1 className={`text-2xl font-bold mb-4 ${textColor}`}>
            {statusConfig.title}
          </h1>
          
          <p className={`text-lg mb-6 ${muted}`}>
            {statusConfig.message}
          </p>

          {orderData && (
            <div className={`rounded-xl p-4 mb-6 text-left ${isDark ? "bg-slate-800" : "bg-slate-50"}`}>
              <h3 className={`font-semibold mb-2 ${textColor}`}>
                {t("checkout.payment.orderDetails", "Order Details")}
              </h3>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className={muted}>{t("checkout.payment.amount", "Amount")}:</span>
                  <span className={textColor}>
                    {orderData.amount ? `${(orderData.amount / 100).toFixed(2)} EGP` : "N/A"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className={muted}>{t("checkout.payment.currency", "Currency")}:</span>
                  <span className={textColor}>{orderData.currency || "EGP"}</span>
                </div>
                {orderData.data && (
                  <div className="flex justify-between">
                    <span className={muted}>{t("checkout.payment.transaction", "Transaction")}:</span>
                    <span className={textColor}>{orderData.data.obj?.id || "N/A"}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {status === "processing" && (
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
          )}

          {(status === "failed" || status === "error") && (
            <div className="space-y-3">
              <button
                onClick={() => navigate("/checkout")}
                className="w-full rounded-xl bg-emerald-500 px-6 py-3 text-white font-semibold hover:bg-emerald-600 transition"
              >
                {t("checkout.payment.backToCheckout", "Back to Checkout")}
              </button>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}