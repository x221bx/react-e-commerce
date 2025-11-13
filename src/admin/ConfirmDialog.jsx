import { FiAlertTriangle } from "react-icons/fi";

export default function ConfirmDialog({
  open,
  title = "Are you sure?",
  message = "This action cannot be undone.",
  confirmText = "Delete",
  cancelText = "Cancel",
  confirmTone = "danger", // "danger" | "primary"
  onCancel,
  onConfirm,
  loading = false,
}) {
  if (!open) return null;

  const confirmClasses =
    confirmTone === "danger"
      ? "bg-rose-600 hover:bg-rose-700 focus:ring-rose-500"
      : "bg-[#49BBBD] hover:bg-[#2F7E80] focus:ring-[#49BBBD]";

  return (
    <div
      className="fixed inset-0 z-[999] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
    >
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/40"
        onClick={!loading ? onCancel : undefined}
      />

      {/* Panel */}
      <div className="relative w-full max-w-sm overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-black/5">
        <div className="flex items-start gap-3 px-5 pt-5">
          <div className="mt-0.5 rounded-full bg-rose-50 p-2 text-rose-600 ring-1 ring-rose-100">
            <FiAlertTriangle />
          </div>
          <div className="min-w-0">
            <h2 className="text-base font-semibold text-gray-900">{title}</h2>
            <p className="mt-1 text-sm text-gray-600">{message}</p>
          </div>
        </div>

        <div className="mt-5 flex items-center justify-end gap-2 px-5 pb-5">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="inline-flex items-center rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:ring-2 focus:ring-gray-300 focus:outline-none disabled:opacity-60"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className={`inline-flex items-center rounded-lg px-3 py-2 text-sm font-semibold text-white shadow-sm focus:ring-2 focus:outline-none disabled:opacity-60 ${confirmClasses}`}
          >
            {loading ? "Working…" : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
