// src/components/checkout/CheckoutShippingForm.jsx
import React from "react";
import { useTranslation } from "react-i18next";
import { UseTheme } from "../../theme/ThemeProvider";

export default function CheckoutShippingForm({ form, setForm, errors }) {
  const { t } = useTranslation();
  const { theme } = UseTheme();
  const isDark = theme === "dark";

  const handleChange = (field) => (event) => {
    const value = event.target.value;
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // ----------- INPUT STYLE -----------
  const baseInput = `
    w-full rounded-2xl px-4 py-3 text-sm transition duration-200
    focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400
    shadow-inner
  `;

  const inputSurface = isDark
    ? "bg-slate-900/70 border border-slate-700 text-white placeholder-slate-400 shadow-black/30"
    : "bg-white/90 border border-slate-300 text-slate-900 placeholder-slate-500 shadow-slate-200";

  const titleColor = isDark ? "text-white" : "text-slate-900";
  const labelColor = isDark ? "text-slate-200" : "text-slate-700";
  const errorText = "mt-1 text-xs text-red-500 font-medium";

  return (
    <section
      className={`
        space-y-5 rounded-3xl p-6 border
        ${isDark
          ? "bg-slate-900/50 border-slate-800 shadow-[0_18px_40px_rgba(0,0,0,0.65)]"
          : "bg-emerald-50/40 border-emerald-200 shadow-[0_18px_40px_rgba(16,185,129,0.15)]"}
      `}
      aria-labelledby="checkout-shipping-heading"
    >
      {/* HEADER */}
      <h2
        id="checkout-shipping-heading"
        className={`text-lg font-semibold ${titleColor}`}
      >
        {t("checkout.shipping.title", "Shipping address")}
      </h2>

      {/* CONTENT */}
      <div className="space-y-5">
        {/* Address */}
        <div>
          <label className={`text-sm font-medium ${labelColor}`}>
            {t("checkout.form.address", "Address")}
          </label>

          <input
            type="text"
            autoComplete="street-address"
            value={form.address || ""}
            onChange={handleChange("address")}
            className={`${baseInput} ${inputSurface} ${
              errors?.address ? "!border-red-500 !ring-red-500" : ""
            }`}
            placeholder={t(
              "checkout.form.addressPlaceholder",
              "Street, building, floor, apartment"
            )}
          />

          {errors?.address && (
            <p className={errorText}>{errors.address}</p>
          )}
        </div>

        {/* City & Notes */}
        <div className="grid gap-5 md:grid-cols-2">
          {/* City */}
          <div>
            <label className={`text-sm font-medium ${labelColor}`}>
              {t("checkout.form.city", "City")}
            </label>

            <input
              type="text"
              autoComplete="address-level2"
              value={form.city || ""}
              onChange={handleChange("city")}
              className={`${baseInput} ${inputSurface} ${
                errors?.city ? "!border-red-500 !ring-red-500" : ""
              }`}
              placeholder={t(
                "checkout.form.cityPlaceholder",
                "Enter your city"
              )}
            />

            {errors?.city && <p className={errorText}>{errors.city}</p>}
          </div>

          {/* Notes */}
          <div>
            <label className={`text-sm font-medium ${labelColor}`}>
              {t("checkout.form.notes", "Notes (optional)")}
            </label>

            <textarea
              rows={3}
              value={form.notes || ""}
              onChange={handleChange("notes")}
              className={`${baseInput} ${inputSurface} resize-none ${
                errors?.notes ? "!border-red-500 !ring-red-500" : ""
              }`}
              placeholder={t(
                "checkout.form.notesPlaceholder",
                "Any notes for the courier (landmarks, preferred time, etc.)"
              )}
            />

            {errors?.notes && (
              <p className={errorText}>{errors.notes}</p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
