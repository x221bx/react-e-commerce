// src/pages/Products.jsx
import React, { useState, useMemo } from "react";
import { FiSearch, FiArrowUp, FiArrowDown, FiTag } from "react-icons/fi";
import { useTranslation } from "react-i18next";
import { useProductsSorted } from "../hooks/useProductsSorted";
import { useCategoriesSorted } from "../hooks/useCategoriesSorted";
import { usePagination } from "../hooks/usePagination";
import Pager from "../admin/Pager";
import { getFallbackProducts } from "../data/products";
import ProductCard from "../components/cards/ProductCard";
import Footer from "../components/layout/Footer";
import { UseTheme } from "../theme/ThemeProvider";

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
  const [category, setCategory] = useState("");

  const { theme } = UseTheme();
  const { t } = useTranslation();

  const { data: categories = [] } = useCategoriesSorted({});

  const {
    data: all = [],
    isLoading,
    isError,
  } = useProductsSorted({ sortBy, dir, qText: q, category });

  const fallback = useMemo(() => getFallbackProducts(), []);

  const usingFallback = isError || all.length === 0;
  const list = usingFallback ? fallback : all;

  const {
    paginatedData,
    currentPage,
    totalPages,
    setPage,
    nextPage,
    prevPage,
  } = usePagination(list, pageSize);

  const isDark = theme === "dark";

  return (
    <div className={`min-h-screen flex flex-col bg-surface text-[var(--text-main)]`}>

      {/* HEADER */}
      <header className={`mb-6 p-4 md:p-6 rounded-xl header-surface max-w-6xl mx-auto w-full mt-6`}>
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-5">
            <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
            <FiTag className="brand-primary" />
            {t("products.title", "Products")}
          </h1>

          {/* FILTERS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3 w-full">

            {/* Search */}
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder={t("products.search", "Search products...")}
                className={`w-full rounded-lg py-2 pl-9 pr-3 text-sm input-surface placeholder:text-[var(--text-muted)]`}
              />
            </div>

            {/* Category */}
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className={`w-full rounded-lg px-3 py-2 text-sm input-surface`}
            >
              <option value="">{t("products.allCategories", "All Categories")}</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.title || cat.name} className="text-black">
                  {cat.title || cat.name}
                </option>
              ))}
            </select>

            {/* Sort by */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className={`w-full rounded-lg px-3 py-2 text-sm input-surface`}
            >
              {SORT_FIELDS.map((s) => (
                <option key={s.value} value={s.value} className="text-black">
                  {s.label}
                </option>
              ))}
            </select>

            {/* Direction */}
            <button
              onClick={() => setDir(dir === "asc" ? "desc" : "asc")}
              className={`w-full rounded-lg px-3 py-2 text-sm flex items-center justify-center gap-2 input-surface`}
            >
              {dir === "asc" ? <FiArrowUp /> : <FiArrowDown />}
              {dir === "asc" ? "ASC" : "DESC"}
            </button>

            {/* Page size */}
            <select
              value={pageSize}
              onChange={(e) => setPageSize(Number(e.target.value))}
              className={`w-full rounded-lg px-3 py-2 text-sm input-surface`}
            >
              {[4, 6, 9, 12].map((n) => (
                <option key={n} value={n} className="text-black">
                  {n} / page
                </option>
              ))}
            </select>
          </div>
        </div>
      </header>

      {/* PRODUCT GRID */}
      <main className="flex-grow max-w-6xl w-full mx-auto pb-10">
        {!isLoading && list.length > 0 && (
          <>
            <ul className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {paginatedData.map((p, i) => (
                <ProductCard key={p.id} product={p} index={i} />
              ))}
            </ul>

            <div className="mt-8">
              <Pager
                currentPage={currentPage}
                totalPages={totalPages}
                onPrev={prevPage}
                onNext={nextPage}
                onGo={setPage}
              />
            </div>
          </>
        )}

        {list.length === 0 && (
          <div className="text-center mt-10 opacity-60 text-sm">
            {t("products.noResults", "No products found.")}
          </div>
        )}
      </main>

      {/* FOOTER */}
      <Footer />
    </div>
  );
}
