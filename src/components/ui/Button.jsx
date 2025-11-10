export default function Button({ children, loading, className = "", ...props }) {
  return (
    <button
      {...props}
      disabled={loading || props.disabled}
      className={`w-full rounded-xl px-4 py-3.5 text-white font-semibold transition-all duration-200
      bg-green-500 hover:bg-green-600 active:scale-[0.97] disabled:opacity-60 ${className}`}
    >
      {loading ? "Loading..." : children}
    </button>
  );
}
