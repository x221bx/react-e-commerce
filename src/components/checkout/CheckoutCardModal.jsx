// src/components/checkout/CheckoutCardModal.jsx
import React from "react";
import { useTranslation } from "react-i18next";
import Modal from "../ui/Modal";
import { useCardValidation } from "../../hooks/useCardValidation";
import { UseTheme } from "../../theme/ThemeProvider";

export default function CheckoutCardModal({
    isOpen,
    onClose,
    onSubmit,
}) {
    const { t } = useTranslation();
    const { theme } = UseTheme();
    const isDark = theme === "dark";
    const cardValidation = useCardValidation();

    const handleSubmit = (event) => {
        event.preventDefault();
        if (!cardValidation.validateCard(t)) return;
        onSubmit(cardValidation.cardForm);
        cardValidation.resetCard();
        onClose();
    };

    const {
        cardForm,
        cardErrors,
        handleCardFormChange,
        formatCardNumber,
        formatHolderName,
        formatExpiry,
        detectBrand,
    } = cardValidation;

    const inputSurface = isDark
        ? "bg-slate-900/70 border-slate-700 text-white placeholder-slate-500"
        : "bg-white/90 border-slate-300 text-slate-900 placeholder-slate-400";

    const labelColor = isDark ? "text-slate-200" : "text-slate-700";

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={t("payments.form.cardTitle")}
            footer={false}
            className="!p-0"
        >
            <form
                onSubmit={handleSubmit}
                className={`
                    space-y-5 rounded-3xl p-6 sm:p-8
                    border shadow-lg ring-1

                    bg-gradient-to-b from-transparent to-emerald-50/40
                    dark:bg-gradient-to-b dark:from-transparent dark:to-[#0f1d1d]/60

                    ${isDark 
                        ? "border-slate-800 ring-slate-800 text-white" 
                        : "border-emerald-100 ring-emerald-100 text-slate-900"
                    }
                `}
            >

                {/* Card Holder */}
                <div>
                    <label className={`block text-sm font-semibold mb-1 ${labelColor}`}>
                        {t("payments.form.cardHolder")}
                    </label>
                    <input
                        type="text"
                        value={cardForm.holder}
                        onChange={(e) =>
                            handleCardFormChange("holder", formatHolderName(e.target.value))
                        }
                        className={`w-full rounded-xl px-4 py-3 shadow-sm border ${inputSurface}
                            ${cardErrors.holder ? "!border-red-500" : ""}`}
                    />
                    {cardErrors.holder && (
                        <p className="text-red-500 text-xs mt-1">{cardErrors.holder}</p>
                    )}
                </div>

                {/* Card Number */}
                <div>
                    <label className={`block text-sm font-semibold mb-1 ${labelColor}`}>
                        {t("payments.form.cardNumber")}
                    </label>
                    <input
                        type="text"
                        value={formatCardNumber(cardForm.number)}
                        onChange={(e) => {
                            const digits = e.target.value.replace(/\D/g, "").slice(0, 19);
                            handleCardFormChange("number", digits);
                        }}
                        className={`w-full rounded-xl px-4 py-3 shadow-sm border ${inputSurface}
                            ${cardErrors.number ? "!border-red-500" : ""}`}
                    />
                    {cardErrors.number && (
                        <p className="text-red-500 text-xs mt-1">{cardErrors.number}</p>
                    )}
                </div>

                {/* Exp + CVV */}
                <div className="flex gap-4">
                    {/* Exp */}
                    <div className="flex-1">
                        <label className={`block text-sm font-semibold mb-1 ${labelColor}`}>
                            {t("payments.form.expiry")}
                        </label>
                        <input
                            type="text"
                            value={formatExpiry(cardForm.exp)}
                            onChange={(e) =>
                                handleCardFormChange("exp", formatExpiry(e.target.value))
                            }
                            placeholder="MM/YY"
                            className={`w-full rounded-xl px-4 py-3 shadow-sm border ${inputSurface}
                                ${cardErrors.exp ? "!border-red-500" : ""}`}
                        />
                        {cardErrors.exp && (
                            <p className="text-red-500 text-xs mt-1">{cardErrors.exp}</p>
                        )}
                    </div>

                    {/* CVV */}
                    <div className="flex-1">
                        <label className={`block text-sm font-semibold mb-1 ${labelColor}`}>
                            {t("payments.form.cvv")}
                        </label>
                        <input
                            type="text"
                            value={cardForm.cvv}
                            onChange={(e) => {
                                const brand = detectBrand(cardForm.number);
                                const max = brand === "amex" ? 4 : 3;
                                handleCardFormChange(
                                    "cvv",
                                    e.target.value.replace(/\D/g, "").slice(0, max)
                                );
                            }}
                            placeholder="123"
                            className={`w-full rounded-xl px-4 py-3 shadow-sm border ${inputSurface}
                                ${cardErrors.cvv ? "!border-red-500" : ""}`}
                        />
                        {cardErrors.cvv && (
                            <p className="text-red-500 text-xs mt-1">{cardErrors.cvv}</p>
                        )}
                    </div>
                </div>

                {/* Buttons */}
                <div className="flex justify-end gap-3 pt-4">
                    <button
                        type="button"
                        onClick={onClose}
                        className={`rounded-xl px-4 py-2 text-sm font-semibold border shadow-sm transition
                            ${isDark
                                ? "border-slate-700 text-slate-300 hover:bg-slate-800/70"
                                : "border-slate-300 text-slate-600 hover:bg-slate-50"
                            }`}
                    >
                        {t("common.cancel", "Cancel")}
                    </button>

                    <button
                        type="submit"
                        className="rounded-xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-emerald-600 transition"
                    >
                        {t("checkout.actions.completeOrder", "Complete Order")}
                    </button>
                </div>
            </form>
        </Modal>
    );
}
