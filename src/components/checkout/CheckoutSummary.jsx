import React from "react";
import { useTranslation } from "react-i18next";

export default function CheckoutSummary({ cartItems, summary }) {
    const { t } = useTranslation();

    return (
        <>
            {/* Desktop Summary */}
            <aside className="rounded-3xl border bg-white p-6 shadow-sm lg:block hidden">
                <h2 className="text-lg font-semibold">
                    {t("checkout.summary.title", "Order Summary")}
                </h2>
                <div className="mt-4 space-y-4">
                    {cartItems.map((item) => (
                        <div
                            key={item.id}
                            className="flex items-center gap-3 rounded-2xl border border-slate-100 p-3"
                        >
                            <img
                                src={item.thumbnailUrl || item.img}
                                alt={item.name || item.title}
                                className="h-16 w-16 rounded-xl object-cover"
                            />
                            <div className="flex-1">
                                <p className="text-sm font-semibold">
                                    {item.name || item.title}
                                </p>
                                <p className="text-xs text-slate-500">
                                    {t("checkout.summary.qty", { count: item.quantity ?? 1 })}
                                </p>
                            </div>
                            <p className="text-sm font-semibold">{`${Number(
                                item.price
                            ).toLocaleString()} EGP`}</p>
                        </div>
                    ))}
                </div>

                <div className="mt-6 space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                        <span>{t("checkout.summary.subtotal", "Subtotal")}</span>
                        <span>{`${summary.subtotal.toLocaleString()} EGP`}</span>
                    </div>
                    <div className="flex items-center justify-between">
                        <span>{t("checkout.summary.shipping", "Shipping")}</span>
                        <span>{`${summary.shipping.toLocaleString()} EGP`}</span>
                    </div>
                    <div className="flex items-center justify-between text-base font-semibold">
                        <span>{t("checkout.summary.total", "Total")}</span>
                        <span>{`${summary.total.toLocaleString()} EGP`}</span>
                    </div>
                </div>
            </aside>

            {/* Mobile Summary */}
            <div className="lg:hidden mt-6">
                <h2 className="text-lg font-semibold mb-2">
                    {t("checkout.summary.title", "Order Summary")}
                </h2>
                {cartItems.map((item) => (
                    <div
                        key={item.id}
                        className="flex items-center gap-3 rounded-2xl border border-slate-100 p-3 mb-2"
                    >
                        <img
                            src={item.thumbnailUrl || item.img}
                            alt={item.name || item.title}
                            className="h-16 w-16 rounded-xl object-cover"
                        />
                        <div className="flex-1">
                            <p className="text-sm font-semibold">
                                {item.name || item.title}
                            </p>
                            <p className="text-xs text-slate-500">
                                {t("checkout.summary.qty", { count: item.quantity ?? 1 })}
                            </p>
                        </div>
                        <p className="text-sm font-semibold">{`${Number(
                            item.price
                        ).toLocaleString()} EGP`}</p>
                    </div>
                ))}
                <div className="mt-4 flex justify-between font-semibold">
                    <span>{t("checkout.summary.total", "Total")}:</span>
                    <span>{`${summary.total.toLocaleString()} EGP`}</span>
                </div>
            </div>
        </>
    );
}
