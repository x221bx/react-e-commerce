const toneMap = {
  neutral: "bg-[var(--color-surface-muted)] text-[var(--color-text-muted)]",
  accent: "bg-[var(--color-accent)]/10 text-[var(--color-accent)]",
  success: "bg-[var(--color-success)]/10 text-[var(--color-success)]",
  danger: "bg-[var(--color-danger)]/10 text-[var(--color-danger)]",
  warning: "bg-[var(--color-warning)]/10 text-[var(--color-warning)]",
};

export default function Badge({ children, tone = "neutral", className = "" }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold ${toneMap[tone] || toneMap.neutral} ${className}`}
    >
      {children}
    </span>
  );
}
