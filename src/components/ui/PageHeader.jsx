export default function PageHeader({ title, subtitle, icon }) {
  return (
    <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
      <div className="flex items-center gap-3">
        {icon && (
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[var(--color-accent)]/10 text-[var(--color-accent)]">
            {icon}
          </div>
        )}
        <div>
          <h1 className="text-3xl font-bold text-[var(--color-text)]">{title}</h1>
          {subtitle && <p className="text-[var(--color-text-muted)] text-sm mt-1">{subtitle}</p>}
        </div>
      </div>
    </div>
  );
}
