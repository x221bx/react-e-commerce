// src/components/NotificationBell.jsx
import React, { useEffect, useRef } from "react";
import { FiBell } from "react-icons/fi";
import { useSelector, useDispatch } from "react-redux";
import { setOpen } from "../features/notifications/notificationsSlice";
import NotificationsList from "./NotificationsList";
import { useNotifications } from "../hooks/useNotifications";

export default function NotificationBell({ recipient = "admin" }) {
  const dispatch = useDispatch();
  const { unreadCount, open } = useSelector((s) => s.notifications || {});
  // init subscription
  const { markAllAsReadRemote } = useNotifications({ recipient });
  const ref = useRef(null);

  // close dropdown when click outside
  useEffect(() => {
    const onDoc = (e) => {
      if (!ref.current) return;
      if (!ref.current.contains(e.target)) dispatch(setOpen(false));
    };
    document.addEventListener("click", onDoc);
    return () => document.removeEventListener("click", onDoc);
  }, [dispatch]);

  const toggle = async () => {
    const next = !open;
    dispatch(setOpen(next));
    if (next) {
      // when opening, mark unread as read on the server
      try {
        await markAllAsReadRemote();
      } catch (err) {
        console.error("markAll read error", err);
      }
    }
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={toggle}
        className="relative inline-flex items-center rounded-full p-2 hover:bg-gray-100 focus:outline-none"
        aria-label="Notifications"
        title="Notifications"
      >
        <FiBell className="text-xl text-[#323D3D]" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-rose-500 px-1.5 text-[11px] font-semibold text-white">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 z-50 mt-2 w-[360px] max-w-screen-sm">
          <NotificationsList recipient={recipient} />
        </div>
      )}
    </div>
  );
}
