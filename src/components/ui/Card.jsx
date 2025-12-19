export default function Card({ children, className = "", onClick }) {
  return (
    <div
      onClick={onClick}
      className={`rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] shadow-[var(--shadow-sm)] transition hover:shadow-[var(--shadow-md)] ${onClick ? "cursor-pointer" : ""
        } ${className}`}
    >
      {children}
    </div>
  );
}
