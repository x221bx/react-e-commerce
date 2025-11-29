// src/pages/Home.jsx
import React from "react";
import Hero from "./homeCom/hero";
import CategoriesSection from "./homeCom/CategoriesSection";
import Articles from "./homeCom/Articles";
import AiAssistant from "./homeCom/AiAssistant";
import EcoBanner from "./homeCom/EcoBanner";
import Footer from "../components/layout/footer";
import FeaturedProducts from "./homeCom/FeaturedProducts";
import SimpleAnalyticsPanel from "./SimpleAnalyticsPanel";

const FALLBACK_CATEGORIES = [
  {
    id: 1,
    title: "Seeds & Plants",
    note: "High quality seeds",
    img: "https://dummyimage.com/300x300/10b981/fff&text=Seeds",
  },
  {
    id: 2,
    title: "Fertilizers",
    note: "Boost your yield",
    img: "https://dummyimage.com/300x300/3b82f6/fff&text=Fertilizers",
  },
  {
    id: 3,
    title: "Tools",
    note: "Professional equipment",
    img: "https://dummyimage.com/300x300/ef4444/fff&text=Tools",
  },
];

const FALLBACK_ARTICLES = [
  {
    title: "Best Planting Techniques 2025",
    excerpt: "Increase yield by 40%",
    img: "https://dummyimage.com/400x300/1e293b/fff&text=Tips",
  },
  {
    title: "AI in Modern Farming",
    excerpt: "The future is now",
    img: "https://dummyimage.com/400x300/0f172a/fff&text=AI",
  },
];

export default function Home() {
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
        <div className="container mx-auto px-4">
          <CategoriesSection
            header="Shop by Category"
            items={FALLBACK_CATEGORIES}
          />
        </div>
      </div>

      <section className="container mx-auto px-4">
        <FeaturedProducts />
      </section>

      <section className="container mx-auto px-4">
        <SimpleAnalyticsPanel />
      </section>

      <section className="container mx-auto px-4">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-start">
          <div className="flex-1 min-w-0">
            <Articles header="Top Articles" items={FALLBACK_ARTICLES} />
          </div>
          <div className="flex-shrink-0 w-full lg:w-96">
            <AiAssistant />
          </div>
        </div>
      </section>

      <EcoBanner
        title="Spring Planting Sale"
        text="Get up to 20% off all seeds and fertilizers. Stock up now for a bountiful harvest!"
        bg="https://lh3.googleusercontent.com/aida-public/AB6AXuD8A3yXLwfO6ky-87JjNALS51VJCW0bPghXtMja2AcS-Hc5lGk9yLi6rqptiT0ZWriq8XbZh7113-7bon8bjXa9ILgc17YfLL2d1pSjfLQWnkMUGmbE5U_M2ne3bK9lEKk_r03TOZC0NK903XXGf2Z4zeVqPwLxMzNl_7-FISV41iS2eLPChiJ5dz4g38q1cBEMCKS3rxf5El1xu2QTkcCSszzfd7sr9SCxUZ0DH5qtTwKY-JRLBfWSUOoqAOmnmDhvQvUg-dKKxRk"
      />

      <Footer />
    </main>
  );
}
