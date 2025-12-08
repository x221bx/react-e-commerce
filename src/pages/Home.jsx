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

export default function Home() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const isRTL = i18n.language === "ar";

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
      className="
    min-h-screen flex flex-col
    bg-[#f9f9f9] text-slate-900
    dark:bg-[#021a15] dark:text-slate-100
    transition-colors duration-300
  "
>
   {/* HERO VIDEO SECTION */}
<section className="relative w-full overflow-hidden h-[450px] md:h-[520px] lg:h-[580px]">

  {/* VIDEO BACKGROUND */}
  <video
    src="/2758322-uhd_3840_2160_30fps.mp4"
    autoPlay
    loop
    muted
    playsInline
    className="absolute inset-0 w-full h-full object-cover pointer-events-none"
  />

  {/* FIXED OVERLAY — الآن يتأثر بالثيم بشكل صحيح */}
  <div className="
    absolute inset-0 pointer-events-none
    bg-gradient-to-b
    from-black/20 via-black/10 to-transparent
    dark:from-black/50 dark:via-black/40 dark:to-[#022b1b]
    transition-colors duration-300
  " />

  {/* CONTENT */}
  <div className="relative z-10 h-full flex items-center">
    <div className="container mx-auto px-4">
      <Hero
        title={t('home.heroTitle')}
        subtitle={t('home.heroSubtitle')}
      />
    </div>
  </div>
</section>



      {/* ========= MAIN CONTENT ========= */}
      <div className="flex-1">
        {/* CATEGORIES */}
        <section className="py-6 md:py-10 lg:py-12">
          <div className="container mx-auto px-4">
            <CategoriesSection
              header={t("home.shopByCategory")}
              items={categories}
            />
          </div>
        </section>

        {/* FEATURED PRODUCTS */}
        <section className="pb-6 md:pb-10 lg:pb-12">
          <div className="container mx-auto px-4">
            <FeaturedProducts />
          </div>
        </section>

        {/* ARTICLES */}
        {articles.length > 0 && (
          <section className="pb-6 md:pb-10 lg:pb-12">
            <div className="container mx-auto px-4">
              <Articles header={t("home.topArticles")} items={articles} />
            </div>
          </section>
        )}

        {/* ECO / HELP BANNER */}
        <section className="pb-10 lg:pb-14">
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
