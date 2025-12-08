// src/pages/homeCom/hero.jsx
import { motion as Motion } from "framer-motion";
import { UseTheme } from "../../theme/ThemeProvider";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Button from "../../components/ui/Button";

export default function Hero({ title, subtitle }) {
  const { theme } = UseTheme();
  const { t } = useTranslation();
  const navigate = useNavigate();

  const handleCTA = () => navigate("/products");

  const fadeUp = {
    hidden: { opacity: 0, y: 40 },
    show: (delay = 0) => ({
      opacity: 1,
      y: 0,
      transition: { duration: 0.7, delay, ease: "easeOut" },
    }),
  };

  return (
    <section className="pt-6 md:pt-10">
      <div className="container mx-auto px-4">

        {/* بطاقة الهيرو */}
        <Motion.div
  initial="hidden"
  whileInView="show"
  viewport={{ once: true, amount: 0.4 }}
  className={`
  relative overflow-hidden rounded-3xl shadow-xl
  min-h-[420px] md:min-h-[520px] lg:min-h-[560px]
  border transition-all duration-300

  backdrop-blur-[0.5px]   /* أخف بلور ممكن حرفيًا */
  
  ${theme === "dark"
    ? "bg-black/20 border-emerald-800/40"
    : "bg-white/10 border-emerald-300/40"}
`}
>

          {/* إضاءات خفيفة */}
          <div className="pointer-events-none absolute -right-40 -top-40 h-72 w-72 
                          rounded-full bg-emerald-400/10 blur-2xl" />
          <div className="pointer-events-none absolute -left-10 bottom-0 h-64 w-64 
                          rounded-full bg-lime-300/10 blur-2xl" />

          {/* المحتوى */}
          <div className="relative z-10 flex h-full flex-col justify-between p-6 md:p-10 lg:p-14">
            
            {/* النصوص */}
            <div className="max-w-2xl space-y-5 md:space-y-6">

              {/* Badge */}
              <Motion.div
                variants={fadeUp}
                custom={0.05}
                className={`
                  inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs md:text-sm 
                  backdrop-blur-sm border shadow
                  ${theme === "dark"
                    ? "bg-black/30 text-emerald-100 border-white/10"
                    : "bg-white/60 text-emerald-700 border-emerald-200"}
                `}
              >
                <span className={`
                  inline-block h-2 w-2 rounded-full animate-pulse
                  ${theme === "dark" ? "bg-emerald-300" : "bg-emerald-600"}
                `} />
                <span>{t("home.heroBadge")}</span>
              </Motion.div>

              {/* Title */}
              <Motion.h1
  variants={fadeUp}
  custom={0.15}
  className={`
    text-3xl md:text-5xl lg:text-6xl font-extrabold tracking-tight
    ${theme === "dark" ? "text-emerald-100" : "text-emerald-300"}
  `}
>

                {title}
              </Motion.h1>

              {/* Subtitle */}
              <Motion.p
  variants={fadeUp}
  custom={0.3}
  className={`
    text-sm md:text-base lg:text-lg max-w-xl leading-relaxed
    ${theme === "dark" ? "text-emerald-100/80" : "text-emerald-100/80"}
  `}
>

                {subtitle}
              </Motion.p>

              {/* CTA buttons */}
              <Motion.div
                variants={fadeUp}
                custom={0.5}
                className="flex flex-wrap items-center gap-3 md:gap-4"
              >
                <Motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}>
                  <Button
                    text={t("home.shopAllProducts")}
                    onClick={handleCTA}
                    className={`
                      h-12 px-7 md:px-9 font-bold rounded-xl shadow-lg border transition-all
                      ${theme === "dark"
                        ? "bg-emerald-300 text-slate-900 border-emerald-200 hover:bg-emerald-200"
                        : "bg-emerald-500 text-white border-emerald-300 hover:bg-emerald-600"}
                    `}
                  />
                </Motion.div>

                <Motion.button
                  variants={fadeUp}
                  custom={0.6}
                  type="button"
                  onClick={handleCTA}
                  className={`
                    inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs md:text-sm 
                    backdrop-blur-sm border transition-all
                    ${theme === "dark"
                      ? "bg-white/10 text-white border-white/20 hover:bg-white/20"
                      : "bg-white/50 text-emerald-800 border-emerald-200 hover:bg-white/80"}
                  `}
                >
                  <span className="h-6 w-6 flex items-center justify-center rounded-full bg-emerald-400/80 text-slate-900 text-xs font-bold shadow-md">
                    ✓
                  </span>
                  <span>{t("home.heroSecondaryCta")}</span>
                </Motion.button>
              </Motion.div>

            </div>

            {/* ✨ شريط مزايا احترافي تحت الأزرار */}
            <Motion.div
              variants={fadeUp}
              custom={0.8}
              className={`
                mt-8 grid grid-cols-2 md:grid-cols-3 gap-4 max-w-2xl
                text-xs md:text-sm font-medium
              `}
            >
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 bg-emerald-400 rounded-full"></span>
                <span className={theme === "dark" ? "text-emerald-100" : "text-emerald-100"}>
                  2,500+ trusted farm products
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span className="h-2 w-2 bg-emerald-400 rounded-full"></span>
                <span className={theme === "dark" ? "text-emerald-100" : "text-emerald-100"}>
                  AI-powered farming insights
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span className="h-2 w-2 bg-emerald-400 rounded-full"></span>
                <span className={theme === "dark" ? "text-emerald-100" : "text-emerald-100"}>
                  Fast delivery & support
                </span>
              </div>
            </Motion.div>

          </div>
        </Motion.div>

      </div>
    </section>
  );
}
