import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";
import { createOrder } from "../services/ordersService";
import { clearCart } from "../features/cart/cartSlice";
import { useDispatch } from "react-redux";
import { UseTheme } from "../theme/ThemeProvider";
import Footer from "../Authcomponents/Footer";

const PAYMOB_STORAGE_KEY = "paymob:pendingOrder";

export default function DemoPayment() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const dispatch = useDispatch();
  
  const { theme } = UseTheme();
  const isDark = theme === "dark";
  
  const cartItems = useSelector((state) => state.cart.items || []);
  
  const [paymentStatus, setPaymentStatus] = useState("processing");
  const [processingStep, setProcessingStep] = useState(0);
  const [orderId, setOrderId] = useState(null);

  const steps = [
    { key: "verifying", text: "التحقق من صحة البيانات...", en: "Verifying payment data..." },
    { key: "processing", text: "معالجة الدفع...", en: "Processing payment..." },
    { key: "confirming", text: "تأكيد المعاملة...", en: "Confirming transaction..." },
    { key: "completing", text: "إتمام الطلب...", en: "Completing order..." }
  ];

  useEffect(() => {
    simulatePayment();
  }, []);

  const simulatePayment = async () => {
    try {
      // Get pending order from sessionStorage
      const pendingOrderData = sessionStorage.getItem(PAYMOB_STORAGE_KEY);
      if (!pendingOrderData) {
        throw new Error("No pending order found");
      }

      const { order: draftOrder } = JSON.parse(pendingOrderData);

      // Simulate payment processing steps
      for (let i = 0; i < steps.length; i++) {
        setProcessingStep(i);
        await new Promise(resolve => setTimeout(resolve, 1500));
      }

      // Create the order
      const orderData = {
        ...draftOrder,
        paymentDetails: {
          provider: "paymob_demo",
          status: "completed",
          demo: true,
          transactionId: `demo_${Date.now()}`,
          paymentMethod: "card",
          amount: draftOrder.totals?.total || 0
        },
        status: "confirmed"
      };

      const { id } = await createOrder(orderData);
      setOrderId(id);

      // Clear cart and pending order
      dispatch(clearCart());
      sessionStorage.removeItem(PAYMOB_STORAGE_KEY);

      setPaymentStatus("success");
      
      toast.success("تم الدفع بنجاح! 🎉");
      
      // Redirect to success page after 2 seconds
      setTimeout(() => {
        navigate(`/success?orderId=${id}`, { 
          state: { 
            orderId: id, 
            demo: true,
            amount: orderData.paymentDetails.amount 
          } 
        });
      }, 2000);

    } catch (error) {
      console.error("Demo payment error:", error);
      setPaymentStatus("error");
      toast.error("حدث خطأ في عملية الدفع التجريبية");
    }
  };

  const shellSurface = isDark
    ? "bg-[#0f1d1d]/60 border-white/10 shadow-lg"
    : "bg-white/95 border-slate-200 shadow-md";

  const headingColor = isDark ? "text-white" : "text-slate-900";
  const muted = isDark ? "text-slate-300" : "text-slate-500";

  return (
    <div className="min-h-screen bg-gradient-to-b from-transparent to-gray-50/50 py-10">
      <div className="mx-auto max-w-2xl px-4">
        <div className={`rounded-3xl border p-8 text-center ${shellSurface}`}>
          {/* Payment Status */}
          <div className="mb-8">
            {paymentStatus === "processing" && (
              <div className="space-y-4">
                <div className="mx-auto h-16 w-16 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent"></div>
                <h2 className={`text-xl font-semibold ${headingColor}`}>
                  {t("payment.processing.title", "Processing Payment")}
                </h2>
                <p className={`text-sm ${muted}`}>
                  {t("payment.processing.subtitle", "Please wait while we process your payment...")}
                </p>
                
                {/* Progress Steps */}
                <div className="mt-6 space-y-3">
                  {steps.map((step, index) => (
                    <div
                      key={step.key}
                      className={`flex items-center justify-between rounded-lg px-4 py-2 ${
                        index <= processingStep
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      <span className="text-sm font-medium">
                        {t(`payment.steps.${step.key}`, step.text)}
                      </span>
                      {index <= processingStep && (
                        <div className="h-4 w-4 animate-pulse rounded-full bg-emerald-500"></div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {paymentStatus === "success" && (
              <div className="space-y-4">
                <div className="mx-auto h-16 w-16 rounded-full bg-emerald-100 flex items-center justify-center">
                  <svg className="h-8 w-8 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h2 className={`text-xl font-semibold ${headingColor}`}>
                  {t("payment.success.title", "Payment Successful!")}
                </h2>
                <p className={`text-sm ${muted}`}>
                  {t("payment.success.subtitle", "Your order has been confirmed and will be processed shortly.")}
                </p>
                {orderId && (
                  <p className={`text-xs ${muted}`}>
                    {t("payment.success.orderId", "Order ID")}: {orderId}
                  </p>
                )}
              </div>
            )}

            {paymentStatus === "error" && (
              <div className="space-y-4">
                <div className="mx-auto h-16 w-16 rounded-full bg-red-100 flex items-center justify-center">
                  <svg className="h-8 w-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
                <h2 className={`text-xl font-semibold ${headingColor}`}>
                  {t("payment.error.title", "Payment Failed")}
                </h2>
                <p className={`text-sm ${muted}`}>
                  {t("payment.error.subtitle", "There was an error processing your payment. Please try again.")}
                </p>
                <button
                  onClick={() => navigate("/checkout")}
                  className="mt-4 rounded-2xl bg-emerald-500 px-6 py-2 text-sm font-semibold text-white hover:bg-emerald-600"
                >
                  {t("payment.error.tryAgain", "Try Again")}
                </button>
              </div>
            )}
          </div>

          {/* Demo Notice */}
          <div className={`rounded-xl p-4 text-left ${
            isDark ? "bg-amber-900/20 border border-amber-800/30" : "bg-amber-50 border border-amber-200"
          }`}>
            <div className="flex items-start space-x-3">
              <svg className="h-5 w-5 text-amber-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <h3 className={`font-semibold text-sm ${isDark ? "text-amber-200" : "text-amber-800"}`}>
                  {t("demo.notice.title", "Demo Payment Mode")}
                </h3>
                <p className={`text-xs mt-1 ${isDark ? "text-amber-300" : "text-amber-700"}`}>
                  {t("demo.notice.description", "This is a demonstration payment process. No real money will be charged.")}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}