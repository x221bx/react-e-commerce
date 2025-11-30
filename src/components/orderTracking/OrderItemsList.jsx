import React from "react";
import { useTranslation } from "react-i18next";

export default function OrderItemsList({ items, isDark }) {
    const { t } = useTranslation();

    if (!items || items.length === 0) return null;

    const muted = isDark ? "text-slate-400" : "text-slate-500";
    const strongText = isDark ? "text-white" : "text-slate-900";
    const infoSurface = isDark
        ? "border-slate-800 bg-slate-800/50 hover:bg-slate-800/70"
        : "border-slate-100 bg-slate-50 hover:bg-white";

    return (
        <div className="mt-8">
            <h3 className={`text-sm font-semibold uppercase tracking-wide ${muted}`}>
                {t("tracking.orderItems", "Order Items")}
            </h3>
            <div className="mt-4 space-y-3">
                {items.map((item, index) => (
                    <div
                        key={index}
                        className={`flex items-center gap-4 rounded-xl border p-4 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg ${infoSurface}`}
                    >
                        {item.thumbnailUrl || item.img || item.image || item.imageUrl ? (
                            <img
                                src={item.thumbnailUrl || item.img || item.image || item.imageUrl}
                                alt={item.name || item.title}
                                className="h-14 w-14 rounded-lg object-cover"
                            />
                        ) : (
                            <div className="h-14 w-14 rounded-lg bg-slate-300 dark:bg-slate-700" />
                        )}
                        <div className="flex-1">
                            <p className={`font-semibold ${strongText}`}>
                                {item.name || item.title}
                            </p>
                            <p className={`text-sm ${muted}`}>
                                {t("tracking.qty", { count: item.quantity || 1 })}
                            </p>
                        </div>
                        <p className={`text-lg font-semibold ${strongText}`}>
                            {item.price ? `${Number(item.price).toLocaleString()} EGP` : "-"}
                        </p>
                    </div>
                ))}
            </div>
        </div>
    );
}
