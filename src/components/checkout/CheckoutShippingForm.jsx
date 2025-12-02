// src/components/checkout/CheckoutShippingForm.jsx
import React from "react";
import { useTranslation } from "react-i18next";
import { UseTheme } from "../../theme/ThemeProvider";

export default function CheckoutShippingForm({ form, setForm, errors }) {
    const { t } = useTranslation();
    const { theme } = UseTheme();
    const isDark = theme === "dark";

    const inputSurface = isDark
        ? "bg-slate-900/70 border-slate-700 text-white placeholder-slate-500"
        : "bg-white/90 border-slate-300 text-slate-900 placeholder-slate-400";

    const labelColor = isDark ? "text-slate-200" : "text-slate-700";

    const errorBorder = "!border-red-500";

    return (
        <section className="space-y-4">
            <h2 className={`text-lg font-semibold ${isDark ? "text-white" : "text-slate-900"}`}>
                {t("checkout.sections.shipping")}
            </h2>

            <div className="grid gap-4">

                {/* Address */}
                <div>
                    <label className={`text-sm font-medium ${labelColor}`}>
                        {t("checkout.fields.address", "Address")}
                    </label>
                    <input
                        type="text"
                        value={form.address}
                        onChange={(e) =>
                            setForm((prev) => ({ ...prev, address: e.target.value }))
                        }
                        className={`
                            w-full rounded-2xl px-4 py-3 border shadow-sm
                            ${inputSurface}
                            ${errors.address ? errorBorder : ""}
                        `}
                    />
                    {errors.address && (
                        <p className="mt-1 text-xs text-red-500">{errors.address}</p>
                    )}
                </div>

                {/* City */}
                <div>
                    <label className={`text-sm font-medium ${labelColor}`}>
                        {t("checkout.fields.city")}
                    </label>
                    <input
                        type="text"
                        value={form.city}
                        onChange={(e) =>
                            setForm((prev) => ({ ...prev, city: e.target.value }))
                        }
                        className={`
                            w-full rounded-2xl px-4 py-3 border shadow-sm
                            ${inputSurface}
                            ${errors.city ? errorBorder : ""}
                        `}
                    />
                    {errors.city && (
                        <p className="mt-1 text-xs text-red-500">{errors.city}</p>
                    )}
                </div>

                {/* Notes */}
                <div>
                    <label className={`text-sm font-medium ${labelColor}`}>
                        {t("checkout.fields.notes", "Notes (optional)")}
                    </label>
                    <textarea
                        rows="3"
                        value={form.notes}
                        onChange={(e) =>
                            setForm((prev) => ({ ...prev, notes: e.target.value }))
                        }
                        className={`
                            w-full rounded-2xl px-4 py-3 border shadow-sm resize-none
                            ${inputSurface}
                        `}
                    ></textarea>
                </div>
            </div>
        </section>
    );
}
