import React from "react";
import { ShieldCheck } from "lucide-react";
import PaymentMethodCard from "./PaymentMethodCard";

export default function PaymentMethodsList({
    methods,
    loading,
    onDelete,
    onSetDefault,
    isDark,
    t,
    headingColor,
    subText,
    dashedSurface,
}) {
    return (
        <section className={`space-y-4 rounded-3xl border p-5 shadow-lg ${isDark ? "border-slate-800/80 bg-gradient-to-b from-slate-900/70 to-slate-900/40" : "border-slate-100 bg-white/95"}`}>
            <div className="flex items-center justify-between">
                <div>
                    <p className={`text-sm font-semibold ${headingColor}`}>
                        {t("payments.activeMethods", "Active methods")}
                    </p>
                    <p className={`text-xs ${subText}`}>
                        {t(
                            "payments.savedCount",
                            "{{count}} saved | {{cards}} cards | {{wallets}} wallets",
                            {
                                count: methods.length,
                                cards: methods.filter((m) => m.type === "card").length,
                                wallets: methods.filter((m) => m.type === "wallet").length,
                            }
                        )}
                    </p>
                </div>
                <ShieldCheck className="h-5 w-5 text-emerald-500" />
            </div>

            <div className="space-y-3">
                {methods.map((method) => (
                    <PaymentMethodCard
                        key={method.id}
                        method={method}
                        onMakeDefault={() => onSetDefault(method.id)}
                        onDelete={() => onDelete(method.id)}
                        isDark={isDark}
                        t={t}
                    />
                ))}
                {methods.length === 0 && (
                    <div className={`rounded-2xl border border-dashed p-6 text-center text-sm ${dashedSurface}`}>
                        {loading
                            ? t("common.loading", "Loading...")
                            : t(
                                "payments.noMethods",
                                "No payment methods saved yet. Use the forms on the right to add one."
                            )}
                    </div>
                )}
            </div>
        </section>
    );
}
