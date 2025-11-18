import { useMemo } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { UseTheme } from "../../theme/ThemeProvider";
import { selectCurrentUser } from "../../features/auth/authSlice";
import { accountArticles } from "../../data/articles";

export default function FavoriteArticles() {
  const { theme } = UseTheme();
  const user = useSelector(selectCurrentUser);
  const isDark = theme === "dark";

  const personalized = useMemo(() => {
    const savedList = user?.favoriteArticles;
    if (!Array.isArray(savedList) || savedList.length === 0) return [];
    const seen = new Set();
    return savedList
      .map((article, index) => ({
        id: article.id || `favorite-${index}`,
        title: article.title || article.name || "Untitled article",
        summary: article.summary || article.excerpt || "Stay tuned for more details.",
        readTime: article.readTime || "5 min read",
        tag: article.tag || article.category || "Saved",
        url: article.url || "#",
      }))
      .filter((article) => {
        if (seen.has(article.id)) return false;
        seen.add(article.id);
        return true;
      });
  }, [user?.favoriteArticles]);

  const curatedArticles = useMemo(() => {
    const base = personalized.length > 0 ? personalized : accountArticles;
    const seen = new Set();
    return base
      .map((article, idx) => ({
        id: article.id || `curated-${idx}`,
        title: article.title,
        summary: article.summary,
        readTime: article.readTime || "5 min read",
        tag: article.tag || "Insights",
        url: article.url || "#",
      }))
      .filter((article) => {
        if (seen.has(article.id)) return false;
        seen.add(article.id);
        return true;
      });
  }, [personalized]);

  const accent = isDark ? "text-emerald-300" : "text-emerald-600";
  const headingColor = isDark ? "text-white" : "text-slate-900";
  const muted = isDark ? "text-slate-400" : "text-slate-500";
  const cardSurface = isDark
    ? "border-slate-800/70 bg-gradient-to-b from-slate-900/70 to-slate-900/40"
    : "border-slate-100 bg-white";

  if (!curatedArticles.length) {
    return (
      <section className="rounded-3xl border border-dashed border-slate-200 bg-white/80 p-8 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900/60">
        <p className={`text-lg font-semibold ${headingColor}`}>No saved articles yet</p>
        <p className={`mt-2 text-sm ${muted}`}>
          Save knowledge base entries from the catalog and they will appear here automatically.
        </p>
      </section>
    );
  }

  return (
    <div className="space-y-6">
      <header>
        <p className={`text-sm font-semibold uppercase tracking-wide ${accent}`}>
          Research stream
        </p>
        <h1 className={`text-3xl font-semibold ${headingColor}`}>Favorite Articles</h1>
        <p className={`text-sm ${muted}`}>
          Personalized reading list for your farm crew. Saved items override our curated picks.
        </p>
      </header>

      <div className="space-y-4">
        {curatedArticles.map((article) => (
          <article
            key={article.id}
            className={`rounded-3xl border p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-lg ${cardSurface}`}
          >
            <div
              className={`flex items-center gap-2 text-xs font-semibold uppercase tracking-wide ${accent}`}
            >
              <span>{article.tag}</span>
              <span className={muted}>•</span>
              <span className={muted}>{article.readTime}</span>
            </div>
            <h2 className={`mt-2 text-2xl font-semibold ${headingColor}`}>
              {article.title}
            </h2>
            <p className={`mt-2 text-sm ${muted}`}>{article.summary}</p>
            {article.url && article.url !== "#" ? (
              <Link
                to={article.url}
                className={`mt-4 inline-flex items-center text-sm font-semibold hover:underline ${accent}`}
              >
                Continue reading →
              </Link>
            ) : (
              <span className={`mt-4 inline-flex text-sm font-semibold ${accent}`}>
                Continue reading
              </span>
            )}
          </article>
        ))}
      </div>
    </div>
  );
}
