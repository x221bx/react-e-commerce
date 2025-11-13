// src/pages/Cart.jsx
import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { removeFromCart, clearCart } from "../features/cart/cartSlice";
import { Link } from "react-router-dom";
import { FiTrash2, FiShoppingCart } from "react-icons/fi";

export default function Cart() {
  const dispatch = useDispatch();
  const { items } = useSelector((state) => state.cart);

  const totalPrice = items.reduce((sum, item) => sum + (item.price || 0), 0);

  return (
    <div className="min-h-screen bg-[#f5fff5] text-[#203232]">
      <div className="mx-auto w-full max-w-6xl px-4 py-10">
        <div className="bg-white border border-gray-200 rounded-2xl shadow-md p-8">
          <h1 className="text-3xl font-bold mb-6 flex items-center gap-2">
            <FiShoppingCart className="text-[#52b788]" /> Cart
          </h1>

          {items.length === 0 ? (
            <p className="text-gray-500 text-center text-lg">
              Your cart is empty.
            </p>
          ) : (
            <>
              <ul className="divide-y divide-gray-200">
                {items.map((item) => (
                  <li
                    key={item.id}
                    className="py-4 flex flex-col md:flex-row items-center gap-4"
                  >
                    <img
                      src={
                        item.thumbnailUrl ||
                        "https://via.placeholder.com/150?text=No+Image"
                      }
                      alt={item.title}
                      className="w-40 h-40 rounded-lg object-cover border border-gray-200"
                    />
                    <div className="flex-1 text-center md:text-left">
                      <h3 className="text-lg font-semibold">{item.title}</h3>
                      <p className="text-sm text-gray-500">{item.category}</p>
                      <p className="font-medium text-[#2d6a4f] mt-1">
                        {Number(item.price || 0).toLocaleString()} EGP
                      </p>
                    </div>
                    <button
                      onClick={() => dispatch(removeFromCart(item.id))}
                      className="rounded-xl bg-red-500 text-white px-4 py-2 text-sm font-semibold shadow hover:bg-red-600 transition"
                    >
                      <FiTrash2 />
                    </button>
                  </li>
                ))}
              </ul>

              <div className="mt-8 flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="font-semibold text-lg">
                  Total: {totalPrice.toLocaleString()} EGP
                </div>
                <div className="flex gap-4 flex-wrap">
                  <button
                    onClick={() => dispatch(clearCart())}
                    className="rounded-xl bg-red-500 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-red-600 transition"
                  >
                    Clear Cart
                  </button>
                  <Link
                    to="/checkout"
                    className="flex items-center gap-2 rounded-xl bg-[#52b788] px-4 py-2 text-sm font-semibold text-white shadow hover:bg-[#40916c] transition"
                  >
                    Checkout
                  </Link>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
