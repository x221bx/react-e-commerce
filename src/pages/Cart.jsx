// src/pages/Cart.jsx
import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  addToCart,
  decreaseQuantity,
  removeFromCart,
  updateCartStock,
} from "../features/cart/cartSlice";
import {
  FiTrash2,
  FiShoppingCart,
  FiPlus,
  FiMinus,
} from "react-icons/fi";
import { db } from "../services/firebase";
import { getDocs, collection } from "firebase/firestore";
import CartFooter from "../components/CartFooter";
import Footer from "../Authcomponents/Footer";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { UseTheme } from "../theme/ThemeProvider";
import { getLocalizedProductTitle, ensureProductLocalization } from "../utils/productLocalization";
import { getShippingCost, subscribeShippingCost } from "../services/shippingService";

export default function Cart() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "ar";
  const lang = i18n.language || "en";
  const { theme } = UseTheme();
  const isDark = theme === "dark";

  const { items = [] } = useSelector((state) => state.cart || {});
  const [toast, setToast] = useState("");
  const [shippingCost, setShippingCost] = useState(50);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  };

  // Fetch latest stock
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

      dispatch(updateCartStock(products.map((p) => ensureProductLocalization(p))));
    } catch (err) {
      console.error("fetchLatestStock failed:", err);
    }
  };

  useEffect(() => {
    fetchLatestStock();
  }, []);

  useEffect(() => {
    // subscribe to shipping cost so changes in admin reflect immediately
    let unsub = null;
    const start = async () => {
      try {
        // initial fetch (keeps existing behavior)
        const cost = await getShippingCost();
        setShippingCost(cost);
      } catch (error) {
        console.error("Error fetching shipping cost:", error);
      }

      // real-time updates
      unsub = subscribeShippingCost((cost) => {
        setShippingCost(cost);
      });
    };

    start();

    return () => {
      if (typeof unsub === "function") unsub();
    };
  }, []);

  const handleAdd = (item) => {
    const qty = Number(item.quantity || 0);
    const stock = Number(item.stock || 0);

    if (qty >= stock) {
      const name = getLocalizedProductTitle(item, lang) || item.title || item.name || "";
      showToast(`Max stock reached for "${name}"`);
      return;
    }
    dispatch(addToCart({ ...item }));
  };

  const handleDecrease = (item) => {
    if (item.quantity > 1) dispatch(decreaseQuantity(item.id));
  };

  const subtotal = items.reduce(
    (sum, i) => sum + Number(i.price || 0) * Number(i.quantity || 0),
    0
  );
  const shipping = items.length ? shippingCost : 0;
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

  /* PAGE + GLASS + GLOW STYLES */
  const pageBg = `
    min-h-screen flex flex-col relative overflow-hidden 
    bg-[radial-gradient(circle_at_20%_0%,#bbf7d0_0%,transparent_60%),radial-gradient(circle_at_100%_80%,#c7d2fe_0%,transparent_60%)]
    dark:bg-[radial-gradient(circle_at_20%_0%,#0f172a_0%,transparent_60%),radial-gradient(circle_at_100%_80%,#064e3b_0%,transparent_60%)]
    transition-colors duration-500
  `;

  const sectionSurface = `
    rounded-3xl border backdrop-blur-2xl transition-all duration-300
    ${isDark
      ? "bg-slate-900/70 border-slate-700 shadow-[0_25px_60px_rgba(0,0,0,0.75)]"
      : "bg-white/80 border-emerald-200 shadow-[0_25px_60px_rgba(16,185,129,0.20)]"}
  `;

  const lineBg = isDark
    ? "border-slate-700/80 bg-slate-900/40"
    : "border-emerald-200/80 bg-emerald-50/40";

  const muted = isDark ? "text-slate-300" : "text-slate-500";

  return (
    <main dir={isRTL ? "rtl" : "ltr"} className={pageBg}>

      {/* BACKGROUND GRID */}
      <div className="pointer-events-none absolute inset-0 opacity-10">
        <div className="w-full h-full bg-[radial-gradient(circle_at_1px_1px,rgba(148,163,184,0.4)_1px,transparent_0)] bg-[length:22px_22px]" />
      </div>

      {/* FLOATING GLOW ORBS */}
      <div className="pointer-events-none absolute -top-20 right-10 w-60 h-60 bg-emerald-400/25 blur-3xl rounded-full animate-pulse"></div>
      <div className="pointer-events-none absolute -bottom-20 left-10 w-60 h-60 bg-emerald-300/20 blur-2xl rounded-full"></div>

      {/* TOAST */}
      {toast && (
        <div
          className={`fixed z-50 top-4 ${
            isRTL ? "left-4" : "right-4"
          } max-w-xs rounded-2xl px-4 py-3 text-sm flex items-center gap-2
          shadow-xl backdrop-blur-xl border
          ${
            isDark
              ? "bg-amber-900/80 text-amber-100 border-amber-700"
              : "bg-amber-50 text-amber-900 border-amber-200"
          }`}
        >
          <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-amber-500 text-white text-[10px] font-bold">
            !
          </span>
          {toast}
        </div>
      )}

      {/* HEADER */}
      <div className="bg-transparent pt-10 pb-6 px-4 max-w-6xl mx-auto">
        <div className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-wide
          bg-emerald-500/10 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300 ring-1 ring-emerald-400/30 backdrop-blur">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          {t("nav.cart", "Cart")}
        </div>

        <div className="mt-4 flex items-end justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl flex items-center justify-center bg-emerald-500/10 text-emerald-500 shadow-inner">
              <FiShoppingCart size={20} />
            </div>
            <div>
              <h1 className="text-3xl font-bold">{t("cart.title", "Your shopping cart")}</h1>
              <p className={`text-sm mt-1 ${muted}`}>
                {items.length
                  ? t("cart.subtitle", "Review items and adjust quantities.")
                  : t("checkout.empty.subtitle", "Add products to your cart to start your order.")}
              </p>
            </div>
          </div>

          {items.length > 0 && (
            <div className="flex items-center gap-2 text-xs rounded-2xl px-3 py-2 border
              bg-emerald-500/10 border-emerald-500/40 text-emerald-700 dark:text-emerald-200 dark:bg-emerald-600/20">
              <span className="inline-flex h-6 w-6 items-center justify-center rounded-xl bg-emerald-500 text-white text-[11px] shadow shadow-emerald-500/40">
                {items.length}
              </span>
              {t("cart.itemsCountLabel", "Items in your basket")}
            </div>
          )}
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="flex-1 pb-12 pt-4">
        <div className="max-w-6xl mx-auto px-4">

          <section className={`${sectionSurface} p-8`}>

            {/* EMPTY */}
            {!items.length ? (
              <div className="py-12 text-center">
                <div className="h-16 w-16 mx-auto rounded-3xl bg-emerald-500/10 text-emerald-500 mb-4 flex items-center justify-center">
                  <FiShoppingCart size={26} />
                </div>
                <p className="text-xl font-semibold">{t("checkout.empty.title", "Your cart is empty")}</p>
                <p className={`mt-2 text-sm ${muted}`}>
                  {t("cart.empty.subtitle", "Browse products and add them to your cart.")}
                </p>
              </div>
            ) : (

              <>
                {/* ITEMS */}
                <ul className={`rounded-3xl border overflow-hidden divide-y ${lineBg}`}>
                  {items.map((item) => {
                    const price = Number(item.price);
                    const qty = Number(item.quantity);
                    const stock = Number(item.stock);
                    const stockRem = stock - qty;

                    return (
                      <li key={item.id} className="p-5 md:p-6 flex flex-col md:flex-row gap-4 hover:bg-black/5 dark:hover:bg-white/5 transition">

                        {/* IMAGE */}
                        <div className={`
                          w-full md:w-32 h-32 flex-shrink-0 rounded-2xl overflow-hidden border shadow-inner
                          ${isDark ? "border-slate-700 bg-slate-900/60" : "border-emerald-200 bg-white"}
                        `}>
                          <img
                            src={item.thumbnailUrl || item.img}
                            className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
                            alt=""
                          />
                        </div>

                        {/* DETAILS */}
                        <div className="flex-1 flex flex-col justify-between">

                          <div className="flex flex-wrap justify-between gap-3">
                            <div>
                              <h3 className={`font-semibold text-lg ${isDark ? "text-white" : "text-slate-900"}`}>
                                {getLocalizedProductTitle(item, lang)}
                              </h3>

                              <p className="text-emerald-500 font-bold mt-1">
                                {price.toLocaleString()} EGP
                              </p>

                              {/* BADGES */}
                              <div className="mt-2 text-xs flex gap-2 flex-wrap">

                                {stock === 0 && (
                                  <span className="rounded-full px-2 py-1 bg-red-500/20 border border-red-400/50 text-red-300 flex items-center gap-1">
                                    <span className="w-1.5 h-1.5 bg-red-400 rounded-full" />
                                    {t("cart.outOfStock")}
                                  </span>
                                )}

                                {stock > 0 && stockRem < 5 && (
                                  <span className="rounded-full px-2 py-1 bg-amber-500/20 border border-amber-400/50 text-amber-400 flex items-center gap-1">
                                    <span className="w-1.5 h-1.5 bg-amber-400 rounded-full" />
                                    {t("cart.lowStock", { count: stockRem })}
                                  </span>
                                )}

                                {stockRem >= 5 && (
                                  <span className={`
                                    rounded-full px-2 py-1 border flex items-center gap-1
                                    ${
                                      isDark
                                        ? "bg-emerald-900/20 border-emerald-700 text-emerald-300"
                                        : "bg-emerald-50 border-emerald-300 text-emerald-700"
                                    }
                                  `}>
                                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                                    {t("cart.inStock")}
                                  </span>
                                )}

                              </div>
                            </div>

                            {/* DELETE BUTTON */}
                            <button
                              onClick={() => dispatch(removeFromCart(item.id))}
                              className={`
                                p-2 rounded-full transition-all shadow-md
                                ${
                                  isDark
                                    ? "bg-red-900/60 text-red-200 hover:bg-red-800 hover:shadow-red-500/40"
                                    : "bg-red-500 text-white hover:bg-red-600 hover:shadow-red-400/40"
                                }
                              `}
                            >
                              <FiTrash2 size={18} />
                            </button>
                          </div>

                          {/* QUANTITY CONTROLS */}
                          <div className="flex items-center justify-between mt-4">

                            {/* CONTROLS */}
                            <div className="flex items-center gap-3">

                              <button
                                onClick={() => handleDecrease(item)}
                                className={`
                                  w-9 h-9 flex items-center justify-center rounded-full border
                                  ${
                                    isDark
                                      ? "border-slate-700 bg-slate-800 text-slate-200 hover:bg-slate-700"
                                      : "border-slate-300 bg-slate-100 hover:bg-slate-200"
                                  }
                                `}
                              >
                                <FiMinus />
                              </button>

                              <span className={`min-w-[36px] text-center font-semibold ${isDark ? "text-white" : "text-slate-900"}`}>
                                {qty}
                              </span>

                              <button
                                onClick={() => handleAdd(item)}
                                className={`
                                  w-9 h-9 flex items-center justify-center rounded-full border transition
                                  ${
                                    isDark
                                      ? "border-emerald-500 text-emerald-400 hover:bg-emerald-500/20"
                                      : "border-emerald-400 text-emerald-700 hover:bg-emerald-50"
                                  }
                                `}
                              >
                                <FiPlus />
                              </button>

                            </div>

                            {/* LINE TOTAL */}
                            <p className={`text-sm ${isDark ? "text-emerald-200" : "text-emerald-700"}`}>
                              {t("cart.lineTotal")}:{" "}
                              <span className="font-bold">
                                {(price * qty).toLocaleString()} EGP
                              </span>
                            </p>

                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ul>

                {/* FOOTER */}
                <div className="mt-6">
                  <CartFooter
                    title={t("checkout.header.eyebrow", "Checkout")}
                    total={total}
                    totaltext={t("checkout.summary.total", "Total")}
                    onCheckout={handleGoToCheckout}
                    itemCount={items.length}
                    textitem={
                      items.length === 1
                        ? t("checkout.summary.itemLabel", "item")
                        : t("checkout.summary.itemsLabel", "items")
                    }
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
