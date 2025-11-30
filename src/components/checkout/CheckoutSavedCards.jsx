import React from "react";
import { useTranslation } from "react-i18next";

export const NEW_CARD_OPTION = "__new_card__";

const formatSavedMethod = (method) => {
    if (!method) return "";
    if (method.type === "card") {
        const brand = method.brand
            ? method.brand.charAt(0).toUpperCase() + method.brand.slice(1)
            : "Card";
        return `${brand} **** ${method.last4 || "----"}`;
    }
    if (method.type === "wallet") {
        const provider = method.provider
            ? method.provider.charAt(0).toUpperCase() + method.provider.slice(1)
            : "Wallet";
        return `${provider} (${method.email})`;
    }
    return method.nickname || "Saved method";
};

export default function CheckoutSavedCards({
    paymentMethod,
    savedCards,
    selectedSavedCardId,
    setSelectedSavedCardId,
    savedPaymentLoading,
}) {
    const { t } = useTranslation();

    if (paymentMethod !== "card") return null;

    return (
        <>
            {savedPaymentLoading && (
                <div className="rounded-2xl border border-dashed border-slate-200 bg-white/70 p-3 text-xs text-slate-500">
                    {t("checkout.payment.loadingSuggestion", "Looking for saved cards...")}
                </div>
            )}
            <div className="rounded-2xl border border-emerald-100 bg-emerald-50/60 p-4 text-sm space-y-2">
                <label className="font-semibold">
                    {t(
                        "checkout.payment.card.dropdownLabel",
                        "Select a saved card or add a new one"
                    )}
                </label>
                <select
                    value={selectedSavedCardId}
                    onChange={(e) => setSelectedSavedCardId(e.target.value)}
                    className="w-full rounded-xl border border-emerald-200 bg-white px-3 py-2 text-sm focus:border-emerald-400 focus:outline-none"
                >
                    {savedCards.map((card) => (
                        <option key={card.id} value={card.id}>
                            {formatSavedMethod(card)}
                        </option>
                    ))}
                    <option value={NEW_CARD_OPTION}>
                        {t("checkout.payment.card.addNew", "Add a new card")}
                    </option>
                </select>
                {selectedSavedCardId === NEW_CARD_OPTION ? (
                    <p className="text-xs text-emerald-700">
                        {t(
                            "checkout.payment.card.addNewHint",
                            "We will collect your card details securely after you confirm."
                        )}
                    </p>
                ) : (
                    <p className="text-xs text-slate-600">
                        {t(
                            "checkout.payment.card.savedHint",
                            "The selected saved card will be used for this order."
                        )}
                    </p>
                )}
            </div>
        </>
    );
}
