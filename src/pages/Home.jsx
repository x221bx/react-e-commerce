import Hero from "./homeCom/hero";
import CategoriesSection from "./homeCom/CategoriesSection";
import Articles from "./homeCom/Articles";
import AiAssistant from "./homeCom/AiAssistant";
import EcoBanner from "./homeCom/EcoBanner";
import Footer from "../components/layout/footer";
import FeaturedProducts from "./homeCom/FeaturedProducts";
import { useCategoriesSorted } from "../hooks/useCategoriesSorted";
import { getFallbackArticles, localizeArticleRecord } from "../data/articles";
import useArticles from "../hooks/useArticles";
import { useTranslation } from "react-i18next";
import SimpleAnalyticsPanel from "./SimpleAnalyticsPanel";
export default function Home() {
  const { i18n } = useTranslation();
  const { data: catData = [] } = useCategoriesSorted({ dir: "desc" });
  const { articles: featuredArticles } = useArticles({ featureHome: true });

  const locale = i18n.language || "en";
  const fallbackArticles = getFallbackArticles({ locale, featureHome: true });
  const localizedFeatured = featuredArticles.map((article) =>
    localizeArticleRecord(article, locale)
  );
  const featuredSource = localizedFeatured.length
    ? localizedFeatured
    : fallbackArticles;

  const categories = catData.map((category) => ({
    id: category.id,
    title: category.name || "Category",
    note: category.note || "Browse products",
    img:
      category.img ||
      "https://dummyimage.com/300x300/eeeeee/000000&text=No+Image",
  }));

  const articles = featuredSource.map((article) => ({
    title: article.title,
    excerpt: article.summary,
    img:
      article.heroImage ||
      "https://dummyimage.com/400x300/0f172a/ffffff&text=Article",
  }));

  return (
    <main className="flex flex-col gap-12 md:gap-16 lg:gap-20">
      <div className="animate-fade-in">
        <Hero
          title="Smarter Farming Starts Here"
          subtitle="Your one-stop shop for quality products, expert resources, and AI-powered farming advice."
          bg="https://lh3.googleusercontent.com/aida-public/AB6AXuCLKxwiP-sEyN6Rrsaj0ZEikJ7tuC3i1BDZESOUybBIq9rxpKdpWBwAoodTCjWNVaMQAejA6E7MlL9jyLRyPeR6ToPxQIN0NEaK7VTyapj1liAE8OnwYii_WMHM3_uP3RbX2z_pu5eAGPqFtdI5dqUSJ0PpZeythsCjaDCt4GBFD3TOMNChq8rIrDZFZP9o0Js4D9lI2JIHBb9ZpWutDdH1xIDLxpTzpO-XReYaYDNn3sHTvGei5avHD43XCPbZ9MnexMNeNlcVztk"
        />
      </div>

      <div className="bg-gradient-to-b from-transparent to-gray-50/50 py-12 dark:to-slate-800/30">
        <div className="container mx-auto">
          <CategoriesSection header="Shop by Category" items={categories} />
        </div>
      </div>

      <section className="container mx-auto px-4">
        <FeaturedProducts />
      </section>
      <section>
        <SimpleAnalyticsPanel />
      </section>
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-stretch gap-8 lg:flex-row">
          <Articles header="Top Articles" items={articles} />
          <AiAssistant />
        </div>
      </div>

      <EcoBanner
        title="Spring Planting Sale"
        text="Get up to 20% off all seeds and fertilizers. Stock up now for a bountiful harvest!"
        bg="https://lh3.googleusercontent.com/aida-public/AB6AXuD8A3yXLwfO6ky-87JjNALS51VJCW0bPghXtMja2AcS-Hc5lGk9yLi6rqptiT0ZWriq8XbZh7113-7bon8bjXa9ILgc17YfLL2d1pSjfLQWnkMUGmbE5U_M2ne3bK9lEKk_r03TOZC0NK903XXGf2Z4zeVqPwLxMzNl_7-FISV41iS2eLPChiJ5dz4g38q1cBEMCKS3rxf5El1xu2QTkcCSszzfd7sr9SCxUZ0DH5qtTwKY-JRLBfWSUOoqAOmnmDhvQvUg-dKKxRk"
      />

      <Footer />
    </main>
  );
}
