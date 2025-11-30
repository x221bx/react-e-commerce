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

      // Find the main invoice content (visible one)
      const invoiceElement = document.querySelector('.invoice-container');
      if (!invoiceElement) {
        throw new Error("Invoice content not found");
      }

      // Temporarily modify styles for better PDF rendering
      const originalStyles = {
        backgroundColor: invoiceElement.style.backgroundColor,
        boxShadow: invoiceElement.style.boxShadow,
      };

      invoiceElement.style.backgroundColor = '#ffffff';
      invoiceElement.style.boxShadow = 'none';

      // Create canvas from the visible invoice element
      const canvas = await html2canvas(invoiceElement, {
        scale: 2,
        useCORS: true,
        allowTaint: false,
        backgroundColor: '#ffffff',
        logging: false,
        imageTimeout: 15000,
        removeContainer: true,
        width: invoiceElement.scrollWidth,
        height: invoiceElement.scrollHeight,
        windowWidth: invoiceElement.scrollWidth,
        windowHeight: invoiceElement.scrollHeight,
      });

      // Restore original styles
      invoiceElement.style.backgroundColor = originalStyles.backgroundColor;
      invoiceElement.style.boxShadow = originalStyles.boxShadow;

      // Create PDF
      const imgData = canvas.toDataURL('image/png', 0.8);
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
        compress: true,
      });

      // Calculate dimensions to fit A4
      const imgWidth = 210; // A4 width in mm
      const pageHeight = 295; // A4 height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      // If image is taller than one page, split it
      if (imgHeight > pageHeight) {
        let position = 0;
        let remainingHeight = imgHeight;

        // Add first page
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, Math.min(pageHeight, remainingHeight));
        remainingHeight -= pageHeight;

        // Add additional pages if needed
        while (remainingHeight > 0) {
          pdf.addPage();
          position = -imgHeight + (imgHeight - remainingHeight);
          pdf.addImage(imgData, 'PNG', 0, position, imgWidth, Math.min(pageHeight, remainingHeight));
          remainingHeight -= pageHeight;
        }
      } else {
        // Single page
        pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      }

      // Download the PDF
      const fileName = `Invoice-${currentOrder?.orderNumber || currentOrder?.id?.slice(-8) || 'Order'}.pdf`;
      pdf.save(fileName);

      toast.success("PDF downloaded successfully!", { id: "pdf-download" });
    } catch (error) {
      console.error("PDF generation error:", error);

      // Fallback: Try a simpler approach
      try {
        toast.loading("Trying alternative method...", { id: "pdf-download" });

        const pdf = new jsPDF({
          orientation: 'portrait',
          unit: 'mm',
          format: 'a4',
        });

        // Add basic text content as fallback
        pdf.setFontSize(20);
        pdf.text('INVOICE', 105, 30, { align: 'center' });

        pdf.setFontSize(12);
        pdf.text(`Order: ${currentOrder?.orderNumber || currentOrder?.id?.slice(-8)}`, 20, 50);
        pdf.text(`Date: ${new Date(currentOrder?.createdAt).toLocaleDateString()}`, 20, 60);
        pdf.text(`Total: ${currentOrder?.totals?.total?.toLocaleString() || currentOrder?.total?.toLocaleString()} EGP`, 20, 70);

        const fileName = `Invoice-${currentOrder?.orderNumber || currentOrder?.id?.slice(-8) || 'Order'}.pdf`;
        pdf.save(fileName);

        toast.success("PDF downloaded with basic format!", { id: "pdf-download" });
      } catch (fallbackError) {
        console.error("Fallback PDF generation failed:", fallbackError);
        toast.error("Failed to generate PDF. Please try printing the page instead.", { id: "pdf-download" });
      }
    }
  };

  return (
    <div className={`min-h-screen ${containerBg} py-8 px-4 sm:px-6 lg:px-8`}>
      <div className="max-w-4xl mx-auto invoice-container">
        {/* Main Invoice Display */}
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
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
  );
}