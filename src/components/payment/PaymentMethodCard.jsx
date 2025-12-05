// src/components/payment/PaymentMethodCard.jsx
import React from "react";
import { CreditCard, WalletCards, Star, Trash2 } from "lucide-react";

const brandCopy = {
    visa: { label: "Visa" },
    mastercard: { label: "Mastercard" },
    amex: { label: "American Express" },
};

const walletLabels = {
    paypal: "PayPal",
    apple: "Apple Pay",
    google: "Google Wallet",
};

export default function PaymentMethodCard({
    method,
    onMakeDefault,
    onDelete,
    isDark,
    t,
}) {
    const isCard = method.type === "card";
    const badge = isCard && brandCopy[method.brand]
        ? brandCopy[method.brand]
        : { label: walletLabels[method.provider] || "Wallet" };

    // ✅ الخلفية الجديدة فقط
    const surface = isDark
        ? "border-emerald-900/20 bg-[#0f1d1d]/70 backdrop-blur"
        : "border-emerald-200 bg-emerald-50/70 backdrop-blur";

    const headingColor = isDark ? "text-white" : "text-slate-900";
    const muted = isDark ? "text-slate-400" : "text-slate-500";

    const defaultBadge = isDark
        ? "bg-emerald-900/30 text-emerald-200"
        : "bg-emerald-50 text-emerald-700";

    const outlineButton = isDark
        ? "border-slate-700 text-slate-200 hover:bg-slate-800/70"
        : "border-slate-200 text-slate-700 hover:bg-slate-50";

    const destructiveButton = isDark
        ? "border-red-900/40 text-red-200 hover:bg-red-900/30"
        : "border-red-200 text-red-600 hover:bg-red-50";

    const getLabel = () => {
        if (isCard) {
            const brand = brandCopy[method.brand]?.label || "Card";
            return method.nickname || `${brand} **** ${method.last4}`;
        }
        const label = walletLabels[method.provider] || "Wallet";
        return method.nickname || `${label} (${method.email})`;
    };

    return (
        <div className={`rounded-2xl border p-4 shadow-sm ${surface}`}>
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                    {isCard ? (
                        <CreditCard className="h-5 w-5 text-emerald-500" />
                    ) : (
                        <WalletCards className="h-5 w-5 text-emerald-500" />
                    )}
                    <div>
                        <p className={`text-sm font-semibold ${headingColor}`}>
                            {getLabel()}
                        </p>
                        <p className={`text-xs ${muted}`}>
                            {isCard
                                ? `${badge.label} ${t("payments.endingIn", "ending in")} ${method.last4}`
                                : `${badge.label} - ${method.email}`}
                        </p>
                        {isCard && method.holder && (
                            <p className={`text-xs ${muted} mt-1`}>
                                {t("payments.cardHolder", "Card holder")}: {method.holder}
                            </p>
                        )}
                    </div>
                </div>

                {method.isDefault && (
                    <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold ${defaultBadge}`}>
                        <Star className="h-3 w-3" />
                        {t("payments.status.defaultBadge", "Default")}
                    </span>
                )}
            </div>

            <div className="mt-3 flex flex-wrap gap-2 text-xs font-semibold">
                {!method.isDefault && (
                    <button
                        type="button"
                        onClick={onMakeDefault}
                        className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 transition ${outlineButton}`}
                    >
                        <Star className="h-3 w-3" />
                        {t("payments.actions.makeDefault", "Make default")}
                    </button>
                )}
                <button
                    type="button"
                    onClick={onDelete}
                    className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 transition ${destructiveButton}`}
                >
                    <Trash2 className="h-3 w-3" />
                    {t("payments.actions.delete", "Delete")}
                </button>
            </div>
        </div>
    );
}
