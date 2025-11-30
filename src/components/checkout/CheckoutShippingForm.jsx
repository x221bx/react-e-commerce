import React from "react";
import { useTranslation } from "react-i18next";

export default function CheckoutShippingForm({ form, setForm, errors }) {
    const { t } = useTranslation();

    const inputClasses =
        "w-full rounded-2xl border px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 transition";

    return (
        <section className="space-y-4">
            <h2 className="text-lg font-semibold">
                {t("checkout.sections.shipping")}
            </h2>
            <div className="grid gap-4">
                <div>
                    <label className="text-sm font-medium">
                        {t("checkout.fields.address", "Address")}
                    </label>
                    <input
                        type="text"
                        value={form.address}
                        onChange={(e) =>
                            setForm((prev) => ({ ...prev, address: e.target.value }))
                        }
                        className={`${inputClasses} ${errors.address ? "border-red-400" : "border-slate-200"
                            }`}
                    />
                    {errors.address && (
                        <p className="mt-1 text-xs text-red-500">{errors.address}</p>
                    )}
                </div>
                <div>
                    <label className="text-sm font-medium">
                        {t("checkout.fields.city")}
                    </label>
                    <input
                        type="text"
                        value={form.city}
                        onChange={(e) =>
                            setForm((prev) => ({ ...prev, city: e.target.value }))
                        }
                        className={`${inputClasses} ${errors.city ? "border-red-400" : "border-slate-200"
                            }`}
                    />
                    {errors.city && (
                        <p className="mt-1 text-xs text-red-500">{errors.city}</p>
                    )}
                </div>
                <div>
                    <label className="text-sm font-medium">
                        {t("checkout.fields.notes", "Notes (optional)")}
                    </label>
                    <textarea
                        rows="3"
                        value={form.notes}
                        onChange={(e) =>
                            setForm((prev) => ({ ...prev, notes: e.target.value }))
                        }
                        className={inputClasses}
                    ></textarea>
                </div>
            </div>
        </section>
    );
}
