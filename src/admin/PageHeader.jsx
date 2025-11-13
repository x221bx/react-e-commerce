export default function PageHeader({ title, actions }) {
  return (
    <header className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
      <h1 className="text-lg font-semibold text-gray-900">{title}</h1>
      {actions ? <div className="flex items-center gap-2">{actions}</div> : null}
    </header>
  );
}
