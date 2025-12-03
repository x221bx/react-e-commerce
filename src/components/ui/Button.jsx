// src/components/ui/Button.jsx
import { motion as Motion } from "framer-motion";
import { UseTheme } from "../../theme/ThemeProvider";

export default function Button({
  text,
  children,
  onClick = () => {},
  className = "",
  full = false, // ✅ لو عايز الزرار ياخد عرض كامل
  size = "md", // sm / md / lg
  type = "button",
  disabled = false,
  ariaLabel,
}) {
  const { theme } = UseTheme();

  const sizes = {
    sm: "h-8 text-sm px-3",
    md: "h-10 text-base px-4",
    lg: "h-12 text-lg px-6",
  };

  return (
    <Motion.button
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      type={type}
      disabled={disabled}
      aria-label={ariaLabel}
      className={`
        ${full ? "w-full" : "w-fit"}
        ${sizes[size]}
        inline-flex items-center justify-center whitespace-nowrap
        rounded-lg font-semibold transition-all duration-300
        ${
          theme === "dark"
            ? "bg-pale-teal text-dark-text hover:bg-hover-pale"
            : "bg-accent-teal text-white hover:bg-hover-teal"
        }
        disabled:opacity-60 disabled:cursor-not-allowed
        ${className}
      `}
    >
      {children ?? text}
    </Motion.button>
  );
}
