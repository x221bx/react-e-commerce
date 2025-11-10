import React from "react";
import ProductCard from "../../components/cards/ProductCard";

export default function FeaturedProducts() {
  const products = [
    {
      id: 1,
      name: "Vitamin Boost for Cattle",
      price: 150,
      image: "https://i.imgur.com/GY4nB0c.jpeg",
    },
    {
      id: 2,
      name: "Premium Animal Feed (10kg)",
      price: 320,
      image: "https://i.imgur.com/3vU6d4n.jpeg",
    },
    {
      id: 3,
      name: "Multi-purpose Medicine Spray",
      price: 90,
      image: "https://i.imgur.com/oU7B1rb.jpeg",
    },
    {
      id: 4,
      name: "Goat & Sheep Vitamins Pack",
      price: 210,
      image: "https://i.imgur.com/8uS0S49.jpeg",
    },
  ];

  return (
    <section className="mt-16">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Featured Products</h2>
        <button className="text-primary hover:text-primary/80 font-medium transition">
          View All
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
        {products.map((product) => (
          <ProductCard
            key={product.id}
            image={product.image}
            name={product.name}
            price={product.price}
            onAdd={() => console.log("Add:", product.name)}
          />
        ))}
      </div>
    </section>
  );
}
