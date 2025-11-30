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
  BsTag,
} from "react-icons/bs";
import { AiOutlineHeart, AiFillHeart } from "react-icons/ai";
import { useProductsSorted } from "../hooks/useProductsSorted";
import Footer from "../components/layout/footer";
import { UseTheme } from "../theme/ThemeProvider";
import { toggleFavourite } from "../features/favorites/favoritesSlice";
import { addToCart } from "../features/cart/cartSlice";
import { useCategoriesSorted } from "../hooks/useCategoriesSorted";

const SORT_FIELDS = [
  { value: "createdAt", label: "Newest" },
  { value: "price", label: "Price" },
  { value: "title", label: "Alphabetical" },
];

export default function Products() {
  const { categoryId } = useParams(); // ID الفئة من URL
  const [q, setQ] = useState("");
  const [sortBy, setSortBy] = useState("createdAt");
  const [dir, setDir] = useState("desc");
  const [categoryFilter, setCategoryFilter] = useState(categoryId || "all");

  const { theme } = UseTheme();
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const isDark = theme === "dark";
  const favorites = useSelector((state) => state.favorites?.items ?? []);
  const favoriteIds = useMemo(
    () => new Set(favorites.map((item) => item?.id).filter(Boolean)),
    [favorites]
  );

  const { data: categories = [] } = useCategoriesSorted({ dir: "asc" });

  // تحديث الفلتر عند تغيير الـ URL
  useEffect(() => {
    setCategoryFilter(categoryId || "all");
  }, [categoryId]);



  const {
    data: all = [],
    isLoading,
    isError,
    error,
  } = useProductsSorted({ sortBy, dir, qText: q });

  // فلترة المنتجات حسب الفئة
  const filteredList = useMemo(() => {
    if (!categoryFilter || categoryFilter === "all") return all;
    return all.filter((p) => p.categoryId === categoryFilter);
  }, [all, categoryFilter]);

  // Infinite Scroll
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
    <div className="min-h-screen bg-neutral-50 text-slate-900 font-sans ">
      <div className="mx-auto max-w-8xl px-6 py-4">
        <div className="rounded-2xl bg-white shadow-md border border-gray-100 overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div>
                <h1 className="text-4xl lg:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-green-400 via-blue-500 to-cyan-500">
                  {t("products.title", " Our Products")}
                </h1>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="px-6 py-6 bg-white">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder={t("products.search", "Search products...")}
                className="md:col-span-2 w-full rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm shadow-sm"
              />

              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="rounded-lg border border-gray-200 bg-white px-3 py-3 text-sm"
              >
                <option value="all">All Categories</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => setDir((d) => (d === "asc" ? "desc" : "asc"))}
                  className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-3 text-sm shadow-sm"
                >
                  {dir === "asc" ? <BsArrowUp /> : <BsArrowDown />}
                </button>

                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="rounded-lg border border-gray-200 bg-white px-3 py-3 text-sm"
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

          <div className="px-6 py-4">
            {isLoading && <GridSkeleton count={12} premium />}
            {isError && (
              <div className="rounded-md border border-red-200 bg-red-50 p-4 text-red-700 text-sm">
                {t("products.error", "Failed to load products.")}{" "}
                {error?.message}
              </div>
            )}
            {!isLoading && !isError && filteredList.length === 0 && (
              <div className="rounded-md border border-gray-100 bg-gray-50 p-6 text-center text-sm text-slate-600">
                No products found.
              </div>
            )}
          </div>
        </div>

        <main className="mt-8">
          {!isLoading && filteredList.length > 0 && (
            <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {paginatedData.map((p) => {
                const isFavorite = favoriteIds.has(p.id);
                return (
                  <li
                    key={p.id}
                    className="group bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden cursor-pointer hover:shadow-lg transition"
                  >
                    <div
                      className="relative h-66 w-full bg-gray-50 flex items-center justify-center"
                      onClick={() => handleCardClick(p.id)}
                    >
                      {p.thumbnailUrl ? (
                        <img
                          src={p.thumbnailUrl}
                          alt={p.title}
                          className="object-contain h-full w-full transition-transform duration-300 group-hover:scale-105"
                        />
                      ) : (
                        <div className="text-sm text-slate-400">No image</div>
                      )}

                      <div className="absolute left-4 top-4 rounded-md bg-white/90 px-3 py-1 text-sm font-semibold text-slate-800 shadow-sm">
                        {Number(p.price || 0).toLocaleString()} EGP
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleFavorite(p);
                        }}
                        className={`
    absolute right-3 top-3 p-2 rounded-full 
    transition-all duration-200 ease-in-out
    ${isDark ? "bg-gray-800/80" : "bg-white/90"}
    shadow-md hover:scale-110 hover:shadow-lg
    flex items-center justify-center
  `}
                      >
                        {isFavorite ? (
                          <AiFillHeart size={22} className="text-red-500" />
                        ) : (
                          <AiOutlineHeart
                            size={22}
                            className={
                              isDark ? "text-gray-300" : "text-gray-500"
                            }
                          />
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
                        {categories.find((c) => c.id === p.categoryId)?.name ||
                          "Unknown"}
                      </p>

                      <div className="mt-4 flex items-center justify-between gap-3">
                        <div className="text-sm text-slate-400">{p.sku}</div>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAddToCart(p);
                          }}
                          disabled={p.stock === 0}
                          className="inline-flex items-center gap-2 rounded-lg bg-green-600 text-white px-3 py-2 text-sm font-semibold shadow hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <BsCartPlus />
                          <span>Add to cart</span>
                        </button>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}

          {hasMore && (
            <div ref={loadMoreRef} className="py-10 text-center text-slate-400">
              Loading more...
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
