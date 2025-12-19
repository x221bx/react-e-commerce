// src/pages/Favorites.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { FiTrash2, FiArrowLeft, FiShoppingCart, FiHeart } from "react-icons/fi";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { collection, getDocs, query, where, documentId } from "firebase/firestore";
import { db } from "../services/firebase";
import {
  removeFavourite,
  clearFavourites,
} from "../features/favorites/favoritesSlice";
import { addToCart } from "../features/cart/cartSlice";
import Footer from "../Authcomponents/Footer";
import { ensureProductLocalization, getLocalizedProductTitle } from "../utils/productLocalization";
import Card from "../components/ui/Card";
import EmptyState from "../components/ui/EmptyState";
import Button from "../components/ui/Button";

export default function Favorites() {
  const { t, i18n } = useTranslation();
  const lang = i18n.language || "en";
  const isRTL = i18n.language === "ar";

  const favorites = useSelector((state) => state.favorites.items ?? []);
  const cart = useSelector((state) => state.cart.items ?? []);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [latestProducts, setLatestProducts] = useState({});

  const normalizedFavorites = useMemo(
    () => favorites.map((f) => ensureProductLocalization(f)),
    [favorites]
  );

  const cartItemIds = useMemo(() => new Set(cart.map((item) => item.id)), [cart]);

  const isUnavailable = (item) => {
    const live = latestProducts[item.id] || {};
    const stock = Number(live.stock ?? live.quantity ?? item.stock ?? item.quantity ?? 0);
    const availableFlag = live.isAvailable ?? item.isAvailable;
    return availableFlag === false || stock <= 0;
  };

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
      toast.error(t("favorites.unavailable", "This product is unavailable right now."));
      return;
    }
    if (!cartItemIds.has(item.id)) {
      dispatch(addToCart(ensureProductLocalization({ ...item })));
    }
  };

  const handleRemoveFromFavorites = (item) => {
    dispatch(removeFavourite(ensureProductLocalization({ ...item })));
  };

  return (
    <div dir={isRTL ? "rtl" : "ltr"} className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)]">
      <div className="mx-auto max-w-6xl px-4 py-10 space-y-8">
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[var(--color-accent)]/10 text-[var(--color-accent)]">
              <FiHeart />
            </div>
            <div>
              <h1 className="text-3xl font-bold">{t("favorites.title", "My Favorites")}</h1>
              <p className="text-[var(--color-text-muted)] text-sm mt-1">
                {t("favorites.subtitle", "Keep track of the products you love and add them to your cart anytime.")}
              </p>
            </div>
          </div>
          {normalizedFavorites.length > 0 && (
            <Button
              size="md"
              onClick={() => dispatch(clearFavourites())}
              className="bg-[var(--color-danger)] hover:brightness-95 text-white px-5"
            >
              {t("favorites.clearAll", "Clear All")}
            </Button>
          )}
        </div>

        {/* Content */}
        {normalizedFavorites.length === 0 ? (
          <EmptyState
            title={t("favorites.emptyTitle", "No favorites yet.")}
            message={t("favorites.emptySubtitle", "Explore products and tap the heart to save them here.")}
            action={
              <Link to="/products">
                <Button size="md" className="px-6">
                  <FiArrowLeft /> {t("favorites.exploreProducts", "Explore products")}
                </Button>
              </Link>
            }
          />
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {normalizedFavorites.map((item) => {
              const latest = latestProducts[item.id] || item;
              const title = getLocalizedProductTitle(latest, lang);
              const price = Number(latest.price ?? 0).toFixed(2);
              const unavailable = isUnavailable(latest);

              return (
                <Card key={item.id} className="relative overflow-hidden">
                  <div className="flex items-start justify-between gap-3 p-4 pb-2">
                    <div className="min-w-0">
                      <p className="text-[11px] uppercase tracking-wide text-[var(--color-accent)] font-semibold">
                        {latest.category || t("favorites.category", "Favorite")}
                      </p>
                      <h3 className="text-lg font-semibold text-[var(--color-text)] truncate">
                        {title}
                      </h3>
                    </div>
                    <button
                      onClick={() => handleRemoveFromFavorites(item)}
                      className="rounded-full p-2 text-[var(--color-danger)] hover:bg-[var(--color-surface-muted)] transition"
                    >
                      <FiTrash2 />
                    </button>
                  </div>

                  <div className="px-4 flex items-center justify-between text-sm text-[var(--color-text-muted)]">
                    <span className="text-lg font-semibold text-[var(--color-accent)]">
                      {price} {latest.currency || "EGP"}
                    </span>
                    {unavailable && (
                      <span className="text-xs font-semibold text-[var(--color-warning)]">
                        {t("favorites.unavailable", "Unavailable")}
                      </span>
                    )}
                  </div>

                  <div className="p-4 flex flex-wrap items-center gap-3">
                    <Button
                      size="sm"
                      className="flex-1 bg-[var(--color-surface-muted)] text-[var(--color-text)] hover:brightness-95"
                      onClick={() => navigate(`/product/${item.id}`)}
                    >
                      {t("favorites.viewDetails", "View details")}
                    </Button>
                    <Button
                      size="sm"
                      disabled={unavailable}
                      className={`flex items-center gap-2 ${unavailable ? "opacity-50 cursor-not-allowed" : ""}`}
                      onClick={() => handleAddToCart(latest)}
                    >
                      <FiShoppingCart /> {t("favorites.addToCart", "Add to cart")}
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
