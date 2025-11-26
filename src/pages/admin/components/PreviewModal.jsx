import React from 'react';

const PreviewModal = ({
  showPreview,
  setShowPreview,
  form,
  selectedProducts
}) => {
  if (!showPreview) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-slate-900 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        <div className="p-4 border-b border-muted flex items-center justify-between">
          <h3 className="font-semibold">Article Preview</h3>
          <button
            onClick={() => setShowPreview(false)}
            className="text-[var(--text-muted)] hover:text-[var(--text-main)]"
          >
            ✕
          </button>
        </div>
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
          {/* Hero Image */}
          {form.heroImage && (
            <div className="mb-6 overflow-hidden rounded-xl">
              <img
                src={form.heroImage}
                alt={form.title}
                className="w-full h-64 object-cover"
              />
            </div>
          )}

          {/* Article Header */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-4">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                form.status === 'published' ? 'bg-emerald-100 text-emerald-800' :
                form.status === 'draft' ? 'bg-amber-100 text-amber-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {form.status || 'draft'}
              </span>
              <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                {form.difficulty}
              </span>
              <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-medium">
                {form.articleType}
              </span>
            </div>

            <h1 className="text-3xl font-bold mb-4">{form.title || 'Article Title'}</h1>

            <div className="flex items-center gap-4 text-sm text-[var(--text-muted)] mb-4">
              <span>By {form.author || 'Author'}</span>
              <span>•</span>
              <span>{form.readTime || '5 min read'}</span>
              <span>•</span>
              <span>{form.tag || 'Category'}</span>
            </div>

            <p className="text-lg text-[var(--text-muted)]">
              {form.summary || 'Article summary will appear here...'}
            </p>
          </div>

          {/* Article Content */}
          <div className="prose prose-lg max-w-none">
            {form.content ? (
              form.content.split('\n\n').map((paragraph, index) => (
                <p key={index} className="mb-4 leading-relaxed">
                  {paragraph}
                </p>
              ))
            ) : (
              <p className="text-[var(--text-muted)] italic">
                Article content will appear here...
              </p>
            )}
          </div>

          {/* Related Products */}
          {selectedProducts.length > 0 && (
            <div className="mt-8 p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg">
              <h3 className="font-semibold mb-3 text-emerald-800 dark:text-emerald-200">
                Related Products
              </h3>
              <div className="grid gap-3 md:grid-cols-2">
                {selectedProducts.map((product) => (
                  <div key={product.id} className="flex items-center gap-3 p-3 bg-white dark:bg-slate-800 rounded">
                    <img
                      src={product.thumbnailUrl}
                      alt={product.title}
                      className="w-12 h-12 rounded object-cover"
                    />
                    <div className="flex-1">
                      <h4 className="font-medium text-sm">{product.title}</h4>
                      {product.translations?.ar?.title && (
                        <p className="text-xs text-emerald-600 font-medium">{product.translations.ar.title}</p>
                      )}
                      <p className="text-xs text-[var(--text-muted)] line-clamp-2">{product.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PreviewModal;