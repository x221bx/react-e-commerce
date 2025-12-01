// src/pages/account/OrderInvoice.jsx
import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { selectCurrentUser } from "../../features/auth/authSlice";
import { useOrderTracking } from "../../hooks/useOrderTracking";
import { UseTheme } from "../../theme/ThemeProvider";
import { FiDownload, FiPrinter, FiArrowLeft, FiPackage, FiMapPin, FiCreditCard, FiCalendar } from "react-icons/fi";
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import toast from "react-hot-toast";

export default function OrderInvoice() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { isDark } = UseTheme();
  const user = useSelector(selectCurrentUser);

  const { orders, order, loading } = useOrderTracking(user?.uid);

  // Find the order by ID if not the selected one
  const currentOrder = order?.id === orderId ? order : orders.find(o => o.id === orderId);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  if (!currentOrder) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center p-8">
        <FiPackage className="h-16 w-16 text-slate-400 mb-4" />
        <h2 className="text-2xl font-bold text-slate-600 mb-2">Order Not Found</h2>
        <p className="text-slate-500 mb-4">The order you're looking for doesn't exist or you don't have access to it.</p>
        <button
          onClick={() => navigate('/account/OrderHistory')}
          className="px-6 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors"
        >
          Back to Orders
        </button>
      </div>
    );
  }

  const containerBg = isDark ? "bg-slate-950" : "bg-slate-50";
  const cardBg = isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200";
  const textColor = isDark ? "text-white" : "text-slate-900";
  const mutedText = isDark ? "text-slate-400" : "text-slate-500";

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = async () => {
    try {
      toast.loading("Generating PDF...", { id: "pdf-download" });

      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      // Set font
      pdf.setFont("helvetica", "normal");

      // Header
      pdf.setFontSize(24);
      pdf.setTextColor(0, 123, 255); // Blue color
      pdf.text('INVOICE', 105, 30, { align: 'center' });

      pdf.setFontSize(14);
      pdf.setTextColor(0, 0, 0);
      pdf.text(`Order #${currentOrder.orderNumber || currentOrder.id.slice(-8)}`, 20, 50);
      pdf.text(`Date: ${new Date(currentOrder.createdAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })}`, 20, 60);
      pdf.text(`Status: ${currentOrder.status}`, 20, 70);

      // Bill To
      pdf.setFontSize(12);
      pdf.text('Bill To:', 20, 90);
      pdf.text(currentOrder.fullName || currentOrder.shipping?.fullName || user?.displayName || '', 20, 100);
      pdf.text(currentOrder.email || user?.email || '', 20, 110);
      pdf.text(currentOrder.phone || currentOrder.shipping?.phone || '', 20, 120);

      // Ship To
      pdf.text('Ship To:', 110, 90);
      pdf.text(currentOrder.address || currentOrder.shipping?.addressLine1 || '', 110, 100);
      pdf.text(currentOrder.city || currentOrder.shipping?.city || '', 110, 110);
      pdf.text(currentOrder.country || currentOrder.shipping?.country || 'Egypt', 110, 120);

      // Items header
      let yPosition = 140;
      pdf.setFontSize(12);
      pdf.setFillColor(240, 240, 240);
      pdf.rect(20, yPosition - 5, 170, 10, 'F');
      pdf.setTextColor(0, 0, 0);
      pdf.text('Item', 25, yPosition);
      pdf.text('Qty', 120, yPosition);
      pdf.text('Price', 140, yPosition);
      pdf.text('Total', 165, yPosition);

      yPosition += 15;

      // Items
      currentOrder.items?.forEach((item) => {
        pdf.text(item.name || '', 25, yPosition);
        pdf.text(item.quantity?.toString() || '1', 125, yPosition);
        pdf.text(`${item.price?.toLocaleString() || 0} EGP`, 140, yPosition);
        pdf.text(`${(item.price * item.quantity)?.toLocaleString() || 0} EGP`, 165, yPosition);
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
        pdf.text(`Shipping: ${shipping.toLocaleString()} EGP`, 140, yPosition);
        yPosition += 10;
      }
      if (tax) {
        pdf.text(`Tax: ${tax.toLocaleString()} EGP`, 140, yPosition);
        yPosition += 10;
      }
      pdf.setFontSize(14);
      pdf.setTextColor(0, 123, 255);
      pdf.text(`Total: ${total.toLocaleString()} EGP`, 140, yPosition + 10);

      // Payment method
      yPosition += 30;
      pdf.setFontSize(12);
      pdf.setTextColor(0, 0, 0);
      pdf.text(`Payment Method: ${currentOrder.paymentMethod || currentOrder.paymentSummary || 'Cash on Delivery'}`, 20, yPosition);

      // Footer
      yPosition += 20;
      pdf.setFontSize(10);
      pdf.setTextColor(128, 128, 128);
      pdf.text('Thank you for your business!', 105, yPosition, { align: 'center' });
      pdf.text(`Invoice generated on ${new Date().toLocaleDateString()}`, 105, yPosition + 10, { align: 'center' });

      // Download the PDF
      const fileName = `Invoice-${currentOrder?.orderNumber || currentOrder?.id?.slice(-8) || 'Order'}.pdf`;
      pdf.save(fileName);

      toast.success("PDF downloaded successfully!", { id: "pdf-download" });
    } catch (error) {
      console.error("PDF generation error:", error);
      toast.error("Failed to generate PDF. Please try again.", { id: "pdf-download" });
    }
  };

  return (
    <>
      <style jsx>{`
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
      <div className={`min-h-screen ${containerBg} py-8 px-4 sm:px-6 lg:px-8`}>
        <div className="max-w-4xl mx-auto invoice-container">
        {/* Main Invoice Display */}
        {/* Header */}
        <div className="flex items-center justify-between mb-8 no-print">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <FiArrowLeft className="w-5 h-5" />
            Back
          </button>

          <div className="flex gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            >
              <FiPrinter className="w-5 h-5" />
              Print
            </button>
            <button
              onClick={handleDownload}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-500 text-white hover:bg-emerald-600 transition-colors"
            >
              <FiDownload className="w-5 h-5" />
              Download PDF
            </button>
          </div>
        </div>

        {/* Invoice Header */}
        <div className={`rounded-2xl border shadow-sm p-8 mb-8 ${cardBg}`}>
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
            <div>
              <h1 className={`text-3xl font-bold ${textColor} mb-2`}>Invoice</h1>
              <p className={`text-lg ${mutedText}`}>Order #{currentOrder.orderNumber || currentOrder.id.slice(-8)}</p>
              <div className="flex items-center gap-4 mt-2">
                <div className="flex items-center gap-2">
                  <FiCalendar className="w-4 h-4 text-slate-400" />
                  <span className={mutedText}>
                    {new Date(currentOrder.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </span>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  currentOrder.status?.toLowerCase() === 'delivered' ? 'bg-emerald-100 text-emerald-800' :
                  currentOrder.status?.toLowerCase() === 'shipped' ? 'bg-blue-100 text-blue-800' :
                  currentOrder.status?.toLowerCase() === 'processing' ? 'bg-yellow-100 text-yellow-800' :
                  currentOrder.status?.toLowerCase() === 'canceled' ? 'bg-red-100 text-red-800' :
                  'bg-slate-100 text-slate-800'
                }`}>
                  {currentOrder.status}
                </span>
              </div>
            </div>

            <div className="text-right">
              <h2 className={`text-2xl font-bold ${textColor}`}>
                {currentOrder.totals?.total?.toLocaleString()} EGP
              </h2>
              <p className={mutedText}>Total Amount</p>
            </div>
          </div>
        </div>

        {/* Customer & Order Details */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Bill To */}
          <div className={`rounded-2xl border shadow-sm p-6 ${cardBg}`}>
            <h3 className={`text-lg font-semibold ${textColor} mb-4 flex items-center gap-2`}>
              <FiPackage className="w-5 h-5" />
              Bill To
            </h3>
            <div className="space-y-2">
              <p className={`font-medium ${textColor}`}>{currentOrder.fullName || currentOrder.shipping?.fullName || user?.displayName}</p>
              <p className={mutedText}>{currentOrder.email || user?.email}</p>
              <p className={mutedText}>{currentOrder.phone || currentOrder.shipping?.phone}</p>
            </div>
          </div>

          {/* Ship To */}
          <div className={`rounded-2xl border shadow-sm p-6 ${cardBg}`}>
            <h3 className={`text-lg font-semibold ${textColor} mb-4 flex items-center gap-2`}>
              <FiMapPin className="w-5 h-5" />
              Ship To
            </h3>
            <div className="space-y-2">
              <p className={textColor}>{currentOrder.address || currentOrder.shipping?.addressLine1}</p>
              <p className={textColor}>{currentOrder.city || currentOrder.shipping?.city}</p>
              <p className={textColor}>{currentOrder.country || currentOrder.shipping?.country || 'Egypt'}</p>
            </div>
          </div>
        </div>

        {/* Order Items */}
        <div className={`rounded-2xl border shadow-sm overflow-hidden mb-8 ${cardBg}`}>
          <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700">
            <h3 className={`text-lg font-semibold ${textColor}`}>Order Items</h3>
          </div>

          <div className="divide-y divide-slate-200 dark:divide-slate-700">
            {currentOrder.items?.map((item, index) => (
              <div key={index} className="px-6 py-4 flex items-center gap-4">
                <img
                  src={item.imageUrl || item.image || item.thumbnailUrl || item.img || "/placeholder.png"}
                  alt={item.name}
                  className="w-16 h-16 rounded-lg object-cover border border-slate-200 dark:border-slate-700"
                />
                <div className="flex-1">
                  <h4 className={`font-medium ${textColor}`}>{item.name}</h4>
                  <p className={mutedText}>Quantity: {item.quantity}</p>
                </div>
                <div className="text-right">
                  <p className={`font-medium ${textColor}`}>
                    {item.price?.toLocaleString()} EGP
                  </p>
                  <p className={`text-sm ${mutedText}`}>
                    × {item.quantity} = {(item.price * item.quantity)?.toLocaleString()} EGP
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Order Summary */}
        <div className={`rounded-2xl border shadow-sm p-6 ${cardBg}`}>
          <h3 className={`text-lg font-semibold ${textColor} mb-4 flex items-center gap-2`}>
            <FiCreditCard className="w-5 h-5" />
            Order Summary
          </h3>

          <div className="space-y-3">
            <div className="flex justify-between">
              <span className={mutedText}>Subtotal</span>
              <span className={textColor}>
                {currentOrder.totals?.subtotal?.toLocaleString() || currentOrder.total?.toLocaleString()} EGP
              </span>
            </div>

            {currentOrder.totals?.shipping && (
              <div className="flex justify-between">
                <span className={mutedText}>Shipping</span>
                <span className={textColor}>
                  {currentOrder.totals.shipping.toLocaleString()} EGP
                </span>
              </div>
            )}

            {currentOrder.totals?.tax && (
              <div className="flex justify-between">
                <span className={mutedText}>Tax</span>
                <span className={textColor}>
                  {currentOrder.totals.tax.toLocaleString()} EGP
                </span>
              </div>
            )}

            <div className="border-t border-slate-200 dark:border-slate-700 pt-3">
              <div className="flex justify-between text-lg font-semibold">
                <span className={textColor}>Total</span>
                <span className={textColor}>
                  {currentOrder.totals?.total?.toLocaleString() || currentOrder.total?.toLocaleString()} EGP
                </span>
              </div>
            </div>
          </div>

          {/* Payment Method */}
          <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-2">
              <FiCreditCard className="w-5 h-5 text-slate-400" />
              <span className={mutedText}>Payment Method:</span>
              <span className={textColor}>
                {currentOrder.paymentMethod || currentOrder.paymentSummary || 'Cash on Delivery'}
              </span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className={mutedText}>Thank you for your business!</p>
          <p className={`text-sm ${mutedText} mt-1`}>
            Invoice generated on {new Date().toLocaleDateString()}
          </p>
        </div>
      </div>
    </div>
    </>
  );
}