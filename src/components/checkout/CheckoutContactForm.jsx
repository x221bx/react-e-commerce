// src/components/checkout/CheckoutContactForm.jsx
import React from "react";
import { useTranslation } from "react-i18next";
import { UseTheme } from "../../theme/ThemeProvider";

export default function CheckoutContactForm({ form, setForm, errors }) {
    const { t } = useTranslation();
    const { theme } = UseTheme();
    const isDark = theme === "dark";

    const inputBase = `
        w-full rounded-2xl px-4 py-3 text-sm shadow-sm 
        focus:outline-none focus:ring-2 focus:ring-emerald-400 transition
    `;

    const inputSurface = isDark
        ? "bg-slate-900/70 border-slate-700 text-white placeholder-slate-400"
        : "bg-white/90 border-slate-200 text-slate-900 placeholder-slate-400";

    const titleColor = isDark ? "text-white" : "text-slate-900";
    const labelColor = isDark ? "text-slate-200" : "text-slate-700";

    return (
        <section
            className={`
                space-y-4 rounded-3xl p-6 
                bg-gradient-to-b from-transparent to-emerald-50/40
                dark:bg-gradient-to-b dark:from-transparent dark:to-[#0f1d1d]/40
                border 
                ${isDark ? "border-slate-800" : "border-emerald-100"}
            `}
        >
            <h2 className={`text-lg font-semibold ${titleColor}`}>
                {t("checkout.sections.contact")}
            </h2>

            <div className="grid gap-4 md:grid-cols-2">
                {/* FULL NAME */}
                <div>
                    <label className={`text-sm font-medium ${labelColor}`}>
                        {t("checkout.fields.fullName")}
                    </label>
                    <input
                        type="text"
                        value={form.fullName}
                        onChange={(e) =>
                            setForm((prev) => ({ ...prev, fullName: e.target.value }))
                        }
                        className={`
                            ${inputBase} ${inputSurface}
                            ${errors.fullName ? "!border-red-500" : ""}
                        `}
                    />
                    {errors.fullName && (
                        <p className="mt-1 text-xs text-red-500">{errors.fullName}</p>
                    )}
                </div>

                {/* PHONE */}
                <div>
                    <label className={`text-sm font-medium ${labelColor}`}>
                        {t("checkout.fields.phone")}
                    </label>
                    <input
                        type="tel"
                        inputMode="numeric"
                        maxLength={11}
                        value={form.phone}
                        onChange={(e) => {
                            const digitsOnly = e.target.value.replace(/\D/g, "").slice(0, 11);
                            setForm((prev) => ({ ...prev, phone: digitsOnly }));
                        }}
                        className={`
                            ${inputBase} ${inputSurface}
                            ${errors.phone ? "!border-red-500" : ""}
                        `}
                    />
                    {errors.phone && (
                        <p className="mt-1 text-xs text-red-500">{errors.phone}</p>
                    )}
                </div>
            </div>
        </section>
    );
}
