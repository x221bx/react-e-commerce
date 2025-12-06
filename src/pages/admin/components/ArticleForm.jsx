import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { translateText } from "../../../utils/aiHelpers";
import toast from "react-hot-toast";
import ArticleFormHeader from "./ArticleFormHeader";
import ArticleFormTabs from "./ArticleFormTabs";
import ArticleFormContent from "./ArticleFormContent";

const ArticleForm = ({
  form,
  editingId,
  activeTab,
  setShowPreview,
  handleChange,
  handleGenerateTitle,
  handleGenerateSummary,
  handleRewrite,
  handleImageDrop,
  handleSubmit,
  submitting,
  aiTopics,
  aiTopic,
  setAiTopic,
  aiLines,
  setAiLines,
  productContext,
  setProductContext,
  handleGenerate,
  seoSuggestions,
  handleGenerateSEO,
  generatingSEO,
  aiDrafting,
  aiReview,
  handleAiReview,
  reviewing,
  setActiveTab,
  setEditingId,
  setForm,
  defaultForm,
  setAiReview,
  setSuggestedProducts,
  setSelectedProducts,
  setSeoSuggestions,
}) => {
  const { t } = useTranslation();
  const [uploadingImage, setUploadingImage] = useState(false);
  const [translating, setTranslating] = useState(false);
  const [seoSynced, setSeoSynced] = useState(Boolean(seoSuggestions));
  const hasTranslatableSource = Boolean(
    form.content?.trim() || form.summary?.trim() || form.title?.trim(),
  );
  const sanitizeGeneratedBlock = (value) =>
    value
      ?.replace(/^#{1,6}\s*/gm, "")
      .replace(/\n{3,}/g, "\n\n")
      .trim() || "";
  const showScheduler = form.status === "scheduled";
  const nowIso = new Date().toISOString().slice(0, 16);
  const primaryCtaLabel = submitting
    ? showScheduler
      ? "Scheduling..."
      : "Saving..."
    : editingId
    ? showScheduler
      ? "Update Schedule"
      : "Update Article"
    : showScheduler
    ? "Schedule Article"
    : "Publish Article";
  const seoButtonLabel = generatingSEO
    ? "Generating SEO..."
    : seoSynced
    ? "Refresh AI SEO"
    : "Generate AI SEO";
  useEffect(() => {
    setSeoSynced(Boolean(seoSuggestions));
  }, [seoSuggestions]);

  const hasQualityScore = typeof aiReview?.score === "number";
  const hasSeoScore = typeof aiReview?.seo_score === "number";
  const hasContentScore = typeof aiReview?.content_score === "number";
  const hasAnyScores = hasQualityScore || hasSeoScore || hasContentScore;
  const reviewSuggestions = Array.isArray(aiReview?.suggestions)
    ? aiReview.suggestions
    : [];
  const reviewIssues = Array.isArray(aiReview?.issues) ? aiReview.issues : [];
  const handleTranslateToArabic = async () => {
    if (!hasTranslatableSource) {
      toast.error("Add English content before translating");
      return;
    }
    setTranslating(true);
    const translateField = (value) =>
      value?.trim()
        ? translateText({ text: value, targetLang: "ar" })
        : Promise.resolve("");
    try {
      const [contentAr, summaryAr, titleAr] = await Promise.all([
        translateField(form.content),
        translateField(form.summary),
        translateField(form.title),
      ]);
      setForm((prev) => ({
        ...prev,
        ...(contentAr ? { contentAr: sanitizeGeneratedBlock(contentAr) } : {}),
        ...(summaryAr ? { summaryAr: sanitizeGeneratedBlock(summaryAr) } : {}),
        ...(titleAr ? { titleAr: sanitizeGeneratedBlock(titleAr) } : {}),
      }));
      toast.success("Content translated to Arabic!");
    } catch (error) {
      toast.error("Failed to translate content");
    } finally {
      setTranslating(false);
    }
  };
  const handleSeoClick = async () => {
    const success = await handleGenerateSEO();
    if (success) setSeoSynced(true);
  };
  return (
    <div className="lg:col-span-2">
      <form
        onSubmit={handleSubmit}
        className="card-surface rounded-3xl border border-muted shadow-sm"
      >
        <ArticleFormHeader
          editingId={editingId}
          setShowPreview={setShowPreview}
          setEditingId={setEditingId}
          setForm={setForm}
          defaultForm={defaultForm}
          setAiReview={setAiReview}
          setSuggestedProducts={setSuggestedProducts}
          setSelectedProducts={setSelectedProducts}
          setSeoSuggestions={setSeoSuggestions}
        />
        <ArticleFormTabs activeTab={activeTab} setActiveTab={setActiveTab} />
        <div className="p-6">
          {activeTab === "content" && (
            <ArticleFormContent
              form={form}
              handleChange={handleChange}
              handleGenerateTitle={handleGenerateTitle}
              handleGenerateSummary={handleGenerateSummary}
              handleRewrite={handleRewrite}
              handleImageDrop={handleImageDrop}
              showScheduler={showScheduler}
              nowIso={nowIso}
              uploadingImage={uploadingImage}
              setUploadingImage={setUploadingImage}
              aiDrafting={aiDrafting}
            />
          )}
          {activeTab === "ai" && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-2 rounded-xl border border-muted bg-panel p-3 text-xs text-[var(--text-main)] shadow-sm">
                <label className="flex flex-col gap-1">
                  <span className="font-semibold">
                    {t("articles.admin.aiTopic", "Topic focus")}
                  </span>
                  <select
                    value={aiTopic}
                    onChange={(e) => setAiTopic(e.target.value)}
                    className="rounded-lg border border-muted bg-surface px-2 py-2 text-sm"
                  >
                    <option value="" disabled>
                      {t("articles.admin.selectTopic", "Select a topic")}
                    </option>
                    {aiTopics.map((topic) => (
                      <option key={topic.value} value={topic.value}>
                        {topic.label}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="flex flex-col gap-1">
                  <span className="font-semibold">
                    {t("articles.admin.aiLines", "Summary lines")}
                  </span>
                  <input
                    type="number"
                    min={3}
                    max={12}
                    value={aiLines}
                    onChange={(e) => setAiLines(Number(e.target.value) || 5)}
                    className="rounded-lg border border-muted bg-surface px-2 py-2 text-sm"
                  />
                </label>
                <label className="col-span-2 flex flex-col gap-1">
                  <span className="font-semibold">
                    {t(
                      "articles.admin.productContext",
                      "Product name / context",
                    )}
                  </span>
                  <input
                    type="text"
                    value={productContext}
                    onChange={(e) => setProductContext(e.target.value)}
                    placeholder={t(
                      "articles.admin.productPlaceholder",
                      "Enter the product or crop name",
                    )}
                    className="w-full rounded-lg border border-muted bg-surface px-3 py-2 text-sm"
                  />
                </label>
                <p className="col-span-2 text-[11px] text-[var(--text-muted)]">
                  {t(
                    "articles.admin.helper",
                    "AI will generate content based on the product and topic selected.",
                  )}
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleGenerate}
                  disabled={aiDrafting}
                  className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-500 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-600 disabled:opacity-60"
                >
                  {aiDrafting ? "..." : "AI"}{" "}
                  {t("articles.admin.generate", "Generate with AI")}
                </button>
                <button
                  type="button"
                  onClick={handleTranslateToArabic}
                  disabled={!hasTranslatableSource || translating}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-purple-500 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-purple-600 disabled:opacity-50"
                >
                  {translating ? "Translating..." : "Translate to Arabic"}
                </button>
              </div>
            </div>
          )}
          {activeTab === "seo" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">SEO Optimization</h3>
                <button
                  type="button"
                  onClick={handleSeoClick}
                  disabled={generatingSEO || !form.title}
                  className="inline-flex items-center gap-2 rounded-lg bg-blue-500 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-blue-600 disabled:opacity-50"
                >
                  {generatingSEO ? "⏳" : "⚡"} {seoButtonLabel}
                </button>
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">
                  SEO Description
                </label>
                <textarea
                  name="seoDescription"
                  value={form.seoDescription}
                  onChange={handleChange}
                  placeholder="Meta description for search engines (150-160 characters)"
                  rows={3}
                  className="w-full rounded-lg border border-muted bg-panel px-4 py-3 text-[var(--text-main)] focus:outline-none focus:ring-2 focus:ring-emerald-400"
                />
                <p className="text-xs text-[var(--text-muted)] mt-1">
                  {form.seoDescription.length}/160 characters
                </p>
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">
                  Keywords
                </label>
                <input
                  type="text"
                  name="keywords"
                  value={form.keywords}
                  onChange={handleChange}
                  placeholder="Comma-separated keywords"
                  className="w-full rounded-lg border border-muted bg-panel px-4 py-3 text-[var(--text-main)] focus:outline-none focus:ring-2 focus:ring-emerald-400"
                />
              </div>
              {seoSuggestions && (
                <div className="rounded-lg border border-blue-200 bg-blue-50 dark:bg-blue-900/20 p-4">
                  <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-3">
                    AI SEO Suggestions
                  </h4>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm font-medium text-blue-700 dark:text-blue-300">
                        Suggested Meta Description:
                      </p>
                      <p className="text-sm text-blue-600 dark:text-blue-400 mt-1 p-2 bg-white dark:bg-slate-800 rounded">
                        {seoSuggestions.metaDescription}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-blue-700 dark:text-blue-300">
                        Suggested Keywords:
                      </p>
                      <p className="text-sm text-blue-600 dark:text-blue-400 mt-1 p-2 bg-white dark:bg-slate-800 rounded">
                        {seoSuggestions.keywords}
                      </p>
                    </div>
                    {seoSuggestions.suggestions?.length > 0 && (
                      <div>
                        <p className="text-sm font-medium text-blue-700 dark:text-blue-300">
                          SEO Tips:
                        </p>
                        <ul className="text-sm text-blue-600 dark:text-blue-400 mt-1 space-y-1">
                          {seoSuggestions.suggestions.map((tip, i) => (
                            <li key={i} className="flex items-start gap-2">
                              <span>•</span>
                              <span>{tip}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
          {activeTab === "review" && (
            <div className="space-y-4">
              {aiReview ? (
                <div className="space-y-4">
                  {aiReview.error && (
                    <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
                      {aiReview.message ||
                        "AI review unavailable. Please try again with a valid OpenRouter key and network connection."}
                    </div>
                  )}

                  {hasAnyScores ? (
                    <div className="grid gap-4 md:grid-cols-3">
                      {hasQualityScore && (
                        <div className="p-4 bg-blue-50 rounded-lg">
                          <h4 className="font-semibold text-blue-800">
                            Quality Score
                          </h4>
                          <div className="text-2xl font-bold text-blue-600">
                            {aiReview.score}/100
                          </div>
                        </div>
                      )}
                      {hasSeoScore && (
                        <div className="p-4 bg-green-50 rounded-lg">
                          <h4 className="font-semibold text-green-800">
                            SEO Score
                          </h4>
                          <div className="text-2xl font-bold text-green-600">
                            {aiReview.seo_score}/100
                          </div>
                        </div>
                      )}
                      {hasContentScore && (
                        <div className="p-4 bg-purple-50 rounded-lg">
                          <h4 className="font-semibold text-purple-800">
                            Content Score
                          </h4>
                          <div className="text-2xl font-bold text-purple-600">
                            {aiReview.content_score}/100
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    !aiReview.error && (
                      <div className="rounded-lg border border-muted bg-panel p-3 text-sm text-[var(--text-muted)]">
                        No numeric scores returned. Rerun AI review after checking the article length and API key.
                      </div>
                    )
                  )}

                  {reviewSuggestions.length > 0 && (
                    <div>
                      <h4 className="font-semibold mb-2">Suggestions</h4>
                      <ul className="space-y-1">
                        {reviewSuggestions.map((suggestion, i) => (
                          <li
                            key={i}
                            className="text-sm text-[var(--text-muted)]"
                          >
                            - {suggestion}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {reviewIssues.length > 0 && (
                    <div>
                      <h4 className="font-semibold mb-2 text-red-600">
                        Issues Found
                      </h4>
                      <ul className="space-y-1">
                        {reviewIssues.map((issue, i) => (
                          <li key={i} className="text-sm text-red-600">
                            - {issue}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-[var(--text-muted)]">
                    Click "AI Review" to get feedback on your content.
                  </p>
                </div>
              )}
            </div>
          )}
          {/* Tab-Specific Form Actions */}
          <div className="flex gap-3 pt-6 border-t border-muted">
            {activeTab === "content" && (
              <>
                <button
                  type="button"
                  onClick={() => {
                    setForm(defaultForm);
                    setAiReview(null);
                    setSuggestedProducts?.([]);
                    setSelectedProducts?.([]);
                    setSeoSuggestions(null);
                    setEditingId(null);
                    toast.success("Form cleared successfully");
                  }}
                  className="inline-flex items-center gap-2 rounded-lg bg-red-500 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-red-600"
                >
                  🗑️ Clear Form
                </button>
                {editingId && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditingId(null);
                      setForm(defaultForm);
                      setAiReview(null);
                      setSuggestedProducts?.([]);
                      setSelectedProducts?.([]);
                      setSeoSuggestions(null);
                    }}
                    className="rounded-lg border border-muted px-4 py-2 text-sm font-semibold text-[var(--text-main)] hover:bg-panel"
                  >
                    Cancel
                  </button>
                )}
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 inline-flex items-center justify-center rounded-lg bg-emerald-500 px-5 py-2 text-sm font-semibold text-white shadow hover:bg-emerald-600 disabled:opacity-70"
                >
                  {primaryCtaLabel}
                </button>
              </>
            )}
            {activeTab === "seo" && (
              <>
                <button
                  type="button"
                  onClick={() => setActiveTab("content")}
                  className="rounded-lg border border-muted px-4 py-2 text-sm font-semibold text-[var(--text-main)] hover:bg-panel"
                >
                  Back to Content
                </button>
                <button
                  type="button"
                  onClick={handleSeoClick}
                  disabled={generatingSEO || !form.title}
                  className="flex-1 inline-flex items-center justify-center rounded-lg bg-blue-500 px-5 py-2 text-sm font-semibold text-white shadow hover:bg-blue-600 disabled:opacity-50"
                >
                  {generatingSEO ? "Generating SEO..." : seoButtonLabel}
                </button>
              </>
            )}
            {activeTab === "review" && (
              <>
                <button
                  type="button"
                  onClick={() => setActiveTab("content")}
                  className="rounded-lg border border-muted px-4 py-2 text-sm font-semibold text-[var(--text-main)] hover:bg-panel"
                >
                  Back to Content
                </button>
                <button
                  type="button"
                  onClick={handleAiReview}
                  disabled={reviewing || !form.content}
                  className="flex-1 inline-flex items-center justify-center rounded-lg bg-blue-500 px-5 py-2 text-sm font-semibold text-white shadow hover:bg-blue-600 disabled:opacity-50"
                >
                  {reviewing ? "Reviewing..." : "Run AI Review"}
                </button>
              </>
            )}
          </div>
        </div>
      </form>
    </div>
  );
};

export default ArticleForm;
