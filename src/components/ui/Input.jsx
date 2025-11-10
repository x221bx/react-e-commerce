import { useState } from "react";
import { UseTheme } from "../../theme/ThemeProvider";

export default function Input({
  label,
  icon,
  error,
  value = "",
  onChange,
  placeholder = "Type something...",
  type = "text",
  ...props
}) {
  const [focused, setFocused] = useState(false);
  const { theme } = UseTheme();

  return (
    <div className="flex flex-col w-full relative">
      {/* 🏷️ Label */}
      {label && (
        <label
          className={`mb-1 text-sm font-medium transition-colors ${
            theme === "dark" ? "text-[#B8E4E6]" : "text-[#2F7E80]"
          }`}
        >
          {label}
        </label>
      )}

      {/* 🔤 Input Wrapper */}
      <div
        className={`flex items-center gap-2 px-3 h-10 rounded-lg border transition-all duration-300 relative
          ${
            theme === "dark"
              ? "bg-white/10 border-[#B8E4E6]/20 hover:bg-white/20"
              : "bg-white/15 border-[#B8E4E6]/20 hover:bg-white/25"
          }
          ${error ? "border-red-500 ring-1 ring-red-400/50" : ""}
        `}
      >
        {/* 🌟 Icon */}
        {icon && (
          <span
            className={`material-symbols-outlined text-base ${
              theme === "dark" ? "text-[#B8E4E6]" : "text-[#2F7E80]"
            }`}
          >
            {icon}
          </span>
        )}

        {/* 📝 Input Field */}
        <input
          {...props}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          onFocus={() => setFocused(true)}
          onBlur={() => setTimeout(() => setFocused(false), 150)}
          className={`flex-1 bg-transparent outline-none text-sm placeholder:opacity-70
            ${
              theme === "dark"
                ? "text-[#B8E4E6] placeholder:text-[#B8E4E6]/70"
                : "text-[#2F7E80] placeholder:text-[#2F7E80]/60"
            }`}
        />
      </div>

      {/* ✨ Focus Ring */}
      {focused && !error && (
        <div
          className={`absolute left-0 right-0 top-[1.85rem] h-10 rounded-lg ring-2 pointer-events-none transition-all duration-300 
            ${
              theme === "dark"
                ? "ring-[#B8E4E6]/40"
                : "ring-[#2F7E80]/40"
            }`}
        />
      )}

      {/* ⚠️ Error Message */}
      {error && (
        <span className="mt-1 text-xs text-red-500 font-medium">
          {error}
        </span>
      )}
    </div>
  );
}
