// src/components/layout/Footer.jsx
import { Link } from "react-router-dom";
import { FaFacebookF, FaInstagram, FaTwitter, FaGlobe } from "react-icons/fa";
import { UseTheme } from "../../theme/ThemeProvider";
import { motion as Motion } from "framer-motion";
import { useTranslation } from "react-i18next";

export default function Footer() {
  const { theme } = UseTheme();
  const { t } = useTranslation();

  const fadeUp = {
    hidden: { opacity: 0, y: 35 },
    show: (d = 0) => ({
      opacity: 1,
      y: 0,
      transition: { duration: 0.7, delay: d, ease: "easeOut" },
    }),
  };

  return (
    <Motion.footer
      variants={fadeUp}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.3 }}
      className={`
        relative overflow-hidden mt-20
        transition-colors duration-500
        ${theme === "dark"
          ? "bg-[#071412] text-[#C7EDE9]"
          : "bg-[#0F2D2A] text-[#D4F3EE]"}
      `}
    >
      {/* ✨ Soft Pattern Background */}
      <div
        className="absolute inset-0 opacity-[0.12] pointer-events-none"
        style={{
          backgroundImage:
            "url('https://www.transparenttextures.com/patterns/asfalt-light.png')",
        }}
      />

      {/* 🌈 Gradient Glow */}
      <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[420px] h-[420px] rounded-full bg-emerald-500/20 blur-3xl" />

      <div className="relative max-w-7xl mx-auto px-6 py-14 grid grid-cols-1 md:grid-cols-3 gap-12">

        {/* 🌿 BRAND SECTION */}
        <div className="space-y-4">
          <h2 className="text-3xl font-extrabold tracking-wide flex items-center gap-2">
            🌿 <span>{t("footer.brandName")}</span>
          </h2>

          <p className="text-sm opacity-85 leading-relaxed">
            {t("footer.brandDescription")}
          </p>

          <div className="mt-6 h-[2px] w-24 bg-gradient-to-r from-emerald-400 to-transparent rounded-full" />
        </div>

        {/* 🧭 NAVIGATION */}
        <div>
          <h3 className="font-bold text-xl mb-4 opacity-95">
            {t("footer.quickLinks")}
          </h3>

          <ul className="space-y-3 text-sm">
            {[
              { k: "footer.home", p: "/" },
              { k: "footer.products", p: "/products" },
              { k: "footer.about", p: "/about" },
              { k: "footer.contact", p: "/contactus" },
            ].map((l, i) => (
              <li key={i}>
                <Link
                  to={l.p}
                  className="
                    group inline-block relative
                    transition-all duration-300
                    hover:translate-x-1
                  "
                >
                  <span className="relative z-10 group-hover:text-emerald-300">
                    {t(l.k)}
                  </span>

                  {/* Underline Animation */}
                  <span
                    className="
                      absolute left-0 -bottom-0.5 h-[2px] w-0 group-hover:w-full 
                      bg-emerald-400 transition-all duration-300
                    "
                  />
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* 🌐 SOCIAL + CONTACT */}
        <div>
          <h3 className="font-bold text-xl mb-4 opacity-95">
            {t("footer.followUs")}
          </h3>

          <div className="flex space-x-4 text-xl">
            {[FaGlobe, FaFacebookF, FaInstagram, FaTwitter].map((Icon, idx) => (
              <Motion.a
                key={idx}
                href="#"
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.2, rotate: 5 }}
                whileTap={{ scale: 0.9 }}
                className="
                  p-3 rounded-full backdrop-blur-md border
                  transition-all duration-300
                  hover:shadow-[0_0_18px_rgba(16,185,129,0.4)]
                  hover:bg-emerald-400/20
                "
              >
                <Icon />
              </Motion.a>
            ))}
          </div>

          {/* Contact Info */}
          <div className="mt-6 space-y-2 text-sm opacity-80">
            <p>📞 +20 100 000 0000</p>
            <p>📩 support@example.com</p>
          </div>
        </div>

      </div>

      {/* COPYRIGHT */}
      <div
        className={`
          relative text-center py-5 text-sm
          border-t transition-colors duration-500
          ${theme === "dark" ? "border-emerald-900/40" : "border-white/20"}
        `}
      >
        {t("footer.copyright", {
          year: new Date().getFullYear(),
        })}
      </div>
    </Motion.footer>
  );
}
