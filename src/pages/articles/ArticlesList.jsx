// src/pages/articles/ArticlesList.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import { selectCurrentUser } from "../../features/auth/authSlice";
import useArticles from "../../hooks/useArticles";
import useUserFavoriteIds from "../../hooks/useUserFavoriteIds";
import {
  saveArticleFavorite,
  removeArticleFavorite,
} from "../../services/articlesService";
import {
  getFallbackArticles,
  localizeArticleRecord,
  generateSlug,
} from "../../data/articles";
import {
  FiFilter,
  FiBookOpen,
  FiTrendingUp,
  FiSearch,
} from "react-icons/fi";
import toast from "react-hot-toast";
import Footer from "../../Authcomponents/Footer";
import ArticleCard from "../../components/articles/ArticleCard";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import Pagination from "../../components/ui/Pagination";
import { UseTheme } from "../../theme/ThemeProvider";

const PAGE_SIZE = 6;

const ArticlesList = () => {
  const { t, i18n } = useTranslation();
  const user = useSelector(selectCurrentUser);
  const { theme } = UseTheme();
  const isDark = theme === "dark";
  const isRTL = (i18n.language || "en").startsWith("ar");
  const locale = i18n.language || "en";

  const { articles, loading } = useArticles();
  const favoriteIds = useUserFavoriteIds(user?.uid);

  const [tag, setTag] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);

  // ---- Localize + slugify articles ----
  const localizedArticles = useMemo(
    () =>
      articles.length
        ? articles.map((article) => {
            const articleWithSlug = { ...article };
            if (!articleWithSlug.slug && articleWithSlug.title) {
              articleWithSlug.slug = generateSlug(articleWithSlug.title);
            }
            return localizeArticleRecord(articleWithSlug, locale);
          })
        : [],
    [articles, locale]
  );

  const fallbackArticles = useMemo(
    () => getFallbackArticles({ locale }),
    [locale]
  );

  const baseArticles = localizedArticles.length
    ? localizedArticles
    : fallbackArticles;

  // ---- Published only ----
  const publishedArticles = useMemo(
    () => baseArticles.filter((article) => article.status === "published"),
    [baseArticles]
  );

  const usingFallback = localizedArticles.length === 0;

  // ---- Tags / filters ----
  const tags = useMemo(() => {
    const tagSet = new Set();
    publishedArticles.forEach((article) => {
      if (article.tag) tagSet.add(article.tag);
    });
    return ["all", ...Array.from(tagSet)];
  }, [publishedArticles]);

  const filteredArticles = useMemo(
    () =>
      publishedArticles.filter((article) => {
        const matchesTag = tag === "all" || article.tag === tag;
        return matchesTag;
      }),
    [publishedArticles, tag]
  );

  const stats = useMemo(
    () => ({
      total: publishedArticles.length,
      filtered: filteredArticles.length,
      topics: tags.length - 1,
    }),
    [publishedArticles.length, filteredArticles.length, tags.length]
  );

  // ---- Pagination ----
  useEffect(() => {
    setCurrentPage(1);
  }, [tag]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredArticles.length / PAGE_SIZE)
  );
  const clampedPage = Math.min(currentPage, totalPages);
  const startIndex = (clampedPage - 1) * PAGE_SIZE;
  const endIndex = startIndex + PAGE_SIZE;
  const paginatedArticles = filteredArticles.slice(startIndex, endIndex);

  // ---- Favorites ----
  const handleToggleFavorite = async (articleId) => {
    if (!user?.uid) {
      toast.error(
        t("articles.detail.authNeeded", "Sign in to save articles")
      );
      return;
    }
    try {
      const isFavorite = favoriteIds.includes(articleId);
      if (isFavorite) {
        await removeArticleFavorite(user.uid, articleId);
        toast.success(
          t("articles.detail.removed", "Removed from favorites")
        );
      } else {
        await saveArticleFavorite(user.uid, articleId);
        toast.success(t("articles.detail.saved", "Saved for later"));
      }
    } catch (error) {
      console.error(error);
      toast.error(
        t("articles.detail.error", "Unable to update favorites")
      );
    }
  };

  return (
    <div
      dir={isRTL ? "rtl" : "ltr"}
      className={`
        min-h-screen flex flex-col transition-colors duration-500
        ${
          isDark
            ? "bg-[#02130f] bg-gradient-to-b from-[#02130f] via-[#031e16] to-[#04261b] text-slate-100"
            : "bg-[#f5faf8] text-slate-900"
        }
      `}
    >
      {/* ================= HERO ================= */}
      <section
        className={`
          relative overflow-hidden border-b
          ${isDark ? "border-emerald-900/40" : "border-emerald-100"}
        `}
      >
        {/* Background gradient / pattern */}
        <div
          className={`
            absolute inset-0 pointer-events-none
            ${
              isDark
                ? "bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.28),_transparent_55%),radial-gradient(circle_at_bottom,_rgba(8,47,35,0.9),_rgba(3,16,12,1))]"
                : "bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.16),_transparent_55%),linear-gradient(to_bottom,_#e8fff5,_#f5faf8)]"
            }
          `}
        />

        <div className="relative mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          <div className="max-w-4xl space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full bg-emerald-100/90 px-4 py-2 text-sm font-semibold text-emerald-900 shadow-sm dark:bg-emerald-500/15 dark:text-emerald-200">
              <FiBookOpen className="h-4 w-4" />
              {t("articles.list.eyebrow", "Knowledge hub")}
            </div>

            <h1
              className={`
                text-4xl sm:text-5xl font-extrabold tracking-tight
                bg-clip-text text-transparent
                ${
                  isDark
                    ? "bg-gradient-to-r from-emerald-200 via-green-300 to-lime-300"
                    : "bg-gradient-to-r from-emerald-700 via-emerald-500 to-sky-500"
                }
              `}
            >
              {t("articles.list.title", "Articles & Field Notes")}
            </h1>

            <p
              className={`
                text-lg leading-relaxed max-w-2xl
                ${
                  isDark
                    ? "text-emerald-100/80"
                    : "text-slate-700"
                }
              `}
            >
              {t(
                "articles.list.subtitle",
                "Fresh agronomy tips, veterinary schedules, and AI-powered insights to keep your farm a step ahead."
              )}
            </p>

            <div className="flex flex-wrap gap-4 text-sm">
              <span className="inline-flex items-center gap-2 rounded-full bg-black/5 px-3 py-1 text-slate-700 dark:bg-white/5 dark:text-emerald-100">
                <FiTrendingUp className="h-4 w-4 text-emerald-500" />
                {stats.total} {t("articles.stats.articles", "articles")}
              </span>
              <span className="inline-flex items-center gap-2 rounded-full bg-black/5 px-3 py-1 text-slate-700 dark:bg-white/5 dark:text-emerald-100">
                <FiFilter className="h-4 w-4 text-emerald-500" />
                {stats.topics} {t("articles.stats.topics", "topics")}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ================ MAIN CONTENT ================ */}
      <main className="flex-1">
        {/* Filters bar */}
        <section
          className={`
            border-b
            ${isDark ? "bg-[#031810]/95 border-emerald-900/40" : "bg-white border-emerald-50"}
          `}
        >
          <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
            <div className="flex flex-col gap-4">
              {/* Tags row */}
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between gap-4">
                  <p
                    className={`text-sm font-medium ${
                      isDark ? "text-emerald-100/80" : "text-slate-700"
                    }`}
                  >
                    {t("articles.filters.title", "Browse by topic")}
                  </p>

                  <p
                    className={`text-xs ${
                      isDark ? "text-emerald-100/60" : "text-slate-500"
                    }`}
                  >
                    {filteredArticles.length === stats.total
                      ? `${stats.total} ${t(
                          "articles.stats.articles",
                          "articles"
                        )}`
                      : `${filteredArticles.length} ${t(
                          "articles.results.of",
                          "of"
                        )} ${stats.total} ${t(
                          "articles.stats.articles",
                          "articles"
                        )}`}
                  </p>
                </div>

                <div className="relative">
                  <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin scrollbar-thumb-emerald-400/60 scrollbar-track-transparent">
                    {tags.slice(0, 12).map((currentTag) => {
                      const isActive = tag === currentTag;
                      return (
                        <button
                          key={currentTag}
                          type="button"
                          onClick={() => setTag(currentTag)}
                          className={`
                            whitespace-nowrap rounded-full border px-4 py-2 text-xs sm:text-sm font-medium transition-all duration-200
                            ${
                              isActive
                                ? "bg-emerald-600 text-white border-emerald-600 shadow-md shadow-emerald-500/30"
                                : isDark
                                ? "bg-[#041912] text-emerald-100 border-emerald-800 hover:bg-emerald-900/40"
                                : "bg-white text-slate-700 border-emerald-100 hover:bg-emerald-50"
                            }
                          `}
                        >
                          {currentTag === "all"
                            ? t("articles.list.allTags", "All")
                            : currentTag}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Content area */}
        <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          {/* Fallback notice */}
          {usingFallback && !loading && publishedArticles.length === 0 && (
            <div
              className={`
                mb-8 rounded-xl border px-4 py-4 text-sm shadow-sm
                ${
                  isDark
                    ? "border-amber-900/60 bg-amber-950/20 text-amber-100"
                    : "border-amber-200 bg-amber-50 text-amber-900"
                }
              `}
            >
              <div className="flex items-start gap-3">
                <FiTrendingUp className="mt-0.5 h-5 w-5 text-amber-500" />
                <div>
                  <p className="font-semibold">
                    {t(
                      "articles.list.fallbackNotice",
                      "Content in development"
                    )}
                  </p>
                  <p className="mt-1 text-xs sm:text-sm">
                    {t(
                      "articles.list.fallbackSubtitle",
                      "Our editorial team is preparing fresh agricultural content. Showing trusted field guides in the meantime."
                    )}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Loading */}
          {loading ? (
            <div className="py-16">
              <LoadingSpinner
                text={t("articles.loading", "Loading articles...")}
              />
            </div>
          ) : (
            <>
              {/* Grid */}
              <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                {paginatedArticles.map((article) => (
                  <ArticleCard
                    key={article.id}
                    article={article}
                    showFavorite={!!user}
                    favoriteIds={favoriteIds}
                    onFavoriteToggle={handleToggleFavorite}
                  />
                ))}
              </div>

              {/* Pagination */}
              {filteredArticles.length > 0 && (
                <div className="mt-10 flex justify-center">
                  <Pagination
                    currentPage={clampedPage}
                    totalPages={totalPages}
                    totalItems={filteredArticles.length}
                    rangeStart={filteredArticles.length ? startIndex + 1 : 0}
                    rangeEnd={Math.min(
                      endIndex,
                      filteredArticles.length
                    )}
                    onPageChange={(page) =>
                      setCurrentPage(
                        Math.min(Math.max(1, page), totalPages)
                      )
                    }
                    hideOnSinglePage={false}
                    showInfo={false}
                  />
                </div>
              )}

              {/* Empty states */}
              {!loading && publishedArticles.length === 0 && (
                <div className="py-16 text-center">
                  <div
                    className={`
                      mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-xl
                      ${
                        isDark
                          ? "bg-slate-800 text-slate-400"
                          : "bg-slate-100 text-slate-400"
                      }
                    `}
                  >
                    <FiBookOpen className="h-10 w-10" />
                  </div>
                  <h3
                    className={`
                      mb-3 text-xl font-semibold
                      ${isDark ? "text-white" : "text-slate-900"}
                    `}
                  >
                    {t(
                      "articles.empty.title",
                      "Articles coming soon"
                    )}
                  </h3>
                  <p
                    className={`
                      mx-auto max-w-md text-sm
                      ${
                        isDark
                          ? "text-slate-300"
                          : "text-slate-600"
                      }
                    `}
                  >
                    {t(
                      "articles.empty.subtitle",
                      "We're preparing comprehensive agricultural resources and expert insights. Check back soon for valuable farming knowledge."
                    )}
                  </p>
                </div>
              )}

              {!loading &&
                publishedArticles.length > 0 &&
                !filteredArticles.length && (
                  <div className="py-16 text-center">
                    <div
                      className={`
                        mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-xl
                        ${
                          isDark
                            ? "bg-slate-800 text-slate-400"
                            : "bg-slate-100 text-slate-400"
                        }
                      `}
                    >
                      <FiSearch className="h-10 w-10" />
                    </div>
                    <h3
                      className={`
                        mb-3 text-xl font-semibold
                        ${isDark ? "text-white" : "text-slate-900"}
                      `}
                    >
                      {t(
                        "articles.search.empty.title",
                        "No articles found"
                      )}
                    </h3>
                    <p
                      className={`
                        mx-auto mb-6 max-w-md text-sm
                        ${
                          isDark
                            ? "text-slate-300"
                            : "text-slate-600"
                        }
                      `}
                    >
                      {t(
                        "articles.search.empty.subtitle",
                        "Try adjusting your filters or browse all available topics."
                      )}
                    </p>
                    <button
                      onClick={() => setTag("all")}
                      className={`
                        inline-flex items-center gap-2 rounded-lg px-6 py-2 text-sm font-medium transition-colors
                        ${
                          isDark
                            ? "bg-emerald-500 text-slate-900 hover:bg-emerald-400"
                            : "bg-slate-900 text-white hover:bg-slate-800"
                        }
                      `}
                    >
                      <FiFilter className="h-4 w-4" />
                      {t("articles.search.clear", "Clear filters")}
                    </button>
                  </div>
                )}
            </>
          )}
        </section>
      </main>

      {/* Footer ثابت في آخر الصفحة */}
      <Footer />
    </div>
  );
};

export default ArticlesList;
