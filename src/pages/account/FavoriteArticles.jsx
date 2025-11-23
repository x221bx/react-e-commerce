import { useMemo } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { UseTheme } from "../../theme/ThemeProvider";
import { selectCurrentUser } from "../../features/auth/authSlice";
import useArticles from "../../hooks/useArticles";
import useUserFavoriteArticles from "../../hooks/useUserFavoriteArticles";
import { getFallbackArticles, localizeArticleRecord } from "../../data/articles";

export default function FavoriteArticles() {
  const { t, i18n } = useTranslation();
  const { theme } = UseTheme();
  const isDark = theme === "dark";
  const user = useSelector(selectCurrentUser);
  const locale = i18n.language || "en";

  const { articles: featuredArticlesRaw } = useArticles({ featureAccount: true });
  const featuredArticles = useMemo(
    () => featuredArticlesRaw.map((article) => localizeArticleRecord(article, locale)),
    [featuredArticlesRaw, locale]
  );
  const fallbackArticles = useMemo(
    () => getFallbackArticles({ locale, featureAccount: true }),
    [locale]
  );
  const { articles: favoriteArticles, loading } = useUserFavoriteArticles(user?.uid, { locale });

  const curatedArticles = useMemo(() => {
    const source = favoriteArticles.length
      ? favoriteArticles
      : featuredArticles.length
        ? featuredArticles
        : fallbackArticles;
    return source.map((article) => ({
      id: article.id,
      title: article.title,
      summary: article.summary,
      readTime: article.readTime || "5 min",
      tag: article.tag || "Insights",
      heroImage: article.heroImage,
    }));
  }, [favoriteArticles, featuredArticles, fallbackArticles]);

  const accent = isDark ? "text-emerald-300" : "text-emerald-600";
  const headingColor = isDark ? "text-white" : "text-slate-900";
  const muted = isDark ? "text-slate-400" : "text-slate-500";
  const cardSurface = isDark
    ? "border-slate-800/70 bg-gradient-to-b from-slate-900/70 to-slate-900/40"
    : "border-slate-100 bg-white";

  if (loading) {
    return (
      <section className="rounded-3xl border border-dashed border-slate-200 bg-white/80 p-8 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900/60">
        <p className={`text-sm ${muted}`}>
          {t("account.favoriteArticles.loading", "Loading your reading list...")}
        </p>
      </section>
    );
  }

  if (!curatedArticles.length) {
    return (
      <section className="rounded-3xl border border-dashed border-slate-200 bg-white/80 p-8 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900/60">
        <p className={`text-lg font-semibold ${headingColor}`}>
          {t("account.favoriteArticles.emptyTitle", "No saved articles yet")}
        </p>
        <p className={`mt-2 text-sm ${muted}`}>
          {t(
            "account.favoriteArticles.emptySubtitle",
            "Save knowledge base entries from the catalog and they will appear here automatically."
          )}
        </p>
        <Link
          to="/articles"
          className="mt-4 inline-flex items-center justify-center rounded-2xl bg-emerald-500 px-5 py-2 text-sm font-semibold text-white shadow hover:bg-emerald-600"
        >
          {t("account.favoriteArticles.browse", "Browse articles")}
        </Link>
      </section>
    );
  }

  return (
    <div className="space-y-6">
      <header>
        <p className={`text-sm font-semibold uppercase tracking-wide ${accent}`}>
          {t("account.favoriteArticles.eyebrow", "Research stream")}
        </p>
        <h1 className={`text-3xl font-semibold ${headingColor}`}>
          {t("account.favoriteArticles.title", "Favorite Articles")}
        </h1>
        <p className={`text-sm ${muted}`}>
          {t(
            "account.favoriteArticles.subtitle",
            "Personalized reading list for your farm crew. Saved items override our curated picks."
          )}
        </p>
      </header>

      <div className="space-y-4">
        {curatedArticles.map((article) => (
          <article
            key={article.id}
            className={`rounded-3xl border p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-lg ${cardSurface}`}
          >
            <div className={`flex items-center gap-2 text-xs font-semibold uppercase tracking-wide ${accent}`}>
              <span>{article.tag}</span>
              <span className={muted}>•</span>
              <span className={muted}>{article.readTime}</span>
            </div>
            <h2 className={`mt-2 text-2xl font-semibold ${headingColor}`}>{article.title}</h2>
            <p className={`mt-2 text-sm ${muted}`}>{article.summary}</p>
            <Link
              to={`/articles/${article.id}`}
              className={`mt-4 inline-flex items-center text-sm font-semibold hover:underline ${accent}`}
            >
              {t("account.favoriteArticles.readMore", "Continue reading →")}
            </Link>
          </article>
        ))}
      </div>
    </div>
  );
}
