// src/pages/Cart.jsx
import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  addToCart,
  decreaseQuantity,
  removeFromCart,
  updateCartStock,
} from "../features/cart/cartSlice";
import { FiTrash2, FiShoppingCart, FiPlus, FiMinus } from "react-icons/fi";
import { db } from "../services/firebase";
import { getDocs, collection } from "firebase/firestore";
import CartFooter from "../components/CartFooter";
import Footer from "../Authcomponents/Footer";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { UseTheme } from "../theme/ThemeProvider";

export default function Cart() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "ar";
  const { theme } = UseTheme();
  const isDark = theme === "dark";

  const { items = [] } = useSelector((state) => state.cart || {});
  const [toast, setToast] = useState("");

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  };

  // 🔄 Fetch latest stock from Firestore (نفس اللوجيك – UI فقط اللي اتغير)
  const fetchLatestStock = async () => {
    try {
      const snapshot = await getDocs(collection(db, "products"));
      const products = snapshot.docs.map((d) => {
        const data = d.data() || {};
        const createdAt =
          data.createdAt && typeof data.createdAt.toMillis === "function"
            ? data.createdAt.toMillis()
            : data.createdAt ?? null;

        return {
          id: d.id,
          ...data,
          createdAt,
          stock: Number(data.stock ?? data.quantity ?? 0),
        };
      });

      dispatch(updateCartStock(products));
    } catch (err) {
      console.error("fetchLatestStock failed:", err);
    }
  };

  useEffect(() => {
    fetchLatestStock();
  }, []);

  const handleAdd = (item) => {
    const qty = Number(item.quantity || 0);
    const stock = Number(item.stock || 0);

    if (qty >= stock) {
      showToast(`Max stock reached for "${item.title || item.name}"`);
      return;
    }
    dispatch(addToCart({ ...item }));
  };

  const handleDecrease = (item) => {
    const qty = Number(item.quantity || 0);
    if (qty > 1) dispatch(decreaseQuantity(item.id));
  };

  const subtotal = items.reduce(
    (sum, i) => sum + Number(i.price || 0) * Number(i.quantity || 0),
    0
  );
  const shipping = items.length ? 50 : 0;
  const total = subtotal + shipping;

  const handleGoToCheckout = () => {
    if (!items.length) {
      showToast(t("checkout.messages.emptyCart", "Your cart is empty."));
      return;
    }

    const invalid = items.some(
      (i) => Number(i.quantity || 0) > Number(i.stock || 0)
    );
    if (invalid) {
      showToast(
        t(
          "checkout.messages.stockIssue",
          "Some items exceed stock. Please update quantities."
        )
      );
      return;
    }

    navigate("/checkout");
  };

  // 🎨 ألوان حسب الثيم
  const pageBg =
    "min-h-screen flex flex-col bg-[#f9f9f9] text-slate-900 dark:bg-[#021a15] dark:text-slate-100 transition-colors duration-300";

  const shellSurface = isDark
    ? "bg-slate-900/70 border-slate-700/70 shadow-[0_22px_55px_rgba(0,0,0,0.75)]"
    : "bg-white/90 border-emerald-100 shadow-[0_22px_55px_rgba(15,23,42,0.18)]";

  const muted = isDark ? "text-slate-300" : "text-slate-500";

  return (
    <main dir={isRTL ? "rtl" : "ltr"} className={pageBg}>
      {/* توست بسيط فوق */}
      {toast && (
        <div
          className={`
            fixed z-50 top-4 ${isRTL ? "left-4" : "right-4"}
            max-w-xs rounded-2xl px-4 py-3 text-sm flex items-center gap-2
            shadow-lg backdrop-blur
            ${
              isDark
                ? "bg-amber-900/90 text-amber-100 border border-amber-700/70"
                : "bg-amber-50 text-amber-900 border border-amber-200"
            }
          `}
        >
          <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-amber-500 text-white text-[10px] font-bold">
            !
          </span>
          <span>{toast}</span>
        </div>
      )}

      {/* هيدر بسيط بنفس ستايل الهوم / تشيك اوت */}
      <div className="bg-gradient-to-b from-emerald-500/15 via-emerald-500/5 to-transparent dark:from-emerald-400/25 dark:via-emerald-400/10">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 pt-10 pb-6">
          <div className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-[11px] font-semibold tracking-[0.18em] uppercase bg-black/5 dark:bg-white/5 text-emerald-700 dark:text-emerald-300 ring-1 ring-emerald-500/20 backdrop-blur">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            {t("nav.cart", "Cart")}
          </div>

          <div className="mt-4 flex items-end justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-500">
                <FiShoppingCart className="text-lg" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-semibold">
                  {t("cart.title", "Your shopping cart")}
                </h1>
                <p className={`text-xs md:text-sm mt-1 ${muted}`}>
                  {items.length
                    ? t("cart.subtitle", "Review items and adjust quantities.")
                    : t(
                        "checkout.empty.subtitle",
                        "Add products to your cart to start your order."
                      )}
                </p>
              </div>
            </div>

            {items.length > 0 && (
              <div className="text-xs md:text-[13px] flex items-center gap-2 rounded-2xl px-3 py-2 bg-emerald-500/10 border border-emerald-500/30 text-emerald-100 dark:text-emerald-100">
                <span className="inline-flex h-6 w-6 items-center justify-center rounded-xl bg-emerald-500 text-white text-[11px] font-bold shadow-md shadow-emerald-500/40">
                  {items.length}
                </span>
                <span className="opacity-90">
                  {t("cart.itemsCountLabel", "Items in your basket")}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* محتوى الكارت */}
      <div className="flex-1 pb-10 pt-4">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <section
            className={`
              rounded-3xl border p-6 md:p-8
              ${shellSurface}
            `}
          >
            {!items.length ? (
              <div className="py-10 text-center">
                <div className="inline-flex h-16 w-16 items-center justify-center rounded-3xl bg-emerald-500/10 text-emerald-500 mb-4">
                  <FiShoppingCart className="text-2xl" />
                </div>
                <p className="text-lg font-semibold">
                  {t("checkout.empty.title", "Your cart is empty")}
                </p>
                <p className={`mt-2 text-sm ${muted}`}>
                  {t(
                    "cart.empty.subtitle",
                    "Browse products and add them to your cart to see them here."
                  )}
                </p>
              </div>
            ) : (
              <>
                {/* قائمة المنتجات */}
                <ul
                  className={`divide-y rounded-2xl border ${
                    isDark
                      ? "border-slate-700/70 divide-slate-800/80 bg-slate-900/40"
                      : "border-emerald-100/80 divide-emerald-50 bg-emerald-50/40"
                  }`}
                >
                  {items.map((item) => {
                    const price = Number(item.price || 0);
                    const qty = Number(item.quantity || 0);
                    const stock = Number(item.stock || 0);
                    const stockRem = Math.max(0, stock - qty);

                    const outOfStock = stock === 0;
                    const lowStock = !outOfStock && stockRem > 0 && stockRem <= 5;

                    return (
                      <li
                        key={item.id}
                        className="py-4 px-4 flex flex-col sm:flex-row gap-4 items-start sm:items-center transition-all duration-200 hover:bg-black/5 dark:hover:bg-white/5"
                      >
                        {/* صورة المنتج */}
                        <div
                          className={`
                            w-full sm:w-32 h-32 flex-shrink-0 overflow-hidden rounded-2xl border
                            ${
                              isDark
                                ? "border-slate-700 bg-slate-900/60"
                                : "border-emerald-100 bg-white"
                            }
                          `}
                        >
                          {item.thumbnailUrl || item.img ? (
                            <img
                              src={item.thumbnailUrl || item.img}
                              alt={item.title || item.name}
                              className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                            />
                          ) : (
                            <div
                              className={`w-full h-full flex items-center justify-center text-xs ${
                                isDark
                                  ? "bg-slate-800 text-slate-400"
                                  : "bg-emerald-50 text-emerald-700"
                              }`}
                            >
                              {t("cart.noImage", "No Image")}
                            </div>
                          )}
                        </div>

                        {/* تفاصيل المنتج */}
                        <div className="flex-1 flex flex-col justify-between gap-2 w-full">
                          <div className="flex flex-wrap items-start justify-between gap-2">
                            <div>
                              <h3
                                className={`text-base md:text-lg font-semibold ${
                                  isDark ? "text-white" : "text-slate-900"
                                }`}
                              >
                                {item.name || item.title}
                              </h3>
                              <p className="text-emerald-500 font-semibold mt-1">
                                {price.toLocaleString()} EGP
                              </p>

                              {/* حالة المخزون */}
                              <div className="mt-1 text-[11px] flex items-center gap-2">
                                {outOfStock && (
                                  <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 bg-red-500/15 text-red-300 border border-red-500/40">
                                    <span className="h-1.5 w-1.5 rounded-full bg-red-400" />
                                    {t("cart.outOfStock", "Out of stock")}
                                  </span>
                                )}

                                {lowStock && (
                                  <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 bg-amber-500/10 text-amber-500 border border-amber-500/40">
                                    <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
                                    {t("cart.lowStock", "Only {{count}} left", {
                                      count: stockRem,
                                    })}
                                  </span>
                                )}

                                {!outOfStock && !lowStock && (
                                  <span
                                    className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 border text-[10px] ${
                                      isDark
                                        ? "border-emerald-500/40 text-emerald-300 bg-emerald-500/10"
                                        : "border-emerald-300 text-emerald-700 bg-emerald-50"
                                    }`}
                                  >
                                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                                    {t("cart.inStock", "In stock")}
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* زر الحذف */}
                            <button
                              onClick={() => dispatch(removeFromCart(item.id))}
                              className={`
                                rounded-full p-2 text-xs flex items-center justify-center
                                transition-all duration-200
                                ${
                                  isDark
                                    ? "bg-red-900/70 text-red-100 hover:bg-red-800 hover:shadow-[0_0_20px_rgba(239,68,68,0.4)]"
                                    : "bg-red-500/90 text-white hover:bg-red-600 hover:shadow-[0_0_20px_rgba(239,68,68,0.35)]"
                                }
                              `}
                              aria-label={t("cart.remove", "Remove item")}
                            >
                              <FiTrash2 size={18} />
                            </button>
                          </div>

                          {/* الكمية + كنترول */}
                          <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                            <div className="flex items-center gap-3">
                              <button
                                onClick={() => handleDecrease(item)}
                                className={`
                                  w-8 h-8 rounded-full border flex items-center justify-center
                                  transition-all duration-200
                                  ${
                                    isDark
                                      ? "border-slate-600 text-slate-100 hover:bg-slate-800"
                                      : "border-slate-300 text-slate-700 hover:bg-slate-100"
                                  }
                                `}
                              >
                                <FiMinus />
                              </button>
                              <span
                                className={`min-w-[40px] text-center text-sm font-semibold ${
                                  isDark ? "text-white" : "text-slate-900"
                                }`}
                              >
                                {qty}
                              </span>
                              <button
                                onClick={() => handleAdd(item)}
                                className={`
                                  w-8 h-8 rounded-full border flex items-center justify-center
                                  transition-all duration-200
                                  ${
                                    isDark
                                      ? "border-emerald-500 text-emerald-400 hover:bg-emerald-500/20"
                                      : "border-emerald-400 text-emerald-600 hover:bg-emerald-50"
                                  }
                                `}
                              >
                                <FiPlus />
                              </button>
                            </div>

                            <p className={`text-xs ${muted}`}>
                              {t("cart.lineTotal", "Line total")}:{" "}
                              <span className="font-semibold text-emerald-500">
                                {(price * qty).toLocaleString()} EGP
                              </span>
                            </p>
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ul>

                {/* فوتر الكارت (نفس الكومبوننت / نفس اللوجيك) */}
                <div className="mt-6">
                  <CartFooter
                    title={t("checkout.header.eyebrow", "Checkout")}
                    total={total}
                    totaltext={t("checkout.summary.total", "Total")}
                    onCheckout={handleGoToCheckout}
                    itemCount={items.length}
                    textitem={t("checkout.summary.quantity_plural", "items")}
                  />
                </div>
              </>
            )}
          </section>
        </div>
      </div>

      <Footer />
    </main>
  );
}
