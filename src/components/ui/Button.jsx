/**
 * Reusable Button component with theme support and animations
 * @param {Object} props - Component props
 * @param {string} props.text - Button text (alternative to children)
 * @param {ReactNode} props.children - Button content
 * @param {Function} props.onClick - Click handler
 * @param {string} props.className - Additional CSS classes
 * @param {boolean} props.full - Whether button should be full width
 * @param {string} props.size - Button size: 'sm', 'md', 'lg'
 * @param {string} props.type - Button type attribute
 * @param {boolean} props.disabled - Whether button is disabled
 * @param {string} props.ariaLabel - Accessibility label
 */
import { motion as Motion } from "framer-motion";
import { UseTheme } from "../../theme/ThemeProvider";

export default function Button({
  text,
  children,
  onClick = () => {},
  className = "",
  full = false,
  size = "md",
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
