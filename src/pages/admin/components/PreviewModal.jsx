import React from "react";

const statusStyles = {
  published:
    "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-200",
  draft: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-200",
  scheduled:
    "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200",
};

const PreviewModal = ({ showPreview, setShowPreview, form }) => {
  if (!showPreview) return null;

  const status = form.status || "draft";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/70 backdrop-blur-[2px] px-4 py-6 dark:bg-slate-950/70">
      <div className="w-full max-w-5xl max-h-[95vh] overflow-hidden rounded-3xl border border-emerald-100 bg-white shadow-2xl dark:border-emerald-800 dark:bg-gradient-to-b dark:from-slate-900 dark:via-slate-900/80 dark:to-slate-950">
        <div className="flex items-center justify-between border-b border-emerald-100/60 bg-gradient-to-r from-emerald-50/80 to-transparent px-6 py-4 dark:border-slate-800 dark:from-emerald-900/20">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-2xl bg-emerald-600 text-white shadow-lg shadow-emerald-600/30">
              AP
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-emerald-600 dark:text-emerald-300">
                Preview Mode
              </p>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                Article Preview
              </h3>
            </div>
          </div>

          <button
            onClick={() => setShowPreview(false)}
            className="rounded-full border border-transparent bg-white/80 p-2 text-slate-500 shadow-sm transition hover:border-emerald-200 hover:text-slate-900 dark:bg-slate-800/60 dark:text-slate-300 dark:hover:border-emerald-700 dark:hover:text-white"
            aria-label="Close preview"
          >
            ✕
          </button>
        </div>

        <div className="max-h-[calc(95vh-64px)] overflow-y-auto">
          {form.heroImage && (
            <div className="relative">
              <img
                src={form.heroImage}
                alt={form.title || "Article hero"}
                className="h-80 w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
              <div className="absolute bottom-6 left-6 rounded-xl border border-white/20 bg-white/20 px-4 py-2 text-sm font-semibold text-white backdrop-blur-sm shadow-lg">
                Featured cover
              </div>
            </div>
          )}

          <div className="mx-auto grid max-w-4xl gap-8 px-6 py-10">
            <header className="space-y-6 rounded-3xl border border-emerald-100/70 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/70">
              <div className="flex flex-wrap gap-3">
                <span
                  className={`rounded-full px-4 py-1.5 text-sm font-semibold shadow-sm ${statusStyles[status] || statusStyles.draft
                    }`}
                >
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </span>
                <span className="rounded-full bg-emerald-100 px-4 py-1.5 text-sm font-semibold text-emerald-900 dark:bg-emerald-900/30 dark:text-emerald-200">
                  {form.difficulty || "Beginner"}
                </span>
                <span className="rounded-full bg-blue-100 px-4 py-1.5 text-sm font-semibold text-blue-900 dark:bg-blue-900/30 dark:text-blue-200">
                  {form.articleType || "Blog"}
                </span>
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.35em] text-emerald-500 dark:text-emerald-300">
                  Highlight
                </p>
                <h1 className="mt-3 text-4xl font-bold text-slate-900 dark:text-white">
                  {form.title || "Your Article Title Will Appear Here"}
                </h1>
              </div>

              <div className="grid gap-4 rounded-2xl border border-emerald-100/70 bg-emerald-50/40 p-4 text-sm text-slate-600 dark:border-emerald-900/50 dark:bg-emerald-950/30 dark:text-slate-300 sm:grid-cols-3">
                <Meta label="Author" value={form.author || "Author name"} />
                <Meta label="Read time" value={form.readTime || "5 min read"} />
                <Meta label="Category" value={form.tag || "General"} />
              </div>

              <p className="rounded-2xl border border-emerald-100/70 bg-gradient-to-r from-emerald-50 to-white p-5 text-lg text-slate-700 dark:border-emerald-900/40 dark:from-emerald-950/40 dark:to-slate-900 dark:text-slate-200">
                {form.summary ||
                  "Your article summary will appear here. Share a short, compelling description so readers know what to expect."}
              </p>
            </header>

            <article className="prose prose-lg max-w-none rounded-3xl border border-emerald-100/70 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/70 prose-headings:text-slate-900 prose-headings:dark:text-white prose-p:text-slate-700 prose-p:dark:text-slate-300">
              {form.content ? (
                <div className="space-y-6">
                  {form.content.split("\n\n").map((paragraph, index) => (
                    <p key={index} className="leading-relaxed">
                      {paragraph}
                    </p>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center gap-4 rounded-2xl border border-dashed border-emerald-200/80 bg-emerald-50 p-10 text-center dark:border-emerald-900/40 dark:bg-emerald-950/20">
                  <div className="grid h-16 w-16 place-items-center rounded-full bg-white shadow dark:bg-slate-800">
                    <span className="text-3xl">✍️</span>
                  </div>
                  <p className="text-lg text-slate-600 dark:text-slate-300">
                    Start writing to see how your article will look.
                  </p>
                </div>
              )}
            </article>

            <footer className="flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-emerald-100/70 bg-white px-6 py-5 text-sm text-slate-500 shadow-sm dark:border-slate-800 dark:bg-slate-900/70 dark:text-slate-300">
              <span>This is the reader-facing preview of your article.</span>
              <button
                onClick={() => setShowPreview(false)}
                className="rounded-2xl bg-emerald-500 px-6 py-2 text-sm font-semibold text-white shadow-lg shadow-emerald-500/30 transition hover:bg-emerald-600"
              >
                Continue editing
              </button>
            </footer>
          </div>
        </div>
      </div>
    </div>
  );
};

function Meta({ label, value }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-[0.2em] text-emerald-500 dark:text-emerald-300">
        {label}
      </p>
      <p className="mt-1 font-semibold text-slate-900 dark:text-white">
        {value}
      </p>
    </div>
  );
}

export default PreviewModal;
