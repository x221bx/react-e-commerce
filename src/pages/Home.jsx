// src/pages/Home.jsx
import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import Hero from "./homeCom/hero";
import CategoriesSection from "./homeCom/CategoriesSection";
import Articles from "./homeCom/Articles";
import EcoBanner from "./homeCom/EcoBanner";
import Footer from "../Authcomponents/Footer";
import FeaturedProducts from "./homeCom/FeaturedProducts";
import { useCategoriesSorted } from "../hooks/useCategoriesSorted";
import { localizeArticleRecord } from "../data/articles";
import useArticles from "../hooks/useArticles";
import { useTranslation } from "react-i18next";
import { useCategoryRepresentativeImages } from "../hooks/useCategoryRepresentativeImages";
import { UseTheme } from "../theme/ThemeProvider";

export default function Home() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const isRTL = i18n.language === "ar";
  const { theme } = UseTheme();
  const isDark = theme === "dark";

  const { data: catData = [] } = useCategoriesSorted({ dir: "desc" });
  const { articles: allFeaturedArticles } = useArticles({ featureHome: true });

  const featuredArticles = allFeaturedArticles.filter(
    (a) => a.status === "published"
  );

  const locale = i18n.language || "en";
  const localizedFeatured = featuredArticles.map((article) =>
    localizeArticleRecord(article, locale)
  );

  const categoryIds = useMemo(
    () => catData.map((c) => c.id).filter(Boolean),
    [catData]
  );

  const { data: categoryImages = {} } =
    useCategoryRepresentativeImages(categoryIds);

  const categories = catData.map((category) => ({
    id: category.id,
    title: category.name || t("home.categoryFallback"),
    note: category.note || t("home.categoryNoteFallback"),
    imageSources: [
      ...(categoryImages[category.id] || []),
      ...(category.img ? [category.img] : []),
    ],
    onClick: () => navigate(`/category/${category.id}`),
  }));

  const articles = localizedFeatured.map((article) => ({
    title: article.title,
    excerpt: article.summary,
    img:
      article.heroImage ||
      `https://dummyimage.com/400x300/0f172a/ffffff&text=${t(
        "home.articleFallback"
      )}`,
  }));

  return (
    <main
      dir={isRTL ? "rtl" : "ltr"}
      className={`
        min-h-screen flex flex-col transition-colors duration-500
        ${
          isDark
            ? "bg-[#02130f] bg-gradient-to-b from-[#02130f] via-[#022519] to-[#033624] text-slate-100"
            : "bg-white text-slate-900"
        }
      `}
    >
      {/* ===================== HERO VIDEO SECTION ===================== */}
      <section className="relative w-full overflow-hidden h-[450px] md:h-[520px] lg:h-[580px]">
        {/* VIDEO BG */}
        <video
          src="/VideoProject.mp4"
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover pointer-events-none"
        />

        {/* THEMED OVERLAY */}
        <div
          className={`
            absolute inset-0 pointer-events-none transition-opacity duration-500
            ${
              isDark
                ? "bg-gradient-to-b from-black/60 via-black/40 to-[#022b1b]/80"
                : "bg-gradient-to-b from-black/10 via-black/5 to-transparent"
            }
          `}
        />

        {/* CONTENT */}
        <div className="relative z-10 h-full flex items-center">
          <div className="container mx-auto px-4">
            <Hero
              title={t("home.heroTitle")}
              subtitle={t("home.heroSubtitle")}
            />
          </div>
        </div>
      </section>

      {/* ===================== MAIN CONTENT ===================== */}
      <div className="flex-1">
        {/* CATEGORIES */}
        <section className={isDark ? "py-10" : "py-12"}>
          <div className="container mx-auto px-4">
            <CategoriesSection
              header={t("home.shopByCategory")}
              items={categories}
            />
          </div>
        </section>

        {/* FEATURED PRODUCTS */}
        <section className="pb-10">
          <div className="container mx-auto px-4">
            <FeaturedProducts />
          </div>
        </section>

        {/* ARTICLES */}
        {articles.length > 0 && (
          <section className="pb-10">
            <div className="container mx-auto px-4">
              <Articles header={t("home.topArticles")} items={articles} />
            </div>
          </section>
        )}

        {/* ECO BANNER */}
        <section className="pb-14">
          <div className="container mx-auto px-4">
            <EcoBanner
              title={t("home.ecoBannerTitle")}
              text={t("home.ecoBannerText")}
            />
          </div>
        </section>
      </div>

      {/* FOOTER */}
      <Footer />
    </main>
  );
}
