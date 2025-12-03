import React, { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import { selectCurrentUser } from "../../features/auth/authSlice";
import useArticles from "../../hooks/useArticles";
import useUserFavoriteIds from "../../hooks/useUserFavoriteIds";
import { saveArticleFavorite, removeArticleFavorite } from "../../services/articlesService";
import { getFallbackArticles, localizeArticleRecord, generateSlug } from "../../data/articles";
import { FiFilter, FiBookOpen, FiTrendingUp } from "react-icons/fi";
import toast from "react-hot-toast";
import Footer from "../../Authcomponents/Footer";
import ArticleCard from "../../components/articles/ArticleCard";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import ErrorMessage from "../../components/ui/ErrorMessage";
import Pagination from "../../components/ui/Pagination";

const ArticlesList = () => {
    const { t, i18n } = useTranslation();
    const user = useSelector(selectCurrentUser);
    const { articles, loading } = useArticles();
    const [tag, setTag] = useState("all");
    const favoriteIds = useUserFavoriteIds(user?.uid);
    const locale = i18n.language || "en";
    const PAGE_SIZE = 6;
    const [currentPage, setCurrentPage] = useState(1);

    const localizedArticles = useMemo(
        () => (articles.length ? articles.map((article) => {
            // Ensure article has a slug for URL routing
            const articleWithSlug = { ...article };
            if (!articleWithSlug.slug && articleWithSlug.title) {
                articleWithSlug.slug = generateSlug(articleWithSlug.title);
            }
            return localizeArticleRecord(articleWithSlug, locale);
        }) : []),
        [articles, locale]
    );
    const fallbackArticles = useMemo(() => getFallbackArticles({ locale }), [locale]);
    const baseArticles = localizedArticles.length ? localizedArticles : fallbackArticles;

    // Filter to show only published articles to clients
    const publishedArticles = useMemo(
        () => baseArticles.filter(article => article.status === 'published'),
        [baseArticles]
    );
    const usingFallback = localizedArticles.length === 0;

    const tags = useMemo(() => {
        const tagSet = new Set();
        publishedArticles.forEach((article) => {
            if (article.tag) tagSet.add(article.tag);
        });
        return ["all", ...Array.from(tagSet)];
    }, [publishedArticles]);

    const filteredArticles = useMemo(() => {
        return publishedArticles.filter((article) => {
            const matchesTag = tag === "all" || article.tag === tag;
            return matchesTag;
        });
    }, [publishedArticles, tag]);

    const stats = useMemo(() => ({
        total: publishedArticles.length,
        filtered: filteredArticles.length,
        tags: tags.length - 1, // exclude "all"
    }), [publishedArticles.length, filteredArticles.length, tags.length]);

    useEffect(() => {
        setCurrentPage(1);
    }, [tag]);

    const totalPages = Math.max(1, Math.ceil(filteredArticles.length / PAGE_SIZE));
    const clampedPage = Math.min(currentPage, totalPages);
    const startIndex = (clampedPage - 1) * PAGE_SIZE;
    const endIndex = startIndex + PAGE_SIZE;
    const paginatedArticles = filteredArticles.slice(startIndex, endIndex);

    const handleToggleFavorite = async (articleId) => {
        if (!user?.uid) {
            toast.error(t("articles.detail.authNeeded", "Sign in to save articles"));
            return;
        }
        try {
            const isFavorite = favoriteIds.includes(articleId);
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

    return (
        <div className="min-h-screen bg-surface text-[var(--text-main)]">
            {/* Hero */}
            <section className="relative overflow-hidden border-b border-muted bg-panel">
                <div className="absolute inset-0 bg-grid-pattern opacity-5 dark:opacity-10" />
                <div className="relative mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
                    <div className="max-w-4xl">
                        <div className="inline-flex items-center gap-2 rounded-full bg-emerald-100 px-4 py-2 text-sm font-semibold text-emerald-800">
                            <FiBookOpen className="h-4 w-4" />
                            {t("articles.list.eyebrow", "Knowledge base")}
                        </div>
                        <h1 className="mt-4 text-4xl font-bold tracking-tight text-[var(--text-main)] sm:text-5xl">
                            {t("articles.list.title", "Articles & field notes")}
                        </h1>
                        <p className="mt-3 text-lg leading-relaxed text-[var(--text-muted)]">
                            {t("articles.list.subtitle", "Fresh agronomy tips, veterinary schedules, and AI-powered insights for your farm.")}
                        </p>
                        <div className="mt-5 flex flex-wrap gap-4 text-sm text-[var(--text-muted)]">
              <span className="inline-flex items-center gap-2">
                <FiTrendingUp className="h-4 w-4 text-emerald-500" />
                  {stats.total} {t("articles.stats.articles", "articles")}
              </span>
                            <span className="inline-flex items-center gap-2">
                <FiFilter className="h-4 w-4 text-emerald-500" />
                                {stats.tags} {t("articles.stats.topics", "topics")}
              </span>
                        </div>
                    </div>
                </div>
            </section>

            {/* Filters Section */}
            <section className="bg-panel border-b border-muted">
                <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                    <div className="flex flex-col gap-6">
                        {/* Filters */}
                        <div className="flex flex-col items-center gap-4">
                            <div className="flex flex-wrap items-center justify-center gap-2">
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300 mr-2">
                  {t("articles.filters.title", "Topics:")}
                </span>
                                <div className="flex flex-wrap gap-2">
                                    {tags.slice(0, 6).map((currentTag) => (
                                        <button
                                            key={currentTag}
                                            type="button"
                                            onClick={() => setTag(currentTag)}
                                            className={`rounded-lg px-4 py-2 text-sm font-medium transition-all duration-200 ${
                                                tag === currentTag
                                                    ? "bg-slate-900 text-white shadow-md dark:bg-slate-100 dark:text-slate-900"
                                                    : "bg-white text-slate-700 hover:bg-slate-100 border border-slate-300 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600 dark:border-slate-600"
                                            }`}
                                        >
                                            {currentTag === "all" ? t("articles.list.allTags", "All") : currentTag}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Results Count */}
                            <div className="text-center">
                                <p className="text-sm text-slate-600 dark:text-slate-400">
                                    {filteredArticles.length === stats.total
                                        ? `${stats.total} ${t("articles.stats.articles", "articles")}`
                                        : `${filteredArticles.length} ${t("articles.results.of", "of")} ${stats.total} ${t("articles.stats.articles", "articles")}`
                                    }
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Main Content */}
            <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
                {/* Fallback Notice */}
                {usingFallback && !loading && publishedArticles.length === 0 && (
                    <div className="mb-8 rounded-xl border border-amber-200 bg-amber-50/80 p-4 text-sm text-amber-900 shadow-sm dark:border-amber-800/50 dark:bg-amber-950/30 dark:text-amber-200">
                        <div className="flex items-center gap-3">
                            <FiTrendingUp className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                            <div>
                                <p className="font-medium">{t("articles.list.fallbackNotice", "Content in Development")}</p>
                                <p className="mt-1 text-amber-800 dark:text-amber-300">
                                    {t("articles.list.fallbackSubtitle", "Our editorial team is preparing fresh agricultural content. Showing trusted field guides in the meantime.")}
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Loading State */}
                {loading ? (
                    <LoadingSpinner text={t("articles.loading", "Loading articles...")} />
                ) : (
                    <>
                        {/* Articles Grid */}
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

                        {filteredArticles.length > 0 && (
                            <div className="mt-10">
                                <Pagination
                                    currentPage={clampedPage}
                                    totalPages={totalPages}
                                    totalItems={filteredArticles.length}
                                    rangeStart={filteredArticles.length ? startIndex + 1 : 0}
                                    rangeEnd={Math.min(endIndex, filteredArticles.length)}
                                    onPageChange={(page) => setCurrentPage(Math.min(Math.max(1, page), totalPages))}
                                    hideOnSinglePage={false}
                                    showInfo={false}
                                />
                            </div>
                        )}

                        {/* Empty States */}
                        {!loading && publishedArticles.length === 0 && (
                            <div className="text-center py-16">
                                <div className="mx-auto w-20 h-20 rounded-xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center mb-6">
                                    <FiBookOpen className="w-10 h-10 text-slate-400 dark:text-slate-500" />
                                </div>
                                <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-3">
                                    {t("articles.empty.title", "Articles Coming Soon")}
                                </h3>
                                <p className="text-slate-600 dark:text-slate-400 max-w-md mx-auto">
                                    {t("articles.empty.subtitle", "We're preparing comprehensive agricultural resources and expert insights. Check back soon for valuable farming knowledge.")}
                                </p>
                            </div>
                        )}

                        {!loading && publishedArticles.length > 0 && !filteredArticles.length && (
                            <div className="text-center py-16">
                                <div className="mx-auto w-20 h-20 rounded-xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center mb-6">
                                    <FiSearch className="w-10 h-10 text-slate-400 dark:text-slate-500" />
                                </div>
                                <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-3">
                                    {t("articles.search.empty.title", "No Articles Found")}
                                </h3>
                                <p className="text-slate-600 dark:text-slate-400 max-w-md mx-auto mb-6">
                                    {t("articles.search.empty.subtitle", "Try adjusting your search terms or browse all available topics.")}
                                </p>
                                <button
                                    onClick={() => {
                                        setTag("all");
                                    }}
                                    className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-6 py-2 text-sm font-medium text-white transition-colors hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200"
                                >
                                    <FiFilter className="h-4 w-4" />
                                    {t("articles.search.clear", "Clear Filters")}
                                </button>
                            </div>
                        )}
                    </>
                )}
            </main>

            {/* Footer */}
            <Footer />
        </div>
    );
};

export default ArticlesList;

