// ============================================================
// Ultra Premium Article Details v7 (Glass + Gradient + 3D UI)
// ============================================================

import React, { useMemo, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import { FiShare2, FiBookmark, FiThumbsUp, FiThumbsDown, FiTag } from "react-icons/fi";

import { selectCurrentUser } from "../../features/auth/authSlice";
import { UseTheme } from "../../theme/ThemeProvider";

import { useArticle } from "../../hooks/useArticle";
import useUserFavoriteIds from "../../hooks/useUserFavoriteIds";
import useArticleLikes from "../../hooks/useArticleLikes";

import {
  saveArticleFavorite,
  removeArticleFavorite,
  incrementArticleViews,
} from "../../services/articlesService";

import toast from "react-hot-toast";
import { localizeArticleRecord } from "../../data/articles";

import LoadingSpinner from "../../components/ui/LoadingSpinner";
import ErrorMessage from "../../components/ui/ErrorMessage";
import Footer from "../../Authcomponents/Footer";

export default function ArticleDetails() {
  const { articleId } = useParams();
  const { t, i18n } = useTranslation();
  const isRTL = (i18n.language || "en").startsWith("ar");

  const { theme } = UseTheme();
  const isDark = theme === "dark";

  const user = useSelector(selectCurrentUser);

  const { article, loading, notFound } = useArticle(articleId);
  const favoriteIds = useUserFavoriteIds(user?.uid);
  const isFavorite = favoriteIds.includes(article?.id);

  const locale = i18n.language || "en";
  const localizedArticle = useMemo(
    () => (article ? localizeArticleRecord(article, locale) : null),
    [article, locale]
  );

  const {
    isLiked,
    isDisliked,
    handleLike,
    handleDislike,
    canInteract,
  } = useArticleLikes(article?.id);

  // Increment views
  useEffect(() => {
    if (localizedArticle?.id && !loading) {
      incrementArticleViews(localizedArticle.id).catch(console.error);
    }
  }, [localizedArticle?.id, loading]);

  // Toggle Favorite
  const handleToggleFavorite = async () => {
    if (!user?.uid) return toast.error(t("articles.detail.authNeeded"));

    try {
      if (isFavorite) {
        await removeArticleFavorite(user.uid, article.id);
        toast.success(t("articles.detail.removed"));
      } else {
        await saveArticleFavorite(user.uid, article.id);
        toast.success(t("articles.detail.saved"));
      }
    } catch {
      toast.error(t("articles.detail.error"));
    }
  };

  // ---------------------------------------------------
  // Loading / Error
  // ---------------------------------------------------
  if (loading)
    return (
      <div
        dir={isRTL ? "rtl" : "ltr"}
        className="min-h-screen flex items-center justify-center"
      >
        <LoadingSpinner />
      </div>
    );

  if (notFound || !localizedArticle)
    return (
      <div dir={isRTL ? "rtl" : "ltr"}>
        <ErrorMessage text={t("articles.detail.notFound")} />
      </div>
    );

  if (
    localizedArticle &&
    localizedArticle.status !== "published" &&
    !user?.isAdmin
  ) {
    return <ErrorMessage />;
  }

  // ---------------------------------------------------
  // MAIN UI
  // ---------------------------------------------------

  return (
    <div
      dir={isRTL ? "rtl" : "ltr"}
      className={`min-h-screen transition-colors duration-500 
      ${isDark ? "bg-[#020d0a] text-slate-100" : "bg-[#f7fdfb] text-slate-900"}`}
    >
      <article
        className={`
          mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8 mb-16 
          rounded-[28px] transition-all duration-500 overflow-hidden
          backdrop-blur-xl border 
          ${
            isDark
              ? "bg-[#0f1a1a]/80 border-emerald-900/40 shadow-[0_25px_60px_rgba(0,255,150,0.15)]"
              : "bg-white border-emerald-100 shadow-[0_18px_45px_rgba(0,0,0,0.06)]"
          }
        `}
      >
        {/* =============== HERO IMAGE =============== */}
        {localizedArticle?.heroImage && (
          <div
            className="relative mb-12 rounded-3xl overflow-hidden shadow-xl group"
          >
            <img
              src={localizedArticle.heroImage}
              alt={localizedArticle.title}
              className="
                w-full h-[350px] sm:h-[450px] lg:h-[520px] object-cover
                transition-all duration-700 group-hover:scale-105
              "
            />

            {/* Subtle gradient overlay */}
            <div
              className="
                absolute inset-0 bg-gradient-to-b from-black/10 via-black/5 to-transparent
                dark:from-black/50 dark:via-black/40 dark:to-transparent
              "
            ></div>
          </div>
        )}

        {/* =============== HEADER ACTIONS =============== */}
        <header className="mb-12">
          <div className="flex items-center justify-between mb-10">
            <div className="flex items-center gap-3">
              {/* LIKE / DISLIKE */}
              {canInteract && (
                <div
                  className="
                  flex items-center gap-1 rounded-xl px-2 py-1 border
                  bg-slate-50 dark:bg-slate-800 
                  border-slate-200 dark:border-slate-700
                "
                >
                  <button
                    onClick={handleLike}
                    className={`
                      px-3 py-2 rounded-lg text-sm font-medium transition
                      flex items-center gap-1
                      ${
                        isLiked
                          ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300 shadow"
                          : "hover:bg-white/50 dark:hover:bg-slate-700"
                      }
                    `}
                  >
                    <FiThumbsUp size={16} />
                  </button>

                  <button
                    onClick={handleDislike}
                    className={`
                      px-3 py-2 rounded-lg text-sm font-medium transition
                      flex items-center gap-1
                      ${
                        isDisliked
                          ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300 shadow"
                          : "hover:bg-white/50 dark:hover:bg-slate-700"
                      }
                    `}
                  >
                    <FiThumbsDown size={16} />
                  </button>
                </div>
              )}

              {/* SHARE */}
              <button
                onClick={() => navigator.share?.({ title: localizedArticle.title, url: window.location.href })}
                className="
                  flex items-center gap-2 px-3 py-2 rounded-lg border 
                  bg-white dark:bg-slate-800 
                  border-slate-200 dark:border-slate-700
                  text-slate-700 dark:text-slate-300 
                  hover:bg-slate-50 dark:hover:bg-slate-700 transition
                "
              >
                <FiShare2 size={18} />
              </button>
            </div>

            {/* SAVE / UNSAVE */}
            {user && (
              <button
                onClick={handleToggleFavorite}
                className={`
                  inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-xl shadow
                  transition-all border 
                  ${
                    isFavorite
                      ? "bg-amber-200 text-amber-900 border-amber-300 dark:bg-amber-900/40 dark:text-amber-200 dark:border-amber-800"
                      : "bg-slate-100 text-slate-700 border-slate-300 hover:bg-white dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700 dark:hover:bg-slate-700"
                  }
                `}
              >
                <FiBookmark size={18} />
                {isFavorite ? t("articles.detail.saved") : t("articles.detail.save")}
              </button>
            )}
          </div>

          {/* TAG BADGE */}
          <div className="flex justify-center mb-6">
            <span
              className="
                inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium 
                bg-emerald-100 text-emerald-800 
                dark:bg-emerald-900/40 dark:text-emerald-200
              "
            >
              <FiTag />
              {localizedArticle.tag}
            </span>
          </div>

          {/* TITLE */}
          <h1
            className="
              text-4xl sm:text-5xl lg:text-6xl font-extrabold text-center mb-6
              leading-tight
            "
          >
            {localizedArticle.title}
          </h1>

          {/* SUMMARY */}
          <p
            className="
              text-xl text-center max-w-3xl mx-auto 
              text-slate-600 dark:text-slate-300
            "
          >
            {localizedArticle.summary}
          </p>
        </header>

        {/* =================== ARTICLE BODY =================== */}
        <div
          className="
            prose prose-xl max-w-none 
            prose-p:text-slate-700 prose-p:dark:text-slate-300
            prose-a:text-emerald-600 prose-a:dark:text-emerald-300
            prose-headings:text-slate-900 dark:prose-headings:text-white
            mb-20
          "
        >
          {localizedArticle?.content ? (
            localizedArticle.content.split("\n\n").map((paragraph, i) => (
              <p key={i} className="leading-relaxed">{paragraph}</p>
            ))
          ) : (
            <div className="text-center py-20 opacity-70">
              <FiBookmark className="mx-auto text-4xl mb-4" />
              {t("articles.detail.emptyContent")}
            </div>
          )}
        </div>

        {/* =================== RELATED SECTION =================== */}
        <div
          className={`
            rounded-2xl p-10 text-center border transition-all 
            ${
              isDark
                ? "bg-[#0f1a1a]/70 border-emerald-900/40 shadow-xl"
                : "bg-emerald-50 border-emerald-200 shadow-lg"
            }
          `}
        >
          <h3 className="text-3xl font-bold mb-3">Discover More Articles</h3>
          <p className="text-slate-600 dark:text-slate-300 mb-6">
            Continue your learning journey with related content.
          </p>

          <Link
            to="/articles"
            className="
              inline-flex items-center gap-3 px-8 py-4 rounded-xl 
              bg-emerald-600 text-white font-semibold shadow-lg 
              hover:bg-emerald-500 transition transform hover:scale-105
            "
          >
            <FiBookmark />
            Browse All Articles
          </Link>
        </div>
      </article>

      <Footer />
    </div>
  );
}
