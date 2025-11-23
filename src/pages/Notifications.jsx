// // src/pages/Notifications.jsx
// import React, { useEffect, useState } from "react";
// import {
//   collection,
//   query,
//   orderBy,
//   onSnapshot,
//   updateDoc,
//   doc,
// } from "firebase/firestore";
// import { db } from "../services/firebase";
// import { useNavigate } from "react-router-dom";
// import { FiUser, FiPackage, FiClock, FiAlertTriangle } from "react-icons/fi";

// export default function Notifications() {
//   const [notifications, setNotifications] = useState([]);
//   const navigate = useNavigate();

//   useEffect(() => {
//     const q = query(
//       collection(db, "notifications"),
//       orderBy("createdAt", "desc")
//     );
//     const unsub = onSnapshot(q, (snap) => {
//       setNotifications(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
//     });
//     return () => unsub();
//   }, []);

//   const markAsRead = async (notifId) => {
//     try {
//       await updateDoc(doc(db, "notifications", notifId), {
//         read: true,
//         readAt: new Date(),
//       });
//     } catch (err) {
//       console.error("markAsRead error", err);
//     }
//   };

//   const formatDate = (ts) => {
//     if (!ts) return "";
//     if (ts.toDate) return ts.toDate().toLocaleString();
//     if (ts.seconds) return new Date(ts.seconds * 1000).toLocaleString();
//     return new Date(ts).toLocaleString();
//   };

//   return (
//     <div className="p-6 max-w-4xl mx-auto">
//       <div className="flex items-center justify-between mb-6">
//         <h1 className="text-3xl font-bold">Notifications</h1>
//         <div className="text-sm text-gray-600">
//           {notifications.filter((n) => !n.read).length} unread
//         </div>
//       </div>

//       {notifications.length === 0 && (
//         <div className="text-gray-500 p-6 bg-white rounded-lg shadow">
//           No notifications.
//         </div>
//       )}

//       <ul className="space-y-4">
//         {notifications.map((n) => (
//           <li
//             key={n.id}
//             onClick={async () => {
//               if (!n.read) await markAsRead(n.id);
//               // navigate to order or product if applicable
//               if (n.orderId) navigate(`/admin/orders/${n.orderId}`);
//               else navigate("/notifications");
//             }}
//             className={`relative p-5 rounded-xl shadow cursor-pointer border-l-4 transition hover:scale-[1.01]
//               ${
//                 n.read
//                   ? "bg-gray-50 border-gray-300"
//                   : n.type === "low-stock"
//                   ? "bg-yellow-50 border-yellow-400"
//                   : n.type === "new"
//                   ? "bg-green-50 border-green-500"
//                   : "bg-white border-indigo-200"
//               }`}
//           >
//             {!n.read && (
//               <span className="absolute top-4 right-4 w-3 h-3 bg-rose-500 rounded-full" />
//             )}

//             <div className="flex items-start gap-4">
//               <div className="bg-white p-3 rounded-full shadow">
//                 <FiUser className="text-gray-700 text-xl" />
//               </div>

//               <div className="flex-1">
//                 <div className="flex items-center justify-between gap-4">
//                   <p className="font-semibold text-lg">{n.message}</p>
//                   <span className="text-xs text-gray-500">
//                     {formatDate(n.createdAt)}
//                   </span>
//                 </div>

//                 <div className="mt-2 text-sm text-gray-600 space-y-1">
//                   {n.orderId && (
//                     <div className="flex items-center gap-2">
//                       <FiPackage /> <b>Order:</b> #{n.orderId}
//                     </div>
//                   )}
//                   {n.productId && (
//                     <div className="flex items-center gap-2">
//                       <FiAlertTriangle /> <b>Product:</b>{" "}
//                       {n.productName || n.productId}
//                     </div>
//                   )}
//                   {n.userName && (
//                     <div className="flex items-center gap-2">
//                       <FiUser /> <b>Customer:</b> {n.userName}
//                     </div>
//                   )}
//                 </div>
//               </div>
//             </div>
//           </li>
//         ))}
//       </ul>
//     </div>
//   );
// }
