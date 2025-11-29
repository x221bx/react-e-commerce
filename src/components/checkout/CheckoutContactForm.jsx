import React from "react";
import { useTranslation } from "react-i18next";

export default function CheckoutContactForm({ form, setForm, errors }) {
    const { t } = useTranslation();

    const inputClasses =
        "w-full rounded-2xl border px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 transition";

    return (
        <section className="space-y-4">
            <h2 className="text-lg font-semibold">
                {t("checkout.sections.contact")}
            </h2>
            <div className="grid gap-4 md:grid-cols-2">
                <div>
                    <label className="text-sm font-medium">
                        {t("checkout.fields.fullName")}
                    </label>
                    <input
                        type="text"
                        value={form.fullName}
                        onChange={(e) =>
                            setForm((prev) => ({ ...prev, fullName: e.target.value }))
                        }
                        className={`${inputClasses} ${errors.fullName ? "border-red-400" : "border-slate-200"
                            }`}
                    />
                    {errors.fullName && (
                        <p className="mt-1 text-xs text-red-500">{errors.fullName}</p>
                    )}
                </div>
                <div>
                    <label className="text-sm font-medium">
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
                        className={`${inputClasses} ${errors.phone ? "border-red-400" : "border-slate-200"
                            }`}
                    />
                    {errors.phone && (
                        <p className="mt-1 text-xs text-red-500">{errors.phone}</p>
                    )}
                </div>
            </div>
        </section>
    );
}
