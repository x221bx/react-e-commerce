import React from "react";
import { useTranslation } from "react-i18next";
import { uploadImage } from "../../../services/firebase";
import toast from "react-hot-toast";

const ArticleFormContent = ({
  form,
  handleChange,
  handleGenerateTitle,
  handleGenerateSummary,
  handleRewrite,
  handleImageDrop,
  showScheduler,
  nowIso,
  uploadingImage,
  setUploadingImage,
  aiDrafting,
}) => {
  const { t } = useTranslation();
  return (
    <div className="space-y-6">
      {/* Status */}
      <div>
        <label className="block text-sm font-semibold mb-2">Status</label>
        <select
          name="status"
          value={form.status}
          onChange={handleChange}
          className="w-full rounded-lg border border-muted bg-panel px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
        >
          <option value="draft">Draft</option>
          <option value="scheduled">Scheduled</option>
          <option value="published">Published</option>
        </select>
      </div>

      {showScheduler && (
        <div className="rounded-2xl border border-dashed border-emerald-200 bg-emerald-50/40 p-4 space-y-2">
          <label className="block text-sm font-semibold">Publish Date & Time</label>
          <input
            type="datetime-local"
            name="publishDate"
            value={form.publishDate || ""}
            min={nowIso}
            onChange={handleChange}
            className="w-full rounded-lg border border-emerald-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
          />
          <p className="text-xs text-emerald-800">
            {t("articles.admin.scheduledArticlesNote", "Scheduled articles will auto-publish at this exact time.")}
          </p>
        </div>
      )}

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
              />
              <button
                type="button"
                onClick={handleGenerateTitle}
                disabled={aiDrafting}
                className="px-3 py-3 rounded-lg bg-blue-500 text-white text-sm hover:bg-blue-600 disabled:opacity-50"
                title="Generate AI Title"
              >
                {aiDrafting ? "..." : "AI"}
              </button>
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2">Arabic Title</label>
            <input
              type="text"
              name="titleAr"
              value={form.titleAr}
              onChange={handleChange}
              placeholder="Arabic title"
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
              />
              <button
                type="button"
                onClick={handleGenerateSummary}
                disabled={aiDrafting}
                className="px-3 py-3 rounded-lg bg-blue-500 text-white text-sm hover:bg-blue-600 self-start disabled:opacity-50"
                title="Generate AI Summary"
              >
                {aiDrafting ? "..." : "AI"}
              </button>
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2">Arabic Summary</label>
            <textarea
              name="summaryAr"
              value={form.summaryAr}
              onChange={handleChange}
              placeholder="Arabic summary"
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
                // Limit image size to 5MB
                if (file.size > 5 * 1024 * 1024) {
                  toast.error("Image size must be less than 5MB");
                  return;
                }
                setUploadingImage(true);
                try {
                  const downloadURL = await uploadImage(file, "articles/");
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
            {uploadingImage ? "..." : "Upload"} {uploadingImage ? "Uploading..." : "Upload image"}
          </label>
          {form.heroImage && (
            <span className="truncate text-[var(--text-main)]">Image uploaded</span>
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
                disabled={aiDrafting}
                className="px-3 py-1 rounded bg-blue-500 text-white text-xs hover:bg-blue-600 disabled:opacity-50"
              >
                {aiDrafting ? "..." : "Shorter"}
              </button>
              <button
                type="button"
                onClick={() => handleRewrite("longer")}
                disabled={aiDrafting}
                className="px-3 py-1 rounded bg-blue-500 text-white text-xs hover:bg-blue-600 disabled:opacity-50"
              >
                {aiDrafting ? "..." : "Longer"}
              </button>
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2">Arabic Content</label>
            <textarea
              name="contentAr"
              value={form.contentAr}
              onChange={handleChange}
              placeholder="Arabic content"
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
            Feature on home page
          </label>
        </div>
      </div>
    </div>
  );
};

export default ArticleFormContent;
