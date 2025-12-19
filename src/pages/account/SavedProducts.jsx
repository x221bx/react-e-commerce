// src/pages/account/SavedProducts.jsx
import { useMemo, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { FiHeart, FiShoppingCart, FiExternalLink, FiImage, FiTrash2 } from "react-icons/fi";

import { toggleFavourite } from "../../features/favorites/favoritesSlice";
import { addToCart } from "../../features/cart/cartSlice";
import EmptyState from "../../components/ui/EmptyState";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";

const currency = new Intl.NumberFormat("ar-EG", {
  style: "currency",
  currency: "EGP",
});

const OptimizedImage = ({ src, alt }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  if (hasError || !src) {
    return (
      <div className="flex h-full w-full items-center justify-center rounded-[var(--radius-md)] bg-[var(--color-surface-muted)] text-[var(--color-text-muted)]">
        <FiImage className="h-6 w-6" />
      </div>
    );
  }
  return (
    <div className="relative h-24 w-24 overflow-hidden rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface-muted)]">
      {isLoading && <div className="absolute inset-0 animate-pulse bg-[var(--color-border)]/50" />}
      <img
        src={src}
        alt={alt}
        className={`h-full w-full object-cover transition-opacity duration-300 ${isLoading ? "opacity-0" : "opacity-100"}`}
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
  const { t } = useTranslation();

  const items = useMemo(
    () =>
      favourites.map((product) => {
        const stock = Number(product.stock ?? product.quantity ?? 0) || 0;
        const isAvailable =
          (typeof product.isAvailable === "boolean" ? product.isAvailable : true) && stock > 0;
        return {
          id: product.id,
          title: product.title || product.name || t("account.savedProducts.unnamed", "Unnamed product"),
          category: product.category || product.productType || t("account.savedProducts.general", "General"),
          stock,
          price:
            typeof product.price === "number"
              ? currency.format(product.price)
              : product.price || t("account.savedProducts.priceUnknown", "N/A"),
          isAvailable,
          thumbnail:
            product.img ||
            product.thumbnailUrl ||
            product.coverImg ||
            product.thumbnail ||
            product.images?.[0] ||
            product.photoURL ||
            "",
          original: product,
        };
      }),
    [favourites, t]
  );

  const handleRemove = (original) => dispatch(toggleFavourite({ ...original }));
  const handleAddToCart = (original) => {
    const stock = Number(original.stock ?? original.quantity ?? 0) || 0;
    const available =
      (typeof original.isAvailable === "boolean" ? original.isAvailable : true) && stock > 0;
    if (!available) return;
    dispatch(addToCart({ ...original }));
  };
  const handleViewProduct = (id) => id && navigate(`/product/${id}`);

  if (!items.length) {
    return (
      <EmptyState
        title={t("account.savedProducts.emptyTitle", "No saved products")}
        message={t("account.savedProducts.emptySubtitle", "Browse products and save your favorites to find them quickly.")}
        action={
          <Button onClick={() => navigate("/products")} size="md" className="px-5">
            {t("account.savedProducts.browse", "Browse products")}
          </Button>
        }
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2">
        <p className="text-sm font-semibold uppercase tracking-wide text-[var(--color-accent)]">
          {t("account.savedProducts.eyebrow", "Saved")}
        </p>
        <h1 className="text-2xl font-bold text-[var(--color-text)]">{t("account.savedProducts.title", "Saved Products")}</h1>
        <p className="text-sm text-[var(--color-text-muted)]">
          {t("account.savedProducts.subtitle", "Quickly add your favorites to the cart or view details.")}
        </p>
      </div>

      <div className="grid gap-4">
        {items.map((item, idx) => (
          <Card key={item.id || idx} className="p-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-4 min-w-0">
              <OptimizedImage src={item.thumbnail} alt={item.title} />
              <div className="min-w-0 space-y-1">
                <p className="text-xs uppercase tracking-wide text-[var(--color-text-muted)]">{item.category}</p>
                <h3 className="text-base font-semibold text-[var(--color-text)] truncate">{item.title}</h3>
                <div className="flex items-center gap-3 text-sm text-[var(--color-text-muted)]">
                  <span>{item.price}</span>
                  {!item.isAvailable && (
                    <span className="text-[var(--color-warning)] font-semibold">
                      {t("account.savedProducts.unavailable", "Unavailable")}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 justify-end">
              <Button
                size="sm"
                className="bg-[var(--color-surface-muted)] text-[var(--color-text)] hover:brightness-95"
                onClick={() => handleViewProduct(item.id)}
              >
                <FiExternalLink /> {t("account.savedProducts.view", "View")}
              </Button>
              <Button
                size="sm"
                disabled={!item.isAvailable}
                className={!item.isAvailable ? "opacity-60 cursor-not-allowed" : ""}
                onClick={() => handleAddToCart(item.original)}
              >
                <FiShoppingCart /> {t("account.savedProducts.addToCart", "Add to cart")}
              </Button>
              <Button
                size="sm"
                className="bg-[var(--color-surface-muted)] text-[var(--color-danger)] hover:brightness-95"
                onClick={() => handleRemove(item.original)}
              >
                <FiTrash2 /> {t("account.savedProducts.remove", "Remove")}
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
