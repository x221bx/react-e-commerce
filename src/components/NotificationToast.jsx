// src/components/NotificationToast.jsx
import React, { useEffect } from "react";

export default function NotificationToast({ notif, onClose, navigate }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose(notif.id);
    }, 3000); // يظهر 3 ثواني فقط
    return () => clearTimeout(timer);
  }, [notif, onClose]);

  const createdAtStr =
    notif?.createdAt?.toDate?.()?.toLocaleTimeString?.() ||
    (notif?.createdAt ? new Date(notif.createdAt).toLocaleTimeString() : "");

  const handleClose = (e) => {
    e.stopPropagation();
    onClose(notif.id);
  };

  const handleNavigate = () => {
    if (notif?.orderId) navigate(`/order/${notif.orderId}`);
    else if (notif?.target) navigate(notif.target);
  };

  return (
    <div
      onClick={handleNavigate}
      className={`fixed top-5 right-5 bg-white border-l-4 ${
        notif.type === "new" ? "border-green-500" : "border-red-500"
      } shadow-md p-4 rounded-md cursor-pointer w-80 z-50 hover:shadow-lg transition`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <p className="text-sm font-semibold">{notif.message}</p>
          <p className="text-xs text-gray-500">{createdAtStr}</p>
        </div>
        <button
          onClick={handleClose}
          aria-label="close"
          className="text-slate-400 hover:text-slate-600 ml-3"
        >
          ×
        </button>
      </div>
    </div>
  );
}
