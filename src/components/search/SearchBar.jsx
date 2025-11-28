import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { UseTheme } from "../../theme/ThemeProvider";
import { useProductsSorted } from "../../hooks/useProductsSorted";

export default function SearchBar({
                           products: propProducts = [], // 🧩 تمررها من صفحة shop أو من Redux
                         placeholder = "Search products...",
                         onSearch, // ✅ callback (للموبايل علشان يقفل المنيو)
                         }) {
    const [query, setQuery] = useState("");
    const [focused, setFocused] = useState(false);
    const [results, setResults] = useState([]);
    const navigate = useNavigate();
    const { theme } = UseTheme();

    // Fetch products if not provided
    const { data: fetchedProducts = [] } = useProductsSorted({ sortBy: "createdAt", dir: "desc" });
    const products = propProducts.length > 0 ? propProducts : fetchedProducts;

    // 🔍 تصفية المنتجات حسب الكلمة
    useEffect(() => {
        if (query.trim() && products.length > 0) {
            const filtered = products.filter((item) =>
                (item.name || item.title || "").toLowerCase().includes(query.toLowerCase())
            );
            setResults(filtered.slice(0, 5)); // Limit to 5 suggestions
        } else {
            setResults([]);
        }
    }, [query, products]);

    // 🧭 عند الضغط على Enter أو زر البحث
    const handleSubmit = (e) => {
        e.preventDefault();
        if (query.trim()) {
            navigate(`/products?search=${encodeURIComponent(query.trim())}`);
            setFocused(false);
            setResults([]);
            if (onSearch) onSearch(query.trim()); // ✅ للموبايل: يقفل المنيو بعد البحث
        }
    };

    // 🧠 عند اختيار اقتراح من القائمة
    const handleSelect = (item) => {
        const name = item.name || item.title || "";
        setQuery(name);
        navigate(`/products?search=${encodeURIComponent(name)}`);
        setFocused(false);
        setResults([]);
        if (onSearch) onSearch(name); // ✅ يقفل المنيو لو في موبايل
    };

    return (
        <div className="relative w-full sm:w-64 md:w-72">
            {/* 🔎 صندوق البحث */}
            <form
                onSubmit={handleSubmit}
                className={`flex items-center h-10 rounded-lg px-2 transition-all duration-300 border w-full
          ${
                    theme === "dark"
                        ? "bg-white/10 border-[#B8E4E6]/20 hover:bg-white/20"
                        : "bg-white/15 border-[#B8E4E6]/20 hover:bg-white/25"
                }`}
            >
                {/* أيقونة البحث */}
                <span
                    className={`material-symbols-outlined px-2 text-lg transition-colors ${
                        theme === "dark" ? "text-[#B8E4E6]" : "text-[#B8E4E6]"
                    }`}
                >

        </span>

                {/* حقل الإدخال */}
                <input
                    type="text"
                    value={query}
                    onFocus={() => setFocused(true)}
                    onBlur={() => setTimeout(() => setFocused(false), 200)}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder={placeholder}
                    className={`flex-1 bg-transparent outline-none text-sm placeholder:opacity-70
            ${
                        theme === "dark"
                            ? "text-[#B8E4E6] placeholder:text-[#B8E4E6]/70"
                            : "text-[#B8E4E6] placeholder:text-[#B8E4E6]/70"
                    }`}
                />
            </form>

            {/* ✨ تأثير الفوكس */}
            {focused && (
                <div
                    className={`absolute inset-0 rounded-lg ring-2 pointer-events-none transition-all duration-300 
            ${
                        theme === "dark"
                            ? "ring-[#B8E4E6]/40"
                            : "ring-[#B8E4E6]/50"
                    }`}
                />
            )}

            {/* 🧠 قائمة الاقتراحات */}
            {focused && results.length > 0 && (
                <div
                    className={`absolute mt-2 w-full rounded-lg shadow-lg border max-h-56 overflow-y-auto z-50 transition-all
            ${
                        theme === "dark"
                            ? "bg-[#0e1b1b] border-[#B8E4E6]/30"
                            : "bg-white border-[#B8E4E6]/30"
                    }`}
                >
                    {results.map((item) => (
                        <button
                            key={item.id}
                            onMouseDown={() => handleSelect(item)}
                            className={`w-full text-left px-4 py-2 text-sm flex items-center gap-2 transition-colors
                ${
                                theme === "dark"
                                    ? "text-[#B8E4E6] hover:bg-[#B8E4E6]/10"
                                    : "text-[#142727] hover:bg-[#B8E4E6]/20"
                            }`}
                        >
              <span className="material-symbols-outlined text-base opacity-70">
                inventory_2
              </span>
                            {item.name || item.title || "Unnamed"}
                        </button>
                    ))}
                </div>
            )}

            {/* ⚠️ لو مفيش نتائج */}
            {focused && query.trim() && results.length === 0 && (
                <div
                    className={`absolute mt-2 w-full rounded-lg shadow-md border px-4 py-2 text-sm text-center z-50
            ${
                        theme === "dark"
                            ? "bg-[#0e1b1b] border-[#B8E4E6]/30 text-[#B8E4E6]/80"
                            : "bg-white border-[#B8E4E6]/30 text-[#142727]/80"
                    }`}
                >
                    No results found
                </div>
            )}
        </div>
    );
}
