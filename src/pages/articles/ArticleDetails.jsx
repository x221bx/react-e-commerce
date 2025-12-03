import React, { useMemo, useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import { selectCurrentUser } from "../../features/auth/authSlice";
import { UseTheme } from "../../theme/ThemeProvider";
import { useArticle } from "../../hooks/useArticle";
import useUserFavoriteIds from "../../hooks/useUserFavoriteIds";
import useArticleLikes from "../../hooks/useArticleLikes";
import { removeArticleFavorite, saveArticleFavorite, incrementArticleViews } from "../../services/articlesService";
import toast from "react-hot-toast";
import { localizeArticleRecord } from "../../data/articles";
import { FiShare2, FiUser, FiBookmark, FiThumbsUp, FiThumbsDown } from "react-icons/fi";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import ErrorMessage from "../../components/ui/ErrorMessage";
import Footer from "../../Authcomponents/Footer";

const ArticleDetails = () => {
    const { articleId } = useParams();
    const { t, i18n } = useTranslation();
    const user = useSelector(selectCurrentUser);
    const { article, loading, notFound } = useArticle(articleId);
    const favoriteIds = useUserFavoriteIds(user?.uid);
    const isFavorite = favoriteIds.includes(article?.id);
    const { isLiked, isDisliked, handleLike, handleDislike, canInteract } = useArticleLikes(article?.id);
    const locale = i18n.language || "en";
    const localizedArticle = useMemo(
        () => (article ? localizeArticleRecord(article, locale) : null),
        [article, locale]
    );

    // Increment views when article loads
    useEffect(() => {
        if (localizedArticle?.id && !loading) {
            incrementArticleViews(localizedArticle.id).catch(console.error);
        }
    }, [localizedArticle?.id, loading]);

    const handleToggleFavorite = async () => {
        if (!user?.uid) {
            toast.error(t("articles.detail.authNeeded", "Sign in to save articles"));
            return;
        }
        const articleId = article?.id;
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
            <div className="flex min-h-screen items-center justify-center">
                <LoadingSpinner />
            </div>
        );
    }

    if (notFound || !localizedArticle) {
        return <ErrorMessage text={t("articles.detail.notFound", "Article not found")} />;
    }

    // Check if article is published (only published articles should be visible to clients, unless admin)
    if (localizedArticle && localizedArticle.status !== 'published' && !user?.isAdmin && !loading) {
        return <ErrorMessage />;
    }

    return (
        <div className="min-h-screen bg-surface text-[var(--text-main)]">
            {/* Article Content */}
            <article className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8 card-surface rounded-[32px] shadow-2xl">
                {/* Hero Image */}
                {localizedArticle?.heroImage && (
                    <div className="mb-12 overflow-hidden rounded-3xl shadow-2xl">
                        <img
                            src={localizedArticle.heroImage}
                            alt={localizedArticle.title}
                            className="h-80 w-full object-cover sm:h-96 lg:h-[500px]"
                        />
                    </div>
                )}

                {/* Article Header */}
                <header className="mb-12">
                    {/* Action Buttons */}
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-4">
                            {/* Like/Dislike Buttons */}
                            {canInteract && (
                                <div className="flex items-center gap-1 bg-slate-50 dark:bg-slate-800 rounded-lg p-1 border border-slate-200 dark:border-slate-700">
                                    <button
                                        onClick={handleLike}
                                        className={`inline-flex items-center gap-1 rounded-md px-3 py-2 text-sm font-medium transition-all ${
                                            isLiked
                                                ? "bg-emerald-100 text-emerald-700 shadow-sm dark:bg-emerald-900/30 dark:text-emerald-300"
                                                : "text-slate-600 hover:bg-white dark:text-slate-400 dark:hover:bg-slate-700"
                                        }`}
                                        aria-label={isLiked ? "Remove like" : "Like this article"}
                                    >
                                        <FiThumbsUp className="h-4 w-4" />
                                        <span>{isLiked ? "Liked" : "Like"}</span>
                                    </button>

                                    <button
                                        onClick={handleDislike}
                                        className={`inline-flex items-center gap-1 rounded-md px-3 py-2 text-sm font-medium transition-all ${
                                            isDisliked
                                                ? "bg-red-100 text-red-700 shadow-sm dark:bg-red-900/30 dark:text-red-300"
                                                : "text-slate-600 hover:bg-white dark:text-slate-400 dark:hover:bg-slate-700"
                                        }`}
                                        aria-label={isDisliked ? "Remove dislike" : "Dislike this article"}
                                    >
                                        <FiThumbsDown className="h-4 w-4" />
                                        <span>{isDisliked ? "Disliked" : "Dislike"}</span>
                                    </button>
                                </div>
                            )}

                            <button
                                onClick={() => {
                                    if (navigator.share) {
                                        navigator.share({
                                            title: localizedArticle?.title,
                                            url: window.location.href,
                                        });
                                    }
                                }}
                                className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 border border-slate-200 dark:text-slate-400 dark:hover:bg-slate-800 dark:border-slate-700 transition-colors"
                                title={t("articles.detail.share", "Share Article")}
                                aria-label="Share this article"
                            >
                                <FiShare2 className="h-4 w-4" />
                                {t("articles.detail.share", "Share")}
                            </button>
                        </div>

                        {/* Save Button */}
                        {user && (
                            <button
                                onClick={handleToggleFavorite}
                                className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all shadow-sm ${
                                    isFavorite
                                        ? "bg-amber-100 text-amber-700 border border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800"
                                        : "bg-slate-100 text-slate-700 border border-slate-200 hover:bg-white dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700 dark:hover:bg-slate-700"
                                }`}
                                aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
                            >
                                {isFavorite ? (
                                    <>
                                        <FiBookmark className="h-4 w-4 fill-current" />
                                        {t("articles.detail.saved", "Saved")}
                                    </>
                                ) : (
                                    <>
                                        <FiBookmark className="h-4 w-4" />
                                        {t("articles.detail.save", "Save")}
                                    </>
                                )}
                            </button>
                        )}
                    </div>

                    {/* Category Badge */}
                    <div className="mb-6 text-center">
            <span className="inline-flex items-center gap-2 rounded-full bg-emerald-100 px-4 py-2 text-sm font-medium text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300">
              <FiUser className="h-4 w-4" />
                {localizedArticle?.tag || t("articles.tag.insights", "Insights")}
            </span>
                    </div>

                    {/* Title */}
                    <h1 className="text-4xl font-bold text-slate-900   sm:text-5xl lg:text-6xl leading-tight mb-6 text-center">
                        {localizedArticle?.title}
                    </h1>


                    {/* Summary */}
                    {localizedArticle?.summary && (
                        <div className="max-w-3xl mx-auto text-center">
                            <p className="text-xl leading-relaxed text-slate-600 dark:text-slate-300">
                                {localizedArticle.summary}
                            </p>
                        </div>
                    )}
                </header>

                {/* Article Body */}
                <div className="prose prose-xl max-w-none prose-headings:text-slate-900 prose-headings:  prose-p:text-slate-700 prose-p:dark:text-slate-300 prose-strong:text-slate-900 prose-strong:  prose-a:text-emerald-600 prose-a:dark:text-emerald-400 prose-blockquote:border-emerald-200 prose-blockquote:dark:border-emerald-800 prose-code:bg-slate-100 prose-code:dark:bg-slate-800 prose-pre:bg-slate-900 prose-pre:dark:bg-slate-950 mb-16">
                    {localizedArticle?.content ? (
                        localizedArticle.content.split("\n\n").map((paragraph, index) => (
                            <p key={index} className="mb-8 leading-relaxed text-lg">
                                {paragraph}
                            </p>
                        ))
                    ) : (
                        <div className="text-center py-20">
                            <div className="mx-auto w-20 h-20 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-6">
                                <FiBookmark className="w-10 h-10 text-slate-400 dark:text-slate-500" />
                            </div>
                            <h3 className="text-xl font-semibold text-slate-600 dark:text-slate-400 mb-2">
                                {t("articles.detail.emptyContent", "Article content is being prepared.")}
                            </h3>
                            <p className="text-slate-500 dark:text-slate-500">
                                Check back soon for updates!
                            </p>
                        </div>
                    )}
                </div>

                {/* Related Articles Section */}
                <div className="bg-gradient-to-r from-emerald-50 to-blue-50 dark:from-slate-800 dark:to-slate-700 rounded-2xl p-8 shadow-lg border border-emerald-200 dark:border-slate-600 mb-16">
                    <div className="text-center">
                        <h3 className="text-2xl font-bold text-slate-900   mb-4">
                            Discover More Articles
                        </h3>
                        <p className="text-slate-600 dark:text-slate-300 mb-6">
                            Continue your learning journey with related content
                        </p>
                        <Link
                            to="/articles"
                            className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-8 py-4 text-lg font-semibold text-white shadow-lg hover:bg-emerald-600 transition-all transform hover:scale-105"
                        >
                            <FiBookmark className="h-5 w-5" />
                            Browse All Articles
                        </Link>
                    </div>
                </div>
            </article>

            {/* Footer */}
            <Footer />
        </div>
    );
};

export default ArticleDetails;




