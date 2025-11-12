// src/pages/Products.jsx
import React, { useState, useMemo } from "react";
import {
  FiSearch,
  FiArrowUp,
  FiArrowDown,
  FiHeart,
  FiShoppingCart,
  FiTag,
} from "react-icons/fi";
import { useSelector, useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { useProductsSorted } from "../hooks/useProductsSorted";
import { usePagination } from "../hooks/usePagination";
import Pager from "../admin/Pager";
import {
  pushFavourites,
  removeFavourite,
} from "../features/favorites/favoritesSlice";
import { addToCart } from "../features/cart/cartSlice";

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

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const favorites = useSelector((state) => state.favorites);
  const cart = useSelector((state) => state.cart.items);

  const {
    data: all = [],
    isLoading,
    isError,
    error,
  } = useProductsSorted({ sortBy, dir, qText: q });
  const list = useMemo(() => all, [all]);

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

  const handleToggleFavorite = (product) => {
    const exists = favorites.find((f) => f.id === product.id);
    if (exists) dispatch(removeFavourite(product.id));
    else dispatch(pushFavourites(product));
  };

  const handleAddToCart = (product) => {
    dispatch(addToCart(product));
  };

  const handleCardClick = (productId) => {
    navigate(`/products/${productId}`);
  };

  return (
    <div className="relative text-white min-h-screen font-inter">
      <div className="absolute inset-0 bg-[#658a8a] via-[#2a4435] to-[#214939]" />

      <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <header className="mb-8 rounded-2xl border border-white/30 bg-white/5 p-6 shadow-2xl backdrop-blur-lg transition hover:shadow-green-500/20">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <h1 className="text-3xl font-bold tracking-tight text-[#d7f7d0] flex items-center gap-2">
              <FiTag className="text-[#9af59d]" /> Products
            </h1>

            {/* Filters */}
            <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              <div className="relative">
                <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Search products..."
                  className="w-full rounded-xl border border-white/20 bg-[#203232]/50 py-2.5 pl-9 pr-3 text-sm text-white placeholder:text-gray-400 focus:border-[#9af59d] focus:ring-2 focus:ring-[#9af59d]/40 focus:outline-none transition"
                />
              </div>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full rounded-xl border border-white/20 bg-[#203232]/50 px-3 py-2.5 text-sm text-white shadow-sm focus:border-[#9af59d] focus:ring-2 focus:ring-[#9af59d]/40 transition"
              >
                {SORT_FIELDS.map((s) => (
                  <option key={s.value} value={s.value} className="text-black">
                    Sort: {s.label}
                  </option>
                ))}
              </select>

              <button
                onClick={() => setDir((d) => (d === "asc" ? "desc" : "asc"))}
                className="w-full rounded-xl border border-white/20 bg-[#203232]/50 px-3 py-2.5 text-sm text-white hover:bg-[#9af59d]/10 transition flex items-center justify-center gap-2"
                title={`Direction: ${dir.toUpperCase()}`}
              >
                {dir === "asc" ? <FiArrowUp /> : <FiArrowDown />}
                <span>{dir === "asc" ? "Ascending" : "Descending"}</span>
              </button>

              <select
                value={pageSize}
                onChange={(e) => setPageSize(Number(e.target.value))}
                className="w-full rounded-xl border border-white/20 bg-[#203232]/50 px-3 py-2.5 text-sm text-white focus:border-[#9af59d] focus:ring-2 focus:ring-[#9af59d]/40 transition"
              >
                {[4, 8, 12, 24].map((n) => (
                  <option key={n} value={n} className="text-black">
                    {n} / page
                  </option>
                ))}
              </select>
            </div>
          </div>
        </header>

        {/* States */}
        {isLoading && <GridSkeleton count={pageSize} />}
        {isError && (
          <div className="rounded-lg border border-red-500 bg-red-900/50 p-4 text-red-300">
            Failed to load products. {error?.message}
          </div>
        )}
        {!isLoading && !isError && list.length === 0 && (
          <div className="rounded-lg border border-white/20 bg-white/10 p-8 text-center text-white/70">
            No products found.
          </div>
        )}

        {/* Product Grid */}
        {!isLoading && !isError && list.length > 0 && (
          <>
            <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {paginatedData.map((p) => {
                const isFavorite = favorites.some((f) => f.id === p.id);
                const inCart = cart.some((i) => i.id === p.id);

                return (
                  <li
                    key={p.id}
                    className="group cursor-pointer overflow-hidden rounded-2xl bg-[#244036]/20 border border-[#9af59d]/10 shadow-lg hover:shadow-[#9af59d]/30 transition duration-300"
                    onClick={() => handleCardClick(p.id)}
                  >
                    {p.thumbnailUrl ? (
                      <img
                        src={p.thumbnailUrl}
                        alt={p.title}
                        className="h-90 w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    ) : (
                      <div className="grid h-60 w-full place-items-center bg-white/5 text-xs text-white/50">
                        No Image
                      </div>
                    )}

                    <div className="p-5 flex flex-col justify-between min-h-[180px]">
                      <div>
                        <h3 className="line-clamp-1 text-lg font-semibold text-[#e6ffe2]">
                          {p.title}
                        </h3>
                        <p className="mt-2 line-clamp-1 text-sm text-[#9af59d] font-medium">
                          {p.category}
                        </p>
                      </div>

                      <div className="mt-3 flex items-center justify-between">
                        <span className="text-base font-medium text-[#f5fff3]">
                          {Number(p.price || 0).toLocaleString()}{" "}
                          <span className="text-[#9af59d]/70">EGP</span>
                        </span>
                      </div>

                      {/* Buttons */}
                      <div className="mt-4 flex items-center gap-3">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggleFavorite(p);
                          }}
                          className="flex h-10 w-10 items-center justify-center rounded-full border border-[#9af59d]/20 bg-white/5 text-white hover:text-red-500 transition"
                        >
                          <FiHeart
                            size={20}
                            className={isFavorite ? "text-red-500" : ""}
                          />
                        </button>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAddToCart(p);
                          }}
                          disabled={inCart}
                          className={`flex-1 h-10 rounded-xl border border-[#9af59d]/20 bg-[#203232]/60 px-4 text-sm font-semibold text-white transition hover:bg-[#9af59d]/20 ${
                            inCart
                              ? "bg-gray-500 border-gray-500 cursor-not-allowed text-white"
                              : ""
                          }`}
                        >
                          <div className="flex items-center justify-center gap-2">
                            <FiShoppingCart size={18} />
                            {inCart ? "In Cart" : "Add to Cart"}
                          </div>
                        </button>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>

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
          </>
        )}
      </div>
    </div>
  );
}

function GridSkeleton({ count = 6 }) {
  return (
    <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <li
          key={i}
          className="h-72 animate-pulse rounded-xl bg-[#244036]/40 backdrop-blur"
        />
      ))}
    </ul>
  );
}
