// src/pages/account/OrderInvoice.jsx
import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { selectCurrentUser } from "../../features/auth/authSlice";
import { useOrderTracking } from "../../hooks/useOrderTracking";
import { UseTheme } from "../../theme/ThemeProvider";
import {
  FiDownload,
  FiPrinter,
  FiArrowLeft,
  FiPackage,
  FiMapPin,
  FiCreditCard,
  FiCalendar,
} from "react-icons/fi";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { ensureProductLocalization, getLocalizedProductTitle } from "../../utils/productLocalization";

export default function OrderInvoice() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { theme } = UseTheme();
  const isDark = theme === "dark";
  const user = useSelector(selectCurrentUser);
  const { i18n } = useTranslation();
  const lang = i18n.language || "en";

  const { orders, order, loading } = useOrderTracking(user?.uid);

  // Find the order by ID if not the selected one
  const currentOrder =
    order?.id === orderId ? order : orders.find((o) => o.id === orderId);
  const orderItems = (currentOrder?.items || []).map((item) =>
    ensureProductLocalization(item)
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950/90">
        <div className="relative">
          <div className="h-12 w-12 rounded-full border-2 border-emerald-500/40 border-t-transparent animate-spin" />
          <div className="absolute inset-0 rounded-full blur-xl bg-emerald-500/20" />
        </div>
      </div>
    );
  }

  if (!currentOrder) {
    return (
      <div
        className={`min-h-screen flex flex-col items-center justify-center text-center p-8 ${
          isDark ? "bg-slate-950 text-white" : "bg-slate-50 text-slate-900"
        }`}
      >
        <div className="relative mb-6">
          <div className="h-20 w-20 rounded-2xl bg-emerald-500/10 border border-emerald-500/40 flex items-center justify-center shadow-[0_0_30px_rgba(16,185,129,0.45)]">
            <FiPackage className="h-10 w-10 text-emerald-500" />
          </div>
        </div>
        <h2
          className={`text-2xl font-bold mb-2 ${
            isDark ? "text-emerald-200" : "text-emerald-700"
          }`}
        >
          Order Not Found
        </h2>
        <p
          className={`mb-6 max-w-md text-sm ${
            isDark ? "text-slate-300" : "text-slate-600"
          }`}
        >
          The order you're looking for doesn't exist or you don't have access to
          it. Please check your order list and try again.
        </p>
        <button
          onClick={() => navigate("/account/OrderHistory")}
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-600 text-white text-sm font-semibold shadow-lg hover:bg-emerald-500 hover:shadow-[0_0_25px_rgba(16,185,129,0.7)] transition-all"
        >
          <FiArrowLeft className="w-4 h-4" />
          Back to Orders
        </button>
      </div>
    );
  }

  // Theming
  const containerBg = isDark
    ? "bg-[radial-gradient(circle_at_top,_#14532d_0,_#020617_55%,_#020617_100%)] text-slate-100"
    : "bg-[radial-gradient(circle_at_top,_#bbf7d0_0,_#ecfdf5_40%,_#ffffff_100%)] text-slate-900";

  const shellSurface = isDark
    ? "bg-[#021310]/80 border border-emerald-900/50 shadow-[0_22px_60px_rgba(6,95,70,0.75)]"
    : "bg-white/95 border border-emerald-100 shadow-[0_22px_55px_rgba(16,185,129,0.35)]";

  const cardSurface = isDark
    ? "bg-[#031b18]/90 border border-emerald-900/60"
    : "bg-emerald-50/60 border border-emerald-100";

  const innerCard = isDark
    ? "bg-[#020f0f]/80 border border-emerald-900/50"
    : "bg-white/90 border border-emerald-100";

  const textColor = isDark ? "text-slate-50" : "text-slate-900";
  const accentText = isDark ? "text-emerald-300" : "text-emerald-700";
  const mutedText = isDark ? "text-slate-300/85" : "text-slate-600";

  const formatPaymentMethod = () => {
    const payment = currentOrder.payment || {};
    const brand =
      payment.brand ||
      currentOrder.cardBrand ||
      currentOrder.paymentBrand;
    const last4 =
      payment.last4 ||
      payment.cardLast4 ||
      currentOrder.cardLast4 ||
      currentOrder.paymentLast4;
    const summary = currentOrder.paymentSummary || currentOrder.paymentMethod;

    if (brand && last4) return `${brand} •••• ${last4}`;
    if (summary && last4) return `${summary} •••• ${last4}`;
    if (summary) return summary;
    if (last4) return `•••• ${last4}`;
    return "Cash on Delivery";
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = async () => {
    try {
      toast.loading("Generating PDF...", { id: "pdf-download" });

      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      pdf.setFont("helvetica", "normal");

      // Header
      pdf.setFontSize(24);
      pdf.setTextColor(16, 185, 129); // emerald
      pdf.text("INVOICE", 105, 30, { align: "center" });

      pdf.setFontSize(14);
      pdf.setTextColor(0, 0, 0);
      pdf.text(
        `Order #${
          currentOrder.orderNumber || currentOrder.id.slice(-8)
        }`,
        20,
        50
      );
      pdf.text(
        `Date: ${new Date(currentOrder.createdAt).toLocaleDateString(
          "en-US",
          {
            year: "numeric",
            month: "long",
            day: "numeric",
          }
        )}`,
        20,
        60
      );
      pdf.text(`Status: ${currentOrder.status}`, 20, 70);

      // Bill To
      pdf.setFontSize(12);
      pdf.text("Bill To:", 20, 90);
      pdf.text(
        currentOrder.fullName ||
          currentOrder.shipping?.fullName ||
          user?.displayName ||
          "",
        20,
        100
      );
      pdf.text(currentOrder.email || user?.email || "", 20, 110);
      pdf.text(
        currentOrder.phone || currentOrder.shipping?.phone || "",
        20,
        120
      );

      // Ship To
      pdf.text("Ship To:", 110, 90);
      pdf.text(
        currentOrder.address || currentOrder.shipping?.addressLine1 || "",
        110,
        100
      );
      pdf.text(
        currentOrder.city || currentOrder.shipping?.city || "",
        110,
        110
      );
      pdf.text(
        currentOrder.country ||
          currentOrder.shipping?.country ||
          "Egypt",
        110,
        120
      );

      // Items header
      let yPosition = 140;
      pdf.setFontSize(12);
      pdf.setFillColor(240, 240, 240);
      pdf.rect(20, yPosition - 5, 170, 10, "F");
      pdf.setTextColor(0, 0, 0);
      pdf.text("Item", 25, yPosition);
      pdf.text("Qty", 120, yPosition);
      pdf.text("Price", 140, yPosition);
      pdf.text("Total", 165, yPosition);

      yPosition += 15;

      // Items
      orderItems.forEach((item) => {
        pdf.text(getLocalizedProductTitle(item, lang) || "", 25, yPosition);
        pdf.text(item.quantity?.toString() || "1", 125, yPosition);
        pdf.text(
          `${item.price?.toLocaleString() || 0} EGP`,
          140,
          yPosition
        );
        pdf.text(
          `${(item.price * item.quantity)?.toLocaleString() || 0} EGP`,
          165,
          yPosition
        );
        yPosition += 10;
      });

      // Summary
      yPosition += 10;
      pdf.setFontSize(12);
      const subtotal = currentOrder.totals?.subtotal || currentOrder.total || 0;
      const shipping = currentOrder.totals?.shipping || 0;
      const tax = currentOrder.totals?.tax || 0;
      const total = currentOrder.totals?.total || currentOrder.total || 0;

      pdf.text(`Subtotal: ${subtotal.toLocaleString()} EGP`, 140, yPosition);
      yPosition += 10;
      if (shipping) {
        pdf.text(
          `Shipping: ${shipping.toLocaleString()} EGP`,
          140,
          yPosition
        );
        yPosition += 10;
      }
      if (tax) {
        pdf.text(`Tax: ${tax.toLocaleString()} EGP`, 140, yPosition);
        yPosition += 10;
      }
      pdf.setFontSize(14);
      pdf.setTextColor(16, 185, 129);
      pdf.text(
        `Total: ${total.toLocaleString()} EGP`,
        140,
        yPosition + 10
      );

      // Payment method
      yPosition += 30;
      pdf.setFontSize(12);
      pdf.setTextColor(0, 0, 0);
      pdf.text(`Payment Method: ${formatPaymentMethod()}`, 20, yPosition);

      // Footer
      yPosition += 20;
      pdf.setFontSize(10);
      pdf.setTextColor(128, 128, 128);
      pdf.text(
        "Thank you for your business!",
        105,
        yPosition,
        { align: "center" }
      );
      pdf.text(
        `Invoice generated on ${new Date().toLocaleDateString()}`,
        105,
        yPosition + 10,
        { align: "center" }
      );

      const fileName = `Invoice-${
        currentOrder?.orderNumber ||
        currentOrder?.id?.slice(-8) ||
        "Order"
      }.pdf`;
      pdf.save(fileName);

      toast.success("PDF downloaded successfully!", {
        id: "pdf-download",
      });
    } catch (error) {
      console.error("PDF generation error:", error);
      toast.error("Failed to generate PDF. Please try again.", {
        id: "pdf-download",
      });
    }
  };

  return (
    <>
      {/* Print Styles */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .invoice-container, .invoice-container * {
            visibility: visible;
          }
          .invoice-container {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            max-width: none;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      <div
        className={`min-h-screen ${containerBg} py-10 px-4 sm:px-6 lg:px-8`}
      >
        <div className="max-w-4xl mx-auto invoice-container">
          {/* Outer shell with glow */}
          <div
            className={`rounded-3xl p-6 sm:p-7 lg:p-8 relative overflow-hidden ${shellSurface}`}
          >
            {/* floating emerald glows */}
            <div className="pointer-events-none absolute inset-0">
              <div className="absolute -top-24 right-0 h-40 w-40 rounded-full bg-emerald-500/25 blur-3xl" />
              <div className="absolute -bottom-24 left-0 h-44 w-44 rounded-full bg-emerald-400/15 blur-3xl" />
            </div>

            <div className="relative z-[2] space-y-8">
              {/* Top actions (Back / Print / Download) */}
              <div className="flex items-center justify-between gap-3 no-print">
                <button
                  onClick={() => navigate(-1)}
                  className={`inline-flex items-center gap-2 rounded-2xl px-4 py-2 text-sm font-semibold transition-all
                    ${isDark ? "bg-emerald-950/60 text-emerald-100 hover:bg-emerald-900/80" : "bg-white/90 text-emerald-700 hover:bg-emerald-50"}
                    border border-emerald-900/40 shadow-sm`}
                >
                  <FiArrowLeft className="w-4 h-4" />
                  Back
                </button>

                <div className="flex gap-2">
                  <button
                    onClick={handlePrint}
                    className={`inline-flex items-center gap-2 rounded-2xl px-4 py-2 text-sm font-semibold transition-all
                      ${isDark ? "bg-emerald-950/60 text-emerald-100 hover:bg-emerald-900/80" : "bg-white/90 text-emerald-700 hover:bg-emerald-50"}
                      border border-emerald-900/40 shadow-sm`}
                  >
                    <FiPrinter className="w-4 h-4" />
                    Print
                  </button>
                  <button
                    onClick={handleDownload}
                    className="inline-flex items-center gap-2 rounded-2xl px-4 py-2 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-500 shadow-lg hover:shadow-[0_0_25px_rgba(16,185,129,0.75)] transition-all"
                  >
                    <FiDownload className="w-4 h-4" />
                    Download PDF
                  </button>
                </div>
              </div>

              {/* Invoice Header */}
              <div
                className={`rounded-2xl p-6 sm:p-7 border ${cardSurface} backdrop-blur-md`}
              >
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                  <div className="space-y-2">
                    <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/10 border border-emerald-500/40 px-3 py-1">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      <span className="text-xs font-semibold tracking-wide uppercase text-emerald-300">
                        FarmVet Invoice
                      </span>
                    </div>
                    <h1
                      className={`text-3xl sm:text-4xl font-bold ${accentText}`}
                    >
                      Invoice
                    </h1>
                    <p className={`text-sm ${mutedText}`}>
                      Order #{currentOrder.orderNumber || currentOrder.id.slice(-8)}
                    </p>

                    <div className="flex flex-wrap items-center gap-3 mt-2 text-xs sm:text-sm">
                      <div className="flex items-center gap-2">
                        <FiCalendar
                          className={`w-4 h-4 ${
                            isDark ? "text-emerald-300" : "text-emerald-600"
                          }`}
                        />
                        <span className={mutedText}>
                          {new Date(
                            currentOrder.createdAt
                          ).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </span>
                      </div>

                      <span className="inline-flex items-center gap-2 rounded-full border border-emerald-500/40 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-100">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-300" />
                        {currentOrder.status}
                      </span>
                    </div>
                  </div>

                  <div className="text-right space-y-1">
                    <p className={`text-xs uppercase tracking-wide ${mutedText}`}>
                      Total Amount
                    </p>
                    <p className={`text-2xl sm:text-3xl font-bold ${accentText}`}>
                      {currentOrder.totals?.total?.toLocaleString() ||
                        currentOrder.total?.toLocaleString()}{" "}
                      EGP
                    </p>
                  </div>
                </div>
              </div>

              {/* Customer & Shipping */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Bill To */}
                <div
                  className={`rounded-2xl p-5 border ${innerCard} backdrop-blur-md`}
                >
                  <h3
                    className={`text-sm font-semibold mb-3 flex items-center gap-2 ${accentText}`}
                  >
                    <FiPackage className="w-4 h-4" />
                    Bill To
                  </h3>
                  <div className="space-y-1 text-sm">
                    <p className={`font-semibold ${textColor}`}>
                      {currentOrder.fullName ||
                        currentOrder.shipping?.fullName ||
                        user?.displayName ||
                        "-"}
                    </p>
                    <p className={mutedText}>
                      {currentOrder.email || user?.email || "-"}
                    </p>
                    <p className={mutedText}>
                      {currentOrder.phone ||
                        currentOrder.shipping?.phone ||
                        "-"}
                    </p>
                  </div>
                </div>

                {/* Ship To */}
                <div
                  className={`rounded-2xl p-5 border ${innerCard} backdrop-blur-md`}
                >
                  <h3
                    className={`text-sm font-semibold mb-3 flex items-center gap-2 ${accentText}`}
                  >
                    <FiMapPin className="w-4 h-4" />
                    Ship To
                  </h3>
                  <div className="space-y-1 text-sm">
                    <p className={textColor}>
                      {currentOrder.address ||
                        currentOrder.shipping?.addressLine1 ||
                        "-"}
                    </p>
                    <p className={textColor}>
                      {currentOrder.city || currentOrder.shipping?.city || "-"}
                    </p>
                    <p className={textColor}>
                      {currentOrder.country ||
                        currentOrder.shipping?.country ||
                        "Egypt"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Items */}
              <div
                className={`rounded-2xl border ${cardSurface} overflow-hidden backdrop-blur-md`}
              >
                <div
                  className={`px-6 py-4 border-b ${
                    isDark ? "border-emerald-900/60" : "border-emerald-100"
                  }`}
                >
                  <h3
                    className={`text-sm font-semibold ${accentText} flex items-center gap-2`}
                  >
                    <FiPackage className="w-4 h-4" />
                    Order Items
                  </h3>
                </div>

                <div
                  className={`divide-y ${
                    isDark ? "divide-emerald-900/60" : "divide-emerald-100"
                  }`}
                >
                  {orderItems.map((item, index) => (
                    <div
                      key={index}
                      className="px-6 py-4 flex items-center gap-4"
                    >
                      <div className="relative">
                        <img
                          src={
                            item.imageUrl ||
                            item.image ||
                            item.thumbnailUrl ||
                            item.img ||
                            "/placeholder.png"
                          }
                          alt={getLocalizedProductTitle(item, lang)}
                          className={`w-14 h-14 sm:w-16 sm:h-16 rounded-xl object-cover border ${
                            isDark
                              ? "border-emerald-900/60"
                              : "border-emerald-100"
                          }`}
                        />
                        <span className="absolute -top-1 -right-1 rounded-full bg-emerald-600 text-[10px] px-1.5 py-0.5 text-white font-semibold">
                          × {item.quantity}
                        </span>
                      </div>
                      <div className="flex-1">
                        <h4 className={`text-sm font-semibold ${textColor}`}>
                          {getLocalizedProductTitle(item, lang)}
                        </h4>
                        <p className={`text-xs ${mutedText}`}>
                          {item.price?.toLocaleString()} EGP / unit
                        </p>
                      </div>
                      <div className="text-right text-sm">
                        <p className={`font-semibold ${textColor}`}>
                          {(item.price * item.quantity)?.toLocaleString()} EGP
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Summary */}
              <div
                className={`rounded-2xl p-6 border ${innerCard} backdrop-blur-md space-y-4`}
              >
                <h3
                  className={`text-sm font-semibold ${accentText} flex items-center gap-2`}
                >
                  <FiCreditCard className="w-4 h-4" />
                  Order Summary
                </h3>

                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className={mutedText}>Subtotal</span>
                    <span className={textColor}>
                      {currentOrder.totals?.subtotal?.toLocaleString() ||
                        currentOrder.total?.toLocaleString()}{" "}
                      EGP
                    </span>
                  </div>

                  {currentOrder.totals?.shipping && (
                    <div className="flex items-center justify-between">
                      <span className={mutedText}>Shipping</span>
                      <span className={textColor}>
                        {currentOrder.totals.shipping.toLocaleString()} EGP
                      </span>
                    </div>
                  )}

                  {currentOrder.totals?.tax && (
                    <div className="flex items-center justify-between">
                      <span className={mutedText}>Tax</span>
                      <span className={textColor}>
                        {currentOrder.totals.tax.toLocaleString()} EGP
                      </span>
                    </div>
                  )}

                  <div
                    className={`pt-3 mt-2 border-t ${
                      isDark ? "border-emerald-900/60" : "border-emerald-100"
                    }`}
                  >
                    <div className="flex items-center justify-between text-base font-semibold">
                      <span className={textColor}>Total</span>
                      <span className={accentText}>
                        {currentOrder.totals?.total?.toLocaleString() ||
                          currentOrder.total?.toLocaleString()}{" "}
                        EGP
                      </span>
                    </div>
                  </div>
                </div>

                {/* Payment Method */}
                <div
                  className={`mt-4 pt-4 border-t ${
                    isDark ? "border-emerald-900/60" : "border-emerald-100"
                  }`}
                >
                  <div className="flex flex-wrap items-center gap-2 text-sm">
                    <FiCreditCard
                      className={`w-4 h-4 ${
                        isDark ? "text-emerald-300" : "text-emerald-600"
                      }`}
                    />
                    <span className={mutedText}>Payment Method:</span>
                    <span className={`font-medium ${textColor}`}>
                      {formatPaymentMethod()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="text-center pt-2">
                <p className={`text-xs ${mutedText}`}>
                  Thank you for your business!
                </p>
                <p className={`text-[11px] mt-1 ${mutedText}`}>
                  Invoice generated on {new Date().toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
