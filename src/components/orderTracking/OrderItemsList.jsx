import React from "react";
import { useTranslation } from "react-i18next";

export default function OrderItemsList({ items, isDark }) {
    const { t } = useTranslation();

    if (!items || items.length === 0) return null;

    // 🎨 نفس الألوان من صفحة Products
    const muted = isDark ? "text-white/60" : "text-slate-500";
    const strongText = isDark ? "text-white" : "text-slate-900";

    // 🎨 نفس كروت المنتجات
    const infoSurface = isDark
        ? "bg-[#0f1d1d]/70 border border-white/10 hover:shadow-lg"
        : "bg-white border border-gray-100 hover:shadow-lg";

    return (
        <div className="mt-8">
            <h3 className={`text-sm font-semibold uppercase tracking-wide ${muted}`}>
                {t("tracking.orderItems", "Order Items")}
            </h3>

            <div className="mt-4 space-y-3">
                {items.map((item, index) => (
                    <div
                        key={index}
                        className={`
                            flex items-center gap-4 rounded-2xl p-4 shadow-md transition 
                            cursor-pointer 
                            ${infoSurface}
                        `}
                    >
                        {/* Image */}
                        {item.thumbnailUrl || item.img || item.image || item.imageUrl ? (
                            <img
                                src={item.thumbnailUrl || item.img || item.image || item.imageUrl}
                                alt={item.name || item.title}
                                className="h-16 w-16 rounded-xl object-cover"
                            />
                        ) : (
                            <div className="h-16 w-16 rounded-xl bg-gray-300 dark:bg-slate-700" />
                        )}

                        {/* Text Section */}
                        <div className="flex-1">
                            <p className={`font-semibold ${strongText}`}>
                                {item.name || item.title}
                            </p>
                            <p className={`text-sm ${muted}`}>
                                {t("tracking.qty", { count: item.quantity || 1 })}
                            </p>
                        </div>

                        {/* Price */}
                        <p className={`text-lg font-semibold ${strongText}`}>
                            {item.price ? `${Number(item.price).toLocaleString()} EGP` : "-"}
                        </p>
                    </div>
                ))}
            </div>
        </div>
    );
}
