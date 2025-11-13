import { motion as Motion } from "framer-motion";
import { UseTheme } from "../../theme/ThemeProvider";

export default function Button({
  text = "Click Me",
  onClick = () => {},
  className = "",
  full = false, // ✅ لو عايز الزرار ياخد عرض كامل
  size = "md", // sm / md / lg
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
      className={`
        ${full ? "w-full" : "w-fit"}
        ${sizes[size]}
        rounded-lg font-semibold transition-all duration-300
        ${
          theme === "dark"
            ? "bg-[#B8E4E6] text-[#0e1b1b] hover:bg-[#a7d8da]"
            : "bg-[#2F7E80] text-white hover:bg-[#256b6d]"
        }
        ${className}
      `}
    >
      {text}
    </Motion.button>
  );
}
