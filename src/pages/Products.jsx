// src/pages/Products.jsx
import React, { useState, useMemo, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { BsArrowUp, BsArrowDown } from "react-icons/bs";
import Footer from "../Authcomponents/Footer";
import { UseTheme } from "../theme/ThemeProvider";
import { useProductsSorted } from "../hooks/useProductsSorted";
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
  const isDark = theme === "dark";
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "ar";
  const navigate = useNavigate();

  // PAGINATION
  const ITEMS_PER_PAGE = 6;
  const [page, setPage] = useState(1);

  useEffect(() => {
    setCategoryFilter(categoryId || "all");
    setPage(1);
  }, [categoryId]);

  const { data: categories = [] } = useCategoriesSorted({ dir: "asc" });

  const {
    data: all = [],
    isLoading,
    isError,
    error,
  } = useProductsSorted({ sortBy, dir, qText: q });

  // FILTERING + SEARCH
  const filteredList = useMemo(() => {
    let list = all;

    if (categoryFilter !== "all") {
      list = list.filter((p) => p.categoryId === categoryFilter);
    }

    if (q.trim()) {
      list = list.filter((p) =>
        (p.name || p.title || "")
          .toLowerCase()
          .includes(q.toLowerCase())
      );
    }

    return list;
  }, [all, q, categoryFilter]);

  // PAGINATION
  const totalPages = Math.max(1, Math.ceil(filteredList.length / ITEMS_PER_PAGE));
  const paginatedProducts = filteredList.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE
  );

  return (
    <div
      dir={isRTL ? "rtl" : "ltr"}
      className={`
        min-h-screen flex flex-col
        ${isDark ? "bg-[#0c1614] text-white" : "bg-gray-50 text-slate-900"}
      `}
    >
      {/* ===== PAGE WRAPPER ===== */}
      <div className="flex-1 mx-auto max-w-7xl w-full px-4 md:px-0 pb-20 pt-10">

        {/* ===== HEADER CARD ===== */}
        <div
          className={`
            rounded-2xl shadow-xl border mb-10
            ${isDark 
              ? "bg-[#0f1a1a]/80 border-white/10 backdrop-blur-xl" 
              : "bg-white border-gray-200"
            }
          `}
        >
          <div className="px-6 py-6 border-b border-white/10">
            <h1
              className={`
                text-4xl md:text-5xl font-extrabold bg-clip-text text-transparent
                ${isDark
                  ? "bg-gradient-to-r from-teal-300 via-emerald-300 to-lime-300"
                  : "bg-gradient-to-r from-emerald-600 via-green-500 to-teal-500"
                }
              `}
            >
              {t("products.title", "Products")}
            </h1>
          </div>

          {/* ===== FILTERS ===== */}
          <div className="px-6 py-6 grid grid-cols-1 md:grid-cols-4 gap-4">

            {/* Search */}
            <input
              value={q}
              onChange={(e) => {
                setQ(e.target.value);
                setPage(1);
              }}
              placeholder={t("products.search", "Search products...")}
              className={`
                md:col-span-2 w-full rounded-lg px-4 py-3 text-sm shadow-sm
                ${isDark
                  ? "bg-white/10 border-white/20 text-white placeholder-white/60"
                  : "bg-white border border-gray-200"}
              `}
            />

            {/* Category */}
            <select
              value={categoryFilter}
              onChange={(e) => {
                setCategoryFilter(e.target.value);
                setPage(1);
              }}
              className={`
                rounded-lg px-3 py-3 text-sm shadow-sm
                ${isDark
                  ? "bg-white/10 border-white/20 text-white"
                  : "bg-white border border-gray-200"}
              `}
            >
              <option value="all">{t("products.allCategories")}</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>

            {/* Sort */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setDir((prev) => (prev === "asc" ? "desc" : "asc"))}
                className={`
                  px-3 py-3 rounded-lg shadow-sm
                  ${isDark
                    ? "bg-white/10 border-white/20 text-white"
                    : "bg-white border border-gray-200"}
                `}
              >
                {dir === "asc" ? <BsArrowUp /> : <BsArrowDown />}
              </button>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className={`
                  rounded-lg px-3 py-3 text-sm shadow-sm
                  ${isDark
                    ? "bg-white/10 border-white/20 text-white"
                    : "bg-white border border-gray-200"}
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

        {/* ===== PRODUCT GRID ===== */}
        <div className="mt-4">
          <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
            {paginatedProducts.map((p, index) => (
              <li key={p.id}>
                <ProductCard product={p} index={index} />
              </li>
            ))}
          </ul>

          {/* ===== PAGINATION ===== */}
          {filteredList.length > 0 && (
            <div className="flex items-center justify-center gap-4 mt-10">
              <button
                disabled={page === 1}
                onClick={() => setPage((p) => p - 1)}
                className="px-5 py-2 rounded-xl bg-emerald-600 text-white disabled:bg-emerald-600/40"
              >
                {t("pagination.prev")}
              </button>

              <span
                className={`
                  px-4 py-2 rounded-xl border
                  ${isDark ? "bg-slate-800 border-slate-700" : "bg-white border-gray-200"}
                `}
              >
                {page} / {totalPages}
              </span>

              <button
                disabled={page === totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="px-5 py-2 rounded-xl bg-emerald-600 text-white disabled:bg-emerald-600/40"
              >
                {t("pagination.next")}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ===== FOOTER ===== */}
      <Footer />
    </div>
  );
}
