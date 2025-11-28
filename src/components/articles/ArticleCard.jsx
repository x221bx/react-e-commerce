import React from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
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

  const handleFavoriteClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (onFavoriteToggle) {
      onFavoriteToggle(article.id);
    }
  };

  return (
    <article
      className={`group relative overflow-hidden rounded-2xl card-surface shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-lg ${className}`}
      style={{ animationDelay: `${Math.random() * 200}ms` }}
    >
      {/* Image */}
      {article.heroImage && (
        <div className="aspect-video overflow-hidden bg-slate-100">
          <img
            src={article.heroImage}
            alt={article.title}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
          />
        </div>
      )}

      {/* Content */}
      <div className="p-6 space-y-3">
        <div className="flex items-start justify-between">
          <span className="inline-flex items-center gap-2 rounded-md bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
            {article.tag || t("articles.tag.insights", "Insights")}
          </span>
          {showFavorite && (
            <button
              onClick={handleFavoriteClick}
              className={`p-2 rounded-full transition-colors ${
                favoriteIds.includes(article.id)
                  ? "text-red-500 hover:bg-red-50"
                  : "text-gray-400 hover:bg-gray-50 hover:text-red-400"
              }`}
              title={
                favoriteIds.includes(article.id)
                  ? t("articles.detail.saved", "Saved")
                  : t("articles.detail.save", "Save")
              }
            >
              <FiHeart
                className={`h-5 w-5 ${
                  favoriteIds.includes(article.id) ? "fill-current" : ""
                }`}
              />
            </button>
          )}
        </div>

        <h3
          className={`font-semibold text-[var(--text-main)] line-clamp-2 transition-colors duration-200 group-hover:text-emerald-700 ${
            isCompact ? "text-lg" : "text-lg"
          }`}
        >
          {article.title}
        </h3>

        <p className="text-sm leading-relaxed text-[var(--text-muted)] line-clamp-3">
          {article.summary}
        </p>

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
        <Link
          to={`/articles/${article.slug || article.id}`}
          className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-600 transition-all duration-200 hover:gap-3 hover:text-emerald-700"
        >
          {t("articles.list.readMore", "Read Article")}
          <svg className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      </div>
    </article>
  );
};

export default ArticleCard;
