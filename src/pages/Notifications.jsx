// src/pages/Notifications.jsx
import React from "react";
import { useSelector } from "react-redux";
import { selectCurrentUser } from "../features/auth/authSlice";
import { useNotifications } from "../hooks/useNotifications";
import { useNavigate } from "react-router-dom";

export default function NotificationsPage() {
  const user = useSelector(selectCurrentUser);
  const { notifications, loading, markRead, markAllRead, unreadCount } =
    useNotifications({
      uid: user?.uid,
      role: user?.role,
    });
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-3xl">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold">Notifications</h1>
          <div className="flex items-center gap-3">
            <div className="text-sm text-gray-600">Unread: {unreadCount}</div>
            <button
              onClick={() => markAllRead()}
              className="rounded-md bg-[#2F7E80] px-3 py-1 text-white text-sm"
            >
              Mark all read
            </button>
          </div>
        </div>

        <div className="space-y-3">
          {loading && <div>Loading…</div>}
          {!loading && notifications.length === 0 && (
            <div className="rounded-lg border border-gray-200 bg-white p-6 text-center text-gray-600">
              No notifications yet.
            </div>
          )}

          {notifications.map((n) => (
            <div
              key={n.id}
              onClick={async () => {
                if (!n.read) await markRead(n.id);
                // optional: route based on type
                if (n.orderId) navigate(`/orders/${n.orderId}`);
                else if (n.productId) navigate(`/products/${n.productId}`);
              }}
              className={[
                "cursor-pointer rounded-lg border p-4 transition",
                n.read
                  ? "bg-white border-gray-100"
                  : "bg-[#E8FFFB] border-[#2F7E80]",
              ].join(" ")}
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="font-semibold text-gray-900">{n.title}</div>
                  <div className="text-sm text-gray-600 mt-1">{n.message}</div>
                </div>
                <div className="text-xs text-gray-500">
                  {n.createdAt?.toDate
                    ? n.createdAt.toDate().toLocaleString()
                    : n.createdAt?.seconds
                    ? new Date(n.createdAt.seconds * 1000).toLocaleString()
                    : ""}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
