// src/pages/homeCom/FeaturedProducts.jsx

import React from "react";
import { useNavigate } from "react-router-dom";
import ProductCard from "../../components/cards/ProductCard";
import { useProductsSorted } from "../../hooks/useProductsSorted";
import { useTranslation } from "react-i18next";
import { UseTheme } from "../../theme/ThemeProvider";

export default function FeaturedProducts() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { theme } = UseTheme();
  const isDark = theme === "dark";

  const { data = [], isLoading, isError, error } = useProductsSorted({
    sortBy: "createdAt",
    dir: "desc",
    qText: "",
    status: "available",
  });

  const featured = data.slice(0, 4);

  return (
    <section className="mt-16">
      <div className="flex items-center justify-between mb-6">
        <h2
          className={`text-2xl font-bold ${
            isDark ? "text-emerald-200" : "text-slate-900"
          }`}
        >
          {t("home.featuredProducts")}
        </h2>

        <button
          onClick={() => navigate("/products")}
          className={`
            font-medium transition
            ${isDark ? "text-emerald-300 hover:text-emerald-200" : "text-emerald-700 hover:text-emerald-900"}
          `}
        >
          {t("home.viewAll")}
        </button>
      </div>

      {/* Loading Skeleton */}
      {isLoading && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="
                h-64 rounded-xl animate-pulse
                bg-gray-200 dark:bg-slate-800
              "
            />
          ))}
        </div>
      )}

      {/* Error */}
      {isError && (
        <div
          className="
            rounded-lg border border-rose-200 bg-rose-50 
            p-4 text-rose-700 dark:bg-red-900/20 dark:border-red-700 dark:text-red-300
          "
        >
          {String(error?.message || "Failed to load")}
        </div>
      )}

      {/* Products */}
      {!isLoading && !isError && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
          {featured.map((p, i) => (
            <ProductCard key={p.id} product={p} index={i} />
          ))}
        </div>
      )}
    </section>
  );
}
