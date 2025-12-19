export default function Section({ title, subtitle, actions, children, className = "" }) {
  return (
    <section className={`w-full rounded-[var(--radius-lg)] bg-[var(--color-surface)] border border-[var(--color-border)] shadow-[var(--shadow-sm)] ${className}`}>
      {(title || subtitle || actions) && (
        <header className="flex flex-col gap-2 border-b border-[var(--color-border)] px-5 py-4 md:flex-row md:items-center md:justify-between">
          <div>
            {title && <h2 className="text-[var(--color-text)] text-xl font-semibold">{title}</h2>}
            {subtitle && <p className="text-[var(--color-text-muted)] text-sm mt-1">{subtitle}</p>}
          </div>
          {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
        </header>
      )}
      <div className="p-5">{children}</div>
    </section>
  );
}
