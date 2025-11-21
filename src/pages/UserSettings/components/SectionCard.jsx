import React from "react";
import { sectionToneStyles } from "../utils/constants";
import { UseTheme } from "../../../theme/ThemeProvider";

const SectionCard = ({
  sectionId,
  innerRef,
  eyebrow,
  title,
  description,
  tone = "neutral",
  children,
}) => {
  const { theme } = UseTheme();
  const isDark = theme === "dark";
  const palette = sectionToneStyles[tone] || sectionToneStyles.neutral;
  const surface = palette[isDark ? "dark" : "light"];
  const eyebrowColor = isDark ? "text-green-300" : "text-green-700";
  const headingColor = isDark ? "text-white" : "text-slate-900";
  const descriptionColor = isDark ? "text-slate-400" : "text-slate-600";

  return (
    <section
      ref={innerRef}
      id={sectionId}
      className={`rounded-3xl p-6 transition-colors ${surface}`}
    >
      <header className="mb-8 space-y-3">
        <p className={`text-xs font-bold uppercase tracking-wider ${eyebrowColor} opacity-80`}>
          {eyebrow}
        </p>
        <h2 className={`text-xl font-bold ${headingColor} leading-tight`}>
          {title}
        </h2>
        <p className={`text-sm ${descriptionColor} leading-relaxed max-w-2xl`}>
          {description}
        </p>
      </header>
      <div className="space-y-6">
        {children}
      </div>
    </section>
  );
};

export default SectionCard;
