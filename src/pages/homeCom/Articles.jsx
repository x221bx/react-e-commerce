export default function Articles({ header, items = [] }) {
  return (
    <section className="flex-1 flex flex-col">
      <h2 className="text-[22px] font-bold tracking-[-0.015em] pb-3">{header}</h2>
      <div className="flex flex-col gap-4">
        {items.map((a, i) => (
          <div key={i} className="flex gap-4 p-4 rounded-xl bg-white dark:bg-black/20 shadow-sm hover:shadow-lg transition-shadow">
            <div className="w-24 h-24 sm:w-32 sm:h-32 flex-shrink-0 bg-cover bg-center rounded-lg"
                 style={{ backgroundImage: `url('${a.img}')` }} />
            <div className="flex flex-col">
              <h3 className="font-bold">{a.title}</h3>
              <p className="text-sm text-earthy-brown mt-1 flex-grow">{a.excerpt}</p>
              <button className="text-primary font-bold text-sm mt-2 hover:underline" onClick={() => {}}>
                Read More
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
