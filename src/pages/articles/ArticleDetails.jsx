import React, { useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import { selectCurrentUser } from "../../features/auth/authSlice";
import { UseTheme } from "../../theme/ThemeProvider";
import { useArticle } from "../../hooks/useArticle";
import useUserFavoriteIds from "../../hooks/useUserFavoriteIds";
import { removeArticleFavorite, saveArticleFavorite } from "../../services/articlesService";
import toast from "react-hot-toast";
import { getFallbackArticle, localizeArticleRecord } from "../../data/articles";

const ArticleDetails = () => {
  const { articleId } = useParams();
  const { t, i18n } = useTranslation();
  const { theme } = UseTheme();
  const user = useSelector(selectCurrentUser);
  const { article, loading } = useArticle(articleId);
  const favoriteIds = useUserFavoriteIds(user?.uid);
  const isFavorite = favoriteIds.includes(articleId);
  const locale = i18n.language || "en";
  const fallbackArticle = useMemo(() => getFallbackArticle(articleId, locale), [articleId, locale]);
  const localizedArticle = useMemo(() => {
    if (article) {
      return localizeArticleRecord(article, locale);
    }
    return fallbackArticle;
  }, [article, fallbackArticle, locale]);

  const handleToggleFavorite = async () => {
    if (!user?.uid) {
      toast.error(t("articles.detail.authNeeded", "Sign in to save articles"));
      return;
    }
    try {
      if (isFavorite) {
        await removeArticleFavorite(user.uid, articleId);
        toast.success(t("articles.detail.removed", "Removed from favorites"));
      } else {
        await saveArticleFavorite(user.uid, articleId);
        toast.success(t("articles.detail.saved", "Saved for later"));
      }
    } catch (error) {
      console.error(error);
      toast.error(t("articles.detail.error", "Unable to update favorites"));
    }
  };

  if (loading) {
    return (
      <section className="min-h-[60vh] rounded-3xl border border-slate-200 bg-white/80 p-6 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900/60">
        <p className="text-sm text-slate-500 dark:text-slate-300">
          {t("articles.detail.loading", "Loading article...")}
        </p>
      </section>
    );
  }

  if (!localizedArticle && !loading) {
    return (
      <section className="min-h-[60vh] rounded-3xl border border-slate-200 bg-white/80 p-6 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900/60">
        <p className="text-lg font-semibold text-slate-800 dark:text-white">
          {t("articles.detail.notFound", "Article not found")}
        </p>
        <Link
          to="/articles"
          className="mt-4 inline-flex items-center rounded-2xl bg-emerald-500 px-5 py-2 text-sm font-semibold text-white shadow hover:bg-emerald-600"
        >
          {t("articles.detail.back", "Back to articles")}
        </Link>
      </section>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-10 dark:bg-slate-950">
      <article className="mx-auto flex max-w-3xl flex-col gap-6 rounded-3xl border border-slate-100 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        {localizedArticle?.heroImage && (
          <img
            src={localizedArticle.heroImage}
            alt={localizedArticle.title}
            className="h-72 w-full rounded-2xl object-cover"
          />
        )}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-wide text-emerald-500">
            <span>{localizedArticle?.tag || "Insights"}</span>
            <span className="text-slate-400">•</span>
            <span className="text-slate-500 dark:text-slate-300">
              {localizedArticle?.readTime || "5 min"}
            </span>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleToggleFavorite}
              className={`rounded-2xl border px-4 py-1.5 text-xs font-semibold transition ${
                isFavorite
                  ? "border-amber-300 bg-amber-50 text-amber-700 dark:border-amber-700 dark:bg-amber-900/30 dark:text-amber-200"
                  : "border-slate-200 text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
              }`}
            >
              {isFavorite
                ? t("articles.detail.savedButton", "Saved")
                : t("articles.detail.saveButton", "Save for later")}
            </button>
            <Link
              to="/articles"
              className="rounded-2xl border border-slate-200 px-4 py-1.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              {t("articles.detail.back", "Back to articles")}
            </Link>
          </div>
        </div>
        <h1 className="text-3xl font-semibold text-slate-900 dark:text-white">{localizedArticle?.title}</h1>
        <p className="text-sm text-slate-500 dark:text-slate-300">
          {t("articles.detail.byline", {
            author: localizedArticle?.author || "Editorial team",
          })}
        </p>
        <div className="prose max-w-none text-slate-700 prose-img:rounded-2xl dark:prose-invert">
          {localizedArticle?.content
            ? localizedArticle.content.split("\n\n").map((paragraph, index) => (
                <p key={index} className="leading-relaxed">
                  {paragraph}
                </p>
              ))
            : t("articles.detail.emptyContent", "Content coming soon.")}
        </div>
      </article>
    </div>
  );
};

export default ArticleDetails;
