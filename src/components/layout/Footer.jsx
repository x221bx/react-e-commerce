import { Link } from "react-router-dom";
import { FaFacebookF, FaInstagram, FaTwitter, FaGlobe } from "react-icons/fa";
import { UseTheme } from "../../theme/ThemeProvider";
import { motion as Motion } from "framer-motion";
import { useTranslation } from "react-i18next";

export default function Footer() {
  const { theme } = UseTheme();
  const { t } = useTranslation();

  // ✨ Animation setup
  const fadeUp = {
    hidden: { opacity: 0, y: 40 },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" },
    },
  };

  return (
    <Motion.footer
      variants={fadeUp}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.3 }}
      className={`transition-colors duration-300 ${
        theme === "dark"
          ? "bg-[#0e1b1b] text-[#B8E4E6]"
          : "bg-[#142727] text-[#B8E4E6]"
      } py-10 mt-16 shadow-inner`}
    >
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-10">
        {/* 🌿 Brand */}
        <div>
          <h2 className="text-2xl font-bold tracking-wide flex items-center gap-2">
            🌿 <span>{t("footer.brandName")}</span>
          </h2>
          <p className="mt-3 text-sm opacity-80 leading-relaxed">
            {t("footer.brandDescription")}
          </p>
        </div>

        {/* 🧭 Navigation */}
        <div>
          <h3 className="font-semibold mb-4 text-lg">{t("footer.quickLinks")}</h3>
          <ul className="space-y-2 text-sm">
            {[
              { name: t("footer.home"), path: "/" },
              { name: t("footer.products"), path: "/products" },
              { name: t("footer.about"), path: "/about" },
              { name: t("footer.contact"), path: "/contact" },
            ].map((link) => (
              <li key={link.path}>
                <Link
                  to={link.path}
                  className={`transition-colors duration-200 hover:underline ${
                    theme === "dark"
                      ? "hover:text-[#B8E4E6]"
                      : "hover:text-[#f5d061]"
                  }`}
                >
                  {link.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* 🌐 Social Media */}
        <div>
          <h3 className="font-semibold mb-4 text-lg">{t("footer.followUs")}</h3>
          <div className="flex space-x-4 text-xl">
            {[FaGlobe, FaFacebookF, FaInstagram, FaTwitter].map(
              (Icon, idx) => (
                <a
                  key={idx}
                  href="#"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`p-2 rounded-full transition-transform duration-300 hover:scale-110 ${
                    theme === "dark"
                      ? "hover:bg-[#B8E4E6]/10"
                      : "hover:bg-white/20"
                  }`}
                >
                  <Icon />
                </a>
              )
            )}
          </div>
        </div>
      </div>

      {/* 🔸 Copy Rights */}
      <div
        className={`mt-10 pt-5 border-t text-center text-sm transition-colors duration-300 ${
          theme === "dark"
            ? "border-gray-700 text-gray-400"
            : "border-white/30 text-white/80"
        }`}
      >
        {t("footer.copyright", { year: new Date().getFullYear() })}
      </div>
    </Motion.footer>
  );
}
