import { FiBox } from "react-icons/fi";

export default function EmptyState({
  title = "No items found",
  message = "Try adjusting your filters or check back later.",
  action,
}) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-[var(--radius-lg)] border border-dashed border-[var(--color-border)] bg-[var(--color-surface-muted)] p-8 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text-muted)]">
        <FiBox size={20} />
      </div>
      <div>
        <h3 className="text-[var(--color-text)] text-lg font-semibold">{title}</h3>
        <p className="text-[var(--color-text-muted)] text-sm mt-1">{message}</p>
      </div>
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}
