import Navbar from '../components/layout/Navbar';
import Hero from './homeCom/hero';
import CategoriesSection from './homeCom/CategoriesSection';
import Articles from './homeCom/Articles';
import AiAssistant from './homeCom/AiAssistant';
import EcoBanner from './homeCom/EcoBanner';
import Footer from '../components/layout/footer';
import FeaturedProducts from './homeCom/FeaturedProducts';

// 👇 أهم تعديل هنا
import { useCategoriesSorted } from "../hooks/useCategoriesSorted";

export default function Home() {

  // ⭐ Load real categories from Firestore
  const { data: catData = [] } = useCategoriesSorted({ dir: "desc" });

  // ⭐ Normalize categories for CategoryCard
  const categories = catData.map((c) => ({
  id: c.id,
  title: c.name || "Category",
  note: c.note || "Browse products",
  img: c.img || "https://dummyimage.com/300x300/eeeeee/000000&text=No+Image",
}));


  const articles = [
    {
      title: '5 Ways to Improve Your Soil Health',
      excerpt: 'Learn the fundamentals of creating a nutrient-rich foundation for your crops...',
      img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCA28tLs0B_xksW-t6klMrtYJVc7ZaRbAXHPmvDSPptVHn6CtJGFD9GWBm0lTrETF3Sgeboe0zI5MvjCNo4LcUIuZDwD4SuEgskn17hpOaQTovd1vK80ETDve4qRSvYE25-4RMVxd7ek_p5v0sCnH2i4plL7bg7HicQQeqwc9S7ma0eaL1vYX6uXSP9YRUzNt3DKm0oxyj_MsqRla_47YpNqjlpCWlZB9teW23yR5JuxodOzFKrFhhGlKefUs7m2WyJ4UFQB3Vs2tk',
    },
    {
      title: 'Seasonal Guide: Spring Planting Tips',
      excerpt: 'Maximize your spring harvest with these essential tips for planting and care...',
      img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCTHTi5UQSR233xsMibUMPYHC6DgJsQXf-kfIf6BiJZN_I8-8tXzq_jnB8jUAv93zLvBKkFEJP9Lv56bcy2gDWD6lXNSG5rQVHEB9Z_gaeZAdESzgF1IEaqhnxTTrltX2s_v-j5k5VF8CRQVmGfFbwJnuCTDtf6tUZ--UBgfl3We9jxv8Ej30b92vcIs2id2sBGxoGscYLMCAa8Wcx7VsdCTeVrA981kuqx2FbwaNPbpRobhwXBAZYGn9kVsTxbMrZ7pkNolaifXeY',
    },
  ];

  return (
    <main className="flex flex-col gap-12 md:gap-16 lg:gap-20">

      {/* Hero */}
      <div className="animate-fade-in">
        <Hero
          title="Smarter Farming Starts Here"
          subtitle="Your one-stop shop for quality products, expert resources, and AI-powered farming advice."
          bg="https://lh3.googleusercontent.com/aida-public/AB6AXuCLKxwiP-sEyN6Rrsaj0ZEikJ7tuC3i1BDZESOUybBIq9rxpKdpWBwAoodTCjWNVaMQAejA6E7MlL9jyLRyPeR6ToPxQIN0NEaK7VTyapj1liAE8OnwYii_WMHM3_uP3RbX2z_pu5eAGPqFtdI5dqUSJ0PpZeythsCjaDCt4GBFD3TOMNChq8rIrDZFZP9o0Js4D9lI2JIHBb9ZpWutDdH1xIDLxpTzpO-XReYaYDNn3sHTvGei5avHD43XCPbZ9MnexMNeNlcVztk"
        />
      </div>

      {/* Categories */}
      <div className="bg-gradient-to-b from-transparent to-gray-50/50 dark:to-gray-800/50 py-12">
        <div className="container mx-auto">
          <CategoriesSection header="Shop by Category" items={categories} />
        </div>
      </div>

      {/* Featured Products (dynamic) */}
      <section className="container mx-auto px-4">
        <FeaturedProducts />
      </section>

      {/* Articles + AI Assistant */}
      <div className="container mx-auto px-4">
        <div className="flex flex-col lg:flex-row gap-8 items-stretch">
          <Articles header="Top Articles" items={articles} />
          <AiAssistant />
        </div>
      </div>

      {/* Eco Banner */}
      <EcoBanner
        title="Spring Planting Sale"
        text="Get up to 20% off all seeds and fertilizers. Stock up now for a bountiful harvest!"
        bg="https://lh3.googleusercontent.com/aida-public/AB6AXuD8A3yXLwfO6ky-87JjNALS51VJCW0bPghXtMja2AcS-Hc5lGk9yLi6rqptiT0ZWriq8XbZh7113-7bon8bjXa9ILgc17YfLL2d1pSjfLQWnkMUGmbE5U_M2ne3bK9lEKk_r03TOZC0NK903XXGf2Z4zeVqPwLxMzNl_7-FISV41iS2eLPChiJ5dz4g38q1cBEMCKS3rxf5El1xu2QTkcCSszzfd7sr9SCxUZ0DH5qtTwKY-JRLBfWSUOoqAOmnmDhvQvUg-dKKxRk"
      />

      {/* Footer */}
      <Footer />
    </main>
  );
}
