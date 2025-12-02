import { motion as Motion } from "framer-motion";
import { UseTheme } from "../../theme/ThemeProvider";
import { useEffect, useMemo, useState } from "react";

const gradientPresets = [
  "linear-gradient(135deg, #d7f7ff 0%, #f8fcff 100%)",
  "linear-gradient(135deg, #fff0d8 0%, #faf6ff 100%)",
  "linear-gradient(135deg, #e7f3d8 0%, #f2fff6 100%)",
  "linear-gradient(135deg, #fde6f1 0%, #fffdf5 100%)",
];

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  show: (delay = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay, ease: "easeOut" },
  }),
};

const pickFallbackBackground = (title) => {
  if (!title) return gradientPresets[0];
  const base = title
    .split("")
    .reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return gradientPresets[Math.abs(base) % gradientPresets.length];
};

export default function CategoryCard({
  title,
  note,
  imageSources = [],
  onClick = () => {},
}) {
  const { theme } = UseTheme();
  const sanitizedImages = useMemo(
    () => [...new Set((imageSources || []).filter(Boolean))],
    [imageSources]
  );
  const hasImages = sanitizedImages.length > 0;
  const [activeIndex, setActiveIndex] = useState(0);
  const imagesKey = sanitizedImages.join("|");

  useEffect(() => {
    setActiveIndex(0);
  }, [imagesKey]);

  useEffect(() => {
    if (!hasImages) return undefined;
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % sanitizedImages.length);
    }, 4200);
    return () => clearInterval(interval);
  }, [imagesKey, hasImages, sanitizedImages.length]);

  const activeImage = sanitizedImages[activeIndex];
  const imageStyle = hasImages
    ? { backgroundImage: `url('${activeImage}')` }
    : { background: pickFallbackBackground(title) };

  return (
    <Motion.button
      onClick={onClick}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.3 }}
      variants={fadeUp}
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      className={`text-left w-full rounded-xl overflow-hidden shadow-lg transition-all duration-500
        ${
          theme === "dark"
            ? "bg-[#0e1b1b] text-[#B8E4E6] shadow-[0_4px_20px_rgba(184,228,230,0.08)] hover:shadow-[0_6px_25px_rgba(184,228,230,0.15)]"
            : "bg-white text-[#1a1a1a] shadow-[0_3px_15px_rgba(0,0,0,0.1)] hover:shadow-[0_5px_20px_rgba(0,0,0,0.15)]"
        }`}
      aria-label={`Explore ${title || "category"}`}
    >
      <Motion.div
        whileHover={{ scale: 1.05 }}
        transition={{ duration: 0.4 }}
        className="w-full aspect-square rounded-t-xl"
        style={{
          ...imageStyle,
          backgroundPosition: "center",
          backgroundSize: "cover",
        }}
      >
        {!hasImages && (
          <div className="flex h-full w-full items-center justify-center text-sm font-semibold text-[#1f2933]/60">
            {title || "Explore"}
          </div>
        )}
      </Motion.div>

      <div className="p-4">
        <Motion.p
          variants={fadeUp}
          custom={0.2}
          className={`text-lg font-semibold mb-1 ${
            theme === "dark" ? "text-[#B8E4E6]" : "text-[#2F7E80]"
          }`}
        >
          {title}
        </Motion.p>
        <Motion.p
          variants={fadeUp}
          custom={0.3}
          className={`text-sm ${
            theme === "dark" ? "text-[#B8E4E6]/80" : "text-[#142727]/80"
          }`}
        >
          {note}
        </Motion.p>
      </div>
    </Motion.button>
  );
}
