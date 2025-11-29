import React from "react";
import { useTranslation } from "react-i18next";
import Modal from "../ui/Modal";

export default function CheckoutCardModal({
    isOpen,
    onClose,
    cardForm,
    setCardForm,
    cardErrors,
    onSubmit,
}) {
    const { t } = useTranslation();

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={t("payments.form.cardTitle")}
            footer={false}
        >
            <form onSubmit={onSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium">
                        {t("payments.form.cardHolder")}
                    </label>
                    <input
                        type="text"
                        value={cardForm.holder}
                        onChange={(e) =>
                            setCardForm((prev) => ({
                                ...prev,
                                holder: e.target.value,
                            }))
                        }
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
                        value={cardForm.number}
                        onChange={(e) =>
                            setCardForm((prev) => ({
                                ...prev,
                                number: e.target.value,
                            }))
                        }
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
                            placeholder={t("payments.expPlaceholder")}
                            value={cardForm.expiry}
                            onChange={(e) =>
                                setCardForm((prev) => ({
                                    ...prev,
                                    expiry: e.target.value,
                                }))
                            }
                            className={`w-full border px-3 py-2 rounded ${cardErrors.expiry ? "border-red-500" : "border-gray-300"
                                }`}
                        />
                        {cardErrors.expiry && (
                            <p className="text-red-500 text-xs">{cardErrors.expiry}</p>
                        )}
                    </div>
                    <div className="flex-1">
                        <label className="block text-sm font-medium">
                            {t("payments.form.cvv")}
                        </label>
                        <input
                            type="text"
                            value={cardForm.cvv}
                            onChange={(e) =>
                                setCardForm((prev) => ({
                                    ...prev,
                                    cvv: e.target.value,
                                }))
                            }
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
                        className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200"
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
