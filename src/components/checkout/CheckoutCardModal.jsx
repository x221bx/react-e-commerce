import React from "react";
import { useTranslation } from "react-i18next";
import Modal from "../ui/Modal";
import { useCardValidation } from "../../hooks/useCardValidation";

export default function CheckoutCardModal({
    isOpen,
    onClose,
    onSubmit,
}) {
    const { t } = useTranslation();
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

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={t("payments.form.cardTitle")}
            footer={false}
        >
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium">
                        {t("payments.form.cardHolder")}
                    </label>
                    <input
                        type="text"
                        value={cardForm.holder}
                        onChange={(e) => handleCardFormChange("holder", formatHolderName(e.target.value))}
                        className={`w-full border px-3 py-2 rounded ${cardErrors.holder ? "border-red-500" : "border-gray-300"
                            }`}
                    />
                    {cardErrors.holder && (
                        <p className="text-red-500 text-xs">{cardErrors.holder}</p>
                    )}
                </div>
                <div>
                    <label className="block text-sm font-medium">
                        {t("payments.form.cardNumber")}
                    </label>
                    <input
                        type="text"
                        value={formatCardNumber(cardForm.number)}
                        onChange={(e) => {
                            const digits = e.target.value.replace(/\D/g, "").slice(0, 19);
                            handleCardFormChange("number", digits);
                        }}
                        className={`w-full border px-3 py-2 rounded ${cardErrors.number ? "border-red-500" : "border-gray-300"
                            }`}
                    />
                    {cardErrors.number && (
                        <p className="text-red-500 text-xs">{cardErrors.number}</p>
                    )}
                </div>
                <div className="flex gap-4">
                    <div className="flex-1">
                        <label className="block text-sm font-medium">
                            {t("payments.form.expiry")}
                        </label>
                        <input
                            type="text"
                            value={formatExpiry(cardForm.exp)}
                            onChange={(e) => handleCardFormChange("exp", formatExpiry(e.target.value))}
                            placeholder="MM/YY"
                            className={`w-full border px-3 py-2 rounded ${cardErrors.exp ? "border-red-500" : "border-gray-300"
                                }`}
                        />
                        {cardErrors.exp && (
                            <p className="text-red-500 text-xs">{cardErrors.exp}</p>
                        )}
                    </div>
                    <div className="flex-1">
                        <label className="block text-sm font-medium">
                            {t("payments.form.cvv")}
                        </label>
                        <input
                            type="text"
                            value={cardForm.cvv}
                            onChange={(e) => {
                                const brand = detectBrand(cardForm.number);
                                const max = brand === "amex" ? 4 : 3;
                                handleCardFormChange("cvv", e.target.value.replace(/\D/g, "").slice(0, max));
                            }}
                            placeholder="123"
                            className={`w-full border px-3 py-2 rounded ${cardErrors.cvv ? "border-red-500" : "border-gray-300"
                                }`}
                        />
                        {cardErrors.cvv && (
                            <p className="text-red-500 text-xs">{cardErrors.cvv}</p>
                        )}
                    </div>
                </div>
                <div className="flex justify-end gap-3 pt-2">
                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50"
                    >
                        {t("common.cancel", "Cancel")}
                    </button>
                    <button
                        type="submit"
                        className="rounded-xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-emerald-600"
                    >
                        {t("checkout.actions.completeOrder", "Complete Order")}
                    </button>
                </div>
            </form>
        </Modal>
    );
}
