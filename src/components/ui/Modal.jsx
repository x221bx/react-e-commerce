import { createPortal } from "react-dom";

export default function Modal({ isOpen, onClose, title, children }) {
  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* الخلفية المعتمة */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* نافذة المودال */}
      <div className="relative z-10 w-[90%] max-w-lg rounded-2xl bg-white dark:bg-gray-800 p-6 shadow-2xl animate-fade-in scale-100 transition-transform duration-200">
        
        {/* زر الإغلاق في الزاوية */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 transition text-lg font-bold"
          aria-label="Close modal"
        >
          ×
        </button>

        {/* العنوان */}
        {title && (
          <h2 className="mb-4 text-xl font-semibold text-gray-900 dark:text-gray-100">
            {title}
          </h2>
        )}

        {/* المحتوى */}
        <div className="space-y-4">{children}</div>

        {/* زر الإغلاق الرئيسي */}
        <button
          onClick={onClose}
          className="mt-6 w-full rounded-xl bg-teal-600 hover:bg-teal-700 text-white py-2.5 font-medium transition"
        >
          Close
        </button>
      </div>
    </div>,
    document.body
  );
}
