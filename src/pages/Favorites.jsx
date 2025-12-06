// src/pages/Favorites.jsx
import React from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  toggleFavourite,
  clearFavourites,
} from "../features/favorites/favoritesSlice";
import { addToCart } from "../features/cart/cartSlice";
import { Link, useNavigate } from "react-router-dom";
import { FiTrash2, FiArrowLeft, FiShoppingCart, FiHeart } from "react-icons/fi";
import Footer from "../Authcomponents/Footer";
import { UseTheme } from "../theme/ThemeProvider";
import { useTranslation } from "react-i18next";

export default function Favorites() {
  const { theme } = UseTheme();
  const isDark = theme === "dark";
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "ar";
  const favorites = useSelector((state) => state.favorites.items ?? []);
  const cart = useSelector((state) => state.cart.items);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleBuyNow = (item) => {
    const exists = cart.find((i) => i.id === item.id);
    if (!exists) {
      dispatch(addToCart({ ...item }));
    }
    navigate("/checkout");
  };

  return (
    <div dir={isRTL ? "rtl" : "ltr"} className={`min-h-screen bg-gradient-to-b from-transparent to-gray-50/50 dark:to-slate-800/30`}>
      <div className="mx-auto max-w-6xl px-4 py-10">
        <header className="mb-8 flex items-center justify-between">
          <h1 className={`text-3xl font-bold flex items-center gap-2 ${isDark ? "text-white" : "text-gray-900"}`}>
            <FiHeart className="text-secondary" /> {t("favorites.title", "My Favorites")}
          </h1>

          {favorites.length > 0 && (
            <button
              onClick={() => dispatch(clearFavourites())}
              className={`rounded-xl px-4 py-2 text-sm font-semibold text-white shadow transition ${isDark ? "bg-red-900 hover:bg-red-800" : "bg-red-500 hover:bg-red-600"}`}
            >
              {t("favorites.clearAll", "Clear All")}
            </button>
          )}
        </header>

        {favorites.length === 0 ? (
          <div className={`rounded-xl border p-10 text-center shadow-md ${isDark ? "bg-slate-800/50 border-emerald-900/30" : "bg-white/70 border-emerald-200"}`}>
            <p className={`mb-4 text-lg ${isDark ? "text-gray-400" : "text-gray-500"}`}>{t("favorites.emptyTitle", "No favorites yet.")}</p>
            <Link
              to="/products"
              className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold text-white shadow transition ${isDark ? "bg-emerald-700 hover:bg-emerald-800" : "bg-emerald-600 hover:bg-emerald-700"}`}
            >
              <FiArrowLeft /> {t("favorites.browseProducts", "Browse Products")}
            </Link>
          </div>
        ) : (
          <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {favorites.map((item) => (
              <li
                key={item.id}
                className={`rounded-2xl border p-5 flex flex-col hover:scale-[1.02] transition-all shadow-md ${isDark ? "bg-slate-800/50 border-emerald-900/30" : "bg-white/70 border-emerald-200"}`}
              >
                <img
                  src={item.thumbnailUrl || item.img}
                  alt={item.name || item.title}
                  className={`h-52 w-full rounded-lg object-cover border ${isDark ? "border-slate-700" : "border-gray-200"}`}
                />

                <div className="mt-4 flex flex-col flex-1 justify-between">
                  <h2 className={`text-lg font-semibold ${isDark ? "text-white" : "text-gray-900"}`}>
                    {item.name || item.title}
                  </h2>

                  <div className="mt-3 flex items-center justify-between">
                    <span className="text-sm font-medium text-green-500">
                      {Number(item.price).toLocaleString()} EGP
                    </span>

                    <div className="flex items-center gap-3">
                      {/* ❤️ toggle favourite (add/remove) */}
                      <button
                        onClick={() => dispatch(toggleFavourite({ ...item }))}
                        className={`transition ${isDark ? "text-red-500 hover:text-red-400" : "text-red-500 hover:text-red-700"}`}
                        title="Remove from Favorites"
                      >
                        <FiTrash2 size={18} />
                      </button>

                      <button
                        onClick={() => handleBuyNow(item)}
                        className={`flex items-center gap-1 rounded-xl px-3 py-1 text-sm font-semibold text-white transition ${isDark ? "bg-emerald-700 hover:bg-emerald-800" : "bg-emerald-600 hover:bg-emerald-700"}`}
                        title={t("favorites.buy", "Buy")}
                      >
                        <FiShoppingCart size={16} /> {t("favorites.buy", "Buy")}
                      </button>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <Footer />
    </div>
  );
}
