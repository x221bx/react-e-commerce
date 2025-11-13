import { motion as Motion } from "framer-motion";
import { UseTheme } from "../../theme/ThemeProvider";
import { useNavigate } from "react-router-dom";
import Button from "../../components/ui/Button";

export default function Hero({ title, subtitle, bg }) {
  const { theme } = UseTheme();
  const navigate = useNavigate();

  const handleCTA = () => navigate("/shop");

  // ✨ أنيميشن الفايد البسيط من تحت
  const fadeUp = {
    hidden: { opacity: 0, y: 40 },
    show: (delay = 0) => ({
      opacity: 1,
      y: 0,
      transition: { duration: 0.7, delay, ease: "easeOut" },
    }),
  };

  return (
    <section className="my-10">
      <div className="container mx-auto px-4">
        <Motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.4 }}
          className="relative flex flex-col items-start justify-end rounded-2xl overflow-hidden
                     min-h-[480px] lg:min-h-[560px] p-8 md:p-12 shadow-xl transition-all duration-500"
          style={{
            backgroundImage: `linear-gradient(to bottom, rgba(0,0,0,0.3), rgba(0,0,0,0.6)), url('${bg}')`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
          }}
        >
          {/* النصوص */}
          <div className="max-w-2xl space-y-4">
            <Motion.h1
              variants={fadeUp}
              custom={0.1}
              className="text-3xl md:text-5xl font-extrabold leading-tight tracking-tight 
                         text-white dark:text-[#B8E4E6] drop-shadow-md"
            >
              {title}
            </Motion.h1>

            <Motion.p
              variants={fadeUp}
              custom={0.3}
              className="text-sm md:text-base leading-relaxed text-white/90 dark:text-[#B8E4E6]/80"
            >
              {subtitle}
            </Motion.p>
          </div>

          {/* زرار CTA */}
          <Motion.div
            variants={fadeUp}
            custom={0.6}
            className="mt-6"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.97 }}
          >
            <Button
              text="Shop All Products"
              onClick={handleCTA}
              className={`h-12 px-6 font-bold rounded-lg shadow-md transition-colors duration-300
                ${
                  theme === "dark"
                    ? "bg-[#B8E4E6] text-[#0e1b1b] hover:bg-[#a7d8da]"
                    : "bg-[#2F7E80] text-white hover:bg-[#256b6d]"
                }`}
            />
          </Motion.div>
        </Motion.div>
      </div>
    </section>
  );
}
