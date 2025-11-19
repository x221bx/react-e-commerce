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
  const eyebrowColor = isDark ? "text-emerald-200" : "text-emerald-600";
  const headingColor = isDark ? "text-white" : "text-slate-900";
  const descriptionColor = isDark ? "text-slate-300" : "text-slate-500";

  return (
    <section
      ref={innerRef}
      id={sectionId}
      className={`rounded-3xl p-6 shadow-sm transition-colors ${surface}`}
    >
      <div className="mb-6 space-y-2">
        <p className={`text-sm font-semibold uppercase tracking-wide ${eyebrowColor}`}>
          {eyebrow}
        </p>
        <h2 className={`text-2xl font-semibold ${headingColor}`}>
          {title}
        </h2>
        <p className={`text-sm ${descriptionColor}`}>{description}</p>
      </div>
      {children}
    </section>
  );
};

export default SectionCard;
