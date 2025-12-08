// src/components/checkout/CheckoutContactForm.jsx
import React from "react";
import { useTranslation } from "react-i18next";
import { UseTheme } from "../../theme/ThemeProvider";

export default function CheckoutContactForm({
    form,
    setForm,
    errors,
    handlePhoneChange,
}) {
    const { t } = useTranslation();
    const { theme } = UseTheme();
    const isDark = theme === "dark";

    // ---- Input Styling ----
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

    // ---- Phone Input Logic (No logic changes — only UI + enhanced validation) ----
    const handlePhone = (value) => {
        let cleaned = value.replace(/\D/g, ""); // digits only
        if (cleaned.length > 11) cleaned = cleaned.slice(0, 11); // max 11 digits
        
        // enforce starting with 0 (Egyptian number pattern)
        if (cleaned.length > 0 && cleaned[0] !== "0") cleaned = "0" + cleaned;

        if (handlePhoneChange) handlePhoneChange(cleaned);
        else setForm((prev) => ({ ...prev, phone: cleaned }));
    };

    return (
        <section
            className={`
                space-y-5 rounded-3xl p-6 border
                ${isDark
                    ? "bg-slate-900/50 border-slate-800 shadow-[0_18px_40px_rgba(0,0,0,0.65)]"
                    : "bg-emerald-50/40 border-emerald-200 shadow-[0_18px_40px_rgba(16,185,129,0.15)]"
                }
            `}
        >
            {/* Section Title */}
            <h2 className={`text-lg font-semibold ${titleColor}`}>
                {t("checkout.sections.contact", "Contact Information")}
            </h2>

            <div className="grid gap-5 md:grid-cols-2">
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
                        className={`${baseInput} ${inputSurface} ${
                            errors.fullName ? "!border-red-500 !ring-red-500" : ""
                        }`}
                        placeholder={t("checkout.fields.fullNamePlaceholder", "Your full name")}
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
                        aria-invalid={!!errors.phone}
                        onChange={(e) => handlePhone(e.target.value)}
                        onBlur={(e) => handlePhone(e.target.value)}
                        className={`${baseInput} ${inputSurface} ${
                            errors.phone ? "!border-red-500 !ring-red-500" : ""
                        }`}
                        placeholder={t("checkout.fields.phonePlaceholder", "01xxxxxxxxx")}
                    />

                    {errors.phone && (
                        <p className="mt-1 text-xs text-red-500">{errors.phone}</p>
                    )}
                </div>
            </div>
        </section>
    );
}
