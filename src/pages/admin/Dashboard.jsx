import AlertsPanel from "./AlertsPanel";
import StockAlerts from "./StockAlerts";

export default function Dashboard() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Admin Dashboard</h1>
      <StockAlerts />
      <AlertsPanel />
    </div>
  );
}
