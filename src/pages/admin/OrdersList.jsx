import useOrders from "../hooks/useOrders";
import OrderTimeline from "./OrderTimeline";

export default function OrdersList() {
  const { orders = [] } = useOrders(null, true); // null uid for admin, true for isAdmin

  return (
    <div className="space-y-6">
      {orders.map((order) => (
        <div key={order.id} className="rounded-lg border p-4 shadow">
          <h3 className="font-bold">
            Order #{order.id} - {order.customerName}
          </h3>
          <p className="text-sm text-gray-500">
            {new Date(order.createdAt).toLocaleString()}
          </p>
          <OrderTimeline order={order} />
        </div>
      ))}
    </div>
  );
}
