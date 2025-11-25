import Footer from "../components/layout/footer";

export default function About() {
  return (
    <main className="flex flex-col gap-12 md:gap-16 lg:gap-20">

      {/* HERO */}
      <div className="animate-fade-in">
        <section
          className="relative h-[50vh] bg-cover bg-center flex items-center justify-center text-white"
          style={{
            backgroundImage:
              "url('https://lh3.googleusercontent.com/aida-public/AB6AXuCLKxwiP-sEyN6Rrsaj0ZEikJ7tuC3i1BDZESOUybBIq9rxpKdpWBwAoodTCjWNVaMQAejA6E7MlL9jyLRyPeR6ToPxQIN0NEaK7VTyapj1liAE8OnwYii_WMHM3_uP3RbX2z_pu5eAGPqFtdI5dqUSJ0PpZeythsCjaDCt4GBFD3TOMNChq8rIrDZFZP9o0Js4D9lI2JIHBb9ZpWutDdH1xIDLxpTzpO-XReYaYDNn3sHTvGei5avHD43XCPbZ9MnexMNeNlcVztk')",
          }}
        >
          <div className="bg-black/40 p-6 rounded-xl backdrop-blur-md text-center">
            <h1 className="text-4xl md:text-5xl font-bold">About Us</h1>
            <p className="mt-2 text-lg">Smarter Farming Starts With Us</p>
          </div>
        </section>
      </div>

      {/* CONTENT */}
      <section className="container mx-auto px-4 max-w-4xl space-y-8">
        <h2 className="text-3xl font-bold text-teal-700 dark:text-teal-300">
          Who We Are
        </h2>
        <p className="text-lg leading-relaxed text-gray-700 dark:text-gray-300">
          Farm Vet Shop is your trusted source for high-quality agricultural
          products, livestock care solutions, and expert farming advice powered by AI.
          We aim to empower farmers with the right tools, knowledge, and
          technology to achieve sustainable and profitable farming.
        </p>

        <h2 className="text-3xl font-bold text-teal-700 dark:text-teal-300">
          Our Mission
        </h2>
        <p className="text-lg leading-relaxed text-gray-700 dark:text-gray-300">
          Our mission is to support farmers with top-quality fertilizers,
          pesticides, seeds, and livestock medicines, while providing
          AI-powered guidance that helps improve crop yield and animal health.
        </p>

        <h2 className="text-3xl font-bold text-teal-700 dark:text-teal-300">
          Why Choose Us?
        </h2>
        <ul className="list-disc pl-6 space-y-2 text-gray-700 dark:text-gray-300">
          <li>Wide range of agricultural and veterinary products</li>
          <li>AI Assistant for real-time farming support</li>
          <li>Fast shipping and trusted customer service</li>
          <li>Expert-approved products only</li>
        </ul>
      </section>

      <Footer />
    </main>
  );
}
