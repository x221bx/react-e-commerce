import React from 'react';

const PublishOverlay = ({
  showPublishOverlay,
  setShowPublishOverlay,
  handleConfirmPublish,
  submitting,
  editingId
}) => {
  if (!showPublishOverlay) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-slate-900 rounded-xl max-w-md w-full">
        <div className="p-6">
          <div className="text-center mb-6">
            <div className="mx-auto w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mb-4">
              <span className="text-2xl">📝</span>
            </div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
              {editingId ? "Update Article" : "Publish Article"}
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              {editingId
                ? "Are you sure you want to update this article? Changes will be visible immediately."
                : "Are you ready to publish this article? It will be visible to all users."
              }
            </p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setShowPublishOverlay(false)}
              className="flex-1 px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirmPublish}
              disabled={submitting}
              className="flex-1 px-4 py-2 text-sm font-medium text-white bg-emerald-500 rounded-lg hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {submitting ? "Saving..." : editingId ? "Update" : "Publish"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PublishOverlay;