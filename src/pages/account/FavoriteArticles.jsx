// src/pages/account/FavoriteArticles.jsx
import { useMemo } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { FiBookmark } from "react-icons/fi";
import { selectCurrentUser } from "../../features/auth/authSlice";
import useUserFavoriteArticles from "../../hooks/useUserFavoriteArticles";
import Section from "../../components/ui/Section";
import EmptyState from "../../components/ui/EmptyState";
import Card from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";

export default function FavoriteArticles() {
  const { t, i18n } = useTranslation();
  const user = useSelector(selectCurrentUser);
  const locale = i18n.language || "en";

  const { articles: favoriteArticles, loading } = useUserFavoriteArticles(user?.uid, { locale });

  const curatedArticles = useMemo(
    () =>
      favoriteArticles.map((article) => ({
        id: article.id,
        slug: article.slug,
        title: article.title,
        summary: article.summary,
        readTime: article.readTime || "5 min",
        tag: article.tag || "Insights",
        heroImage: article.heroImage,
      })),
    [favoriteArticles]
  );

  if (loading) {
    return (
      <Section
        title={t("account.favoriteArticles.title", "Favorite Articles")}
        subtitle={t("account.favoriteArticles.subtitle", "Personalized reading list for your farm crew.")}
      >
        <div className="grid gap-3 md:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-4 animate-pulse">
              <div className="h-3 w-16 bg-[var(--color-border)]/70 rounded mb-3" />
              <div className="h-4 w-3/4 bg-[var(--color-border)]/70 rounded mb-2" />
              <div className="h-3 w-1/2 bg-[var(--color-border)]/70 rounded" />
            </div>
          ))}
        </div>
      </Section>
    );
  }

  if (!loading && curatedArticles.length === 0) {
    return (
      <Section
        title={t("account.favoriteArticles.title", "Favorite Articles")}
        subtitle={t("account.favoriteArticles.subtitle", "Personalized reading list for your farm crew.")}
      >
        <EmptyState
          title={t("account.favoriteArticles.emptyTitle", "No saved articles yet")}
          message={t("account.favoriteArticles.emptySubtitle", "Save knowledge base entries from the catalog and they will appear here automatically.")}
          action={
            <Link to="/articles" className="inline-flex">
              <Badge tone="accent" className="px-4 py-2 text-[var(--color-text)] bg-[var(--color-accent)]/10">
                {t("account.favoriteArticles.browse", "Browse articles")}
              </Badge>
            </Link>
          }
        />
      </Section>
    );
  }

  return (
    <Section
      title={t("account.favoriteArticles.title", "Favorite Articles")}
      subtitle={t("account.favoriteArticles.subtitle", "Personalized reading list for your farm crew.")}
      actions={
        <Badge tone="accent" className="text-[var(--color-text)] bg-[var(--color-accent)]/10">
          <FiBookmark /> {t("account.favoriteArticles.eyebrow", "Research stream")}
        </Badge>
      }
    >
      <div className="space-y-4">
        {curatedArticles.map((article) => (
          <Card
            key={article.id}
            className="p-4 md:p-5 hover:shadow-[var(--shadow-md)] transition"
            onClick={() => (article.slug ? window.location.assign(`/articles/${article.slug}`) : null)}
          >
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-[var(--color-accent)]">
              <span>{article.tag}</span>
              <span className="text-[var(--color-text-muted)]">•</span>
              <span className="text-[var(--color-text-muted)]">{article.readTime}</span>
            </div>
            <h3 className="mt-2 text-lg font-semibold text-[var(--color-text)]">{article.title}</h3>
            <p className="mt-1 text-sm text-[var(--color-text-muted)]">{article.summary}</p>
          </Card>
        ))}
      </div>
    </Section>
  );
}
