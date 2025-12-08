import { motion as Motion } from "framer-motion";

export default function CategoriesSection({ header, items }) {
  
  const container = {
    hidden: { opacity: 0, y: 30 },
    show: {
      opacity: 1,
      y: 0,
      transition: {
        staggerChildren: 0.12,
        duration: 0.6,
        ease: "easeOut",
      },
    },
  };

  const itemVariant = {
    hidden: { opacity: 0, scale: 0.92 },
    show: { opacity: 1, scale: 1, transition: { duration: 0.45 } },
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl md:text-3xl font-bold">{header}</h2>

      <Motion.div
        variants={container}
        animate="show"
        className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6"
      >
        {items.map((item) => (
          <Motion.button
            key={item.id}
            variants={itemVariant}
            whileHover={{ scale: 1.06 }}
            whileTap={{ scale: 0.95 }}
            onClick={item.onClick}
            className="
              group relative overflow-hidden
              w-full h-28 md:h-32 rounded-2xl px-4
              flex items-center justify-center text-center font-semibold

              bg-white/70 text-slate-900 
              border border-slate-200 shadow-[0_4px_15px_-3px_rgba(0,0,0,0.08)]
              backdrop-blur-[2px]

              dark:bg-slate-800/50 dark:text-emerald-100
              dark:border-slate-700 dark:shadow-[0_4px_20px_-3px_rgba(0,255,150,0.15)]
              dark:backdrop-blur-[2px]

              transition-all duration-500
            "
          >
            {/* النص الآن فوق كل الطبقات */}
            <span className="text-lg md:text-xl relative z-[5]">
              {item.title}
            </span>

            {/* pattern — الآن z-index منخفض */}
            <div
              className="
                absolute inset-0 opacity-30 dark:opacity-20 z-[1]
                bg-[url('/patterns/pattern-light.svg')] 
                dark:bg-[url('/patterns/pattern-dark.svg')]
                bg-cover bg-center
              "
            ></div>

            {/* Glow Hover */}
            <div
              className="
                absolute inset-0 rounded-2xl opacity-0 
                group-hover:opacity-100 transition-all duration-500
                bg-emerald-300/10 dark:bg-emerald-400/10 blur-xl
                z-[2]
              "
            ></div>

            {/* Border Glow */}
            <div
              className="
                absolute inset-0 rounded-2xl border-2 
                border-transparent group-hover:border-emerald-400/50 
                dark:group-hover:border-emerald-300/40
                transition-all duration-500
                z-[3]
              "
            ></div>

            {/* Sweep Shine */}
            <div
              className="
                absolute inset-0 rounded-2xl z-[4]
                bg-gradient-to-r from-transparent via-white/20 to-transparent
                dark:via-emerald-200/15
                opacity-0 group-hover:opacity-100
                translate-x-[-200%] group-hover:translate-x-[200%]
                transition-transform duration-[1200ms] ease-out
              "
            ></div>

          </Motion.button>
        ))}
      </Motion.div>
    </div>
  );
}
