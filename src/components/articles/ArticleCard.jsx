import React from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { motion as Motion } from "framer-motion";
import { UseTheme } from "../../theme/ThemeProvider";
import { FiHeart, FiBookmark, FiThumbsUp, FiThumbsDown } from "react-icons/fi";

const ArticleCard = ({
  article,
  showFavorite = true,
  showStats = false,
  showComments = false,
  onFavoriteToggle,
  favoriteIds = [],
  isCompact = false,
  className = ""
}) => {
  const { t } = useTranslation();
  const { theme } = UseTheme();

  const handleFavoriteClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (onFavoriteToggle) {
      onFavoriteToggle(article.id);
    }
  };

  const fadeUp = {
    hidden: { opacity: 0, y: 40 },
    show: (delay = 0) => ({
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, delay, ease: "easeOut" },
    }),
  };

  return (
    <Motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4, scale: 1.02 }}
      transition={{ type: "spring", stiffness: 200, damping: 15 }}
      className={`relative flex flex-col gap-3 p-4 rounded-xl transition-all duration-500 overflow-hidden
        ${
          theme === "dark"
            ? "bg-[#0e1b1b]/95 text-[#B8E4E6] shadow-[0_4px_20px_rgba(184,228,230,0.08)] hover:shadow-[0_6px_25px_rgba(184,228,230,0.15)]"
            : "bg-white text-[#1a1a1a] shadow-[0_3px_15px_rgba(0,0,0,0.1)] hover:shadow-[0_5px_20px_rgba(0,0,0,0.15)]"
        } ${className}`}
    >
      {/* Image */}
      {article.heroImage && (
        <Motion.div
          whileHover={{ scale: 1.05 }}
          transition={{ duration: 0.4 }}
          className="relative z-10 w-full aspect-square bg-center bg-cover rounded-lg shadow-inner"
          style={{
            backgroundImage: `url('${article.heroImage}')`,
          }}
        />
      )}

      {/* Favorite Button */}
      {showFavorite && (
        <Motion.button
          whileTap={{ scale: 0.9 }}
          onClick={handleFavoriteClick}
          aria-label="favorite"
          className="absolute top-3 right-3 z-20 p-2 rounded-full shadow-md border backdrop-blur-md bg-white/70 border-gray-200 hover:bg-gray-100 transition"
        >
          <FiHeart size={20} className={favoriteIds.includes(article.id) ? "text-red-600" : "icon-muted"} />
        </Motion.button>
      )}

      {/* Content */}
      <div className="flex flex-col gap-2 text-center relative z-10">
        <span className="inline-flex items-center gap-2 rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
          {article.tag || t("articles.tag.insights", "Insights")}
        </span>

        <Motion.p variants={fadeUp} custom={0.2} className="text-base font-semibold">
          {article.title}
        </Motion.p>

        <Motion.p variants={fadeUp} custom={0.3} className="text-sm leading-relaxed text-[var(--text-muted)] line-clamp-3">
          {article.summary}
        </Motion.p>

        {/* Stats */}
        {showStats && (
          <div className="flex items-center gap-3 text-xs text-[var(--text-muted)]">
            <span className="flex items-center gap-1">
              <span className="text-green-600">👍</span>
              {article.likes || 0}
            </span>
            <span className="flex items-center gap-1">
              <span className="text-red-600">👎</span>
              {article.dislikes || 0}
            </span>
            <span className="flex items-center gap-1">
              <span className="text-blue-600">👁️</span>
              {article.views || 0}
            </span>
          </div>
        )}

        {/* Comments Preview */}
        {showComments && article.comments && article.comments.length > 0 && (
          <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <h5 className="text-xs font-semibold text-blue-800 dark:text-blue-200 mb-2">
              💬 Comments ({article.comments.length})
            </h5>
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {article.comments.slice(0, 2).map((comment, idx) => (
                <div key={idx} className="text-xs bg-white dark:bg-slate-800 p-2 rounded border">
                  <div className="font-medium text-blue-600 dark:text-blue-400">
                    {comment.userName}
                  </div>
                  <div className="text-slate-700 dark:text-slate-300 mt-1 line-clamp-2">
                    {comment.comment}
                  </div>
                </div>
              ))}
              {article.comments.length > 2 && (
                <div className="text-xs text-blue-600 dark:text-blue-400">
                  +{article.comments.length - 2} more comments
                </div>
              )}
            </div>
          </div>
        )}

        {/* Read More Link */}
        <Motion.div variants={fadeUp} custom={0.4}>
          <Link
            to={`/articles/${article.id}`}
            className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-500"
          >
            Continue reading →
          </Link>
        </Motion.div>
      </div>
    </Motion.div>
  );
};

export default ArticleCard;
