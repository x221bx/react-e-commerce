export default function StatsCard({ title, value, link }) {
  return (
    <div className="rounded-lg border p-4 shadow hover:shadow-md transition cursor-pointer">
      <h3 className="text-sm text-gray-500">{title}</h3>
      <p className="text-2xl font-bold">{value}</p>
      {link && (
        <a href={link} className="text-xs text-blue-600 hover:underline">
          View
        </a>
      )}
    </div>
  );
}
