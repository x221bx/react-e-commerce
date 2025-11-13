import Navbar from '../components/layout/Navbar';
import Hero from './homeCom/hero';
import CategoriesSection from './homeCom/CategoriesSection';
import Articles from './homeCom/Articles';
import AiAssistant from './homeCom/AiAssistant';
import EcoBanner from './homeCom/EcoBanner';
import ProductCard from '../components/cards/ProductCard';
import Footer from '../components/layout/footer';

export default function Home() {
  const onHeroCTA = () => alert('Open products…');
  const onSaleCTA = () => alert('Spring Sale…');

  const categories = [
    { title: 'Fertilizers', note: 'Boost your yield', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDH_bW1DXXLGIRlY6gWEU9Z98W3-Q0DnEu_b11qZnpWwRa6nVqoyf8eBg_pdLRgSp00tvX-1IlZGa-wiMbhWM2OfT462KV6jFlKKYCdSfbi1Whdty1eXm-FKf388c0TW9qJcIyJ3YA25A4OMqo2SIihd2S2L8Fu_vfQ_0k81fuvy1UGG1VKG5illWzcPQkxnyYPXmu0GFYoCbNY8TNG5sNsxS_QNoFw_B0Uos1MPYc74KQAT8herfq38xSxG4NVsFokLcj0ZIK3xas' },
    { title: 'Pesticides', note: 'Protect your crops', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA67VocjP2KUMEoE-RxJ45xpKQu_56VLmIkY2B3pxUmlQoVA-Dg5kVs8m0kLM_aGCl0H7fJkV12mZ5gtbXcxkWVPZ7QCsWtjopUMKMdDoPor2ns4XH6LWPzzJ93PuANt12QX2mozHwmzuahn54JD18y52ljvcEo32-O0juHwaQhhXwx5dIuPAGwlCj2TuNKt4yNLBw4cbNR-_S3zUdE2NJVe4tpoy6gmBdLEhgpLNjbA7uxSarNyEpK2mnW5-djRwsvLYIe3mOtt5I' },
    { title: 'Seeds', note: 'Quality guaranteed', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDt3BZPlSdMO-91JBk39S9gt7rS0dhAreftm-HYbyO9ZcfNhPQmYRnxjIbQYYMjL1_x8Er2si2xab4mUVKDdb-Y9H5Gs0KXFeVyGb6tCTUCZsTP3Q16h4QgmvaruPTh-EN7XTz26oUoqAJhhj-o9fpPz5D0VEXXDj_Z_2B3pNLrglH6PK8PXT8-cTpDZMylW5iVf0eMFv_srwUk-ijz09APbKT6lcAUNozIeomvbtGnG2LRnYmC7gRzAR5qWsaGZJf36sc5ukBVcZg' },
    { title: 'Tools', note: 'Built to last', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAsXR7Yswg0Msg2x8KAxRTQo0hH5fBox88_k_Vd1Pr43UDa04nAN3HoD1LlzFJm7yw66qQhI__2C-ys5wM3k8yb8mluTNU4zB8OohoiEuAkJ3pJrFWat159biiQD2zBMDjc1-dpOTtUKFzRzEVPTCjSBqGDXtzLD-NlrssJ6ReuB_TKfnUcfAhT9To2gMpO04GXyjsuR7UUh8CXK9_Le3gXnchpkLO7af_H4GkMzMIxhliM10h_ChcQJOTlUskHkvMIlCF1_bWgNSY' },
  ];

  const products = [
    { name: 'Organic Growth Fertilizer', price: '$25.99', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC-WKSF_YhCKkPOM1Kni7GhLGM9gkNPTTiXgkFR41v6RV70prYnPvfvkv7C68wdSmAZTyyS4iV0W_ZIKgVfyeCr-GDdVmpjalgjzRsspNcJbRBqrUGsLhso3ux8iE8NIfIJyieRtpragwoO0xVOzOEz6pXIYrHaFGrhEGIcqDO8iEJFQBiq5diotvybmIup46JDy97_Y7v93W6BdQcT8YwarnxPp6dDBJneACtYwD9yK3jjkYVlllNGEWPgToKbWFqftYN4Wq_-NLA' },
    { name: 'Eco-Safe Pest Control', price: '$18.50', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDu53cfaSZjnojjlyzR_FO5hGt9POWcE3NoYxUjMf0KEJY485YU5mow-_G_fiMUwUnFhhH7BRQGCAGuLaaFWp-KhU4qJ2GdBw9GvPPdDlYLaTmf28XJ14W06UrP7gtwx8b8ydSXRoI_4mUN7xWlLYWWqdWGaJzYjOp73dvYqGDLv20hIfwolx7RmupYUfVilBlicqIEgHhCkIbzSHYo_igZSrSJHB4-_2YO3IGKnOGHlnUv6bG_TgSJArdON5xjc40TfBsNDGGk_Fw' },
    { name: 'Heirloom Tomato Seeds', price: '$4.99', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDe-3aQ2yuD36GpT-8LLFBbvQIKSSksT7nvjlfQq-fo5ol7Q4C1VqTVEEpoYitITqM-xhGhG1JOBN6QCHz80SAJTqwjQSRmc6Fr2VGdYvb4VDOiM5uz25mao_cNXbF6xi0WyjgSoF_CVElVzZaSsy52SmELsbd6hokZSdfZXQio5--V6v6xmkD5gIbL44nzzjaEZd__8L5fLOZSg9SXBi4I-ALcg9WHlK8AQ_zBD1vLhduHuxPj_EEwUMvORSjiE3Z-CpW-Yr6QFv0' },
    { name: 'Heavy-Duty Steel Trowel', price: '$15.00', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD0D9GpmO-8I3_PcN2MxhfPRmQxUXQSFDT3XsorBJtUdO4qMD5m4OGhFhtVd99GWQ1h-9GDQ11SquPgMX1DJDrIdu9ZUtWyk7VRI7HIysbvV69MN1q9r-q9ndjUlOgGoL72bVSKq54mYNyB4dR4n4JV6Ic3cJ8LZRqi9YlcVdt3cJJYSnqorSrG5xHGg306pyUy8io8i6tk22fb8yfcHtA5ojQzI10G1EBGdiyuNqUBA6mTPVamseykDWWuk4IAG2wrQJyzTGs5yWY' },
  ];

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
      <div className="animate-fade-in">
        
        <Hero
          title="Smarter Farming Starts Here"
          subtitle="Your one-stop shop for quality products, expert resources, and AI-powered farming advice."
          bg="https://lh3.googleusercontent.com/aida-public/AB6AXuCLKxwiP-sEyN6Rrsaj0ZEikJ7tuC3i1BDZESOUybBIq9rxpKdpWBwAoodTCjWNVaMQAejA6E7MlL9jyLRyPeR6ToPxQIN0NEaK7VTyapj1liAE8OnwYii_WMHM3_uP3RbX2z_pu5eAGPqFtdI5dqUSJ0PpZeythsCjaDCt4GBFD3TOMNChq8rIrDZFZP9o0Js4D9lI2JIHBb9ZpWutDdH1xIDLxpTzpO-XReYaYDNn3sHTvGei5avHD43XCPbZ9MnexMNeNlcVztk"
          onCTA={onHeroCTA}
        />
      </div>

      <div className="bg-gradient-to-b from-transparent to-gray-50/50 dark:to-gray-800/50 py-12">
        <div className="container mx-auto">
          <CategoriesSection header="Shop by Category" items={categories} />
        </div>
      </div>

      {/* Featured products grid using ProductCard */}
      <section className="container mx-auto px-4">
        <h2 className="text-2xl md:text-3xl font-bold mb-8 text-primary dark:text-accent">
          Featured Products
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {products.map((p) => (
            <div key={p.name} className="transform hover:scale-105 transition-transform duration-300">
              <ProductCard product={p} />
            </div>
          ))}
        </div>
      </section>

      {/* Articles + Assistant */}
      <div className="container mx-auto px-4">
        <div className="flex flex-col lg:flex-row gap-8 items-stretch">
          <Articles header="Top Articles" items={articles} />
          <AiAssistant />
        </div>
      </div>

      <EcoBanner
        title="Spring Planting Sale"
        text="Get up to 20% off all seeds and fertilizers. Stock up now for a bountiful harvest!"
        bg="https://lh3.googleusercontent.com/aida-public/AB6AXuD8A3yXLwfO6ky-87JjNALS51VJCW0bPghXtMja2AcS-Hc5lGk9yLi6rqptiT0ZWriq8XbZh7113-7bon8bjXa9ILgc17YfLL2d1pSjfLQWnkMUGmbE5U_M2ne3bK9lEKk_r03TOZC0NK903XXGf2Z4zeVqPwLxMzNl_7-FISV41iS2eLPChiJ5dz4g38q1cBEMCKS3rxf5El1xu2QTkcCSszzfd7sr9SCxUZ0DH5qtTwKY-JRLBfWSUOoqAOmnmDhvQvUg-dKKxRk"
        onClick={onSaleCTA}
      />
      <Footer/>
    </main>
  );
}
