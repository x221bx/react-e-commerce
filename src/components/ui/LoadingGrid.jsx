export default function LoadingGrid({ items = 6 }) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: items }).map((_, i) => (
        <div
          key={i}
          className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-4 animate-pulse"
        >
          <div className="h-4 w-24 bg-[var(--color-border)]/70 rounded mb-3" />
          <div className="h-5 w-3/4 bg-[var(--color-border)]/70 rounded mb-2" />
          <div className="h-3 w-1/2 bg-[var(--color-border)]/70 rounded" />
        </div>
      ))}
    </div>
  );
}
