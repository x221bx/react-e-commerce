// src/components/ui/Input.jsx
import { forwardRef, useState } from "react";
import { UseTheme } from "../../theme/ThemeProvider";

const Input = (
  {
  label,
  icon,
  error,
  value = "",
  onChange,
  placeholder = "Type something...",
  type = "text",
  ...props
},
  ref
) => {
  const [focused, setFocused] = useState(false);
  const { theme } = UseTheme();
  const isDark = theme === "dark";
  const isDisabled = props.disabled || props.readOnly;

  const labelColor = isDark ? "text-emerald-100" : "text-slate-700";
  const activeSurface = isDark
    ? "bg-white/10 border-emerald-200/30 hover:bg-white/15"
    : "bg-white border-slate-200 hover:border-emerald-300 shadow-inner";
  const disabledSurface = isDark
    ? "bg-slate-800/60 border-slate-700 text-slate-400 cursor-not-allowed"
    : "bg-slate-100 border-slate-200 text-slate-500 cursor-not-allowed";
  const surfaceClasses = isDisabled ? disabledSurface : activeSurface;
  const iconColor = isDark ? "text-emerald-100" : "text-emerald-500";
  const textColor = isDark
    ? "text-emerald-50 placeholder:text-emerald-200/80"
    : "text-slate-900 placeholder:text-slate-500/70";

  return (
    <div className="flex flex-col w-full relative">
      {label && (
        <label className={`mb-1 text-sm font-semibold ${labelColor}`}>
          {label}
        </label>
      )}

      <div
        className={`flex items-center gap-2 px-3 h-11 rounded-xl border transition-all duration-300 relative ${surfaceClasses} ${
          error ? "border-red-500 ring-1 ring-red-400/40" : ""
        }`}
      >
        {icon && (
          <span className={`material-symbols-outlined text-base ${iconColor} input-icon`}>
            {icon}
          </span>
        )}

        <input
          {...props}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          ref={ref}
          onFocus={() => !isDisabled && setFocused(true)}
          onBlur={() => setTimeout(() => setFocused(false), 120)}
          className={`flex-1 bg-transparent outline-none text-sm ${textColor} input-field ${
            isDisabled ? "cursor-not-allowed" : ""
          }`}
        />
      </div>

      {focused && !error && !isDisabled && (
        <div
          className={`absolute left-0 right-0 top-[1.9rem] h-11 rounded-xl ring-2 pointer-events-none transition-all duration-300 ${
            isDark ? "ring-emerald-200/40" : "ring-emerald-500/30"
          }`}
        />
      )}

      {error && (
        <span className="mt-1 text-xs text-red-500 font-semibold">{error}</span>
      )}
    </div>
  );
};

export default forwardRef(Input);
