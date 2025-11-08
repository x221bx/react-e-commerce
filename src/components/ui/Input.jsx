export default function Input({ label, error, ...props }) {
  return (
    <div className="flex flex-col w-full">
      {label && <label className="mb-1 text-sm font-medium text-gray-700 dark:text-gray-200">{label}</label>}

      <input
        {...props}
        className={`
          px-4 py-2 rounded-lg border transition-all outline-none
          bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100
          ${error ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:border-teal-500 focus:ring-1 focus:ring-teal-500"}
          placeholder-gray-400 dark:placeholder-gray-500
        `}
      />

      {error && (
        <span className="mt-1 text-xs text-red-500">{error}</span>
      )}
    </div>
  );
}
