import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import { selectCurrentUser } from "../../features/auth/authSlice";
import useArticles from "../../hooks/useArticles";
import { UseTheme } from "../../theme/ThemeProvider";
import { getFallbackArticles, localizeArticleRecord } from "../../data/articles";

const ArticlesList = () => {
  const { t, i18n } = useTranslation();
  const { theme } = UseTheme();
  const isDark = theme === "dark";
  const user = useSelector(selectCurrentUser);
  const { articles, loading } = useArticles();
  const [search, setSearch] = useState("");
  const [tag, setTag] = useState("all");
  const locale = i18n.language || "en";

  const localizedArticles = useMemo(
    () => (articles.length ? articles.map((article) => localizeArticleRecord(article, locale)) : []),
    [articles, locale]
  );
  const fallbackArticles = useMemo(() => getFallbackArticles({ locale }), [locale]);
  const baseArticles = localizedArticles.length ? localizedArticles : fallbackArticles;
  const usingFallback = localizedArticles.length === 0;

  const tags = useMemo(() => {
    const tagSet = new Set();
    baseArticles.forEach((article) => {
      if (article.tag) tagSet.add(article.tag);
    });
    return ["all", ...Array.from(tagSet)];
  }, [baseArticles]);

  const filteredArticles = useMemo(() => {
    return baseArticles.filter((article) => {
      const matchesTag = tag === "all" || article.tag === tag;
      const term = search.toLowerCase();
      const matchesSearch =
        !term ||
        article.title?.toLowerCase().includes(term) ||
        article.summary?.toLowerCase().includes(term) ||
        article.tag?.toLowerCase().includes(term);
      return matchesTag && matchesSearch;
    });
  }, [baseArticles, search, tag]);

  const background = isDark
    ? "bg-slate-950"
    : "bg-gradient-to-b from-slate-50 via-white to-emerald-50/30";

  return (
    <div className={`min-h-screen py-12 ${background}`}>
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 sm:px-6 lg:px-8">
        <header className="rounded-3xl border border-emerald-100/50 bg-white/90 p-6 shadow-sm dark:border-emerald-900/40 dark:bg-slate-900/70">
          <p className="text-xs font-semibold uppercase tracking-wide text-emerald-500">
            {t("articles.list.eyebrow", "Knowledge base")}
          </p>
          <h1 className="text-3xl font-semibold text-slate-900 dark:text-white">
            {t("articles.list.title", "Articles & field notes")}
          </h1>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
            {t(
              "articles.list.subtitle",
              "Fresh agronomy tips, veterinary schedules, and AI-powered insights for your farm."
            )}
          </p>
          <div className="mt-6 space-y-4">
            {/* Search Bar */}
            <div className="relative">
              <input
                type="search"
                placeholder={t("articles.list.search", "Search articles...")}
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 pl-12 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
              />
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>

            {/* Filters and Actions */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-wrap gap-2">
                {tags.map((currentTag) => (
                  <button
                    key={currentTag}
                    type="button"
                    onClick={() => setTag(currentTag)}
                    className={`rounded-xl px-3 py-2 text-sm font-medium transition ${
                      tag === currentTag
                        ? "bg-emerald-500 text-white shadow-sm"
                        : "bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                    }`}
                  >
                    {currentTag === "all" ? t("articles.list.allTags", "All topics") : currentTag}
                  </button>
                ))}
              </div>

              {user?.role === "admin" && (
                <Link
                  to="/admin/articles"
                  className="inline-flex items-center gap-2 rounded-xl border border-emerald-200 px-4 py-2 text-sm font-semibold text-emerald-600 shadow-sm transition hover:bg-emerald-50 dark:border-emerald-800 dark:text-emerald-300 dark:hover:bg-emerald-900/40"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  {t("articles.list.manage", "Manage articles")}
                </Link>
              )}
            </div>
          </div>
        </header>

        {usingFallback && !loading && (
          <div className="rounded-3xl border border-amber-200 bg-amber-50/80 p-4 text-sm text-amber-900 shadow dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-100">
            {t(
              "articles.list.fallbackNotice",
              "Our editorial team is still publishing live articles. Showing trusted field guides until they arrive."
            )}
          </div>
        )}

        {loading ? (
          <div className="grid gap-6 md:grid-cols-2">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <div className="h-48 rounded-2xl bg-slate-200 dark:bg-slate-700 animate-pulse"></div>
                <div className="mt-4 space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-16 rounded bg-slate-200 dark:bg-slate-700 animate-pulse"></div>
                    <div className="h-4 w-4 rounded bg-slate-200 dark:bg-slate-700 animate-pulse"></div>
                    <div className="h-4 w-12 rounded bg-slate-200 dark:bg-slate-700 animate-pulse"></div>
                  </div>
                  <div className="space-y-2">
                    <div className="h-6 w-3/4 rounded bg-slate-200 dark:bg-slate-700 animate-pulse"></div>
                    <div className="h-4 w-full rounded bg-slate-200 dark:bg-slate-700 animate-pulse"></div>
                    <div className="h-4 w-2/3 rounded bg-slate-200 dark:bg-slate-700 animate-pulse"></div>
                  </div>
                  <div className="h-4 w-24 rounded bg-slate-200 dark:bg-slate-700 animate-pulse"></div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-2">
            {filteredArticles.map((article) => (
              <article
                key={article.id}
                className="group flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:shadow-lg hover:-translate-y-1 dark:border-slate-800 dark:bg-slate-900"
              >
                {article.heroImage && (
                  <div className="aspect-video overflow-hidden">
                    <img
                      src={article.heroImage}
                      alt={article.title}
                      className="h-full w-full object-cover transition group-hover:scale-105"
                      loading="lazy"
                    />
                  </div>
                )}
                <div className="flex flex-1 flex-col p-6">
                  <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-emerald-600 dark:text-emerald-400">
                    <span className="rounded-full bg-emerald-100 px-2 py-1 dark:bg-emerald-900/30">
                      {article.tag || "Insights"}
                    </span>
                    <span className="text-slate-400 dark:text-slate-500">•</span>
                    <span className="text-slate-500 dark:text-slate-400">
                      {article.readTime || "5 min read"}
                    </span>
                  </div>

                  <h2 className="mb-3 text-xl font-bold text-slate-900 line-clamp-2 dark:text-white">
                    {article.title}
                  </h2>

                  <p className="mb-4 flex-1 text-sm leading-relaxed text-slate-600 line-clamp-3 dark:text-slate-300">
                    {article.summary}
                  </p>

                  <Link
                    to={`/articles/${article.id}`}
                    className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-600 transition hover:text-emerald-700 hover:underline dark:text-emerald-400 dark:hover:text-emerald-300"
                  >
                    {t("articles.list.readMore", "Continue reading")}
                    <svg className="h-4 w-4 transition group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}

        {!loading && baseArticles.length === 0 && (
          <div className="rounded-3xl border border-dashed border-emerald-200 bg-white/90 p-8 text-center shadow-sm dark:border-emerald-900/40 dark:bg-slate-900/70">
            <p className="text-lg font-semibold text-slate-800 dark:text-white">
              {t("articles.list.comingSoonTitle", "Articles are coming soon")}
            </p>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-300">
              {t(
                "articles.list.comingSoonSubtitle",
                "We are preparing bilingual resources for this space. Check back shortly."
              )}
            </p>
          </div>
        )}

        {!loading && baseArticles.length > 0 && !filteredArticles.length && (
          <div className="rounded-3xl border border-dashed border-emerald-200 bg-white/90 p-8 text-center shadow-sm dark:border-emerald-900/40 dark:bg-slate-900/70">
            <p className="text-lg font-semibold text-slate-800 dark:text-white">
              {t("articles.list.emptyTitle", "No articles match this filter")}
            </p>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-300">
              {t("articles.list.emptySubtitle", "Try a different search term or browse all topics.")}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ArticlesList;
