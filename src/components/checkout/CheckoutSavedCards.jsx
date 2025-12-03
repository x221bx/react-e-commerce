import React from "react";
import { useTranslation } from "react-i18next";
import { UseTheme } from "../../theme/ThemeProvider";

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
    const { theme } = UseTheme();
    const isDark = theme === "dark";

    if (paymentMethod !== "card") return null;

    const surface = isDark
        ? "bg-[#0f1d1d]/60 border-white/10"
        : "bg-white/90 border-slate-200";

    const loadingSurface = isDark
        ? "bg-[#0f1d1d]/50 border-white/10 text-slate-400"
        : "bg-slate-50 text-slate-600 border-slate-300";

    const hintActive = isDark ? "text-emerald-300" : "text-emerald-700";
    const hintMuted = isDark ? "text-slate-400" : "text-slate-600";

    return (
        <>
            {savedPaymentLoading && (
                <div
                    className={`rounded-2xl border border-dashed p-3 text-xs shadow-sm ${loadingSurface}`}
                >
                    {t("checkout.payment.loadingSuggestion", "Looking for saved cards...")}
                </div>
            )}

            <div
                className={`rounded-2xl border p-4 text-sm space-y-3 shadow-sm backdrop-blur-md ${surface}`}
            >
                <label className={`font-semibold ${isDark ? "text-white" : "text-slate-900"}`}>
                    {t(
                        "checkout.payment.card.dropdownLabel",
                        "Select a saved card or add a new one"
                    )}
                </label>

                <select
                    value={selectedSavedCardId}
                    onChange={(e) => setSelectedSavedCardId(e.target.value)}
                    className={`
                        w-full rounded-xl border px-3 py-2 text-sm transition shadow-sm
                        ${isDark
                            ? "bg-slate-900 text-slate-200 border-slate-700 focus:border-emerald-500 focus:ring-emerald-500"
                            : "bg-white text-slate-800 border-slate-300 focus:border-emerald-500 focus:ring-emerald-500"}
                    `}
                >
                    {savedCards.map((card) => (
                        <option key={card.id} value={card.id}>
                            {formatSavedMethod(card)}
                        </option>
                    ))}

                    <option value={NEW_CARD_OPTION} className="font-semibold">
                        {t("checkout.payment.card.addNew", "Add a new card")}
                    </option>
                </select>

                {selectedSavedCardId === NEW_CARD_OPTION ? (
                    <p className={`text-xs ${hintActive}`}>
                        {t(
                            "checkout.payment.card.addNewHint",
                            "We will collect your card details securely after you confirm."
                        )}
                    </p>
                ) : (
                    <p className={`text-xs ${hintMuted}`}>
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
