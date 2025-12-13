import { useMemo, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { FiHeart, FiShoppingCart, FiExternalLink, FiImage } from "react-icons/fi";

import { toggleFavourite } from "../../features/favorites/favoritesSlice";
import { addToCart } from "../../features/cart/cartSlice";
import { UseTheme } from "../../theme/ThemeProvider";

const currency = new Intl.NumberFormat("ar-EG", {
  style: "currency",
  currency: "EGP",
});

// Optimized Image Component
const OptimizedImage = ({ src, alt, className, onError }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  if (hasError || !src) {
    return (
      <div className={`flex h-full w-full items-center justify-center ${className}`}>
        <FiImage className="h-6 w-6 text-slate-400" />
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-100 dark:bg-slate-800 rounded-lg">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent"></div>
        </div>
      )}
      <img
        src={src}
        alt={alt}
        className={`h-full w-full object-cover transition-opacity duration-300 ${
          isLoading ? "opacity-0" : "opacity-100"
        }`}
        loading="lazy"
        onLoad={() => setIsLoading(false)}
        onError={() => setHasError(true)}
      />
    </div>
  );
};

export default function SavedProducts() {
  const favourites = useSelector((state) => state.favorites?.items || []);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { theme } = UseTheme();
  const { t } = useTranslation();
  const isDark = theme === "dark";

  const items = useMemo(
    () =>
      favourites.map((product) => ({
        id: product.id,
        title: product.title || product.name || "Unnamed product",
        category: product.category || product.productType || "General",
        stock: Number(product.stock ?? product.quantity ?? 0) || 0,
        price:
          typeof product.price === "number"
            ? currency.format(product.price)
            : product.price ||
              t("account.savedProducts.priceUnknown", "N/A"),
        isAvailable:
          (typeof product.isAvailable === "boolean"
            ? product.isAvailable
            : true) && (Number(product.stock ?? product.quantity ?? 0) || 0) > 0,
        thumbnail:
          product.img ||
          product.thumbnailUrl ||
          product.coverImg ||
          product.thumbnail ||
          product.images?.[0] ||
          product.photoURL ||
          "",
        original: product,
      })),
    [favourites]
  );

  const handleRemove = (original) => dispatch(toggleFavourite({ ...original }));
  const handleAddToCart = (original) => {
    const stock = Number(original.stock ?? original.quantity ?? 0) || 0;
    const available =
      (typeof original.isAvailable === "boolean"
        ? original.isAvailable
        : true) && stock > 0;
    if (!available) return;
    dispatch(addToCart({ ...original }));
  };
  const handleViewProduct = (id) => id && navigate(`/product/${id}`);

  const headingColor = isDark ? "text-white" : "text-slate-900";
  const muted = isDark ? "text-white/60" : "text-slate-500";

  const glassCard = isDark
    ? "bg-[#0f1a1a]/60 border-white/10 backdrop-blur-md"
    : "bg-white border-slate-200";

  const glassButton = isDark
    ? "bg-white/10 border border-white/20 text-white hover:bg-white/20"
    : "bg-white border border-slate-300 text-slate-700 hover:bg-slate-100";

  const glassRemove = isDark
    ? "border-red-300/40 text-red-300 hover:bg-red-300/20"
    : "border-red-300 text-red-600 hover:bg-red-50";

  const glassImageSurface = isDark
    ? "bg-white/5 border-white/10"
    : "bg-slate-100 border-slate-200";

  // Empty state
  if (!items.length) {
    return (
      <div
        className={`rounded-3xl p-8 text-center shadow-lg`}
      >
        <FiHeart className="mx-auto mb-3 h-10 w-10 text-emerald-400" />
        <p className={`text-xl font-bold ${headingColor}`}>
          {t("account.savedProducts.emptyTitle")}
        </p>
        <p className={`mt-2 text-sm ${muted}`}>
          {t("account.savedProducts.emptySubtitle")}
        </p>

        <button
          onClick={() => navigate("/products")}
          className="mt-4 inline-flex items-center rounded-xl bg-emerald-600 px-5 py-2 text-sm font-semibold text-white shadow hover:bg-emerald-500"
        >
          {t("account.savedProducts.browse")}
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <header>
        <p className="text-sm font-semibold uppercase tracking-wide text-emerald-400">
          {t("account.savedProducts.eyebrow")}
        </p>
        <h1 className={`text-3xl font-bold ${headingColor}`}>
          {t("account.savedProducts.title")}
        </h1>
        <p className={`text-sm ${muted}`}>
          {t("account.savedProducts.subtitle")}
        </p>
      </header>

      {/* Items */}
      <div className="grid gap-6">
        {items.map((item, idx) => (
          <div
            key={`${item.id}-${idx}`}
            className={`rounded-2xl border p-5 shadow-md transition hover:shadow-xl hover:-translate-y-1 ${glassCard}`}
          >
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              {/* Image */}
              <div
                className={`h-24 w-24 rounded-xl overflow-hidden flex-shrink-0 border ${glassImageSurface}`}
              >
                <OptimizedImage
                  src={item.thumbnail}
                  alt={item.title}
                  className="h-full w-full"
                />
              </div>

              {/* Info */}
              <div className="flex-1 space-y-1">
                <p className={`text-xs uppercase tracking-wide ${muted}`}>
                  {item.category}
                </p>
                <h3 className={`text-xl font-semibold ${headingColor}`}>
                  {item.title}
                </h3>

                <p className="text-emerald-400 font-semibold">{item.price}</p>
                <p
                  className={`text-xs ${
                    item.isAvailable ? "text-emerald-400" : "text-amber-400"
                  }`}
                >
                  {item.isAvailable
                    ? t("account.savedProducts.inStock")
                    : t("account.savedProducts.unavailable")}
                </p>
              </div>

              {/* Buttons */}
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                <button
                  onClick={() => handleViewProduct(item.id)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-2 ${glassButton}`}
                >
                  <FiExternalLink size={16} />
                  {t("account.savedProducts.view")}
                </button>

                <button
                  onClick={() => handleAddToCart(item.original)}
                  disabled={!item.isAvailable}
                  className="px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-2 bg-emerald-600 text-white hover:bg-emerald-500 disabled:opacity-40"
                >
                  <FiShoppingCart size={16} />
                  {t("account.savedProducts.addToCart")}
                </button>

                <button
                  onClick={() => handleRemove(item.original)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-2 ${glassRemove}`}
                >
                  <FiHeart size={16} />
                  {t("account.savedProducts.remove")}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
