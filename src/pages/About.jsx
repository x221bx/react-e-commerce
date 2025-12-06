import Footer from "../Authcomponents/Footer";
import { UseTheme } from "../theme/ThemeProvider";
import { motion as Motion } from "framer-motion";
import { useTranslation } from "react-i18next";

export default function About() {
  const { theme } = UseTheme();
  const isDark = theme === "dark";
  const { i18n, t } = useTranslation();
  const isRTL = i18n.language === "ar";

  // 🔥 نفس الـ fadeUp المستخدم في Footer بالظبط
  const fadeUp = {
    hidden: { opacity: 0, y: 40 },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" },
    },
  };

  return (
    <main className="flex flex-col gap-12 md:gap-16 lg:gap-20" dir={isRTL ? "rtl" : "ltr"}>

      {/* HERO — Motion + fadeUp */}
      <Motion.div
        variants={fadeUp}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.3 }}
        className="flex justify-center px-4"
      >
        <section
          className={`
            relative h-[50vh] w-full max-w-6xl bg-cover bg-center flex items-center justify-center
            rounded-2xl overflow-hidden shadow-lg
            ${isDark ? "border border-[#2d5a4f]" : "border border-gray-300"}
          `}
          style={{
            backgroundImage:
              "url('https://lh3.googleusercontent.com/aida-public/AB6AXuCLKxwiP-sEyN6Rrsaj0ZEikJ7tuC3i1BDZESOUybBIq9rxpKdpWBwAoodTCjWNVaMQAejA6E7MlL9jyLRyPeR6ToPxQIN0NEaK7VTyapj1liAE8OnwYii_WMHM3_uP3RbX2z_pu5eAGPqFtdI5dqUSJ0PpZeythsCjaDCt4GBFD3TOMNChq8rIrDZFZP9o0Js4D9lI2JIHBb9ZpWutDdH1xIDLxpTzpO-XReYaYDNn3sHTvGei5avHD43XCPbZ9MnexMNeNlcVztk')",
          }}
        >
          {/* Overlay */}
          <div
            className={`
              absolute inset-0 backdrop-blur-sm
              ${isDark ? "bg-black/50" : "bg-teal-900/30"}
            `}
          />

          <div className="relative z-10 text-center px-6">
            <h1
              className={`
                text-4xl md:text-5xl font-extrabold drop-shadow-lg
                ${isDark ? "text-teal-300" : "text-teal-700"}
              `}
            >
              {t("about.title", "About Us")}
            </h1>

            <p
              className={`
                mt-2 text-lg font-medium drop-shadow
                ${isDark ? "text-teal-200/90" : "text-teal-800/90"}
              `}
            >
              {t("about.heroSubtitle", "Smarter Farming Starts Here")}
            </p>
          </div>
        </section>
      </Motion.div>

      {/* CONTENT — each block has fadeUp */}
      <section className="container mx-auto px-4 max-w-4xl space-y-12">

        <Motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.3 }}
        >
          <h2 className="text-3xl font-bold text-teal-700 dark:text-teal-300">
            {t("about.whoWeAreTitle", "Who We Are")}
          </h2>
          <p className="text-lg leading-relaxed text-gray-700 dark:text-gray-300">
            {t("about.whoWeAre", "Farm Vet Shop is your trusted source for high-quality agricultural products, livestock care solutions, and expert farming advice powered by AI.")}
          </p>
        </Motion.div>

        <Motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.3 }}
        >
          <h2 className="text-3xl font-bold text-teal-700 dark:text-teal-300">
            {t("about.missionTitle", "Our Mission")}
          </h2>
          <p className="text-lg leading-relaxed text-gray-700 dark:text-gray-300">
            {t("about.mission", "To support farmers with top-quality supplies and AI guidance that improves yield and animal health.")}
          </p>
        </Motion.div>

        <Motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.3 }}
        >
          <h2 className="text-3xl font-bold text-teal-700 dark:text-teal-300">
            {t("about.whyTitle", "Why Choose Us?")}
          </h2>
          <ul className="list-disc pl-6 space-y-2 text-gray-700 dark:text-gray-300">
            <li>{t("about.whyList1", "Wide range of agricultural and veterinary products")}</li>
            <li>{t("about.whyList2", "AI Assistant for real-time farming support")}</li>
            <li>{t("about.whyList3", "Fast shipping and trusted customer service")}</li>
            <li>{t("about.whyList4", "Expert-approved products only")}</li>
          </ul>
        </Motion.div>

      </section>

      <Footer />
    </main>
  );
}
