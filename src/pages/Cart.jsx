import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  addToCart,
  decreaseQuantity,
  removeFromCart,
  clearCart,
  syncStock,
} from "../features/cart/cartSlice";
import { Link } from "react-router-dom";
import { FiTrash2, FiShoppingCart } from "react-icons/fi";

export default function Cart() {
  const dispatch = useDispatch();
  const { items } = useSelector((state) => state.cart);
  const [toast, setToast] = useState("");

  const showToast = (message) => {
    setToast(message);
    setTimeout(() => setToast(""), 3000);
  };

  const handleAdd = (item) => {
    if ((item.quantity || 1) >= (item.stock || Infinity)) {
      showToast(`Max stock reached for "${item.title || item.name}"`);
      return;
    }
    dispatch(addToCart(item));
    dispatch(syncStock({ id: item.id }));

    if (item.stock - (item.quantity || 0) < 5) {
      showToast(
        `Stock is low for "${item.title || item.name}" (${
          item.stock - (item.quantity || 0)
        } left)`
      );
    }
  };

  const handleDecrease = (item) => {
    if ((item.quantity || 1) <= 1) return;
    dispatch(decreaseQuantity(item.id));
    dispatch(syncStock({ id: item.id }));
  };

  const subtotal = items.reduce(
    (sum, i) => sum + Number(i.price) * (i.quantity || 1),
    0
  );
  const shipping = items.length > 0 ? 50 : 0;
  const total = subtotal + shipping;

  return (
    <div className="min-h-screen bg-[#f5fff5] text-[#203232]">
      <div className="mx-auto w-full max-w-6xl px-4 py-10">
        {toast && (
          <div className="fixed top-4 right-4 bg-yellow-100 border border-yellow-300 text-yellow-800 px-4 py-2 rounded shadow z-50">
            {toast}
          </div>
        )}

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
                      src={item.thumbnailUrl || item.img}
                      alt={item.title || item.name}
                      className="w-40 h-40 rounded-lg object-cover border border-gray-200"
                    />
                    <div className="flex-1 text-center md:text-left">
                      <h3 className="text-lg font-semibold">
                        {item.name || item.title}
                      </h3>
                      <p className="font-medium text-[#2d6a4f] mt-1">
                        {Number(item.price).toLocaleString()} EGP
                      </p>

                      <div className="mt-3 flex items-center justify-center md:justify-start gap-3">
                        <button
                          onClick={() => handleDecrease(item)}
                          className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center text-lg hover:bg-gray-100 transition"
                        >
                          -
                        </button>

                        <span className="min-w-[40px] text-center font-semibold">
                          {item.quantity || 1}
                        </span>

                        <button
                          onClick={() => handleAdd(item)}
                          className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center text-lg hover:bg-gray-100 transition"
                        >
                          +
                        </button>
                      </div>
                      <div className="text-sm text-gray-500 mt-1">
                        Stock remaining: {item.stock - (item.quantity || 0)}
                      </div>
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

              <div className="mt-6 flex flex-col md:flex-row justify-end gap-2 text-right space-y-1 md:space-y-0">
                <div>Subtotal: {subtotal.toLocaleString()} EGP</div>
                <div>Shipping: {shipping.toLocaleString()} EGP</div>
                <div className="font-bold text-lg">
                  Total: {total.toLocaleString()} EGP
                </div>
              </div>

              <div className="mt-6 flex gap-4 flex-wrap justify-end">
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
            </>
          )}
        </div>
      </div>
    </div>
  );
}
