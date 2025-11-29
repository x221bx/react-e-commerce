// src/pages/Products.jsx
import React, { useState, useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  BsHeart,
  BsHeartFill,
  BsCartPlus,
  BsArrowUp,
  BsArrowDown,
  BsTag,
} from "react-icons/bs";
import { useProductsSorted } from "../hooks/useProductsSorted";
import { usePagination } from "../hooks/usePagination";
import Pager from "../admin/Pager";
// Fallback data util (if you use it)
import { getFallbackProducts } from "../data/products";
// Footer component
import Footer from "../components/layout/Footer";
// Theme hook (optional)
import { UseTheme } from "../theme/ThemeProvider";

// ACTIONS - عدّل المسار لو أفعالك في مكان ثاني
import { toggleFavourite } from "../features/favorites/favoritesSlice";
import { addToCart } from "../features/cart/cartSlice";

const SORT_FIELDS = [
  { value: "createdAt", label: "Newest" },
  { value: "price", label: "Price" },
  { value: "title", label: "Alphabetical" },
];

export default function Products() {
  // UI state
  const [q, setQ] = useState("");
  const [sortBy, setSortBy] = useState("createdAt");
  const [dir, setDir] = useState("desc");
  const [pageSize, setPageSize] = useState(12);

  const { theme } = UseTheme();
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const favorites = useSelector((state) => state.favorites?.items ?? []);
  const favoriteIds = useMemo(
    () => new Set(favorites.map((item) => item?.id).filter(Boolean)),
    [favorites]
  );

  // Products hook: should return `data`, `isLoading`, `isError`, optionally `error`
  const {
    data: all = [],
    isLoading,
    isError,
    error,
  } = useProductsSorted({ sortBy, dir, qText: q });

  // Fallback catalog when live DB empty / failing
  const fallbackCatalog = useMemo(() => getFallbackProducts(), []);
  const usingFallback = useMemo(() => {
    if (isLoading) return false;
    if (isError) return true;
    return all.length === 0;
  }, [isLoading, isError, all.length]);

  const filteredFallback = useMemo(() => {
    if (!usingFallback) return [];
    const term = q.trim().toLowerCase();
    const filtered = fallbackCatalog.filter((p) => {
      if (!term) return true;
      const hay = `${p.title} ${p.category} ${p.description || ""} ${
        p.keywords?.join(" ") || ""
      }`.toLowerCase();
      return hay.includes(term);
    });

    return [...filtered].sort((a, b) => {
      if (sortBy === "price")
        return dir === "asc" ? a.price - b.price : b.price - a.price;
      if (sortBy === "title")
        return dir === "asc"
          ? a.title.localeCompare(b.title)
          : b.title.localeCompare(a.title);
      // createdAt expected as timestamp number in fallback
      return dir === "asc"
        ? a.createdAt - b.createdAt
        : b.createdAt - a.createdAt;
    });
  }, [usingFallback, fallbackCatalog, q, sortBy, dir]);

  const list = useMemo(
    () => (usingFallback ? filteredFallback : all),
    [usingFallback, filteredFallback, all]
  );

  // pagination - expecting hook returns these fields; adapt if your hook differs
  const {
    paginatedData,
    currentPage,
    totalPages,
    setPage,
    nextPage,
    prevPage,
    rangeStart,
    rangeEnd,
    totalItems,
  } = usePagination(list, pageSize);

  // dispatch helpers
  const handleToggleFavorite = (product) => dispatch(toggleFavourite(product));
  const handleAddToCart = (product) => dispatch(addToCart(product));
  const handleCardClick = (productId) => navigate(`/products/${productId}`);

  return (
    <div className="min-h-screen bg-neutral-50 text-slate-900 font-sans">
      {/* Premium header area */}
      <div className="mx-auto max-w-7xl px-6 py-12">
        <div className="rounded-2xl bg-white shadow-xl border border-gray-100 overflow-hidden">
          {/* Top strip */}
          <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="rounded-full bg-gradient-to-br from-green-500 to-teal-400 p-3 text-white shadow-md">
                <BsTag size={20} />
              </div>
              <div>
                <h1 className="text-2xl font-semibold">
                  {" "}
                  {t("products.title", "Products")}
                </h1>
                <p className="text-sm text-slate-500 mt-1">
                  {t(
                    "products.subtitle",
                    "Browse our catalog — premium selection"
                  )}
                </p>
              </div>
            </div>

            {/* actions area */}
            <div className="flex items-center gap-3">
              <div className="text-sm text-slate-500">
                {totalItems ? `${rangeStart}-${rangeEnd} of ${totalItems}` : ""}
              </div>
            </div>
          </div>

          {/* Filters row */}
          <div className="px-6 py-6 bg-white">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
              <div className="relative md:col-span-2">
                <input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder={t("products.search", "Search products...")}
                  className="w-full rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-green-300"
                />
              </div>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="rounded-lg border border-gray-200 bg-white px-3 py-3 text-sm"
              >
                {SORT_FIELDS.map((s) => (
                  <option key={s.value} value={s.value}>
                    {t("products.sortLabel", "Sort")}:{" "}
                    {t(`products.sort.${s.value}`, s.label)}
                  </option>
                ))}
              </select>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => setDir((d) => (d === "asc" ? "desc" : "asc"))}
                  className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-3 text-sm shadow-sm"
                  title={dir === "asc" ? "Ascending" : "Descending"}
                >
                  {dir === "asc" ? <BsArrowUp /> : <BsArrowDown />}
                  <span className="text-sm">
                    {dir === "asc"
                      ? t("products.asc", "Asc")
                      : t("products.desc", "Desc")}
                  </span>
                </button>

                <select
                  value={pageSize}
                  onChange={(e) => setPageSize(Number(e.target.value))}
                  className="rounded-lg border border-gray-200 bg-white px-3 py-3 text-sm"
                >
                  {[8, 12, 24, 48].map((n) => (
                    <option key={n} value={n}>
                      {n} / {t("products.perPage", "page")}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* status / messages */}
          <div className="px-6 py-4">
            {isLoading && <GridSkeleton count={pageSize} premium />}
            {isError && !usingFallback && (
              <div className="rounded-md border border-red-200 bg-red-50 p-4 text-red-700 text-sm">
                {t("products.error", "Failed to load products.")}{" "}
                {error?.message}
              </div>
            )}
            {usingFallback && (
              <div className="rounded-md border border-amber-200 bg-amber-50 p-4 text-amber-800 text-sm">
                {t(
                  "products.fallback",
                  "Live products are still syncing. Showing a fallback catalog."
                )}
              </div>
            )}
            {!isLoading && !usingFallback && !isError && list.length === 0 && (
              <div className="rounded-md border border-gray-100 bg-gray-50 p-6 text-center text-sm text-slate-600">
                {t("products.noResults", "No products found.")}
              </div>
            )}
          </div>
        </div>

        {/* Product grid */}
        <main className="mt-8">
          {!isLoading && list.length > 0 && (
            <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {paginatedData.map((p) => {
                const isFavorite = favoriteIds.has(p.id);
                return (
                  <li
                    key={p.id}
                    className="group bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden cursor-pointer hover:shadow-lg transition"
                  >
                    <div
                      className="relative h-64 w-full bg-gray-50 flex items-center justify-center"
                      onClick={() => handleCardClick(p.id)}
                    >
                      {p.thumbnailUrl ? (
                        <img
                          src={p.thumbnailUrl}
                          alt={p.title}
                          className="object-contain h-full w-full transition-transform duration-300 group-hover:scale-105"
                        />
                      ) : (
                        <div className="text-sm text-slate-400">
                          {t("products.noImage", "No image")}
                        </div>
                      )}

                      {/* price badge */}
                      <div className="absolute left-4 top-4 rounded-md bg-white/90 px-3 py-1 text-sm font-semibold text-slate-800 shadow-sm">
                        {Number(p.price || 0).toLocaleString()} EGP
                      </div>

                      {/* favorite heart */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleFavorite(p);
                        }}
                        className="absolute right-4 top-4 rounded-full bg-white/90 p-2 shadow-sm"
                        title={isFavorite ? "Remove favorite" : "Add favorite"}
                      >
                        {isFavorite ? (
                          <BsHeartFill className="text-red-500" />
                        ) : (
                          <BsHeart className="text-slate-600" />
                        )}
                      </button>
                    </div>

                    <div className="p-5">
                      <h3
                        onClick={() => handleCardClick(p.id)}
                        className="text-lg font-semibold text-slate-900 line-clamp-2 cursor-pointer"
                      >
                        {p.title}
                      </h3>
                      <p className="text-sm text-slate-500 mt-2">
                        {p.category}
                      </p>

                      <div className="mt-4 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div
                            className={`text-sm font-medium ${
                              p.stock > 0 ? "text-emerald-600" : "text-rose-500"
                            }`}
                          >
                            {p.stock > 0
                              ? t("products.inStock", "In stock")
                              : t("products.outStock", "Out of stock")}
                          </div>
                          <div className="text-sm text-slate-400">•</div>
                          <div className="text-sm text-slate-400">
                            {p.sku || ""}
                          </div>
                        </div>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAddToCart(p);
                          }}
                          disabled={p.stock === 0}
                          className="inline-flex items-center gap-2 rounded-lg bg-green-600 text-white px-3 py-2 text-sm font-semibold shadow hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <BsCartPlus />
                          <span>{t("products.addToCart", "Add to cart")}</span>
                        </button>
                      </div>

                      <div className="mt-3 text-xs text-slate-400">
                        {p.shortDescription || ""}
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}

          {/* pager */}
          {list.length > 0 && (
            <div className="mt-8">
              <Pager
                currentPage={currentPage}
                totalPages={totalPages}
                onPrev={prevPage}
                onNext={nextPage}
                onGo={setPage}
                rangeStart={rangeStart}
                rangeEnd={rangeEnd}
                totalItems={totalItems}
              />
            </div>
          )}

          {/* empty fallback */}
          {!isLoading && list.length === 0 && (
            <div className="mt-10 text-center text-sm text-slate-500">
              {t("products.noResults", "No products found.")}
            </div>
          )}
        </main>

        <div className="mt-14">
          <Footer />
        </div>
      </div>
    </div>
  );
}

/**
 * GridSkeleton - premium skeleton placeholders
 */
function GridSkeleton({ count = 6, premium = false }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className={`rounded-2xl overflow-hidden ${
            premium ? "shadow-md" : ""
          }`}
        >
          <div className="h-64 bg-gray-100 animate-pulse" />
          <div className="p-4 bg-white">
            <div className="h-4 bg-gray-100 rounded w-3/4 animate-pulse mb-2" />
            <div className="h-3 bg-gray-100 rounded w-1/2 animate-pulse" />
          </div>
        </div>
      ))}
    </div>
  );
}
