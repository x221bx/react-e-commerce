import { createPortal } from "react-dom";

export default function Modal({
  isOpen,
  onClose,
  title,
  children,
  footer,
}) {
  if (!isOpen) return null;

  const handleInnerClick = (event) => {
    event.stopPropagation();
  };

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-6">
      <div
        className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      <div
        role="dialog"
        aria-modal="true"
        className="relative z-10 w-full max-w-lg overflow-hidden rounded-3xl bg-white text-slate-900 shadow-2xl ring-1 ring-slate-900/10 dark:bg-slate-900 dark:text-slate-100 dark:ring-slate-700"
        onClick={handleInnerClick}
      >
        {(title || onClose) && (
          <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 dark:border-slate-800">
            {title ? (
              <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
            ) : (
              <span className="text-sm font-medium text-slate-500">
                Modal
              </span>
            )}
            <button
              type="button"
              onClick={onClose}
              className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-transparent text-slate-500 transition hover:border-slate-200 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:border-slate-700 dark:hover:bg-slate-800 dark:hover:text-white modal-close"
              aria-label="Close modal"
            >
              ×
            </button>
          </div>
        )}

        <div className="px-6 py-5">{children}</div>

        {footer !== false && (
          <div className="flex items-center justify-end gap-3 border-t border-slate-100 bg-slate-50/70 px-6 py-4 dark:border-slate-800 dark:bg-slate-900/40 modal-footer">
            {footer ?? (
              <button
                type="button"
                onClick={onClose}
                className="inline-flex items-center justify-center rounded-2xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-600"
              >
                Close
              </button>
            )}
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}
