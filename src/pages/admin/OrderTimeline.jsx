// src/admin/OrderTimeline.jsx
import React from "react";
import { useOrderTimeline } from "../../hooks/useOrderTimeline";

export default function OrderTimeline({ orderId }) {
  const { timeline = [], loading } = useOrderTimeline(orderId);

  if (loading) return <p>Loading timeline...</p>;
  if (!timeline.length) return <p>No updates yet.</p>;

  return (
    <div className="mt-4 border-l-2 border-gray-200 pl-4">
      {timeline.map((item, idx) => (
        <div key={idx} className="mb-2">
          <div className="text-xs text-gray-500">
            {new Date(item.date.seconds * 1000).toLocaleString()}
          </div>
          <div className="text-sm">{item.status}</div>
        </div>
      ))}
    </div>
  );
}
