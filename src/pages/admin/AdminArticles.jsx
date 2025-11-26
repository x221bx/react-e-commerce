import React, { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import useArticles from "../../hooks/useArticles";
import { articleLibrary } from "../../data/articles";
import {
  createArticle,
  deleteArticle,
  updateArticle,
} from "../../services/articlesService";
import { UseTheme } from "../../theme/ThemeProvider";

const defaultForm = {
  title: "",
  summary: "",
  tag: "Insights",
  readTime: "5 min",
  heroImage: "",
  content: "",
  featureHome: false,
  featureAccount: true,
  titleAr: "",
  summaryAr: "",
  contentAr: "",
};

const generateAiDraft = (topic) => {
  const safeTopic = topic || "smart farming";
  return {
    summary: `Key steps to improve ${safeTopic.toLowerCase()} using data-driven routines.`,
    content: [
      `### Why ${safeTopic} matters`,
      "Blend field observations with weather intel to prioritize tasks each week.",
      "",
      "### Actionable checklist",
      "- Inspect soil moisture at sunrise.",
      "- Rotate grazing before forage drops under 3 inches.",
      "- Capture photos for before/after comparisons.",
      "",
      "### Final thoughts",
      "Small daily actions compound into resilient herds and healthier crops.",
    ].join("\n"),
  };
};

const buildTranslationsFromForm = ({ titleAr, summaryAr, contentAr }) => {
  const hasArabic = [titleAr, summaryAr, contentAr].some((value) => value && value.trim().length);
  if (!hasArabic) return {};
  return {
    ar: {
      title: titleAr?.trim(),
      summary: summaryAr?.trim(),
      content: contentAr?.trim(),
    },
  };
};

const AdminArticles = () => {
  const { t } = useTranslation();
  const { theme } = UseTheme(); // ← HERE
  const { articles } = useArticles();

  const [form, setForm] = useState(defaultForm);
  const [editingId, setEditingId] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [seeding, setSeeding] = useState(false);

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleGenerate = () => {
    const draft = generateAiDraft(form.tag);
    setForm((prev) => ({
      ...prev,
      summary: prev.summary || draft.summary,
      content: prev.content || draft.content,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    try {
      const { titleAr, summaryAr, contentAr, ...rest } = form;
      const translations = buildTranslationsFromForm({ titleAr, summaryAr, contentAr });
      const payload = {
        ...rest,
        ...(Object.keys(translations).length ? { translations } : {}),
      };
      if (editingId) {
        await updateArticle(editingId, payload);
        toast.success("Article updated");
      } else {
        await createArticle(payload);
        toast.success("Article created");
      }
      setForm(defaultForm);
      setEditingId(null);
    } catch (error) {
      console.error(error);
      toast.error("Unable to save article");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (article) => {
    setEditingId(article.id);
    const arabic = article.translations?.ar || {};
    setForm({
      title: article.title,
      summary: article.summary,
      tag: article.tag,
      readTime: article.readTime,
      heroImage: article.heroImage || "",
      content: article.content || "",
      featureHome: !!article.featureHome,
      featureAccount: article.featureAccount !== false,
      titleAr: arabic.title || "",
      summaryAr: arabic.summary || "",
      contentAr: arabic.content || "",
    });
  };

  const handleDelete = async (articleId) => {
    if (!window.confirm("Delete this article?")) return;
    await deleteArticle(articleId);
    toast.success("Article deleted");
    if (editingId === articleId) {
      setEditingId(null);
      setForm(defaultForm);
    }
  };

  const handleSeedStarterArticles = async () => {
    if (articles.length > 0) return;
    setSeeding(true);
    try {
      for (const entry of articleLibrary.slice(0, 10)) {
        await createArticle({
          title: entry.title,
          summary: entry.summary,
          tag: entry.tag,
          readTime: entry.readTime,
          heroImage: entry.heroImage,
          content: entry.content,
          featureHome: entry.featureHome,
          featureAccount: entry.featureAccount,
          author: entry.author,
          translations: entry.translations,
        });
      }
      toast.success(t("articles.admin.seedSuccess", "Starter articles published"));
    } catch (error) {
      console.error(error);
      toast.error(t("articles.admin.seedError", "Unable to import starter articles."));
    } finally {
      setSeeding(false);
    }
  };

  const sortedArticles = useMemo(
    () =>
      [...articles].sort(
        (a, b) => (b.updatedAt?.seconds || 0) - (a.updatedAt?.seconds || 0)
      ),
    [articles]
  );

  return (
    <div className={theme === "dark" ? "dark" : ""}>
      <div className="space-y-8">
        <header>
          <p className="text-sm font-semibold uppercase tracking-wide text-emerald-500">
            {t("articles.admin.eyebrow", "Knowledge center")}
          </p>

          <h1 className="text-3xl font-semibold text-slate-900 dark:text-white">
            {t("articles.admin.title", "Manage Articles")}
          </h1>

          <p className="mt-2 text-sm text-slate-500 dark:text-slate-300">
            {t(
              "articles.admin.subtitle",
              "Publish updates for the community or auto-fill content with the AI draft helper."
            )}
          </p>

          {articles.length === 0 && (
            <button
              type="button"
              onClick={handleSeedStarterArticles}
              disabled={seeding}
              className="mt-4 inline-flex items-center rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-100 disabled:opacity-50 dark:border-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200"
            >
              {seeding
                ? t("articles.admin.seedLoading", "Publishing starter pack...")
                : t("articles.admin.seedButton", "Load starter articles")}
            </button>
          )}
        </header>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* FORM */}
          <form
            onSubmit={handleSubmit}
            className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
                {editingId ? "Edit article" : "New article"}
              </h2>

              <button
                type="button"
                onClick={handleGenerate}
                className="rounded-2xl border border-emerald-200 px-3 py-1 text-xs font-semibold text-emerald-600 hover:bg-emerald-50 dark:border-emerald-700 dark:text-emerald-200 dark:hover:bg-emerald-900/30"
              >
                {t("articles.admin.generate", "Generate with AI")}
              </button>
            </div>

            <div className="mt-4 space-y-4 text-sm">
              <input
                type="text"
                name="title"
                value={form.title}
                onChange={handleChange}
                placeholder="Article title"
                className="w-full rounded-2xl border border-slate-200 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-400 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                required
              />

              <textarea
                name="summary"
                value={form.summary}
                onChange={handleChange}
                placeholder="Short summary"
                rows={2}
                className="w-full rounded-2xl border border-slate-200 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-400 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                required
              />

              <input
                type="text"
                name="heroImage"
                value={form.heroImage}
                onChange={handleChange}
                placeholder="Hero image URL"
                className="w-full rounded-2xl border border-slate-200 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-400 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />

              <div className="grid gap-4 md:grid-cols-2">
                <input
                  type="text"
                  name="tag"
                  value={form.tag}
                  onChange={handleChange}
                  placeholder="Tag (e.g., Livestock)"
                  className="rounded-2xl border border-slate-200 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-400 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />

                <input
                  type="text"
                  name="readTime"
                  value={form.readTime}
                  onChange={handleChange}
                  placeholder="Read time"
                  className="rounded-2xl border border-slate-200 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-400 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <textarea
                name="content"
                value={form.content}
                onChange={handleChange}
                placeholder="Body content (Markdown supported)"
                rows={8}
                className="w-full rounded-2xl border border-slate-200 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-400 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />

              {/* ARABIC BLOCK */}
              <div className="rounded-2xl border border-slate-200 p-4 dark:border-slate-700 dark:bg-slate-800">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-300">
                  {t("articles.admin.arabicBlock", "Arabic translation (optional)")}
                </p>

                <div className="mt-3 space-y-3 text-sm">
                  <input
                    type="text"
                    name="titleAr"
                    value={form.titleAr}
                    onChange={handleChange}
                    placeholder={t("articles.admin.titleAr", "Arabic title")}
                    className="w-full rounded-2xl border border-slate-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-400 dark:border-slate-600 dark:bg-slate-900 dark:text-white"
                  />

                  <textarea
                    name="summaryAr"
                    value={form.summaryAr}
                    onChange={handleChange}
                    placeholder={t("articles.admin.summaryAr", "Arabic summary")}
                    rows={2}
                    className="w-full rounded-2xl border border-slate-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-400 dark:border-slate-600 dark:bg-slate-900 dark:text-white"
                  />

                  <textarea
                    name="contentAr"
                    value={form.contentAr}
                    onChange={handleChange}
                    placeholder={t("articles.admin.contentAr", "Arabic body content")}
                    rows={4}
                    className="w-full rounded-2xl border border-slate-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-400 dark:border-slate-600 dark:bg-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="flex flex-wrap gap-4 text-xs font-semibold text-slate-600 dark:text-slate-300">
                <label className="inline-flex items-center gap-2">
                  <input
                    type="checkbox"
                    name="featureHome"
                    checked={form.featureHome}
                    onChange={handleChange}
                  />
                  {t("articles.admin.featureHome", "Feature on home page")}
                </label>

                <label className="inline-flex items-center gap-2">
                  <input
                    type="checkbox"
                    name="featureAccount"
                    checked={form.featureAccount}
                    onChange={handleChange}
                  />
                  {t("articles.admin.featureAccount", "Recommend inside account hub")}
                </label>
              </div>

              <div className="flex gap-3">
                {editingId && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditingId(null);
                      setForm(defaultForm);
                    }}
                    className="rounded-2xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
                  >
                    {t("articles.admin.cancel", "Cancel")}
                  </button>
                )}

                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center rounded-2xl bg-emerald-500 px-5 py-2 text-sm font-semibold text-white shadow hover:bg-emerald-600 disabled:opacity-70"
                >
                  {submitting
                    ? t("articles.admin.saving", "Saving...")
                    : editingId
                    ? t("articles.admin.update", "Update")
                    : t("articles.admin.publish", "Publish")}
                </button>
              </div>
            </div>
          </form>

          {/* LIST */}
          <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
              {t("articles.admin.catalog", "Published articles")}
            </h2>

            <div className="mt-4 space-y-4">
              {sortedArticles.map((article) => (
                <div
                  key={article.id}
                  className="rounded-2xl border border-slate-200 p-4 dark:border-slate-700"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-slate-900 dark:text-white">
                        {article.title}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {article.tag} • {article.readTime}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-2 text-xs">
                      <span
                        className={`rounded-full px-3 py-1 font-semibold ${
                          article.featureHome
                            ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-200"
                            : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-200"
                        }`}
                      >
                        Home
                      </span>

                      <span
                        className={`rounded-full px-3 py-1 font-semibold ${
                          article.featureAccount
                            ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-200"
                            : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-200"
                        }`}
                      >
                        Account
                      </span>
                    </div>
                  </div>

                  <p className="mt-2 text-sm text-slate-500 dark:text-slate-300 line-clamp-2">
                    {article.summary}
                  </p>

                  <div className="mt-4 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => handleEdit(article)}
                      className="rounded-2xl border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
                    >
                      {t("articles.admin.edit", "Edit")}
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDelete(article.id)}
                      className="rounded-2xl border border-red-200 px-3 py-1 text-xs font-semibold text-red-600 hover:bg-red-50 dark:border-red-800 dark:text-red-200 dark:hover:bg-red-900/40"
                    >
                      {t("articles.admin.delete", "Delete")}
                    </button>
                  </div>
                </div>
              ))}

              {!sortedArticles.length && (
                <p className="text-sm text-slate-500 dark:text-slate-300">
                  {t("articles.admin.empty", "No articles published yet.")}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminArticles;
