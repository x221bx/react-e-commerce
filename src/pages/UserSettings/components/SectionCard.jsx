// src/pages/UserSettings/components/SectionCard.jsx
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

  /* =============================
     🌞 LIGHT MODE → NEON GREEN LUMINOSITY
     🌙 DARK MODE → CYBER EMERALD GLOW
     ============================= */
  const surfaceClass = isDark
    ? `
        relative overflow-hidden rounded-3xl
        border border-emerald-900/30 
        bg-[#06201f]/60
        backdrop-blur-xl
        shadow-[0_0_25px_rgba(16,185,129,0.25)]
        transition-all duration-300
        hover:shadow-[0_0_35px_rgba(16,185,129,0.35)]
        hover:border-emerald-600/40
      `
    : `
        relative overflow-hidden rounded-3xl
        border border-emerald-300 
        bg-gradient-to-b from-emerald-50 to-emerald-100/70
        shadow-[0_6px_20px_rgba(16,185,129,0.18)]
        transition-all duration-300
        hover:shadow-[0_10px_25px_rgba(16,185,129,0.28)]
        hover:border-emerald-500
      `;

  const eyebrowColor = isDark ? "text-emerald-300" : "text-emerald-700";
  const headingColor = isDark ? "text-white" : "text-emerald-900";
  const descriptionColor = isDark ? "text-emerald-100/70" : "text-emerald-800/70";

  return (
    <section
      ref={innerRef}
      id={sectionId}
      className={`${surfaceClass} p-6`}
    >
      {/* Glows ONLY in Dark Mode */}
      {isDark && (
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-10 right-0 h-40 w-40 rounded-full bg-emerald-600/20 blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-10 left-0 h-32 w-32 rounded-full bg-emerald-500/10 blur-2xl"></div>
        </div>
      )}

      <div className="relative z-[5]">
        <header className="mb-8 space-y-3">
          <p className={`text-xs font-bold uppercase tracking-wider ${eyebrowColor}`}>
            {eyebrow}
          </p>

          <h2 className={`text-2xl font-bold leading-tight ${headingColor}`}>
            {title}
          </h2>

          <p className={`text-sm max-w-2xl leading-relaxed ${descriptionColor}`}>
            {description}
          </p>
        </header>

        <div className="space-y-6">{children}</div>
      </div>
    </section>
  );
};

export default SectionCard;
