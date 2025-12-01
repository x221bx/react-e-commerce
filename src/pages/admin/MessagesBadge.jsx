// src/pages/admin/MessagesBadge.jsx
import { useEffect, useState } from "react";
import { db } from "../../services/firebase";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import toast from "react-hot-toast";

export default function MessageBadge() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const q = query(
      collection(db, "contactMessages"),
      where("seen", "==", false)
    );

    const unsub = onSnapshot(q, (snapshot) => {
      const newCount = snapshot.size;

      // تشغيل التنبيه عند وصول رسالة جديدة
      if (newCount > count) {
        new Audio("/notify.mp3")?.play?.();
        toast.success("📩 رسالة جديدة وصلت الآن");
      }

      setCount(newCount);
    });

    return () => unsub();
  }, []);

  if (count === 0) return null;

  return (
    <span
      className="
        bg-red-600 text-white
        text-[10px] leading-none
        px-1.5 py-0.5 rounded-full
        shadow absolute -top-1 -right-1
      "
    >
      {count}
    </span>
  );
}
