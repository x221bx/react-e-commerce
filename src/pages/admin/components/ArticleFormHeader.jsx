import React from "react";
import { useTranslation } from "react-i18next";

const ArticleFormHeader = ({
  editingId,
  setShowPreview,
  setEditingId,
  setForm,
  defaultForm,
  setAiReview,
  setSuggestedProducts,
  setSelectedProducts,
  setSeoSuggestions,
}) => {
  const { t } = useTranslation();

  return (
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
  );
};

export default ArticleFormHeader;