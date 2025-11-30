import { useEffect, useRef, useState } from "react";
import { collection, onSnapshot, query } from "firebase/firestore";
import toast from "react-hot-toast";
import { db } from "../../services/firebase";

export default function ComplaintsBadge() {
  const [count, setCount] = useState(0);
  const initialized = useRef(false);

  useEffect(() => {
    const q = query(collection(db, "support"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const complaints = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      const unreplied = complaints.filter(
        (complaint) =>
          !complaint.adminResponses || complaint.adminResponses.length === 0
      ).length;

      if (initialized.current) {
        snapshot.docChanges().forEach((change) => {
          if (change.type !== "added") return;
          const data = change.doc.data() || {};
          const awaitingReply =
            !data.adminResponses || data.adminResponses.length === 0;
          if (awaitingReply && (data.message || data.userFollowUp)) {
            new Audio("/notify.mp3")?.play?.();
            toast.success("📋 New message received!");
          }
        });
      } else {
        initialized.current = true;
      }

      setCount(unreplied);
    });

    // Listen for clear complaints counter event
    const handleClearCounter = () => {
      setCount(0);
    };

    // Listen for logout event to clear counter
    const handleLogout = () => {
      setCount(0);
      initialized.current = false; // Reset initialization
    };

    window.addEventListener('clearComplaintsCounter', handleClearCounter);
    window.addEventListener('userLogout', handleLogout);

    return () => {
      unsubscribe();
      window.removeEventListener('clearComplaintsCounter', handleClearCounter);
      window.removeEventListener('userLogout', handleLogout);
    };
  }, []);

  if (count === 0) return null;

  return (
    <span className="bg-red-600 text-white text-[10px] leading-none px-1.5 py-0.5 rounded-full shadow absolute -top-1 -right-1">
      {count}
    </span>
  );
}
