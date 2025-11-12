// import React from "react";
// import { useDispatch, useSelector } from "react-redux";
// import { removeFromCart, clearCart } from "../hooks/cartSlice";
// import { Link } from "react-router-dom";
// import { FiTrash2, FiShoppingCart } from "react-icons/fi";

// export default function CartPanel() {
//   const dispatch = useDispatch();
//   const { items } = useSelector((state) => state.cart);

//   const totalPrice = items.reduce((sum, item) => sum + (item.price || 0), 0);

//   return (
//     <div className="relative min-h-screen text-white">
//       <div
//         className="absolute inset-0 -z-10 bg-cover bg-center"
//         style={{
//           backgroundImage:
//             "url('https://images.unsplash.com/photo-1578926287945-3f30a3d3b305?auto=format&fit=crop&w=1600&q=80')",
//         }}
//       >
//         <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
//       </div>

//       <div className="mx-auto w-full max-w-6xl px-4 py-10">
//         <div className="bg-white/10 border border-white/20 rounded-2xl shadow-xl backdrop-blur-md p-8">
//           <h1 className="text-3xl font-bold mb-6 flex items-center gap-2">
//             <FiShoppingCart className="text-cyan-400" /> Cart
//           </h1>

//           {items.length === 0 ? (
//             <p className="text-gray-400 text-center text-lg">
//               Your cart is empty.
//             </p>
//           ) : (
//             <>
//               <ul className="divide-y divide-white/10">
//                 {items.map((item) => (
//                   <li
//                     key={item.id}
//                     className="py-4 flex flex-col md:flex-row items-center gap-4"
//                   >
//                     <img
//                       src={
//                         item.thumbnailUrl ||
//                         "https://via.placeholder.com/150?text=No+Image"
//                       }
//                       alt={item.title}
//                       className="w-40 h-40 rounded-lg object-cover"
//                     />
//                     <div className="flex-1 text-center md:text-left">
//                       <h3 className="text-lg font-semibold">{item.title}</h3>
//                       <p className="text-sm text-gray-300">{item.category}</p>
//                       <p className="font-medium text-cyan-300 mt-1">
//                         ${Number(item.price || 0).toLocaleString()} USD
//                       </p>
//                     </div>
//                     <button
//                       onClick={() => dispatch(removeFromCart(item.id))}
//                       className="rounded-xl bg-red-500 px-4 py-2 text-sm font-semibold shadow hover:bg-red-600 transition"
//                     >
//                       <FiTrash2 />
//                     </button>
//                   </li>
//                 ))}
//               </ul>

//               <div className="mt-8 flex flex-col md:flex-row justify-between items-center gap-4">
//                 <div className="text-white font-semibold text-lg">
//                   Total: ${totalPrice.toLocaleString()} USD
//                 </div>
//                 <div className="flex gap-4 flex-wrap">
//                   <button
//                     onClick={() => dispatch(clearCart())}
//                     className="rounded-xl bg-red-500 px-4 py-2 text-sm font-semibold shadow hover:bg-red-600 transition"
//                   >
//                     Clear Cart
//                   </button>
//                   <Link
//                     to="/checkout"
//                     className="flex items-center gap-2 rounded-xl bg-cyan-600 px-4 py-2 text-sm font-semibold shadow hover:bg-cyan-700 transition"
//                   >
//                     Checkout
//                   </Link>
//                 </div>
//               </div>
//             </>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }
