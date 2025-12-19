// src/pages/Products.jsx
import React, { useState, useMemo, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { BsArrowUp, BsArrowDown } from "react-icons/bs";
import Footer from "../Authcomponents/Footer";
import { useProductsSorted } from "../hooks/useProductsSorted";
import { useCategoriesSorted } from "../hooks/useCategoriesSorted";
import ProductCard from "../components/cards/ProductCard";
import Section from "../components/ui/Section";
import EmptyState from "../components/ui/EmptyState";
import Button from "../components/ui/Button";
import { UseTheme } from "../theme/ThemeProvider";

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
  const { i18n } = useTranslation();
  const isRTL = i18n.language === "ar";

  const { theme } = UseTheme();
  const isDark = theme === "dark";
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

  const filteredList = useMemo(() => {
    let list = all;
    if (categoryFilter !== "all") list = list.filter((p) => p.categoryId === categoryFilter);
    if (q.trim()) {
      list = list.filter((p) =>
        (p.name || p.title || "").toLowerCase().includes(q.toLowerCase())
      );
    }
    return list;
  }, [all, q, categoryFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredList.length / ITEMS_PER_PAGE));
  const paginatedProducts = filteredList.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE
  );

  return (
    <div
      dir={isRTL ? "rtl" : "ltr"}
      className="min-h-screen flex flex-col bg-[var(--color-bg)] text-[var(--color-text)]"
    >
      <div className="flex-1 mx-auto max-w-7xl w-full px-4 pb-16 pt-10 space-y-6">
        <Section
          title={i18n.t("products.title", "Products")}
          subtitle={i18n.t("products.subtitle", "Browse, filter, and find what you need quickly.")}
          className="shadow-[var(--shadow-sm)]"
        >
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <input
              value={q}
              onChange={(e) => {
                setQ(e.target.value);
                setPage(1);
              }}
              placeholder={i18n.t("products.search", "Search products...")}
              className="md:col-span-2 w-full rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface-muted)] px-4 py-3 text-sm text-[var(--color-text)] placeholder:text-[var(--color-text-muted)]"
            />

            <select
              value={categoryFilter}
              onChange={(e) => {
                setCategoryFilter(e.target.value);
                setPage(1);
              }}
              className="rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface-muted)] px-3 py-3 text-sm text-[var(--color-text)]"
            >
              <option value="all">{i18n.t("products.allCategories")}</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setDir((prev) => (prev === "asc" ? "desc" : "asc"))}
                className="px-3 py-3 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface-muted)] text-[var(--color-text)]"
              >
                {dir === "asc" ? <BsArrowUp /> : <BsArrowDown />}
              </button>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="flex-1 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface-muted)] px-3 py-3 text-sm text-[var(--color-text)]"
              >
                {SORT_FIELDS.map((f) => (
                  <option key={f.value} value={f.value}>
                    {i18n.t(`products.sort.${f.value}`, f.label)}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </Section>

        {isError && (
          <div className="text-center text-[var(--color-danger)] mb-4">
            {error?.message || "Failed to load products."}
          </div>
        )}

        {isLoading ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-4"
              >
                <div className="h-4 w-24 bg-[var(--color-border)]/70 animate-pulse rounded mb-3" />
                <div className="h-5 w-3/4 bg-[var(--color-border)]/70 animate-pulse rounded mb-2" />
                <div className="h-4 w-1/2 bg-[var(--color-border)]/70 animate-pulse rounded" />
              </div>
            ))}
          </div>
        ) : !isLoading && paginatedProducts.length === 0 ? (
          <EmptyState
            title={i18n.t("products.empty", "No products found")}
            message={i18n.t("products.emptyHint", "Try adjusting filters or search text.")}
            action={
              <Button onClick={() => navigate("/")} size="md">
                {i18n.t("products.backHome", "Back to home")}
              </Button>
            }
          />
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {paginatedProducts.map((product, idx) => (
              <ProductCard key={product.id} product={product} index={idx} />
            ))}
          </div>
        )}

        <div className="flex items-center justify-center gap-3">
          <Button
            size="sm"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className={page === 1 ? "opacity-60 cursor-not-allowed" : ""}
          >
            {i18n.t("products.prev", "Previous")}
          </Button>
          <span className="text-sm text-[var(--color-text-muted)]">
            {i18n.t("products.page", "Page")} {page} / {totalPages}
          </span>
          <Button
            size="sm"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className={page === totalPages ? "opacity-60 cursor-not-allowed" : ""}
          >
            {i18n.t("products.next", "Next")}
          </Button>
        </div>
      </div>

      <Footer />
    </div>
  );
}
