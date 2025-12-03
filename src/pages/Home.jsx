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
  const { data: catData = [] } = useCategoriesSorted({ dir: "desc" });
  const { articles: allFeaturedArticles } = useArticles({ featureHome: true });
  const featuredArticles = allFeaturedArticles.filter(
    (article) => article.status === "published"
  );

  const locale = i18n.language || "en";
  const localizedFeatured = featuredArticles.map((article) =>
    localizeArticleRecord(article, locale)
  );

  const categoryIds = useMemo(
    () => catData.map((category) => category.id).filter(Boolean),
    [catData]
  );
  const { data: categoryImages = {} } =
    useCategoryRepresentativeImages(categoryIds);

  const categories = catData.map((category) => {
    const productImages =
      categoryImages[category.id] || [];
    const uniqueSources = [
      ...new Set([
        ...productImages,
        ...(category.img ? [category.img] : []),
      ]),
    ].filter(Boolean);

    return {
      id: category.id,
      title: category.name || t("home.categoryFallback"),
      note: category.note || t("home.categoryNoteFallback"),
      imageSources: uniqueSources,
      onClick: () => {
        if (category.id) {
          navigate(`/category/${category.id}`);
        }
      },
    };
  });

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
    <main className="flex flex-col gap-12 md:gap-16 lg:gap-20">
      <div className="animate-fade-in">
        <Hero
          title={t("home.heroTitle")}
          subtitle={t("home.heroSubtitle")}
          bg="https://lh3.googleusercontent.com/aida-public/AB6AXuCLKxwiP-sEyN6Rrsaj0ZEikJ7tuC3i1BDZESOUybBIq9rxpKdpWBwAoodTCjWNVaMQAejA6E7MlL9jyLRyPeR6ToPxQIN0NEaK7VTyapj1liAE8OnwYii_WMHM3_uP3RbX2z_pu5eAGPqFtdI5dqUSJ0PpZeythsCjaDCt4GBFD3TOMNChq8rIrDZFZP9o0Js4D9lI2JIHBb9ZpWutDdH1xIDLxpTzpO-XReYaYDNn3sHTvGei5avHD43XCPbZ9MnexMNeNlcVztk"
        />
      </div>

      <div className="bg-gradient-to-b from-transparent to-gray-50/50 py-12 dark:to-slate-800/30">
        <div className="container mx-auto">
          <CategoriesSection
            header={t("home.shopByCategory")}
            items={categories}
          />
        </div>
      </div>

      <section className="container mx-auto px-4">
        <FeaturedProducts />
      </section>

      {articles.length > 0 && (
        <div className="container mx-auto px-4">
          <Articles header={t("home.topArticles")} items={articles} />
        </div>
      )}

      <EcoBanner
        title={t("home.ecoBannerTitle")}
        text={t("home.ecoBannerText")}
        bg="https://lh3.googleusercontent.com/aida-public/AB6AXuD8A3yXLwfO6ky-87JjNALS51VJCW0bPghXtMja2AcS-Hc5lGk9yLi6rqptiT0ZWriq8XbZh7113-7bon8bjXa9ILgc17YfLL2d1pSjfLQWnkMUGmbE5U_M2ne3bK9lEKk_r03TOZC0NK903XXGf2Z4zeVqPwLxMzNl_7-FISV41iS2eLPChiJ5dz4g38q1cBEMCKS3rxf5El1xu2QTkcCSszzfd7sr9SCxUZ0DH5qtTwKY-JRLBfWSUOoqAOmnmDhvQvUg-dKKxRk"
      />

      <Footer />
    </main>
  );
}
