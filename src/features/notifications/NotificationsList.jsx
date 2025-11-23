// src/components/NotificationsList.jsx
import React from "react";
import { useSelector } from "react-redux";
import { formatDistanceToNow } from "date-fns";
import { useNotifications } from "../hooks/useNotifications";

export default function NotificationsList({ recipient = "admin" }) {
  const items = useSelector((s) => s.notifications?.items || []);
  const { markOneAsReadRemote } = useNotifications({ recipient });

  const onClickItem = async (item) => {
    // open or navigate to item.meta.link if exists
    if (!item.read) {
      try {
        await markOneAsReadRemote(item.id);
      } catch (err) {
        console.error("mark one read error", err);
      }
    }
    if (item.meta?.path) {
      window.location.href = item.meta.path; // أو استخدم navigate من react-router
    }
  };

  return (
    <div className="rounded-xl border border-gray-200 bg-white shadow-lg">
      <div className="px-4 py-3 border-b flex items-center justify-between">
        <div className="font-semibold text-sm">Notifications</div>
        <div className="text-xs text-gray-500">{items.length} total</div>
      </div>

      <div className="max-h-80 overflow-y-auto">
        {items.length === 0 && (
          <div className="p-4 text-sm text-gray-500">No notifications</div>
        )}

        {items.map((it) => (
          <button
            key={it.id}
            onClick={() => onClickItem(it)}
            className={`w-full text-left px-4 py-3 hover:bg-gray-50 flex gap-3 ${
              it.read ? "opacity-80" : "bg-white"
            }`}
          >
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <div className="font-medium text-sm">{it.title}</div>
                <div className="text-xs text-gray-400">
                  {formatDistanceToNow(new Date(it.createdAtMs), {
                    addSuffix: true,
                  })}
                </div>
              </div>
              <div className="text-sm text-gray-600 mt-1">{it.body}</div>
              {it.meta?.note && (
                <div className="mt-1 text-xs text-gray-400">{it.meta.note}</div>
              )}
            </div>
            {!it.read && (
              <div className="ml-2 flex items-center">
                <span className="h-2 w-2 rounded-full bg-rose-500" />
              </div>
            )}
          </button>
        ))}
      </div>

      <div className="px-3 py-2 border-t text-center text-xs text-gray-500">
        Real-time via Firestore
      </div>
    </div>
  );
}
