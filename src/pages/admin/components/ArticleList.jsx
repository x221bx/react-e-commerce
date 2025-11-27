import React, { useState } from 'react';
import ConfirmDialog from '../../../components/ui/ConfirmDialog';

const ArticleList = ({
  sortedArticles,
  handleEdit,
  handleDuplicate,
  handleDelete
}) => {
  const [deleteConfirm, setDeleteConfirm] = useState({ isOpen: false, article: null });

  const handleConfirmDelete = async () => {
    if (deleteConfirm.article) {
      await handleDelete(deleteConfirm.article);
    }
  };

  return (
    <div className="space-y-6">
      {/* Articles List */}
      <div className="card-surface rounded-xl border border-muted shadow-sm">
        <div className="p-4 border-b border-muted">
          <h3 className="font-semibold">Recent Articles</h3>
        </div>

        <div className="max-h-96 overflow-y-auto">
          {sortedArticles.slice(0, 10).map((article) => (
            <div
              key={article.id}
              className="p-4 border-b border-muted last:border-b-0 hover:bg-panel group"
            >
              <div className="flex items-start gap-3">
                {article.heroImage && (
                  <img
                    src={article.heroImage}
                    alt={article.title}
                    className="w-12 h-12 rounded object-cover flex-shrink-0"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-sm line-clamp-2">{article.title}</h4>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      article.status === 'published' ? 'bg-emerald-100 text-emerald-800' :
                      article.status === 'draft' ? 'bg-amber-100 text-amber-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {article.status || 'draft'}
                    </span>
                    <span className="text-xs text-[var(--text-muted)]">
                      {article.tag}
                    </span>
                  </div>
                  {/* Like/Dislike Stats */}
                  <div className="flex items-center gap-3 mt-2 text-xs text-[var(--text-muted)]">
                    <span className="flex items-center gap-1">
                      <span className="text-green-600">👍</span>
                      {article.likes || 0}
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="text-red-600">👎</span>
                      {article.dislikes || 0}
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="text-blue-600">👁️</span>
                      {article.views || 0}
                    </span>
                  </div>
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEdit(article);
                    }}
                    className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                    title="Edit"
                  >
                    ✏️
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDuplicate(article);
                    }}
                    className="p-1 text-green-600 hover:bg-green-50 rounded"
                    title="Duplicate"
                  >
                    📋
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setDeleteConfirm({ isOpen: true, article });
                    }}
                    className="p-1 text-red-600 hover:bg-red-50 rounded"
                    title="Delete"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            </div>
          ))}

          {!sortedArticles.length && (
            <div className="p-8 text-center text-[var(--text-muted)]">
              <p>No articles yet.</p>
              <p className="text-sm mt-1">Create your first article!</p>
            </div>
          )}
        </div>
      </div>

      <ConfirmDialog
        isOpen={deleteConfirm.isOpen}
        onClose={() => setDeleteConfirm({ isOpen: false, article: null })}
        onConfirm={handleConfirmDelete}
        title="Delete Article"
        message={`Are you sure you want to delete "${deleteConfirm.article?.title}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        confirmButtonClass="bg-red-500 hover:bg-red-600"
      />
    </div>
  );
};

export default ArticleList;