import { useState } from "react";

export default function SearchBar({
  value,
  onChange,
  data = [],
  onSelect,
  placeholder = "Search..."
}) {
  const [focused, setFocused] = useState(false);

  const filtered = value
    ? data.filter((item) =>
        item.name.toLowerCase().includes(value.toLowerCase())
      )
    : [];

  return (
    <div className="relative w-full">
      
      {/* Search box */}
      <div
        className="
          w-full flex items-center gap-3 rounded-xl border border-gray-300 
          px-4 py-2 bg-white shadow-sm
          focus-within:border-green-500 focus-within:ring-2 focus-within:ring-green-400/50
          transition-all duration-200
        "
      >
        <span className="material-icons text-green-600 text-xl">search</span>

        <input
          type="text"
          value={value}
          onFocus={() => setFocused(true)}
          onBlur={() => setTimeout(() => setFocused(false), 150)}
          onChange={(e) => onChange && onChange(e.target.value)}
          placeholder={placeholder}
          className="
            flex-1 outline-none bg-transparent text-[15px]
            placeholder:text-gray-400 text-gray-700
          "
        />
      </div>

      {/* Results dropdown */}
      {focused && value && (
        <div
          className="
            absolute mt-2 w-full bg-white shadow-lg border rounded-xl 
            max-h-60 overflow-y-auto z-50 animate-fade-in
          "
        >
          {/* لو مفيش نتائج */}
          {filtered.length === 0 && (
            <div className="px-4 py-3 text-sm text-gray-500 text-center select-none">
              No Results
            </div>
          )}

          {filtered.map((item) => (
            <button
              key={item.id}
              onMouseDown={() => onSelect && onSelect(item)}
              className="
                w-full text-left px-4 py-2 hover:bg-green-50 transition
                flex items-center gap-2
              "
            >
              <span className="material-icons text-green-500 text-lg">inventory_2</span>
              <span className="text-gray-700">{item.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
