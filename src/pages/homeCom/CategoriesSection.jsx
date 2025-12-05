// src/pages/homeCom/CategoriesSection.jsx
import CategoryCard from './CategoryCard';

export default function CategoriesSection({ header, items = [] }) {
  return (
    <section>
      <div className="container mx-auto px-4">
        <h2 className="text-[22px] font-bold tracking-[-0.015em] pb-3 pt-5">{header}</h2>
        <div className="grid grid-cols-[repeat(auto-fit,minmax(158px,1fr))] gap-4">
          {items.map((c, i) => <CategoryCard key={i} {...c} />)}
        </div>
      </div>
    </section>
  );
}
