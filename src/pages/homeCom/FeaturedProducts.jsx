// src/pages/homeCom/FeaturedProducts.jsx
import React from "react";
import ProductCard from "../../components/cards/ProductCard";
import { useProductsSorted } from "../../hooks/useProductsSorted";
import { useTranslation } from "react-i18next";

export default function FeaturedProducts() {
  const { t } = useTranslation();
  const { data = [], isLoading, isError, error } = useProductsSorted({
    sortBy: "createdAt",
    dir: "desc",
    qText: "",
    status: "available",
  });

  // ⛔ لا تعمل map هنا عشان متكسرش الـid
  // ⭕ استخدم أول 4 منتجات كما هي
  const featured = data.slice(0, 4);

  if (isLoading) {
    return (
      <section className="mt-16">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">{t("home.featuredProducts")}</h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-64 rounded-xl bg-gray-100 animate-pulse" />
          ))}
        </div>
      </section>
    );
  }

  if (isError) {
    return (
      <section className="mt-16">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">{t("home.featuredProducts")}</h2>
        </div>
        <div className="rounded-lg border border-rose-200 bg-rose-50 p-4 text-rose-700">
          Failed to load products: {String(error?.message || "Unknown error")}
        </div>
      </section>
    );
  }

  return (
    <section className="mt-16">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">{t("home.featuredProducts")}</h2>

        <button className="text-primary hover:text-primary/80 font-medium transition">
          {t("home.viewAll")}
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
        {featured.map((p, i) => (
          <ProductCard key={p.id} product={p} index={i} />
        ))}
      </div>
    </section>
  );
}
