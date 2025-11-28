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
import { toggleFavourite } from "../features/favorites/favoritesSlice";
import { addToCart } from "../features/cart/cartSlice";
import { getFallbackProducts } from "../data/products";

const SORT_FIELDS = [
  { value: "createdAt", label: "Newest" },
  { value: "price", label: "Price" },
  { value: "title", label: "Alphabetical" },
];

export default function Products() {
  const [q, setQ] = useState("");
  const [sortBy, setSortBy] = useState("createdAt");
  const [dir, setDir] = useState("desc");
  const [pageSize, setPageSize] = useState(6);

  const { t } = useTranslation();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const favorites = useSelector(
    (state) => state.favorites?.items ?? state.favorites ?? []
  );
  const favoriteIds = useMemo(
    () => new Set(favorites.map((item) => item?.id).filter(Boolean)),
    [favorites]
  );

  const {
    data: all = [],
    isLoading,
    isError,
    error,
  } = useProductsSorted({ sortBy, dir, qText: q });
  const fallbackCatalog = useMemo(() => getFallbackProducts(), []);
  const usingFallback = useMemo(() => {
    if (isLoading) return false;
    if (isError) return true;
    return all.length === 0;
  }, [all.length, isError, isLoading]);

  const filteredFallback = useMemo(() => {
    if (!usingFallback) return [];
    const term = q.trim().toLowerCase();
    const filtered = fallbackCatalog.filter((p) => {
      if (!term) return true;
      const haystack = `${p.title} ${p.category} ${p.description || ""} ${
        p.keywords?.join(" ") || ""
      }`.toLowerCase();
      return haystack.includes(term);
    });
    return [...filtered].sort((a, b) => {
      if (sortBy === "price")
        return dir === "asc" ? a.price - b.price : b.price - a.price;
      if (sortBy === "title")
        return dir === "asc"
          ? a.title.localeCompare(b.title)
          : b.title.localeCompare(a.title);
      return dir === "asc"
        ? a.createdAt - b.createdAt
        : b.createdAt - a.createdAt;
    });
  }, [dir, fallbackCatalog, q, sortBy, usingFallback]);

  const list = useMemo(
    () => (usingFallback ? filteredFallback : all),
    [all, filteredFallback, usingFallback]
  );

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

  const handleToggleFavorite = (product) => dispatch(toggleFavourite(product));
  const handleAddToCart = (product) => dispatch(addToCart(product));
  const handleCardClick = (productId) => navigate(`/products/${productId}`);

  return (
    <div className="relative min-h-screen bg-gradient-to-b from-[#3a5a4f]/40 to-[#1f3327] font-inter text-white">
      <div className="mx-auto max-w-7xl px-4 py-10">
        {/* Header */}
        <header className="mb-8 rounded-2xl bg-white/10 backdrop-blur-md p-6 shadow-lg border border-white/20">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-6">
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <BsTag className="text-green-300" />{" "}
              {t("products.title", "Products")}
            </h1>

            {/* Filters */}
            <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4">
              <div className="relative">
                <input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder={t("products.search", "Search products...")}
                  className="w-full rounded-xl border border-white/20 bg-[#203232]/50 py-2.5 pl-10 pr-3 text-sm text-white placeholder:text-gray-400 focus:ring-1 focus:ring-green-400"
                />
                <BsTag className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              </div>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full rounded-xl border border-white/20 bg-[#203232]/50 px-3 py-2.5 text-sm text-white"
              >
                {SORT_FIELDS.map((s) => (
                  <option key={s.value} value={s.value} className="text-black">
                    {t("products.sortLabel", "Sort")}:{" "}
                    {t(`products.sort.${s.value}`, s.label)}
                  </option>
                ))}
              </select>

              <button
                onClick={() => setDir((d) => (d === "asc" ? "desc" : "asc"))}
                className="w-full rounded-xl border border-white/20 bg-[#203232]/50 px-3 py-2.5 flex items-center justify-center gap-2 text-sm font-medium hover:bg-green-500/20 transition"
              >
                {dir === "asc" ? <BsArrowUp /> : <BsArrowDown />}
                <span>
                  {dir === "asc"
                    ? t("products.asc", "Ascending")
                    : t("products.desc", "Descending")}
                </span>
              </button>

              <select
                value={pageSize}
                onChange={(e) => setPageSize(Number(e.target.value))}
                className="w-full rounded-xl border border-white/20 bg-[#203232]/50 px-3 py-2.5 text-sm text-white"
              >
                {[4, 8, 12, 24].map((n) => (
                  <option key={n} value={n} className="text-black">
                    {n} {t("products.perPage", "/ page")}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </header>

        {/* States */}
        {isLoading && <GridSkeleton count={pageSize} />}
        {isError && !usingFallback && (
          <div className="rounded-lg border border-red-500 bg-red-900/50 p-4 text-red-300">
            {t("products.error", "Failed to load products.")} {error?.message}
          </div>
        )}
        {usingFallback && (
          <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50/80 p-4 text-sm text-amber-900 shadow dark:border-amber-700 dark:bg-amber-950/30 dark:text-amber-100">
            {t(
              "products.fallback",
              "Live products are still syncing. Showing our core farm catalog until your database is ready."
            )}
          </div>
        )}
        {!isLoading && !usingFallback && !isError && list.length === 0 && (
          <div className="rounded-lg border border-white/20 bg-white/10 p-8 text-center text-white/70">
            {t("products.noResults", "No products found.")}
          </div>
        )}

        {/* Product Grid */}
        {!isLoading && list.length > 0 && (
          <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {paginatedData.map((p) => {
              const isFavorite = favoriteIds.has(p.id);
              return (
                <li
                  key={p.id}
                  className="group relative cursor-pointer overflow-hidden rounded-2xl border border-[#9af59d]/20 bg-[#244036]/20 shadow-lg hover:shadow-[#9af59d]/50 transition-all"
                  onClick={() => handleCardClick(p.id)}
                >
                  {p.thumbnailUrl ? (
                    <div className="h-72 w-full flex items-center justify-center bg-[#203232]/30 overflow-hidden rounded-t-2xl">
                      <img
                        src={p.thumbnailUrl}
                        alt={p.title}
                        className="max-h-full max-w-full object-contain transition-transform group-hover:scale-105"
                      />
                    </div>
                  ) : (
                    <div className="grid h-72 w-full place-items-center bg-white/5 text-xs text-white/50">
                      {t("products.noImage", "No image")}
                    </div>
                  )}

                  <div className="p-5 flex flex-col justify-between min-h-[180px]">
                    <div>
                      <h3 className="line-clamp-1 text-lg font-semibold text-[#e6ffe2]">
                        {p.title}
                      </h3>
                      <p className="mt-2 text-sm text-[#9af59d]">
                        {p.category}
                      </p>
                    </div>

                    <div className="mt-3 flex items-center justify-between">
                      <span className="text-base font-medium text-[#f5fff3]">
                        {Number(p.price || 0).toLocaleString()}{" "}
                        <span className="text-[#9af59d]/70">EGP</span>
                      </span>
                      {p.stock !== undefined && (
                        <span className="text-xs text-gray-300">
                          {p.stock > 0 ? "In Stock" : "Out of Stock"}
                        </span>
                      )}
                    </div>

                    <div className="mt-4 flex items-center gap-3">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleFavorite(p);
                        }}
                        className="flex h-10 w-10 items-center justify-center rounded-full border border-[#9af59d]/20 bg-white/5 hover:bg-red-500/20 text-white transition"
                      >
                        {isFavorite ? (
                          <BsHeartFill className="text-red-500" />
                        ) : (
                          <BsHeart />
                        )}
                      </button>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAddToCart(p);
                        }}
                        disabled={p.stock === 0}
                        className="flex-1 h-10 rounded-xl border border-[#9af59d]/20 bg-[#203232]/60 px-4 text-sm font-semibold text-white hover:bg-[#9af59d]/20 transition disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <div className="flex items-center justify-center gap-2">
                          <BsCartPlus size={18} />
                          {t("products.addToCart", "Add to Cart")}
                        </div>
                      </button>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}

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
      </div>
    </div>
  );
}

function GridSkeleton({ count = 6 }) {
  return (
    <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <li
          key={i}
          className="h-72 animate-pulse rounded-2xl bg-[#244036]/40 backdrop-blur"
        />
      ))}
    </ul>
  );
}
