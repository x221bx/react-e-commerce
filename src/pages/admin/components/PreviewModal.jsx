import React from 'react';

const PreviewModal = ({
  showPreview,
  setShowPreview,
  form
}) => {
  if (!showPreview) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-5xl w-full max-h-[95vh] overflow-hidden border border-slate-200 dark:border-slate-700">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center">
              <span className="text-white text-sm">👁️</span>
            </div>
            <div>
              <h3 className="font-bold text-lg text-slate-900 dark:text-white">Article Preview</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">See how your article will look to readers</p>
            </div>
          </div>
          <button
            onClick={() => setShowPreview(false)}
            className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors"
            title="Close Preview"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(95vh-80px)]">
          {/* Hero Image */}
          {form.heroImage && (
            <div className="relative overflow-hidden">
              <img
                src={form.heroImage}
                alt={form.title}
                className="w-full h-72 object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
            </div>
          )}

          {/* Article Content Container */}
          <div className="px-8 py-8 max-w-4xl mx-auto">
            {/* Article Header */}
            <header className="mb-8">
              {/* Status Badges */}
              <div className="flex items-center gap-3 mb-6">
                <span className={`px-4 py-2 rounded-full text-sm font-semibold ${
                  form.status === 'published' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300' :
                  form.status === 'draft' ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300' :
                  'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300'
                }`}>
                  {form.status === 'published' ? '✅ Published' : form.status === 'draft' ? '📝 Draft' : form.status || 'Draft'}
                </span>
                <span className="px-4 py-2 bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 rounded-full text-sm font-semibold">
                  {form.difficulty || 'Beginner'}
                </span>
                <span className="px-4 py-2 bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300 rounded-full text-sm font-semibold">
                  {form.articleType || 'Blog'}
                </span>
              </div>

              {/* Title */}
              <h1 className="text-4xl font-bold mb-6 text-slate-900 dark:text-white leading-tight">
                {form.title || 'Your Article Title Will Appear Here'}
              </h1>

              {/* Meta Information */}
              <div className="flex items-center gap-6 text-sm text-slate-600 dark:text-slate-400 mb-6">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-xs">👤</span>
                  <span>By {form.author || 'Author Name'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-xs">⏱️</span>
                  <span>{form.readTime || '5 min read'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-xs">🏷️</span>
                  <span>{form.tag || 'Category'}</span>
                </div>
              </div>

              {/* Summary */}
              <div className="text-xl text-slate-700 dark:text-slate-300 leading-relaxed border-l-4 border-emerald-500 pl-6 italic">
                {form.summary || 'Your article summary will appear here. This is where you hook your readers and give them a preview of what to expect.'}
              </div>
            </header>

            {/* Article Body */}
            <article className="prose prose-xl max-w-none prose-headings:text-slate-900 prose-headings:dark:text-white prose-p:text-slate-700 prose-p:dark:text-slate-300 prose-strong:text-slate-900 prose-strong:dark:text-white prose-a:text-emerald-600 prose-a:dark:text-emerald-400 prose-blockquote:border-emerald-200 prose-blockquote:dark:border-emerald-800 prose-code:bg-slate-100 prose-code:dark:bg-slate-800 prose-pre:bg-slate-900 prose-pre:dark:bg-slate-950">
              {form.content ? (
                <div className="space-y-6">
                  {form.content.split('\n\n').map((paragraph, index) => (
                    <p key={index} className="text-lg leading-relaxed">
                      {paragraph}
                    </p>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16">
                  <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4 mx-auto">
                    <span className="text-2xl">📝</span>
                  </div>
                  <p className="text-slate-600 dark:text-slate-400 text-lg">
                    Your article content will appear here. Start writing to see how it looks!
                  </p>
                </div>
              )}
            </article>

            {/* Footer */}
            <footer className="mt-12 pt-8 border-t border-slate-200 dark:border-slate-700">
              <div className="flex items-center justify-between">
                <div className="text-sm text-slate-600 dark:text-slate-400">
                  This is how your article will appear to readers
                </div>
                <button
                  onClick={() => setShowPreview(false)}
                  className="px-6 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg font-semibold transition-colors"
                >
                  Continue Editing
                </button>
              </div>
            </footer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PreviewModal;