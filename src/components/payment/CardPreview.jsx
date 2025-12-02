// src/components/payment/CardPreview.jsx
import React from "react";
import { ShieldCheck } from "lucide-react";
import { useTranslation } from "react-i18next";

const brandCopy = {
    visa: {
        label: "Visa",
        color: "text-sky-600",
        gradient: "linear-gradient(135deg, #1a6cf3, #0ba3f5)",
    },
    mastercard: {
        label: "Mastercard",
        color: "text-orange-600",
        gradient: "linear-gradient(135deg, #ff8c37, #ff3c3c)",
    },
    amex: {
        label: "American Express",
        color: "text-emerald-600",
        gradient: "linear-gradient(135deg, #028174, #1bc8b1)",
    },
};

export default function CardPreview({
    cardForm,
    detectBrand,
    formatCardNumber,
    formatExpiry,
    isDark,
}) {
    const { t } = useTranslation();

    const detectedBrand = detectBrand(cardForm.number);
    const brandMeta = detectedBrand ? brandCopy[detectedBrand] : null;
    const brandLabel =
        brandMeta?.label || t("payments.brandUnknown", "Card type not recognized yet");
    const brandGradient =
        brandMeta?.gradient || "linear-gradient(135deg, #0f766e, #2dd4bf)";

    const headingColor = isDark ? "text-white" : "text-slate-900";

    // ❗❗ الخلفية الجديدة فقط هنا
    const panelSurface = isDark
        ? "border-emerald-900/20 bg-[#0f1d1d]/70 backdrop-blur"
        : "border-emerald-200 bg-emerald-50/70 backdrop-blur";

    return (
        <div className={`rounded-3xl border p-5 shadow-lg ${panelSurface}`}>
            <div className={`mb-3 flex items-center gap-2 ${headingColor}`}>
                <ShieldCheck className="h-4 w-4" />
                <p className="text-sm font-semibold">
                    {t("payments.form.cardPreview", "Card preview")}
                </p>
            </div>

            <div
                className="relative overflow-hidden rounded-2xl p-5 text-white shadow-xl transition-all duration-500"
                style={{
                    background: brandGradient,
                    minHeight: 190,
                }}
            >
                <div className="flex items-center justify-between text-xs uppercase tracking-[0.18em] opacity-95">
                    <span className="font-semibold">{brandLabel}</span>
                    <div className="flex items-center gap-2 text-[11px] opacity-90">
                        <ShieldCheck className="h-4 w-4" />
                        <span>{t("payments.cardLabel", "Card")}</span>
                    </div>
                </div>

                <div className="mt-5 h-8 w-14 rounded-md bg-white/25 shadow-inner" />

                <div className="mt-4 text-lg tracking-[0.22em] font-semibold">
                    {formatCardNumber(cardForm.number).padEnd(19, "•") ||
                        "•••• •••• •••• ••••"}
                </div>

                <div className="mt-6 flex items-end justify-between text-sm">
                    <div>
                        <p className="text-[11px] uppercase opacity-75">
                            {t("payments.nameLabel", "Name")}
                        </p>
                        <p className="font-semibold">
                            {cardForm.holder ||
                                t("payments.form.cardHolder", "Card holder name")}
                        </p>
                    </div>

                    <div className="text-right">
                        <p className="text-[11px] uppercase opacity-75">
                            {t("payments.expLabel", "EXP")}
                        </p>
                        <p className="font-semibold">
                            {cardForm.exp
                                ? formatExpiry(cardForm.exp)
                                : t("payments.expPlaceholder", "MM/YY")}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
