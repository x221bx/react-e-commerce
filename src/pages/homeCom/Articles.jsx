// src/pages/homeCom/Articles.jsx
import { motion as Motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

export default function Articles({ header, items = [] }) {
  const { t } = useTranslation();

  // ✨ Animation Variants
  const container = {
    hidden: { opacity: 0, y: 20 },
    show: {
      opacity: 1,
      y: 0,
      transition: { staggerChildren: 0.15, duration: 0.6, ease: "easeOut" },
    },
  };

  const item = {
    hidden: { opacity: 0, scale: 0.95, y: 30 },
    show: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" },
    },
  };

  return (
    <section className="flex-1 flex flex-col">

      {/* عنوان القسم */}
      <Motion.h2
        variants={item}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.3 }}
        className="text-[24px] font-bold tracking-tight pb-4 
                   text-slate-900 dark:text-emerald-100"
      >
        {header}
      </Motion.h2>

      {/* قائمة المقالات */}
      <Motion.div
        variants={container}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.25 }}
        className="flex flex-col gap-5"
      >
        {items.map((a, i) => (
          <Motion.div
            key={i}
            variants={item}
            whileHover={{
              scale: 1.02,
              y: -3,
              transition: { duration: 0.35 },
            }}
            className="
              group flex gap-5 p-4 rounded-2xl overflow-hidden relative
              cursor-pointer transition-all duration-500

              /* Light Mode */
              bg-white/80 shadow-[0_4px_15px_rgba(0,0,0,0.06)]
              border border-slate-200

              /* Dark Mode */
              dark:bg-slate-900/40 dark:shadow-[0_6px_20px_rgba(0,255,150,0.10)]
              dark:border-slate-800
            "
          >

            {/* تأثير اللمعة داخل الكارد */}
            <div
              className="
                absolute inset-0 opacity-0 group-hover:opacity-100
                bg-gradient-to-r from-transparent via-white/10 to-transparent
                dark:via-emerald-200/10
                rounded-2xl translate-x-[-180%] 
                group-hover:translate-x-[180%]
                transition-all duration-[1100ms] ease-out
              "
            />

            {/* صورة المقال */}
            <Motion.div
              whileHover={{ scale: 1.07 }}
              transition={{ duration: 0.45 }}
              className="
                w-28 h-28 sm:w-36 sm:h-36 flex-shrink-0 
                bg-cover bg-center rounded-xl shadow-inner relative overflow-hidden
              "
              style={{ backgroundImage: `url('${a.img}')` }}
            >
              {/* Layer خفيف للوضوح */}
              <div className="absolute inset-0 bg-black/10 dark:bg-black/30"></div>
            </Motion.div>

            {/* معلومات المقال */}
            <div className="flex flex-col justify-between py-1 flex-1">

              {/* العنوان */}
              <Motion.h3
                variants={item}
                className="
                  font-bold text-lg text-slate-900 dark:text-emerald-50
                  group-hover:text-emerald-600 dark:group-hover:text-emerald-300
                  transition-colors duration-300
                "
              >
                {a.title}
              </Motion.h3>

              {/* الوصف */}
              <Motion.p
                variants={item}
                className="
                  text-sm text-slate-600 dark:text-slate-300 
                  mt-1 line-clamp-3
                "
              >
                {a.excerpt}
              </Motion.p>

              {/* زر القراءة مع الحركة */}
              <Motion.div variants={item} className="mt-2">
                <Link
                  to="/articles"
                  className="
                    text-sm font-semibold inline-flex items-center gap-1
                    text-emerald-700 hover:text-emerald-900
                    dark:text-emerald-300 dark:hover:text-emerald-200
                    transition
                  "
                >
                  {t("home.readMore")}
                  <span className="group-hover:translate-x-1 transition-transform duration-300">
                    →
                  </span>
                </Link>
              </Motion.div>
            </div>
          </Motion.div>
        ))}
      </Motion.div>
    </section>
  );
}
