import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import ReactMarkdown from "react-markdown";
import { uploadImage } from "../../../services/firebase";
import { generateAiDraft, translateText } from "../../../utils/aiHelpers";
import toast from "react-hot-toast";
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
      console.error("Translation error:", error);
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
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-6 border-b border-muted">
          <div>
            <h2 className="text-xl font-semibold">
              {editingId
                ? t("articles.admin.editing", "Edit article")
                : t("articles.admin.new", "New article")}
            </h2>
            <p className="text-sm text-[var(--text-muted)]">
              {t(
                "articles.admin.fillFields",
                "Create comprehensive articles with AI assistance and product integration.",
              )}
            </p>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setShowPreview(true)}
              className="rounded-xl border border-blue-200 px-3 py-2 text-xs font-semibold text-blue-700 transition hover:bg-blue-50"
            >
              👁️ Preview
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
                className="rounded-xl border border-emerald-200 px-3 py-2 text-xs font-semibold text-emerald-700 transition hover:bg-emerald-50"
              >
                ➕ New Article
              </button>
            )}
          </div>
        </div>
        {/* Tabs */}
        <div className="border-b border-muted">
          <div className="flex">
            {[
              { id: "content", label: "Content", icon: "📝" },
              { id: "ai", label: "AI Tools", icon: "🤖" },
              { id: "seo", label: "SEO", icon: "🔍" },
              { id: "review", label: "AI Review", icon: "⭐" },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition ${
                  activeTab === tab.id
                    ? "border-emerald-500 text-emerald-600"
                    : "border-transparent text-[var(--text-muted)] hover:text-[var(--text-main)]"
                }`}
              >
                {tab.icon} {tab.label}
              </button>
            ))}
          </div>
        </div>
        {/* Tab Content */}
        <div className="p-6">
          {activeTab === "content" && (
            <div className="space-y-6">
              {/* Status and Type */}
              <div className="grid gap-4 md:grid-cols-3">
                <div>
                  <label className="block text-sm font-semibold mb-2">
                    Status
                  </label>
                  <select
                    name="status"
                    value={form.status}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-muted bg-panel px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
                  >
                    <option value="draft">📝 Draft</option>
                    <option value="scheduled">⏰ Scheduled</option>
                    <option value="published">✅ Published</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">
                    Type
                  </label>
                  <select
                    name="articleType"
                    value={form.articleType}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-muted bg-panel px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
                  >
                    <option value="blog">📝 Blog Post</option>
                    <option value="guide">📖 Guide</option>
                    <option value="news">📰 News</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">
                    Difficulty
                  </label>
                  <select
                    name="difficulty"
                    value={form.difficulty}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-muted bg-panel px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
                  >
                    <option value="beginner">🌱 Beginner</option>
                    <option value="intermediate">🌿 Intermediate</option>
                    <option value="advanced">🌳 Advanced</option>
                  </select>
                </div>
              </div>
              {showScheduler && (
                <div className="rounded-2xl border border-dashed border-emerald-200 bg-emerald-50/40 p-4 space-y-2">
                  <label className="block text-sm font-semibold">
                    Publish Date &amp; Time
                  </label>
                  <input
                    type="datetime-local"
                    name="publishDate"
                    value={form.publishDate || ""}
                    min={nowIso}
                    onChange={handleChange}
                    required
                    className="w-full rounded-lg border border-emerald-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
                  />
                  <p className="text-xs text-emerald-800">
                    Scheduled articles will auto-publish at this exact time.
                  </p>
                </div>
              )}
              {/* Basic Fields */}
              <div className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="block text-sm font-semibold mb-2">
                      English Title
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        name="title"
                        value={form.title}
                        onChange={handleChange}
                        placeholder="Article title (English)"
                        className="flex-1 rounded-lg border border-muted bg-panel px-4 py-3 text-[var(--text-main)] focus:outline-none focus:ring-2 focus:ring-emerald-400"
                        required
                      />
                      <button
                        type="button"
                        onClick={handleGenerateTitle}
                        className="px-3 py-3 rounded-lg bg-blue-500 text-white text-sm hover:bg-blue-600"
                        title="Generate AI Title"
                      >
                        🤖
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2">
                      Arabic Title (العنوان بالعربية)
                    </label>
                    <input
                      type="text"
                      name="titleAr"
                      value={form.titleAr}
                      onChange={handleChange}
                      placeholder="العنوان بالعربية"
                      className="w-full rounded-lg border border-muted bg-panel px-4 py-3 text-[var(--text-main)] focus:outline-none focus:ring-2 focus:ring-emerald-400"
                      dir="rtl"
                    />
                  </div>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="block text-sm font-semibold mb-2">
                      English Summary
                    </label>
                    <div className="flex gap-2">
                      <textarea
                        name="summary"
                        value={form.summary}
                        onChange={handleChange}
                        placeholder="Brief summary (appears in previews)"
                        rows={3}
                        className="flex-1 rounded-lg border border-muted bg-panel px-4 py-3 text-[var(--text-main)] focus:outline-none focus:ring-2 focus:ring-emerald-400"
                        required
                      />
                      <button
                        type="button"
                        onClick={handleGenerateSummary}
                        className="px-3 py-3 rounded-lg bg-blue-500 text-white text-sm hover:bg-blue-600 self-start"
                        title="Generate AI Summary"
                      >
                        🤖
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2">
                      Arabic Summary (الملخص بالعربية)
                    </label>
                    <textarea
                      name="summaryAr"
                      value={form.summaryAr}
                      onChange={handleChange}
                      placeholder="الملخص بالعربية"
                      rows={3}
                      className="w-full rounded-lg border border-muted bg-panel px-4 py-3 text-[var(--text-main)] focus:outline-none focus:ring-2 focus:ring-emerald-400"
                      dir="rtl"
                    />
                  </div>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <input
                    type="text"
                    name="author"
                    value={form.author}
                    onChange={handleChange}
                    placeholder="Author name"
                    className="rounded-lg border border-muted bg-panel px-4 py-3 text-[var(--text-main)] focus:outline-none focus:ring-2 focus:ring-emerald-400"
                    required
                  />
                  <input
                    type="text"
                    name="heroImage"
                    value={form.heroImage}
                    onChange={handleChange}
                    placeholder="Hero image URL"
                    className="rounded-lg border border-muted bg-panel px-4 py-3 text-[var(--text-main)] focus:outline-none focus:ring-2 focus:ring-emerald-400"
                  />
                </div>
                <div className="flex flex-wrap items-center gap-3 text-xs text-[var(--text-muted)]">
                  <label className="inline-flex items-center gap-2 rounded-lg border border-muted bg-surface px-3 py-2 text-[var(--text-main)] hover:bg-panel cursor-pointer disabled:opacity-50">
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      disabled={uploadingImage}
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        // التحقق من حجم الصورة (حد أقصى 5MB)
                        if (file.size > 5 * 1024 * 1024) {
                          toast.error("Image size must be less than 5MB");
                          return;
                        }
                        setUploadingImage(true);
                        try {
                          const downloadURL = await uploadImage(
                            file,
                            "articles/",
                          );
                          handleChange({
                            target: { name: "heroImage", value: downloadURL },
                          });
                          toast.success("Image uploaded successfully!");
                        } catch (error) {
                          console.error("Upload error:", error);
                          toast.error("Failed to upload image");
                        } finally {
                          setUploadingImage(false);
                        }
                      }}
                    />
                    {uploadingImage ? "⏳" : "📷"}{" "}
                    {uploadingImage ? "Uploading..." : "Upload image"}
                  </label>
                  {form.heroImage && (
                    <span className="truncate text-[var(--text-main)]">
                      ✅ Image uploaded
                    </span>
                  )}
                </div>
                <select
                  name="tag"
                  value={form.tag}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-muted bg-panel px-4 py-3 text-[var(--text-main)] focus:outline-none focus:ring-2 focus:ring-emerald-400"
                >
                  <option value="Product Usage">Product Usage</option>
                  <option value="Product Combo">Product Combo</option>
                  <option value="Troubleshooting">Troubleshooting</option>
                  <option value="Soil Care">Soil Care</option>
                  <option value="Irrigation">Irrigation</option>
                  <option value="Livestock">Livestock</option>
                  <option value="Analytics">Analytics</option>
                  <option value="Pollination">Pollination</option>
                  <option value="Renewables">Renewables</option>
                  <option value="Implements">Implements</option>
                  <option value="Monitoring">Monitoring</option>
                </select>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="block text-sm font-semibold mb-2">
                      English Content
                    </label>
                    <textarea
                      name="content"
                      value={form.content}
                      onChange={handleChange}
                      onDrop={handleImageDrop}
                      onDragOver={(e) => e.preventDefault()}
                      placeholder="Article content (Markdown supported)"
                      rows={12}
                      className="w-full rounded-lg border border-muted bg-panel px-4 py-3 text-[var(--text-main)] focus:outline-none focus:ring-2 focus:ring-emerald-400 font-mono text-sm"
                    />
                    <div className="flex gap-2 mt-2">
                      <button
                        type="button"
                        onClick={() => handleRewrite("shorter")}
                        className="px-3 py-1 rounded bg-blue-500 text-white text-xs hover:bg-blue-600"
                      >
                        Shorter
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRewrite("longer")}
                        className="px-3 py-1 rounded bg-blue-500 text-white text-xs hover:bg-blue-600"
                      >
                        Longer
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2">
                      Arabic Content (المحتوى بالعربية)
                    </label>
                    <textarea
                      name="contentAr"
                      value={form.contentAr}
                      onChange={handleChange}
                      placeholder="المحتوى بالعربية"
                      rows={12}
                      className="w-full rounded-lg border border-muted bg-panel px-4 py-3 text-[var(--text-main)] focus:outline-none focus:ring-2 focus:ring-emerald-400 font-mono text-sm"
                      dir="rtl"
                    />
                  </div>
                </div>
                {/* Features */}
                <div className="flex flex-wrap gap-4 text-sm">
                  <label className="inline-flex items-center gap-2">
                    <input
                      type="checkbox"
                      name="featureHome"
                      checked={form.featureHome}
                      onChange={handleChange}
                    />
                    🏠 Feature on home page
                  </label>
                </div>
              </div>
            </div>
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
                    required
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
                    required
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
                    required
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
                  className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-500 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-600"
                >
                  ⚡ {t("articles.admin.generate", "Generate with AI")}
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
                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <h4 className="font-semibold text-blue-800">
                        Quality Score
                      </h4>
                      <div className="text-2xl font-bold text-blue-600">
                        {aiReview.score}/100
                      </div>
                    </div>
                    <div className="p-4 bg-green-50 rounded-lg">
                      <h4 className="font-semibold text-green-800">
                        SEO Score
                      </h4>
                      <div className="text-2xl font-bold text-green-600">
                        {aiReview.seo_score}/100
                      </div>
                    </div>
                    <div className="p-4 bg-purple-50 rounded-lg">
                      <h4 className="font-semibold text-purple-800">
                        Content Score
                      </h4>
                      <div className="text-2xl font-bold text-purple-600">
                        {Math.min(
                          100,
                          Math.floor(
                            form.content.split(/\s+/).filter(Boolean).length /
                              10 +
                              form.summary.split(/\s+/).filter(Boolean).length /
                                2 +
                              form.keywords.split(",").filter(Boolean).length *
                                5,
                          ),
                        )}
                        /100
                      </div>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Suggestions</h4>
                    <ul className="space-y-1">
                      {aiReview.suggestions?.map((suggestion, i) => (
                        <li
                          key={i}
                          className="text-sm text-[var(--text-muted)]"
                        >
                          • {suggestion}
                        </li>
                      ))}
                    </ul>
                  </div>
                  {aiReview.issues?.length > 0 && (
                    <div>
                      <h4 className="font-semibold mb-2 text-red-600">
                        Issues Found
                      </h4>
                      <ul className="space-y-1">
                        {aiReview.issues.map((issue, i) => (
                          <li key={i} className="text-sm text-red-600">
                            • {issue}
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
