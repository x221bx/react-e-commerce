// src/pages/Products.jsx
import React, { useState, useMemo, useRef, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  BsHeart,
  BsHeartFill,
  BsCartPlus,
  BsArrowUp,
  BsArrowDown,
} from "react-icons/bs";
import { AiOutlineHeart, AiFillHeart } from "react-icons/ai";
import { useProductsSorted } from "../hooks/useProductsSorted";
import Footer from "../Authcomponents/Footer";
import { UseTheme } from "../theme/ThemeProvider";
import { toggleFavourite } from "../features/favorites/favoritesSlice";
import { addToCart } from "../features/cart/cartSlice";
import { useCategoriesSorted } from "../hooks/useCategoriesSorted";
import ProductCard from "../components/cards/ProductCard";
const SORT_FIELDS = [
  { value: "createdAt", label: "Newest" },
  { value: "price", label: "Price" },
  { value: "title", label: "Alphabetical" },
];

export default function Products() {
  const { categoryId } = useParams();
  const [q, setQ] = useState("");
  const [sortBy, setSortBy] = useState("createdAt");
  const [dir, setDir] = useState("desc");
  const [categoryFilter, setCategoryFilter] = useState(categoryId || "all");

  const { theme } = UseTheme();
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "ar";
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const isDark = theme === "dark";

  const favorites = useSelector((state) => state.favorites?.items ?? []);
  const favoriteIds = useMemo(
    () => new Set(favorites.map((item) => item?.id).filter(Boolean)),
    [favorites]
  );

  const { data: categories = [] } = useCategoriesSorted({ dir: "asc" });

  useEffect(() => {
    setCategoryFilter(categoryId || "all");
  }, [categoryId]);

  const {
    data: all = [],
    isLoading,
    isError,
    error,
  } = useProductsSorted({ sortBy, dir, qText: q });

  const filteredList = useMemo(() => {
    if (!categoryFilter || categoryFilter === "all") return all;
    return all.filter((p) => p.categoryId === categoryFilter);
  }, [all, categoryFilter]);

  const [visibleCount, setVisibleCount] = useState(12);
  const loadMoreRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setVisibleCount((prev) => prev + 12);
        }
      },
      { threshold: 1 }
    );
    if (loadMoreRef.current) observer.observe(loadMoreRef.current);
    return () => observer.disconnect();
  }, []);

  const paginatedData = filteredList.slice(0, visibleCount);
  const hasMore = visibleCount < filteredList.length;

  const handleToggleFavorite = (product) => dispatch(toggleFavourite(product));
  const handleAddToCart = (product) => dispatch(addToCart(product));
  const handleCardClick = (productId) => navigate(`/product/${productId}`);

  return (
    <div
      dir={isRTL ? "rtl" : "ltr"}
      className={`
    min-h-screen font-sans 
    bg-gradient-to-b from-transparent to-gray-50/50 
    dark:to-slate-800/30 
    ${isDark ? "text-white" : "text-slate-900"}
  `}
    >


      <div className="mx-auto max-w-8xl flex-1">
        <div
          className={`
          rounded-2xl shadow-md border overflow-hidden
          ${isDark ? "bg-[#0f1a1a]/60 border-white/10 backdrop-blur" : "bg-white border-gray-200"}
        `}
        >
          {/* Header */}
          <div
            className={`
            px-6 py-6 border-b 
            ${isDark ? "border-white/10" : "border-gray-200"}
          `}
          >
            <h1
              className={`text-4xl lg:text-5xl font-bold bg-clip-text text-transparent
              ${isDark ? "bg-gradient-to-r from-teal-300 via-green-300 to-lime-300" :
                  "bg-gradient-to-r from-green-400 via-blue-500 to-cyan-500"}
            `}
            >
              {t("products.title", "Our Products")}
            </h1>
          </div>

          {/* Filters */}
          <div className="px-6 py-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">

              {/* Search */}
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder={t("products.search", "Search products...")}
                className={`
                  md:col-span-2 w-full rounded-lg px-4 py-3 text-sm shadow-sm
                  ${isDark ? "bg-white/10 border border-white/20 text-white placeholder-white/60" :
                    "bg-white border border-gray-200 text-slate-900"}
                `}
              />

              {/* Category Select */}
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className={`
                  rounded-lg px-3 py-3 text-sm
                  ${isDark ? "bg-white/10 border-white/20 text-white" :
                    "bg-white border border-gray-200 text-slate-900"}
                `}
              >
                <option value="all">All Categories</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>

              {/* Sort */}
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setDir((d) => (d === "asc" ? "desc" : "asc"))}
                  className={`
                    flex items-center gap-2 rounded-lg px-3 py-3 text-sm shadow-sm
                    ${isDark ? "bg-white/10 border-white/20 text-white" :
                      "bg-white border border-gray-200 text-slate-900"}
                `}
                >
                  {dir === "asc" ? <BsArrowUp /> : <BsArrowDown />}
                </button>

                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className={`
                    rounded-lg px-3 py-3 text-sm
                    ${isDark ? "bg-white/10 border-white/20 text-white" :
                      "bg-white border border-gray-200 text-slate-900"}
                `}
                >
                  {SORT_FIELDS.map((s) => (
                    <option key={s.value} value={s.value}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Loading / Errors */}
          <div className="px-6 py-4">
            {isLoading && <GridSkeleton count={12} premium />}
            {isError && (
              <div className="rounded-md border border-red-200 bg-red-50 p-4 text-red-700 text-sm">
                {t("products.error", "Failed to load products.")} {error?.message}
              </div>
            )}
            {!isLoading && !isError && filteredList.length === 0 && (
              <div
                className={`
                rounded-md p-6 text-center text-sm space-y-4
                ${isDark ? "bg-white/10 border-white/20 text-white/60" :
                    "bg-gray-50 border border-gray-100 text-slate-600"}
              `}
              >
                <p>{t("products.noProductsFound", "No products found.")}</p>
                <button
                  onClick={() => {
                    setQ("");
                    setCategoryFilter("all");
                  }}
                  className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition"
                >
                  {t("products.shopProducts", "Shop Products")}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Products Grid */}
        <main className="mt-8">
          {!isLoading && filteredList.length > 0 && (
            <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {paginatedData.map((p) => {
                const isFavorite = favoriteIds.has(p.id);
                return (
                  <li key={p.id} className="scale-[0.90] origin-top">
                    <ProductCard product={p} />
                  </li>
                );
              })}
            </ul>
          )}

          {hasMore && (
            <div
              ref={loadMoreRef}
              className={`
                py-10 text-center
                ${isDark ? "text-white/40" : "text-slate-400"}
              `}
            >
              Loading more...
            </div>
          )}
        </main>

      </div>
      {/* Footer */}
      <div className="mt-0">
        <Footer />
      </div>
    </div>
  );
}

function GridSkeleton({ count = 6, premium = false }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className={`rounded-2xl overflow-hidden ${premium ? "shadow-md" : ""}`}
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
