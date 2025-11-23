// import { useEffect, useState } from "react";
// import {
//   collection,
//   query,
//   orderBy,
//   onSnapshot,
//   addDoc,
//   updateDoc,
//   doc,
//   Timestamp,
// } from "firebase/firestore";
// import { db } from "../services/firebase";

// export default function useNotifications(isAdmin = false) {
//   const [notifications, setNotifications] = useState([]);
//   const [unreadCount, setUnreadCount] = useState(0);

//   useEffect(() => {
//     if (!isAdmin) return;

//     const q = query(
//       collection(db, "notifications"),
//       orderBy("createdAt", "desc")
//     );

//     const unsub = onSnapshot(q, (snap) => {
//       const data = snap.docs.map((d) => ({
//         id: d.id,
//         ...d.data(),
//       }));

//       setNotifications(data);

//       const unread = data.filter((n) => !n.read).length;
//       setUnreadCount(unread);
//     });

//     return () => unsub();
//   }, [isAdmin]);

//   const pushNotification = async ({
//     orderId,
//     message,
//     type = "new",
//     userName,
//   }) => {
//     await addDoc(collection(db, "notifications"), {
//       orderId,
//       message,
//       type,
//       read: false,
//       userName,
//       createdAt: Timestamp.now(),
//     });
//   };

//   const markAsRead = async (id) => {
//     await updateDoc(doc(db, "notifications", id), {
//       read: true,
//       readAt: new Date(),
//     });
//   };

//   return {
//     notifications,
//     unreadCount,
//     pushNotification,
//     markAsRead,
//   };
// }
