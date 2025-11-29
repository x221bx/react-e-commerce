import React, { useRef, useEffect, useState } from "react";
import { CreditCard, Plus } from "lucide-react";
import Input from "../ui/Input";
import { useTranslation } from "react-i18next";

const brandCopy = {
    visa: { color: "text-sky-600" },
    mastercard: { color: "text-orange-600" },
    amex: { color: "text-emerald-600" },
};

export default function CardForm({
    cardValidation,
    onSubmit,
    isLoading,
    isDark,
}) {
    const { t } = useTranslation();
    const cardHolderRef = useRef(null);
    const [lastAddAttempt, setLastAddAttempt] = useState(0);

    const {
        cardForm,
        cardErrors,
        cardValid,
        handleCardFormChange,
        validateCard,
        resetCard,
        detectBrand,
        formatCardNumber,
        formatHolderName,
        formatExpiry,
    } = cardValidation;

    useEffect(() => {
        if (cardHolderRef.current) {
            cardHolderRef.current.focus();
        }
    }, []);

    const handleSubmit = (event) => {
        event.preventDefault();

        const now = Date.now();
        if (now - lastAddAttempt < 2000) {
            return;
        }
        setLastAddAttempt(now);

        if (!validateCard(t)) return;
        onSubmit(cardForm);
    };

    const detectedBrand = detectBrand(cardForm.number);
    const brandColor = brandCopy[detectedBrand]?.color || "text-slate-500";
    const quietButton = isDark
        ? "border-slate-700/70 text-slate-100 hover:bg-slate-800/70"
        : "border-slate-200 text-slate-700 hover:bg-slate-50";
    const panelSurface = isDark
        ? "border-slate-800/80 bg-gradient-to-b from-slate-900/70 to-slate-900/40"
        : "border-slate-100 bg-white/95";
    const headingColor = isDark ? "text-white" : "text-slate-900";

    return (
        <div className={`rounded-3xl border p-5 shadow-lg ${panelSurface}`}>
            <div className={`mb-4 flex items-center gap-2 ${headingColor}`}>
                <CreditCard className="h-4 w-4" />
                <p className="text-sm font-semibold">
                    {t("payments.form.cardTitle", "Add new card")}
                </p>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                    ref={cardHolderRef}
                    label={t("payments.form.cardHolder", "Card holder name")}
                    value={cardForm.holder}
                    onChange={(e) => handleCardFormChange("holder", formatHolderName(e.target.value))}
                    error={cardErrors.holder}
                    autoFocus
                />
                <Input
                    label={t("payments.form.cardNumber", "Card number")}
                    value={formatCardNumber(cardForm.number)}
                    onChange={(e) => {
                        const digits = e.target.value.replace(/\D/g, "").slice(0, 19);
                        handleCardFormChange("number", digits);
                    }}
                    placeholder="4242 4242 4242 4242"
                    maxLength={23}
                    error={cardErrors.number}
                />
                <div className="flex items-center justify-between text-xs">
                    <span className={`font-semibold ${brandColor} flex items-center gap-1`}>
                        {detectedBrand && <span className="text-green-500">✓</span>}
                        {detectedBrand || t("payments.brandUnknown", "Card type not recognized yet")}
                        {cardValid && <span className="text-green-600 ml-1">({t("common.valid", "Valid")})</span>}
                    </span>
                    <span className="text-slate-500 dark:text-slate-400">
                        {t("payments.securityHint", "We only store last 4; full number and CVV never saved.")}
                    </span>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                    <Input
                        label={t("payments.form.expiry", "Expiry (MM/YY)")}
                        value={formatExpiry(cardForm.exp)}
                        onChange={(e) => handleCardFormChange("exp", formatExpiry(e.target.value))}
                        placeholder="04/27"
                        error={cardErrors.exp}
                    />
                    <Input
                        label={t("payments.form.cvv", "CVV")}
                        value={cardForm.cvv}
                        onChange={(e) => {
                            const brand = detectBrand(cardForm.number);
                            const max = brand === "amex" ? 4 : 3;
                            handleCardFormChange("cvv", e.target.value.replace(/\D/g, "").slice(0, max));
                        }}
                        placeholder="123"
                        maxLength={4}
                        error={cardErrors.cvv}
                    />
                </div>
                <Input
                    label={t("payments.form.nickname", "Nickname (optional)")}
                    value={cardForm.nickname}
                    onChange={(e) => handleCardFormChange("nickname", e.target.value)}
                    placeholder={t("payments.form.nicknamePlaceholder", "Farm purchases")}
                />
                <div className="flex gap-3">
                    <button
                        type="submit"
                        disabled={isLoading}
                        className={`inline-flex flex-1 items-center justify-center gap-2 rounded-xl border px-4 py-2 text-sm font-semibold transition disabled:opacity-70 ${quietButton}`}
                    >
                        <Plus className="h-4 w-4" />
                        {isLoading ? t("payments.form.saving", "Saving...") : t("payments.form.saveCard", "Save card")}
                    </button>
                    <button
                        type="button"
                        onClick={resetCard}
                        className="text-sm font-semibold text-emerald-500 hover:underline"
                    >
                        {t("payments.form.reset", "Reset")}
                    </button>
                </div>
            </form>
        </div>
    );
}
