import { useAutoStock } from "../hooks/useAutoStock";

export default function StockAlerts() {
  const { needsRestock } = useAutoStock();

  if (needsRestock.length === 0) return null;

  return (
    <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg">
      <h4 className="font-semibold">Critical Stock Alerts!</h4>
      <ul className="list-disc pl-5">
        {needsRestock.map((p) => (
          <li key={p.id}>
            {p.title} - {p.stock} left
          </li>
        ))}
      </ul>
    </div>
  );
}
