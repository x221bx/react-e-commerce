// =========================================
// Ultra Premium Article Card v6 (Glass + 3D + Glow)
// =========================================

import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { motion as Motion } from "framer-motion";
import { UseTheme } from "../../theme/ThemeProvider";
import { FiHeart } from "react-icons/fi";

export default function ArticleCard({
  article,
  showFavorite = true,
  showStats = false,
  showComments = false,
  onFavoriteToggle,
  favoriteIds = [],
  className = "",
}) {
  const { t } = useTranslation();
  const { theme } = UseTheme();
  const isDark = theme === "dark";

  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const isFav = favoriteIds.includes(article.id);

  const fade = {
    hidden: { opacity: 0, y: 40 },
    show: (d = 0) => ({
      opacity: 1,
      y: 0,
      transition: { duration: 0.55, delay: d, ease: "easeOut" },
    }),
  };

  const handleFavoriteClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (onFavoriteToggle) onFavoriteToggle(article.id);
  };

  return (
    <Motion.div
      onMouseMove={(e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        setMousePos({
          x: e.clientX - rect.left,
          y: e.clientY - rect.top,
        });
      }}
      initial="hidden"
      animate="show"
      variants={fade}
      className={`
        relative p-4 rounded-2xl overflow-hidden cursor-pointer group 
        transition-all duration-500 backdrop-blur-xl
        ${
          isDark
            ? "bg-[#0f1a1a]/80 border border-emerald-900/40 shadow-[0_18px_45px_rgba(0,255,150,0.12)] hover:shadow-[0_25px_55px_rgba(0,255,150,0.2)]"
            : "bg-white/80 border border-emerald-100 shadow-[0_12px_35px_rgba(0,0,0,0.08)] hover:shadow-[0_18px_50px_rgba(0,0,0,0.12)]"
        }
        ${className}
      `}
    >

      {/* 🔆 Mouse Light Effect */}
      <div
        className="absolute inset-0 rounded-2xl pointer-events-none opacity-0 group-hover:opacity-100 transition duration-300"
        style={{
          background: `radial-gradient(400px circle at ${mousePos.x}px ${mousePos.y}px,
            rgba(255,255,255,0.35),
            transparent 65%
          )`,
        }}
      />

      {/* ✨ Shine Sweep */}
      <div
        className="
          absolute inset-0 rounded-2xl pointer-events-none 
          bg-gradient-to-r from-transparent via-white/20 to-transparent
          dark:via-emerald-200/15
          opacity-0 group-hover:opacity-100
          translate-x-[-180%] group-hover:translate-x-[180%]
          transition-all duration-[1400ms] ease-out
        "
      />

      {/* ❤️ Favorite Button */}
      {showFavorite && (
        <Motion.button
          whileTap={{ scale: 0.85 }}
          onClick={handleFavoriteClick}
          className={`
            absolute top-3 z-20 rounded-full p-2 shadow-lg border
            backdrop-blur-md transition
            rtl:left-3 ltr:right-3
            ${
              isDark
                ? "bg-black/40 border-emerald-900 hover:bg-black/60"
                : "bg-white/80 border-slate-200 hover:bg-white"
            }
          `}
        >
          <FiHeart
            size={20}
            className={isFav ? "text-red-600" : isDark ? "text-white" : "text-slate-600"}
          />
        </Motion.button>
      )}

      {/* 🖼 Article Image */}
      <Motion.div
        whileHover={{ scale: 1.05 }}
        transition={{ duration: 0.4 }}
        className="
          w-full aspect-square rounded-xl bg-center bg-cover shadow-inner
        "
        style={{ backgroundImage: `url('${article.heroImage}')` }}
      />

      {/* 🏷 Tag */}
      <div
        className="
          mt-3 inline-flex items-center justify-center mx-auto
          bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200
          px-3 py-1 rounded-full text-xs font-semibold
        "
      >
        {article.tag || t("articles.tag.insights", "Insights")}
      </div>

      {/* 🔤 Title */}
      <Motion.h3
        variants={fade}
        custom={0.15}
        className={`mt-3 text-lg font-bold text-center ${
          isDark ? "text-white" : "text-slate-900"
        }`}
      >
        {article.title}
      </Motion.h3>

      {/* ✍ Summary */}
      <Motion.p
        variants={fade}
        custom={0.25}
        className={`text-sm text-center line-clamp-3 ${
          isDark ? "text-emerald-100/70" : "text-slate-600"
        }`}
      >
        {article.summary}
      </Motion.p>

      {/* 📊 Stats */}
      {showStats && (
        <div
          className={`mt-3 flex justify-center gap-4 text-xs ${
            isDark ? "text-emerald-200/70" : "text-slate-500"
          }`}
        >
          <span>👍 {article.likes || 0}</span>
          <span>👎 {article.dislikes || 0}</span>
          <span>👁 {article.views || 0}</span>
        </div>
      )}

      {/* 🔗 Read More */}
      <Motion.div variants={fade} custom={0.35} className="mt-4 text-center">
        <Link
          to={`/articles/${article.id}`}
          className={`
            inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold shadow-md transition
            ${
              isDark
                ? "bg-emerald-500 text-slate-900 hover:bg-emerald-400"
                : "bg-emerald-600 text-white hover:bg-emerald-500"
            }
          `}
        >
          {t("articles.list.readMore", "Continue reading →")}
        </Link>
      </Motion.div>
    </Motion.div>
  );
}
