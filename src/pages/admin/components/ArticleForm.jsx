import React from 'react';
import { useTranslation } from 'react-i18next';
import ReactMarkdown from 'react-markdown';

const ArticleForm = ({
  form,
  editingId,
  activeTab,
  splitView,
  setSplitView,
  setShowPreview,
  generateProductSuggestions,
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
  suggestedProducts,
  selectedProducts,
  handleProductSelect,
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
  setSeoSuggestions
}) => {
  const { t } = useTranslation();

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
                "Create comprehensive articles with AI assistance and product integration."
              )}
            </p>
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setSplitView(!splitView)}
              className="rounded-xl border border-green-200 px-3 py-2 text-xs font-semibold text-green-700 transition hover:bg-green-50"
            >
              📄 {splitView ? "Single" : "Split"} View
            </button>
            <button
              type="button"
              onClick={() => setShowPreview(true)}
              className="rounded-xl border border-blue-200 px-3 py-2 text-xs font-semibold text-blue-700 transition hover:bg-blue-50"
            >
              👁️ Preview
            </button>
            <button
              type="button"
              onClick={generateProductSuggestions}
              className="rounded-xl border border-purple-200 px-3 py-2 text-xs font-semibold text-purple-700 transition hover:bg-purple-50"
            >
              💡 Suggest Products
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-muted">
          <div className="flex">
            {[
              { id: "content", label: "Content", icon: "📝" },
              { id: "ai", label: "AI Tools", icon: "🤖" },
              { id: "seo", label: "SEO", icon: "🔍" },
              { id: "products", label: "Products", icon: "📦" },
              { id: "review", label: "AI Review", icon: "⭐" },
              { id: "analytics", label: "Analytics", icon: "📊" }
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
                  <label className="block text-sm font-semibold mb-2">Status</label>
                  <select
                    name="status"
                    value={form.status}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-muted bg-panel px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
                  >
                    <option value="draft">📝 Draft</option>
                    <option value="scheduled">⏰ Scheduled</option>
                    <option value="published">✅ Published</option>
                    <option value="archived">📦 Archived</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">Type</label>
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
                  <label className="block text-sm font-semibold mb-2">Difficulty</label>
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

              {/* Basic Fields */}
              <div className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="block text-sm font-semibold mb-2">English Title</label>
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
                    <label className="block text-sm font-semibold mb-2">Arabic Title (العنوان بالعربية)</label>
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
                    <label className="block text-sm font-semibold mb-2">English Summary</label>
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
                    <label className="block text-sm font-semibold mb-2">Arabic Summary (الملخص بالعربية)</label>
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
                  <label className="inline-flex items-center gap-2 rounded-lg border border-muted bg-surface px-3 py-2 text-[var(--text-main)] hover:bg-panel cursor-pointer">
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        const reader = new FileReader();
                        reader.onloadend = () => {
                          handleChange({ target: { name: 'heroImage', value: reader.result } });
                        };
                        reader.readAsDataURL(file);
                      }}
                    />
                    📷 Upload image
                  </label>
                  {form.heroImage && (
                    <span className="truncate text-[var(--text-main)]">
                      ✅ Image attached (will upload on save)
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
                    <label className="block text-sm font-semibold mb-2">English Content</label>
                    {splitView ? (
                      <div className="grid grid-cols-2 gap-4">
                        <div>
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
                              onClick={() => handleRewrite('shorter')}
                              className="px-3 py-1 rounded bg-blue-500 text-white text-xs hover:bg-blue-600"
                            >
                              Shorter
                            </button>
                            <button
                              type="button"
                              onClick={() => handleRewrite('longer')}
                              className="px-3 py-1 rounded bg-blue-500 text-white text-xs hover:bg-blue-600"
                            >
                              Longer
                            </button>
                          </div>
                        </div>
                        <div className="border border-muted rounded-lg p-4 bg-panel prose prose-sm max-w-none">
                          <ReactMarkdown>{form.content || 'Preview will appear here...'}</ReactMarkdown>
                        </div>
                      </div>
                    ) : (
                      <>
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
                            onClick={() => handleRewrite('shorter')}
                            className="px-3 py-1 rounded bg-blue-500 text-white text-xs hover:bg-blue-600"
                          >
                            Shorter
                          </button>
                          <button
                            type="button"
                            onClick={() => handleRewrite('longer')}
                            className="px-3 py-1 rounded bg-blue-500 text-white text-xs hover:bg-blue-600"
                          >
                            Longer
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2">Arabic Content (المحتوى بالعربية)</label>
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
                  <span className="font-semibold">{t("articles.admin.aiTopic", "Topic focus")}</span>
                  <select
                    value={aiTopic}
                    onChange={(e) => setAiTopic(e.target.value)}
                    className="rounded-lg border border-muted bg-surface px-2 py-2 text-sm"
                  >
                    {aiTopics.map((topic) => (
                      <option key={topic.value} value={topic.value}>
                        {topic.label}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="flex flex-col gap-1">
                  <span className="font-semibold">{t("articles.admin.aiLines", "Summary lines")}</span>
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
                  <span className="font-semibold">{t("articles.admin.productContext", "Product name / context")}</span>
                  <input
                    type="text"
                    value={productContext}
                    onChange={(e) => setProductContext(e.target.value)}
                    placeholder={t("articles.admin.productPlaceholder", "e.g., Nitro Plus foliar spray")}
                    className="w-full rounded-lg border border-muted bg-surface px-3 py-2 text-sm"
                  />
                </label>
                <p className="col-span-2 text-[11px] text-[var(--text-muted)]">
                  {t("articles.admin.helper", "AI will generate content based on the product and topic selected.")}
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
              </div>
            </div>
          )}

          {activeTab === "seo" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">SEO Optimization</h3>
                <button
                  type="button"
                  onClick={handleGenerateSEO}
                  disabled={generatingSEO || !form.title}
                  className="inline-flex items-center gap-2 rounded-lg bg-blue-500 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-blue-600 disabled:opacity-50"
                >
                  {generatingSEO ? "🤖" : "🎯"} {generatingSEO ? "Generating..." : "Generate SEO"}
                </button>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">SEO Description</label>
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
                <label className="block text-sm font-semibold mb-2">Keywords</label>
                <input
                  type="text"
                  name="keywords"
                  value={form.keywords}
                  onChange={handleChange}
                  placeholder="Comma-separated keywords"
                  className="w-full rounded-lg border border-muted bg-panel px-4 py-3 text-[var(--text-main)] focus:outline-none focus:ring-2 focus:ring-emerald-400"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">Publish Date</label>
                <input
                  type="datetime-local"
                  name="publishDate"
                  value={form.publishDate}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-muted bg-panel px-4 py-3 text-[var(--text-main)] focus:outline-none focus:ring-2 focus:ring-emerald-400"
                />
              </div>

              {seoSuggestions && (
                <div className="rounded-lg border border-blue-200 bg-blue-50 dark:bg-blue-900/20 p-4">
                  <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-3">AI SEO Suggestions</h4>

                  <div className="space-y-3">
                    <div>
                      <p className="text-sm font-medium text-blue-700 dark:text-blue-300">Suggested Meta Description:</p>
                      <p className="text-sm text-blue-600 dark:text-blue-400 mt-1 p-2 bg-white dark:bg-slate-800 rounded">
                        {seoSuggestions.metaDescription}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm font-medium text-blue-700 dark:text-blue-300">Suggested Keywords:</p>
                      <p className="text-sm text-blue-600 dark:text-blue-400 mt-1 p-2 bg-white dark:bg-slate-800 rounded">
                        {seoSuggestions.keywords}
                      </p>
                    </div>

                    {seoSuggestions.suggestions?.length > 0 && (
                      <div>
                        <p className="text-sm font-medium text-blue-700 dark:text-blue-300">SEO Tips:</p>
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

          {activeTab === "products" && (
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold mb-4">Related Products</h3>
                <div className="grid gap-3 max-h-60 overflow-y-auto">
                  {suggestedProducts.map((product) => (
                    <div
                      key={product.id}
                      className={`p-3 rounded-lg border cursor-pointer transition ${
                        selectedProducts.find(p => p.id === product.id)
                          ? "border-emerald-500 bg-emerald-50"
                          : "border-muted hover:border-emerald-300"
                      }`}
                      onClick={() => handleProductSelect(product)}
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={product.thumbnailUrl}
                          alt={product.title}
                          className="w-12 h-12 rounded object-cover"
                        />
                        <div className="flex-1">
                          <h4 className="font-medium">{product.title}</h4>
                          <p className="text-sm text-[var(--text-muted)]">{product.description}</p>
                          <p className="text-xs text-emerald-600">{product.reason}</p>
                        </div>
                        {selectedProducts.find(p => p.id === product.id) && (
                          <div className="text-emerald-500">✅</div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                {suggestedProducts.length === 0 && (
                  <p className="text-[var(--text-muted)] text-center py-8">
                    No product suggestions available. Add content first.
                  </p>
                )}
              </div>
            </div>
          )}

          {activeTab === "review" && (
            <div className="space-y-4">
              {aiReview ? (
                <div className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <h4 className="font-semibold text-blue-800">Quality Score</h4>
                      <div className="text-2xl font-bold text-blue-600">{aiReview.score}/100</div>
                    </div>
                    <div className="p-4 bg-green-50 rounded-lg">
                      <h4 className="font-semibold text-green-800">SEO Score</h4>
                      <div className="text-2xl font-bold text-green-600">{aiReview.seo_score}/100</div>
                    </div>
                    <div className="p-4 bg-purple-50 rounded-lg">
                      <h4 className="font-semibold text-purple-800">Content Score</h4>
                      <div className="text-2xl font-bold text-purple-600">{Math.min(100, Math.floor((form.content.split(/\s+/).filter(Boolean).length / 10) + (form.summary.split(/\s+/).filter(Boolean).length / 2) + (form.keywords.split(',').filter(Boolean).length * 5)))}/100</div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2">Suggestions</h4>
                    <ul className="space-y-1">
                      {aiReview.suggestions?.map((suggestion, i) => (
                        <li key={i} className="text-sm text-[var(--text-muted)]">• {suggestion}</li>
                      ))}
                    </ul>
                  </div>

                  {aiReview.issues?.length > 0 && (
                    <div>
                      <h4 className="font-semibold mb-2 text-red-600">Issues Found</h4>
                      <ul className="space-y-1">
                        {aiReview.issues.map((issue, i) => (
                          <li key={i} className="text-sm text-red-600">• {issue}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-[var(--text-muted)]">Click "AI Review" to get feedback on your content.</p>
                </div>
              )}
            </div>
          )}

          {activeTab === "analytics" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Article Analytics</h3>
                <button
                  type="button"
                  onClick={() => {
                    // Refresh analytics data
                    window.location.reload();
                  }}
                  className="inline-flex items-center gap-2 rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-emerald-600"
                >
                  🔄 Refresh Data
                </button>
              </div>

              {/* Likes/Dislikes Summary */}
              <div className="grid gap-4 md:grid-cols-2">
                <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg border border-emerald-200 dark:border-emerald-800">
                  <h4 className="font-semibold text-emerald-800 dark:text-emerald-200 mb-2">👍 Likes</h4>
                  <div className="text-2xl font-bold text-emerald-600">
                    {(() => {
                      const likesData = JSON.parse(localStorage.getItem('articleLikesData') || '[]');
                      const articleLikes = likesData.filter(like => like.articleId === editingId && like.action === 'liked');
                      return articleLikes.length;
                    })()}
                  </div>
                </div>
                <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                  <h4 className="font-semibold text-red-800 dark:text-red-200 mb-2">👎 Dislikes</h4>
                  <div className="text-2xl font-bold text-red-600">
                    {(() => {
                      const likesData = JSON.parse(localStorage.getItem('articleLikesData') || '[]');
                      const articleDislikes = likesData.filter(like => like.articleId === editingId && like.action === 'disliked');
                      return articleDislikes.length;
                    })()}
                  </div>
                </div>
              </div>

              {/* Recent Activity */}
              <div>
                <h4 className="font-semibold mb-4">Recent User Activity</h4>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {(() => {
                    const likesData = JSON.parse(localStorage.getItem('articleLikesData') || '[]');
                    const articleActivity = likesData
                      .filter(like => like.articleId === editingId)
                      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
                      .slice(0, 20);

                    if (articleActivity.length === 0) {
                      return (
                        <div className="text-center py-8 text-[var(--text-muted)]">
                          <p>No user activity yet for this article.</p>
                          <p className="text-sm mt-1">Activity will appear here when users interact with the article.</p>
                        </div>
                      );
                    }

                    return articleActivity.map((activity, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${
                            activity.action === 'liked'
                              ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300'
                              : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
                          }`}>
                            {activity.action === 'liked' ? '👍' : '👎'}
                          </div>
                          <div>
                            <p className="text-sm font-medium">
                              User {activity.action === 'liked' ? 'liked' : 'disliked'} this article
                            </p>
                            <p className="text-xs text-[var(--text-muted)]">
                              {new Date(activity.timestamp).toLocaleString()}
                            </p>
                          </div>
                        </div>
                        <div className="text-xs text-[var(--text-muted)]">
                          {activity.userId}
                        </div>
                      </div>
                    ));
                  })()}
                </div>
              </div>

              {/* All Articles Analytics Summary */}
              <div className="mt-8 p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                <h4 className="font-semibold mb-4">All Articles Summary</h4>
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-emerald-600">
                      {(() => {
                        const likesData = JSON.parse(localStorage.getItem('articleLikesData') || '[]');
                        return likesData.filter(like => like.action === 'liked').length;
                      })()}
                    </div>
                    <p className="text-sm text-[var(--text-muted)]">Total Likes</p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-600">
                      {(() => {
                        const likesData = JSON.parse(localStorage.getItem('articleLikesData') || '[]');
                        return likesData.filter(like => like.action === 'disliked').length;
                      })()}
                    </div>
                    <p className="text-sm text-[var(--text-muted)]">Total Dislikes</p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {(() => {
                        const likesData = JSON.parse(localStorage.getItem('articleLikesData') || '[]');
                        const uniqueUsers = new Set(likesData.map(like => like.userId));
                        return uniqueUsers.size;
                      })()}
                    </div>
                    <p className="text-sm text-[var(--text-muted)]">Active Users</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tab-Specific Form Actions */}
          <div className="flex gap-3 pt-6 border-t border-muted">
            {activeTab === "content" && (
              <>
                {editingId && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditingId(null);
                      setForm(defaultForm);
                      setAiReview(null);
                      setSuggestedProducts([]);
                      setSelectedProducts([]);
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
                  {submitting ? "Saving..." : editingId ? "Update Article" : "Publish Article"}
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
                  onClick={handleGenerateSEO}
                  disabled={generatingSEO || !form.title}
                  className="flex-1 inline-flex items-center justify-center rounded-lg bg-blue-500 px-5 py-2 text-sm font-semibold text-white shadow hover:bg-blue-600 disabled:opacity-50"
                >
                  {generatingSEO ? "Generating SEO..." : "Generate AI SEO"}
                </button>
              </>
            )}

            {activeTab === "products" && (
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
                  onClick={generateProductSuggestions}
                  className="flex-1 inline-flex items-center justify-center rounded-lg bg-purple-500 px-5 py-2 text-sm font-semibold text-white shadow hover:bg-purple-600"
                >
                  Refresh Suggestions
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

            {activeTab === "analytics" && (
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
                  onClick={() => {
                    // Clear analytics data for this article
                    const likesData = JSON.parse(localStorage.getItem('articleLikesData') || '[]');
                    const filteredData = likesData.filter(like => like.articleId !== editingId);
                    localStorage.setItem('articleLikesData', JSON.stringify(filteredData));
                    window.location.reload();
                  }}
                  className="flex-1 inline-flex items-center justify-center rounded-lg bg-red-500 px-5 py-2 text-sm font-semibold text-white shadow hover:bg-red-600"
                >
                  🗑️ Clear Analytics
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