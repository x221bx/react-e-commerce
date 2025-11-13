import { motion as Motion } from "framer-motion";
import { UseTheme } from "../../theme/ThemeProvider";

export default function HelpBanner({ onClick }) {
  const { theme } = UseTheme();

  const fadeUp = {
    hidden: { opacity: 0, y: 30 },
    show: (delay = 0) => ({
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, delay, ease: "easeOut" },
    }),
  };

  return (
    <section className="my-14">
      <div className="container mx-auto px-4">
        <Motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.3 }}
          className={`flex flex-col md:flex-row items-center justify-between gap-8 rounded-2xl overflow-hidden p-8 md:p-12 text-center md:text-left shadow-xl transition-all duration-500 ${
            theme === "dark"
              ? "bg-[#0e1b1b] text-[#B8E4E6]"
              : "bg-[#2f804e] text-white"
          }`}
          style={{
            backgroundImage:
              theme === "dark"
                ? `linear-gradient(to right, rgba(14,27,27,0.92), rgba(14,27,27,0.85)), url('https://images.unsplash.com/photo-1501004318641-b39e6451bec6?auto=format&fit=crop&w=1350&q=80')`
                : `linear-gradient(to right, rgba(47,126,80,0.9), rgba(47,126,80,0.7)), url('https://images.unsplash.com/photo-1501004318641-b39e6451bec6?auto=format&fit=crop&w=1350&q=80')`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
          }}
        >
          {/* النصوص */}
          <div className="flex flex-col gap-4 max-w-xl">
            <Motion.h2
              variants={fadeUp}
              custom={0.1}
              className="text-3xl md:text-4xl font-extrabold leading-tight drop-shadow-md"
            >
              Need Help With Your Livestock? 🐄
            </Motion.h2>

            <Motion.p
              variants={fadeUp}
              custom={0.3}
              className={`text-sm md:text-base leading-relaxed ${
                theme === "dark" ? "text-[#B8E4E6]/90" : "text-white/90"
              }`}
            >
              Our veterinary experts are ready to assist you — from nutrition
              guidance to choosing the right treatments and products to keep
              your animals strong and healthy.
            </Motion.p>
          </div>

          {/* الزرار */}
          <Motion.button
            variants={fadeUp}
            custom={0.6}
            whileHover={{ scale: 1.06 }}
            whileTap={{ scale: 0.95 }}
            onClick={onClick}
            className={`h-12 px-6 min-w-[180px] rounded-lg font-bold shadow-md transition-colors duration-300 ${
              theme === "dark"
                ? "bg-[#B8E4E6] text-[#0e1b1b] hover:bg-[#a7d8da]"
                : "bg-white text-[#2F7E80] hover:bg-[#B8E4E6] hover:text-[#0e1b1b]"
            }`}
          >
            Contact Our Vet
          </Motion.button>
        </Motion.div>
      </div>
    </section>
  );
}
