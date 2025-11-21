import { useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { FiHeart, FiShoppingCart, FiExternalLink } from "react-icons/fi";

import { toggleFavourite } from "../../features/favorites/favoritesSlice";
import { addToCart } from "../../features/cart/cartSlice";
import { UseTheme } from "../../theme/ThemeProvider";

const currency = new Intl.NumberFormat("ar-EG", {
  style: "currency",
  currency: "EGP",
});

export default function SavedProducts() {
  const favourites = useSelector((state) => state.favorites?.items || []);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { theme } = UseTheme();
  const { t } = useTranslation();
  const isDark = theme === "dark";
  const accent = isDark ? "text-emerald-300" : "text-emerald-600";
  const headingColor = isDark ? "text-white" : "text-slate-900";
  const muted = isDark ? "text-slate-400" : "text-slate-500";
  const cardSurface = isDark
    ? "border-slate-800 bg-slate-900/70"
    : "border-slate-100 bg-white/95";
  const emptySurface = isDark
    ? "border-slate-800 bg-slate-900/60"
    : "border-slate-200 bg-white/80";
  const previewSurface = isDark
    ? "bg-slate-800 text-slate-300"
    : "bg-slate-100 text-slate-500";
  const outlineButton = isDark
    ? "border-slate-700 text-slate-200 hover:bg-slate-800/80"
    : "border-slate-200 text-slate-700 hover:bg-slate-50";
  const destructiveButton = isDark
    ? "border-red-900/40 text-red-200 hover:bg-red-900/30"
    : "border-red-200 text-red-600 hover:bg-red-50";
  const availabilityClass = (available) =>
    available
      ? isDark
        ? "text-emerald-300"
        : "text-emerald-600"
      : isDark
        ? "text-amber-300"
        : "text-amber-600";

  const items = useMemo(
    () =>
      favourites.map((product) => ({
        id: product.id,
        title: product.title || product.name || "Unnamed product",
        category: product.category || product.productType || "General",
        price:
          typeof product.price === "number"
            ? currency.format(product.price)
            : product.price || t("account.savedProducts.priceUnknown", "N/A"),
        isAvailable:
          typeof product.isAvailable === "boolean" ? product.isAvailable : true,
        thumbnail:
          product.coverImg ||
          product.thumbnail ||
          product.images?.[0] ||
          product.photoURL ||
          "",
      })),
    [favourites]
  );

  const handleRemove = (original) => {
    dispatch(toggleFavourite(original));
  };

  const handleAddToCart = (original) => {
    dispatch(addToCart(original));
  };

  const handleViewProduct = (id) => {
    if (!id) return;
    navigate(`/products/${id}`);
  };

  if (!items.length) {
    return (
      <div className={`rounded-3xl border border-dashed p-8 text-center shadow-sm ${emptySurface}`}>
        <FiHeart className="mx-auto mb-3 h-8 w-8 text-emerald-500" />
        <p className={`text-lg font-semibold ${headingColor}`}>
          {t("account.savedProducts.emptyTitle", "No saved products yet")}
        </p>
        <p className={`mt-2 text-sm ${muted}`}>
          {t("account.savedProducts.emptySubtitle", "Explore the catalog curated by your admins and tap the heart icon to keep favourites handy.")}
        </p>
        <button
          type="button"
          onClick={() => navigate("/products")}
          className="mt-4 inline-flex items-center rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-500"
        >
          {t("account.savedProducts.browse", "Browse products")}
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header>
        <p className={`text-sm font-semibold uppercase tracking-wide ${accent}`}>
          {t("account.savedProducts.eyebrow", "Favorites")}
        </p>
        <h1 className={`text-3xl font-semibold ${headingColor}`}>
          {t("account.savedProducts.title", "Saved Products")}
        </h1>
        <p className={`text-sm ${muted}`}>
          {t("account.savedProducts.subtitle", "These items stay in sync with the real inventory managed from the admin area.")}
        </p>
      </header>

      <div className="grid gap-4 sm:gap-6">
        {items.map((item, idx) => (
          <div
            key={`${item.id || "saved"}-${idx}`}
            className={`rounded-2xl border p-4 shadow-sm transition hover:shadow-md ${cardSurface}`}
          >
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              {/* Product Image */}
              <div className={`h-20 w-20 flex-shrink-0 overflow-hidden rounded-xl ${previewSurface} sm:h-24 sm:w-24`}>
                {item.thumbnail ? (
                  <img
                    src={item.thumbnail}
                    alt={item.title}
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-sm">
                    {t("account.savedProducts.noImage", "No image")}
                  </div>
                )}
              </div>

              {/* Product Info */}
              <div className="flex-1 space-y-2">
                <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
                  <div className="space-y-1">
                    <p className={`text-xs uppercase tracking-wide ${muted}`}>
                      {item.category}
                    </p>
                    <h3 className={`text-lg font-semibold ${headingColor} line-clamp-2`}>
                      {item.title}
                    </h3>
                  </div>
                  <div className="flex items-center gap-2 sm:flex-col sm:items-end">
                    <p className={`text-lg font-bold ${isDark ? "text-emerald-300" : "text-emerald-600"}`}>
                      {item.price}
                    </p>
                    <p className={`text-xs font-semibold ${availabilityClass(item.isAvailable)}`}>
                      {item.isAvailable ? t("account.savedProducts.inStock", "In stock") : t("account.savedProducts.unavailable", "Currently unavailable")}
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                <button
                  type="button"
                  onClick={() => handleViewProduct(item.id)}
                  className={`inline-flex items-center justify-center gap-2 rounded-xl border px-4 py-2 text-sm font-medium transition ${outlineButton} min-w-[100px]`}
                >
                  <FiExternalLink className="h-4 w-4" />
                  <span className="hidden sm:inline">{t("account.savedProducts.view", "View")}</span>
                  <span className="sm:hidden">{t("account.savedProducts.view", "View")}</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleAddToCart(favourites[idx])}
                  disabled={!item.isAvailable}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-emerald-500 disabled:opacity-60 min-w-[100px]"
                >
                  <FiShoppingCart className="h-4 w-4" />
                  <span className="hidden sm:inline">{t("account.savedProducts.addToCart", "Add to cart")}</span>
                  <span className="sm:hidden">{t("account.savedProducts.addToCart", "Cart")}</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleRemove(favourites[idx])}
                  className={`inline-flex items-center justify-center gap-2 rounded-xl border px-4 py-2 text-sm font-medium transition ${destructiveButton} min-w-[100px]`}
                >
                  <FiHeart className="h-4 w-4" />
                  <span className="hidden sm:inline">{t("account.savedProducts.remove", "Remove")}</span>
                  <span className="sm:hidden">{t("account.savedProducts.remove", "Remove")}</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

