// components/ActionButton.jsx
export default function ActionButton({ type }) {
  if (type === "join") {
    return (
      <button className="shadow-ml bg-text-amber-50 rounded-full bg-white/30 px-6 py-3 font-semibold text-[#ffffff] backdrop-blur-md transition hover:opacity-90">
        Join for free
      </button>
    );
  }

  if (type === "video") {
    return (
      <div className="flex items-center space-x-3 text-white">
        <div className="text-md flex h-12 w-12 items-center justify-center rounded-full bg-white text-[#49BBBD] shadow-xl backdrop-blur-xl transition hover:opacity-90">
          <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
            <path d="M6 4l10 6-10 6V4z" />
          </svg>
        </div>
        <span className="font-medium text-[#1E1E1E]">Watch how it works</span>
      </div>
    );
  }

  return null;
}
