import React from "react";
import { useTranslation } from "react-i18next";
import Modal from "../ui/Modal";
import { UseTheme } from "../../theme/ThemeProvider";

export default function CheckoutCardModal({
    isOpen,
    onClose,
    onSubmit,
    cardValidation,
    saveCardForLater,
    onSaveCardToggle,
}) {
    const { t } = useTranslation();
    const { theme } = UseTheme();
    const isDark = theme === "dark";

    const {
        cardForm = {},
        cardErrors = {},
        handleCardFormChange = () => {},
        formatCardNumber = (value) => value,
        formatHolderName = (value) => value,
        formatExpiry = (value) => value,
        detectBrand = () => null,
        validateCard,
    } = cardValidation || {};

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (!validateCard || !cardValidation) return;
        if (!validateCard()) return;
        await onSubmit(cardForm, !!saveCardForLater);
    };

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
                        value={cardForm.holder || ""}
                        onChange={(e) =>
                            handleCardFormChange("holder", formatHolderName(e.target.value))
                        }
                        aria-invalid={!!cardErrors.holder}
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
                        value={formatCardNumber(cardForm.number || "")}
                        onChange={(e) => {
                            const digits = e.target.value.replace(/\D/g, "").slice(0, 19);
                            handleCardFormChange("number", digits);
                        }}
                        aria-invalid={!!cardErrors.number}
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
                            value={formatExpiry(cardForm.exp || "")}
                            onChange={(e) =>
                                handleCardFormChange("exp", formatExpiry(e.target.value))
                            }
                            placeholder="MM/YY"
                            aria-invalid={!!cardErrors.exp}
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
                            value={cardForm.cvv || ""}
                            onChange={(e) => {
                                const brand = detectBrand(cardForm.number);
                                const max = brand === "amex" ? 4 : 3;
                                handleCardFormChange(
                                    "cvv",
                                    e.target.value.replace(/\D/g, "").slice(0, max)
                                );
                            }}
                            placeholder="123"
                            aria-invalid={!!cardErrors.cvv}
                            className={`w-full rounded-xl px-4 py-3 shadow-sm border ${inputSurface}
                                ${cardErrors.cvv ? "!border-red-500" : ""}`}
                        />
                        {cardErrors.cvv && (
                            <p className="text-red-500 text-xs mt-1">{cardErrors.cvv}</p>
                        )}
                    </div>
                </div>

                {/* Buttons */}
                <div className="flex flex-col gap-4 pt-2">
                    <label className="inline-flex items-start gap-3 text-sm">
                        <input
                            type="checkbox"
                            checked={!!saveCardForLater}
                            onChange={(e) => onSaveCardToggle?.(e.target.checked)}
                            className="mt-1 h-4 w-4 rounded border-slate-300 text-emerald-500 focus:ring-emerald-500"
                        />
                        <span className={`${labelColor}`}>
                            {t(
                                "payments.form.saveForLater",
                                "Save this card to Payment Methods for next time"
                            )}
                            <span className="block text-xs opacity-70">
                                {t(
                                    "payments.securityHint",
                                    "We only store last 4 digits and nickname; full number and CVV are never saved."
                                )}
                            </span>
                        </span>
                    </label>

                    <div>
                        <label className={`block text-sm font-semibold mb-1 ${labelColor}`}>
                            {t("payments.form.nickname", "Nickname (optional)")}
                        </label>
                        <input
                            type="text"
                            value={cardForm.nickname || ""}
                            onChange={(e) =>
                                handleCardFormChange?.("nickname", e.target.value)
                            }
                            placeholder={t(
                                "payments.form.nicknamePlaceholder",
                                "Personal card"
                            )}
                            className={`w-full rounded-xl px-4 py-3 shadow-sm border ${inputSurface}`}
                        />
                    </div>

                    <div className="flex justify-end gap-3 pt-2">
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
                </div>
            </form>
        </Modal>
    );
}
