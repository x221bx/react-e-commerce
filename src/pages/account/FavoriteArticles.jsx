import { useMemo } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { UseTheme } from "../../theme/ThemeProvider";
import { FiBookmark } from "react-icons/fi";
import { selectCurrentUser } from "../../features/auth/authSlice";
import useUserFavoriteArticles from "../../hooks/useUserFavoriteArticles";

export default function FavoriteArticles() {
  const { t, i18n } = useTranslation();
  const { theme } = UseTheme();
  const isDark = theme === "dark";
  const user = useSelector(selectCurrentUser);
  const locale = i18n.language || "en";

  const { articles: favoriteArticles, loading } =
    useUserFavoriteArticles(user?.uid, { locale });

  const curatedArticles = useMemo(() => {
    return favoriteArticles.map((article) => ({
      id: article.id,
      slug: article.slug,
      title: article.title,
      summary: article.summary,
      readTime: article.readTime || "5 min",
      tag: article.tag || "Insights",
      heroImage: article.heroImage,
    }));
  }, [favoriteArticles]);

  // Unified style (same as Products UI)
  const accent = isDark ? "text-emerald-300" : "text-emerald-600";
  const headingColor = isDark ? "text-white" : "text-slate-900";
  const muted = isDark ? "text-white/60" : "text-slate-500";

  const cardSurface = isDark
    ? "bg-[#0f1d1d]/70 border border-white/10 shadow-lg"
    : "bg-white border border-gray-200 shadow-md";

  return (
    <div
      className={`
      min-h-screen font-sans 
      bg-gradient-to-b from-transparent to-gray-50/50
      dark:to-slate-800/30
      ${isDark ? "text-white" : "text-slate-900"}
    `}
    >
      <div className="max-w-5xl mx-auto px-6 py-8 space-y-8">
        {/* HEADER */}
        <header className="space-y-2">
          <p className={`text-sm font-semibold uppercase tracking-wide ${accent}`}>
            {t("account.favoriteArticles.eyebrow", "Research stream")}
          </p>

          <div className="flex items-center gap-2">
            <FiBookmark className={`${accent} h-6 w-6`} />
            <h1 className={`text-3xl font-semibold ${headingColor}`}>
              {t("account.favoriteArticles.title", "Favorite Articles")}
            </h1>
          </div>

          <p className={`text-sm ${muted}`}>
            {t(
              "account.favoriteArticles.subtitle",
              "Personalized reading list for your farm crew. Saved items override our curated picks."
            )}
          </p>
        </header>

        {/* LOADING */}
        {loading && (
          <section
            className={`
            rounded-2xl border-dashed border p-8 text-center
            ${isDark ? "border-white/10 bg-white/5" : "border-slate-200 bg-white"}
          `}
          >
            <p className={`text-sm ${muted}`}>
              {t("account.favoriteArticles.loading", "Loading your reading list...")}
            </p>
          </section>
        )}

        {/* EMPTY */}
        {!loading && curatedArticles.length === 0 && (
          <section
            className={`
            rounded-2xl border-dashed border p-8 text-center
            ${isDark ? "border-white/10 bg-white/5" : "border-slate-200 bg-white"}
          `}
          >
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
              className="mt-4 inline-flex items-center justify-center rounded-xl bg-emerald-500 px-5 py-2 text-sm font-semibold text-white shadow hover:bg-emerald-600"
            >
              {t("account.favoriteArticles.browse", "Browse articles")}
            </Link>
          </section>
        )}

        {/* LIST */}
        <div className="space-y-5">
          {curatedArticles.map((article) => (
            <article
              key={article.id}
              className={`rounded-2xl p-5 transition hover:-translate-y-1 hover:shadow-xl ${cardSurface}`}
            >
              <div
                className={`flex items-center gap-2 text-xs font-semibold uppercase tracking-wide ${accent}`}
              >
                <span>{article.tag}</span>
                <span className={muted}>•</span>
                <span className={muted}>{article.readTime}</span>
              </div>

              <h2 className={`mt-2 text-xl font-bold leading-tight ${headingColor}`}>
                {article.title}
              </h2>

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
    </div>
  );
}
