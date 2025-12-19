export default function Skeleton({ className = "" }) {
  return (
    <div
      className={`animate-pulse rounded-[var(--radius-md)] bg-[var(--color-border)]/60 ${className}`}
    />
  );
}
