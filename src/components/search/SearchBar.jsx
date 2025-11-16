import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { UseTheme } from "../../theme/ThemeProvider";

export default function SearchBar({
  products = [], // 🧩 تمررها من صفحة shop أو من Redux
  placeholder = "Search products...",
  onSearch, // ✅ callback (للموبايل علشان يقفل المنيو)
}) {
  const [query, setQuery] = useState("");
  const [focused, setFocused] = useState(false);
  const [results, setResults] = useState([]);
  const navigate = useNavigate();
  const { theme } = UseTheme();
  const isDark = theme === "dark";
  const surfaceClasses = isDark
    ? "bg-white/10 border-[#B8E4E6]/20 hover:bg-white/20"
    : "bg-white border-slate-200 shadow-sm hover:border-emerald-200";
  const iconColor = isDark ? "text-[#B8E4E6]" : "text-slate-400";
  const inputColors = isDark
    ? "text-[#B8E4E6] placeholder:text-[#B8E4E6]/70"
    : "text-slate-700 placeholder:text-slate-400";
  const dropdownSurface = isDark
    ? "bg-[#0e1b1b] border-[#B8E4E6]/30 text-[#B8E4E6]"
    : "bg-white border-slate-200 text-slate-700 shadow-lg";
  const dropdownHover = isDark ? "hover:bg-[#B8E4E6]/10" : "hover:bg-slate-50";

  // 🔍 تصفية المنتجات حسب الكلمة
  useEffect(() => {
    if (query.trim() && products.length > 0) {
      const filtered = products.filter((item) =>
        item.name.toLowerCase().includes(query.toLowerCase())
      );
      setResults(filtered);
    } else {
      setResults([]);
    }
  }, [query]);

  // 🧭 عند الضغط على Enter أو زر البحث
  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/shop?search=${encodeURIComponent(query.trim())}`);
      setFocused(false);
      setResults([]);
      if (onSearch) onSearch(query.trim()); // ✅ للموبايل: يقفل المنيو بعد البحث
    }
  };

  // 🧠 عند اختيار اقتراح من القائمة
  const handleSelect = (item) => {
    setQuery(item.name);
    navigate(`/shop?search=${encodeURIComponent(item.name)}`);
    setFocused(false);
    setResults([]);
    if (onSearch) onSearch(item.name); // ✅ يقفل المنيو لو في موبايل
  };

  return (
    <div className="relative w-full sm:w-64 md:w-72">
      {/* 🔎 صندوق البحث */}
      <form
        onSubmit={handleSubmit}
        className={`flex items-center h-10 rounded-lg px-2 transition-all duration-300 border w-full focus-within:ring-2 focus-within:ring-emerald-200/70 dark:focus-within:ring-[#B8E4E6]/40 ${surfaceClasses}`}
        aria-label="Search products"
      >
        {/* أيقونة البحث */}
        <span
          className={`material-symbols-outlined px-2 text-lg transition-colors ${iconColor}`}
          aria-hidden="true"
        >
          search
        </span>

        {/* حقل الإدخال */}
        <input
          type="text"
          value={query}
          onFocus={() => setFocused(true)}
          onBlur={() => setTimeout(() => setFocused(false), 200)}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          className={`flex-1 bg-transparent text-sm placeholder:opacity-80 focus:outline-none ${inputColors}`}
        />
      </form>

      {/* ✨ تأثير الفوكس */}
      {focused && (
        <div
          className={`absolute inset-0 rounded-lg ring-2 pointer-events-none transition-all duration-300 ${isDark ? "ring-[#B8E4E6]/40" : "ring-emerald-100"}`}
        />
      )}

      {/* 🧠 قائمة الاقتراحات */}
      {focused && results.length > 0 && (
        <div
          className={`absolute mt-2 w-full rounded-lg border max-h-56 overflow-y-auto z-50 transition-all ${dropdownSurface}`}
        >
          {results.map((item) => (
            <button
              key={item.id}
              onMouseDown={() => handleSelect(item)}
              className={`w-full text-left px-4 py-2 text-sm flex items-center gap-2 transition-colors ${dropdownHover}`}
            >
              <span className="material-symbols-outlined text-base opacity-70">
                inventory_2
              </span>
              {item.name}
            </button>
          ))}
        </div>
      )}

      {/* ⚠️ لو مفيش نتائج */}
      {focused && query.trim() && results.length === 0 && (
        <div
          className={`absolute mt-2 w-full rounded-lg border px-4 py-2 text-sm text-center z-50 ${dropdownSurface}`}
        >
          No results found
        </div>
      )}
    </div>
  );
}

