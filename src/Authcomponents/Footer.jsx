// src/Authcomponents/Footer.jsx
import { Link } from "react-router-dom";
import { FaFacebookF, FaInstagram, FaTwitter, FaGlobe } from "react-icons/fa";
import { UseTheme } from "../theme/ThemeProvider";
import { motion as Motion } from "framer-motion";
import { useTranslation } from "react-i18next";

export default function Footer() {
  const { theme } = UseTheme();
  const { t } = useTranslation();

  const fadeUp = {
    hidden: { opacity: 0, y: 40 },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.7, ease: "easeOut" },
    },
  };

  return (
    <Motion.footer
      variants={fadeUp}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.2 }}
      className={`
        relative mt-20 py-14
        backdrop-blur-xl
        transition-all duration-500
        ${theme === "dark"
          ? "bg-[#0d1b1b]/95 text-[#B8E4E6]"
          : "bg-gradient-to-b from-[#1d3a3a]/95 to-[#102323]/95 text-[#DFF7EE]"
        }
      `}
    >

      {/* 🌟 Soft Top Glow */}
      <div className="
        absolute top-0 left-0 w-full h-16 
        bg-gradient-to-b from-emerald-500/15 to-transparent
        pointer-events-none
      " />

      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-12">

        {/* 🌿 BRAND */}
        <div className="space-y-4">
          <h2 className="text-3xl font-extrabold flex items-center gap-2 tracking-wide">
            <span className="text-emerald-400">🌿</span> {t("footer.brandName")}
          </h2>
          <p className="opacity-80 text-sm leading-relaxed">
            {t("footer.brandDescription")}
          </p>

          {/* ⭐ Gradient Accent Bar */}
          <div className="h-1 w-24 rounded-full bg-gradient-to-r from-emerald-400 to-teal-300" />
        </div>

        {/* 🧭 QUICK LINKS */}
        <div>
          <h3 className="font-semibold mb-4 text-lg">{t("footer.quickLinks")}</h3>
          <ul className="space-y-3 text-sm">
            {[
              { labelKey: "footer.home", path: "/" },
              { labelKey: "footer.products", path: "/products" },
              { labelKey: "footer.about", path: "/about" },
              { labelKey: "footer.contact", path: "/contactus" },
            ].map((link) => (
              <li key={link.path}>
                <Link
                  to={link.path}
                  className="
                    group inline-block
                    transition-all duration-300
                  "
                >
                  <span
                    className="
                      relative font-medium
                      after:absolute after:left-0 after:-bottom-0.5 after:h-[2px]
                      after:w-0 group-hover:after:w-full
                      after:transition-all after:duration-300
                      after:bg-emerald-400
                    "
                  >
                    {t(link.labelKey)}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* 🌐 SOCIALS */}
        <div>
          <h3 className="font-semibold mb-4 text-lg">{t("footer.followUs")}</h3>

          <div className="flex space-x-4 text-xl">

            {[FaGlobe, FaFacebookF, FaInstagram, FaTwitter].map((Icon, idx) => (
              <Motion.a
                key={idx}
                href="#"
                whileHover={{ scale: 1.15 }}
                whileTap={{ scale: 0.9 }}
                className="
                  p-3 rounded-full transition-all duration-300
                  bg-white/10 dark:bg-white/5 backdrop-blur-md
                  hover:bg-emerald-400/30 dark:hover:bg-emerald-400/20
                  shadow-[0_0_10px_rgba(0,255,200,0.1)]
                  hover:shadow-[0_0_15px_rgba(0,255,200,0.5)]
                "
              >
                <Icon />
              </Motion.a>
            ))}
          </div>
        </div>
      </div>

      {/* 🔸 Copy Rights */}
      <div
        className={`
          mt-14 pt-6 border-t text-center text-sm 
          transition-all duration-300
          ${theme === "dark"
            ? "border-gray-700 text-gray-400"
            : "border-white/20 text-emerald-100"
          }
        `}
      >
        {t("footer.copyright", { year: new Date().getFullYear() })}
      </div>
    </Motion.footer>
  );
}
