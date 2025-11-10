import { motion as Motion } from "framer-motion";

export default function Articles({ header, items = [] }) {
  // ✨ Animation setup
  const fadeUp = {
    hidden: { opacity: 0, y: 40 },
    show: (delay = 0) => ({
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, delay, ease: "easeOut" },
    }),
  };

  return (
    <section className="flex-1 flex flex-col">
      <Motion.h2
        variants={fadeUp}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.3 }}
        custom={0}
        className="text-[22px] font-bold tracking-[-0.015em] pb-3"
      >
        {header}
      </Motion.h2>

      <div className="flex flex-col gap-4">
        {items.map((a, i) => (
          <Motion.div
            key={i}
            variants={fadeUp}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.3 }}
            custom={i * 0.15}
            className="flex gap-4 p-4 rounded-xl bg-white dark:bg-black/20 shadow-sm hover:shadow-lg transition-shadow"
          >
            <Motion.div
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.3 }}
              className="w-24 h-24 sm:w-32 sm:h-32 flex-shrink-0 bg-cover bg-center rounded-lg"
              style={{ backgroundImage: `url('${a.img}')` }}
            />
            <div className="flex flex-col">
              <Motion.h3
                variants={fadeUp}
                custom={i * 0.2 + 0.1}
                className="font-bold"
              >
                {a.title}
              </Motion.h3>
              <Motion.p
                variants={fadeUp}
                custom={i * 0.2 + 0.2}
                className="text-sm text-earthy-brown mt-1 flex-grow"
              >
                {a.excerpt}
              </Motion.p>
              <Motion.button
                variants={fadeUp}
                custom={i * 0.2 + 0.3}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.97 }}
                className="text-primary font-bold text-sm mt-2 hover:underline"
                onClick={() => {}}
              >
                Read More
              </Motion.button>
            </div>
          </Motion.div>
        ))}
      </div>
    </section>
  );
}
