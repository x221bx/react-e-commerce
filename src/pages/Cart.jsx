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
import { getLocalizedProductTitle, ensureProductLocalization } from "../utils/productLocalization";
import { getShippingCost, subscribeShippingCost } from "../services/shippingService";
import EmptyState from "../components/ui/EmptyState";

export default function Cart() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "ar";
  const lang = i18n.language || "en";

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

  const muted = "text-[var(--color-text-muted)]";

  return (
    <main dir={isRTL ? "rtl" : "ltr"} className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)]">
      <div className="mx-auto max-w-6xl px-4 py-10 space-y-6">
        {/* Toast */}
        {toast && (
          <div
            className={`fixed z-50 top-4 ${isRTL ? "left-4" : "right-4"} max-w-xs rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3 text-sm shadow-[var(--shadow-md)]`}
          >
            {toast}
          </div>
        )}

        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-[var(--radius-lg)] flex items-center justify-center bg-[var(--color-surface-muted)] text-[var(--color-accent)] border border-[var(--color-border)]">
              <FiShoppingCart size={20} />
            </div>
            <div>
              <p className="text-xs font-semibold text-[var(--color-accent)] uppercase tracking-wide">
                {t("nav.cart", "Cart")}
              </p>
              <h1 className="text-3xl font-bold">{t("cart.title", "Your shopping cart")}</h1>
              <p className={`text-sm mt-1 ${muted}`}>
                {items.length
                  ? t("cart.subtitle", "Review items and adjust quantities.")
                  : t("checkout.empty.subtitle", "Add products to your cart to start your order.")}
              </p>
            </div>
          </div>
          {items.length > 0 && (
            <div className="flex items-center gap-2 text-xs rounded-[var(--radius-md)] px-3 py-2 border border-[var(--color-border)] bg-[var(--color-surface-muted)]">
              <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-[var(--color-accent)] text-white text-[11px] shadow-[var(--shadow-sm)]">
                {items.length}
              </span>
              {t("cart.itemsCountLabel", "Items in your basket")}
            </div>
          )}
        </div>

        {/* Main */}
        <section className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] shadow-[var(--shadow-sm)] p-6 md:p-8">
          {!items.length ? (
            <EmptyState
              title={t("checkout.empty.title", "Your cart is empty")}
              message={t("cart.empty.subtitle", "Browse products and add them to your cart.")}
              action={
                <button
                  onClick={() => navigate("/products")}
                  className="rounded-[var(--radius-md)] bg-[var(--color-accent)] px-5 py-2 text-sm font-semibold text-white shadow-[var(--shadow-sm)] hover:brightness-95"
                >
                  {t("checkout.empty.cta", "Go to Products")}
                </button>
              }
            />
          ) : (
            <>
              <ul className="divide-y divide-[var(--color-border)]">
                {items.map((item) => {
                  const price = Number(item.price);
                  const qty = Number(item.quantity);
                  const stock = Number(item.stock);
                  const stockRem = stock - qty;

                  const stockBadge = () => {
                    if (stock === 0)
                      return (
                        <span className="inline-flex items-center gap-1 rounded-full border border-[var(--color-border)] bg-red-500/10 px-2 py-1 text-xs text-red-600">
                          <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
                          {t("cart.outOfStock")}
                        </span>
                      );
                    if (stock > 0 && stockRem < 5)
                      return (
                        <span className="inline-flex items-center gap-1 rounded-full border border-[var(--color-border)] bg-amber-100 px-2 py-1 text-xs text-amber-700">
                          <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                          {t("cart.lowStock", { count: stockRem })}
                        </span>
                      );
                    return (
                      <span className="inline-flex items-center gap-1 rounded-full border border-[var(--color-border)] bg-[var(--color-surface-muted)] px-2 py-1 text-xs text-[var(--color-accent)]">
                        <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-accent)]" />
                        {t("cart.inStock")}
                      </span>
                    );
                  };

                  return (
                    <li key={item.id} className="py-5 md:py-6 flex flex-col md:flex-row gap-4">
                      <div className="w-full md:w-32 h-32 flex-shrink-0 rounded-[var(--radius-md)] overflow-hidden border border-[var(--color-border)] bg-[var(--color-surface-muted)]">
                        <img
                          src={item.thumbnailUrl || item.img}
                          className="h-full w-full object-cover"
                          alt=""
                        />
                      </div>

                      <div className="flex-1 flex flex-col justify-between gap-3">
                        <div className="flex flex-wrap justify-between gap-3">
                          <div>
                            <h3 className="font-semibold text-lg text-[var(--color-text)]">
                              {getLocalizedProductTitle(item, lang)}
                            </h3>
                            <p className="text-[var(--color-accent)] font-bold mt-1">
                              {price.toLocaleString()} EGP
                            </p>
                            <div className="mt-2 flex flex-wrap gap-2 text-xs">{stockBadge()}</div>
                          </div>
                          <button
                            onClick={() => dispatch(removeFromCart(item.id))}
                            className="p-2 rounded-full border border-[var(--color-border)] text-[var(--color-text)] hover:bg-[var(--color-surface-muted)]"
                          >
                            <FiTrash2 size={18} />
                          </button>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <button
                              onClick={() => handleDecrease(item)}
                              className="w-9 h-9 flex items-center justify-center rounded-full border border-[var(--color-border)] bg-[var(--color-surface-muted)] hover:bg-[var(--color-surface)]"
                            >
                              <FiMinus />
                            </button>
                            <span className="min-w-[36px] text-center font-semibold text-[var(--color-text)]">
                              {qty}
                            </span>
                            <button
                              onClick={() => handleAdd(item)}
                              className="w-9 h-9 flex items-center justify-center rounded-full border border-[var(--color-border)] bg-[var(--color-surface-muted)] hover:bg-[var(--color-surface)] text-[var(--color-accent)]"
                            >
                              <FiPlus />
                            </button>
                          </div>

                          <p className="text-sm text-[var(--color-text)]">
                            {t("cart.lineTotal")}:{" "}
                            <span className="font-bold">{(price * qty).toLocaleString()} EGP</span>
                          </p>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>

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

      <Footer />
    </main>
  );
}
