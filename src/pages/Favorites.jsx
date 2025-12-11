// src/pages/Favorites.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  removeFavourite,
  clearFavourites,
} from "../features/favorites/favoritesSlice";
import { addToCart } from "../features/cart/cartSlice";
import { Link, useNavigate } from "react-router-dom";
import {
  FiTrash2,
  FiArrowLeft,
  FiShoppingCart,
  FiHeart,
} from "react-icons/fi";
import Footer from "../Authcomponents/Footer";
import { UseTheme } from "../theme/ThemeProvider";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import { db } from "../services/firebase";
import { collection, getDocs, query, where, documentId } from "firebase/firestore";
import { getLocalizedProductTitle, ensureProductLocalization } from "../utils/productLocalization";

export default function Favorites() {
  const { theme } = UseTheme();
  const isDark = theme === "dark";
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "ar";
  const lang = i18n.language || "en";
  const favorites = useSelector((state) => state.favorites.items ?? []);
  const cart = useSelector((state) => state.cart.items ?? []);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [latestProducts, setLatestProducts] = useState({});
  const normalizedFavorites = useMemo(
    () => favorites.map((f) => ensureProductLocalization(f)),
    [favorites]
  );

  const cartItemIds = useMemo(
    () => new Set(cart.map((item) => item.id)),
    [cart]
  );

  const isUnavailable = (item) => {
    const live = latestProducts[item.id] || {};
    const stock = Number(live.stock ?? live.quantity ?? item.stock ?? item.quantity ?? 0);
    const availableFlag = live.isAvailable ?? item.isAvailable;
    return availableFlag === false || stock <= 0;
  };

  // Fetch live product data for favorites to reflect availability changes
  useEffect(() => {
  const fetchLiveProducts = async () => {
    if (!normalizedFavorites.length) {
      setLatestProducts({});
      return;
    }
      const batches = [];
      for (let i = 0; i < normalizedFavorites.length; i += 10) {
        batches.push(normalizedFavorites.slice(i, i + 10).map((f) => f.id));
      }
      const results = {};
      try {
        for (const batch of batches) {
          const snap = await getDocs(
            query(collection(db, "products"), where(documentId(), "in", batch))
          );
          snap.forEach((d) => {
            const data = d.data() || {};
            results[d.id] = ensureProductLocalization({ id: d.id, ...data });
          });
        }
        setLatestProducts(results);
      } catch (err) {
        console.warn("Failed to refresh favorites availability", err);
      }
    };
    fetchLiveProducts();
  }, [normalizedFavorites]);

  const handleAddToCart = (item) => {
    if (isUnavailable(item)) {
      toast.error(
        t("favorites.unavailable", "This product is unavailable right now.")
      );
      return;
    }
    if (!cartItemIds.has(item.id))
      dispatch(addToCart(ensureProductLocalization({ ...item })));
  };

  const handleRemoveFromFavorites = (item) => {
    dispatch(removeFavourite(ensureProductLocalization({ ...item })));
  };

  return (
    <div
      dir={isRTL ? "rtl" : "ltr"}
      className={`
        min-h-screen relative overflow-hidden
        bg-[radial-gradient(circle_at_top,_#bbf7d0_0,_transparent_55%),radial-gradient(circle_at_bottom,_#e5e7eb_0,_transparent_55%)]
        dark:bg-[radial-gradient(circle_at_top,_#0f172a_0,_transparent_55%),radial-gradient(circle_at_bottom,_#022c22_0,_transparent_55%)]
      `}
    >
      {/* خلفية جريد خفيفة + جلو عام */}
      <div className="pointer-events-none absolute inset-0 opacity-40 mix-blend-soft-light">
        <div className="w-full h-full bg-[radial-gradient(circle_at_1px_1px,_rgba(148,163,184,0.4)_1px,_transparent_0)] bg-[length:22px_22px]" />
      </div>
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-32 right-10 w-72 h-72 bg-emerald-400/25 blur-3xl rounded-full animate-pulse" />
        <div className="absolute -bottom-32 left-0 w-72 h-72 bg-emerald-500/20 blur-3xl rounded-full" />
      </div>

      <div className="relative z-10 mx-auto max-w-6xl px-4 py-10">
        {/* HEADER */}
        <header className="mb-10 flex items-center justify-between gap-4">
          <div>
            <h1
              className={`
                text-4xl md:text-5xl font-extrabold flex items-center gap-3 drop-shadow-sm
                ${isDark ? "text-white" : "text-slate-900"}
              `}
            >
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-500/10 border border-emerald-400/40 shadow-inner">
                <FiHeart className="text-emerald-500 animate-pulse" />
              </span>
              {t("favorites.title", "My Favorites")}
            </h1>
            <p
              className={`mt-2 text-sm md:text-base ${
                isDark ? "text-slate-300" : "text-slate-600"
              }`}
            >
              {t(
                "favorites.subtitle",
                "Keep track of the products you love and add them to your cart anytime."
              )}
            </p>
          </div>

          {normalizedFavorites.length > 0 && (
            <button
              onClick={() => dispatch(clearFavourites())}
              className={`
                rounded-2xl px-5 py-2.5 text-sm font-semibold text-white shadow-xl 
                transition-all hover:scale-105 active:scale-95
                border border-red-400/60
                ${
                  isDark
                    ? "bg-red-800/90 hover:bg-red-700/90"
                    : "bg-red-500 hover:bg-red-600"
                }
              `}
            >
              {t("favorites.clearAll", "Clear All")}
            </button>
          )}
        </header>

        {/* EMPTY STATE */}
        {normalizedFavorites.length === 0 ? (
          <div
            className={`
              rounded-3xl border p-12 text-center shadow-2xl backdrop-blur-xl
              relative overflow-hidden
              ${
                isDark
                  ? "bg-slate-900/80 border-emerald-900/40"
                  : "bg-white/80 border-emerald-200/80"
              }
            `}
          >
            <div className="pointer-events-none absolute inset-0">
              <div className="absolute -top-10 right-10 w-40 h-40 bg-emerald-400/25 blur-3xl rounded-full" />
              <div className="absolute bottom-0 left-0 w-40 h-40 bg-emerald-300/15 blur-2xl rounded-full" />
            </div>

            <div className="relative z-10">
              <p
                className={`mb-4 text-lg ${
                  isDark ? "text-slate-200" : "text-slate-600"
                }`}
              >
                {t("favorites.emptyTitle", "No favorites yet.")}
              </p>

              <Link
                to="/products"
                className={`
                  inline-flex items-center gap-2 rounded-2xl px-6 py-3 text-sm font-semibold text-white shadow-xl 
                  transition-all hover:scale-105 active:scale-95
                  ${
                    isDark
                      ? "bg-emerald-700 hover:bg-emerald-800"
                      : "bg-emerald-600 hover:bg-emerald-700"
                  }
                `}
              >
                <FiArrowLeft />{" "}
                {t("favorites.browseProducts", "Browse Products")}
              </Link>
            </div>
          </div>
        ) : (
          // GRID
          <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
            {normalizedFavorites.map((item) => {
              const live = latestProducts[item.id] || {};
              const mergedItem = ensureProductLocalization({ ...item, ...live });
              return (
              <li
                key={item.id}
                className={`
                  relative group rounded-3xl overflow-hidden border
                  backdrop-blur-2xl transition-all duration-500
                  shadow-[0_18px_45px_rgba(15,23,42,0.25)]
                  hover:-translate-y-3 hover:scale-[1.02]
                  hover:shadow-[0_22px_60px_rgba(16,185,129,0.35)]

                  ${
                    isDark
                      ? "bg-slate-900/70 border-emerald-900/40"
                      : "bg-white/85 border-emerald-200/90"
                  }
                `}
                style={{ transformStyle: "preserve-3d" }}
              >
                {/* INNER GLOW */}
                <div className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                  <div className="absolute -top-10 right-0 w-40 h-40 bg-emerald-400/25 blur-3xl rounded-full" />
                  <div className="absolute bottom-0 left-2 w-32 h-32 bg-emerald-300/15 blur-2xl rounded-full" />
                </div>

                {/* TOP BADGE ROW */}
                <div className="relative z-[3] px-4 pt-4 flex items-center justify-between">
                  <span
                    className={`
                      inline-flex items-center gap-1 rounded-full px-3 py-1 text-[11px] font-semibold
                      ${
                        isDark
                          ? "bg-slate-800/80 text-emerald-300 border border-emerald-700/60"
                          : "bg-emerald-50 text-emerald-700 border border-emerald-100"
                      }
                    `}
                  >
                    <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    {t("favorites.badge_curated", "Curated for you")}
                  </span>

                  <span
                    className={`
                      inline-flex items-center gap-1 rounded-full px-3 py-1 text-[11px] font-semibold
                      ${
                        isDark
                          ? "bg-slate-800/80 text-slate-100 border border-slate-700"
                          : "bg-white/80 text-slate-700 border border-slate-200"
                      }
                    `}
                  >
                    <FiHeart className="text-rose-400" size={14} />
                    {t("favorites.badge_favorite", "Favorite")}
                  </span>
                </div>

                {/* PRODUCT IMAGE */}
                <button
                    className="relative z-[2] px-4 pt-3 w-full text-left"
                  onClick={() => navigate(`/product/${item.id}`)}
                >
                  <div
                    className={`
                      rounded-2xl border overflow-hidden shadow-md 
                      transition-all duration-500 group-hover:shadow-emerald-500/25
                      ${
                        isDark
                          ? "border-slate-800 group-hover:border-emerald-500/60"
                          : "border-slate-200 group-hover:border-emerald-400/80"
                      }
                    `}
                    >
                      <img
                      src={mergedItem.thumbnailUrl || mergedItem.img}
                      alt={getLocalizedProductTitle(mergedItem, lang)}
                      className={`
                        h-60 w-full object-cover
                        transition-all duration-500 group-hover:scale-105
                      `}
                    />
                  </div>
                </button>

                {/* CONTENT */}
                <div className="relative z-[3] p-6 flex flex-col gap-4">
                  {/* Title + optional small meta */}
                  <div className="space-y-1">
                    <button
                      onClick={() => navigate(`/product/${item.id}`)}
                      className="text-left w-full"
                    >
                      <h2
                        className={`text-lg font-bold tracking-wide ${
                          isDark ? "text-white" : "text-slate-900"
                        }`}
                      >
                        {getLocalizedProductTitle(mergedItem, lang)}
                      </h2>
                    </button>
                    {(mergedItem.category || mergedItem.categoryName) && (
                      <p
                        className={`text-xs ${
                          isDark ? "text-emerald-200/80" : "text-emerald-700/80"
                        }`}
                      >
                        {mergedItem.category || mergedItem.categoryName}
                      </p>
                    )}
                  </div>

                  {/* PRICE */}
                  <div className="flex items-center justify-between">
                    <span className="text-emerald-500 text-xl font-extrabold tracking-tight drop-shadow-sm">
                      {Number(mergedItem.price).toLocaleString()} EGP
                    </span>
                    {isUnavailable(mergedItem) && (
                      <span className="text-xs font-semibold text-amber-600 dark:text-amber-300">
                        {t("products.outOfStock", "Out of Stock")}
                      </span>
                    )}
                  </div>

                  {/* ACTION BUTTONS */}
                  <div className="flex items-center justify-between mt-2">
                    {/* Remove */}
                    <button
                      onClick={() => handleRemoveFromFavorites(mergedItem)}
                      className={`
                        p-2 rounded-xl transition-all duration-300
                        hover:scale-110 active:scale-95
                        ${
                          isDark
                            ? "text-rose-400 hover:bg-rose-900/40"
                            : "text-rose-600 hover:bg-rose-100"
                        }
                      `}
                      title={t(
                        "favorites.remove",
                        "Remove from favorites"
                      )}
                    >
                      <FiTrash2 size={20} />
                    </button>

                    {/* Add to cart */}
                    <button
                      onClick={() => handleAddToCart(mergedItem)}
                      disabled={cartItemIds.has(item.id) || isUnavailable(mergedItem)}
                      className={`
                        flex items-center gap-2 px-4 py-2 rounded-2xl text-sm font-semibold shadow-lg 
                        transition-all duration-300 active:scale-95 border
                        ${
                          cartItemIds.has(item.id) || isUnavailable(mergedItem)
                            ? "bg-slate-200 text-slate-500 border-slate-300 cursor-not-allowed dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700"
                            : "bg-emerald-600 text-white hover:bg-emerald-500 border-emerald-400/70"
                        }
                      `}
                    >
                      <FiShoppingCart size={18} />
                      {cartItemIds.has(item.id)
                        ? t("favorites.inCart", "In Cart")
                        : isUnavailable(mergedItem)
                        ? t("favorites.unavailableShort", "Unavailable")
                        : t("favorites.addToCart", "Add to Cart")}
                    </button>
                  </div>
                </div>
              </li>
            )})}
          </ul>
        )}
      </div>

      <Footer />
    </div>
  );
}
