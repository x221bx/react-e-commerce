// src/components/CartFooter.jsx
import React from "react";
import { UseTheme } from "../theme/ThemeProvider";

export default function CartFooter({
  title,
  totaltext,
  total,
  onCheckout,
  itemCount,
  textitem,
}) {
  const { theme } = UseTheme();
  const isDark = theme === "dark";

  return (
    <div className={`mt-8 border-t pt-6 ${isDark ? "border-emerald-900/30" : "border-emerald-200"}`}>
      <div
        className={`rounded-2xl p-6 md:p-8 shadow-sm ${
          isDark
            ? "bg-gradient-to-b from-emerald-900/20 to-emerald-900/10 border border-emerald-800/30"
            : "bg-gradient-to-b from-emerald-50/60 to-transparent border border-emerald-200"
        }`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
          {/* Left side: Summary */}
          <div className="space-y-2">
            <p className={`text-sm font-medium ${isDark ? "text-emerald-400" : "text-emerald-700"}`}>
              {itemCount} {textitem}
            </p>
            <p className={`text-3xl md:text-4xl font-bold ${isDark ? "text-white" : "text-emerald-900"}`}>
              {total.toLocaleString()} <span className={`text-lg font-semibold ${isDark ? "text-emerald-400" : "text-emerald-600"}`}>EGP</span>
            </p>
          </div>

          {/* Right side: Checkout Button */}
          <button
            onClick={onCheckout}
            className={`w-full sm:w-auto font-bold py-3 px-8 rounded-xl transition-all duration-300 shadow-md hover:shadow-lg transform hover:scale-105 ${
              isDark
                ? "bg-gradient-to-r from-green-600 to-emerald-700 hover:from-green-700 hover:to-emerald-800 text-white"
                : "bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white"
            }`}
          >
            {title}
          </button>
        </div>
      </div>
    </div>
  );
}
