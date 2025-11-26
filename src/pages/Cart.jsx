import React, { useState, useEffect, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  addToCart,
  decreaseQuantity,
  removeFromCart,
  updateCartStock,
} from "../features/cart/cartSlice";
import { FiTrash2, FiShoppingCart } from "react-icons/fi";
import { db } from "../services/firebase";
import { getDocs, collection } from "firebase/firestore";
import CartFooter from "../components/CartFooter";
import { useNavigate } from "react-router-dom";

export default function Cart() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { items = [] } = useSelector((state) => state.cart || {});
  const [toast, setToast] = useState("");

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  };

  // Fetch latest stock from Firestore
  const fetchLatestStock = useCallback(async () => {
    try {
      const snapshot = await getDocs(collection(db, "products"));
      const products = snapshot.docs.map((d) => {
        const data = d.data() || {};
        const createdAt =
          data.createdAt && typeof data.createdAt.toMillis === "function"
            ? data.createdAt.toMillis()
            : data.createdAt ?? null;

        return {
          id: d.id,
          ...data,
          createdAt,
          stock: Number(data.stock ?? data.quantity ?? 0),
        };
      });

      dispatch(updateCartStock(products));
    } catch (err) {
      console.error("fetchLatestStock failed:", err);
    }
  }, [dispatch]);

  useEffect(() => {
    fetchLatestStock();
  }, [fetchLatestStock]);

  const handleAdd = (item) => {
    const qty = Number(item.quantity || 0);
    const stock = Number(item.stock || 0);

    if (qty >= stock) {
      showToast(`Max stock reached for "${item.title || item.name}"`);
      return;
    }
    dispatch(addToCart(item));
  };

  const handleDecrease = (item) => {
    const qty = Number(item.quantity || 0);
    if (qty > 1) dispatch(decreaseQuantity(item.id));
  };

  const subtotal = items.reduce(
    (sum, i) => sum + Number(i.price || 0) * Number(i.quantity || 0),
    0
  );
  const shipping = items.length ? 50 : 0;
  const total = subtotal + shipping;

  const handleGoToCheckout = () => {
    if (!items.length) {
      showToast("Cart is empty");
      return;
    }

    const invalid = items.some(
      (i) => Number(i.quantity || 0) > Number(i.stock || 0)
    );
    if (invalid) {
      showToast("Some items exceed available stock. Please update quantities.");
      return;
    }

    navigate("/checkout");
  };

  return (
    <div className="min-h-screen bg-[#f5fff5]">
      <div className="mx-auto max-w-6xl p-6">
        {toast && (
          <div className="fixed top-4 right-4 bg-yellow-100 p-3 rounded shadow z-50">
            {toast}
          </div>
        )}

        <div className="bg-white p-8 rounded-2xl shadow">
          <h1 className="text-3xl font-bold flex items-center gap-2 mb-6">
            <FiShoppingCart className="text-[#52b788]" /> Cart
          </h1>

          {!items.length ? (
            <p className="text-gray-500 text-center text-lg">
              Your cart is empty.
            </p>
          ) : (
            <>
              <ul className="divide-y">
                {items.map((item) => {
                  const price = Number(item.price || 0);
                  const qty = Number(item.quantity || 0);
                  const stock = Number(item.stock || 0);
                  const stockRem = Math.max(0, stock - qty);

                  return (
                    <li key={item.id} className="py-4 flex gap-4">
                      <img
                        src={item.thumbnailUrl || item.img}
                        className="w-32 h-32 object-cover rounded border"
                        alt={item.title || item.name}
                      />
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold">
                          {item.name || item.title}
                        </h3>
                        <p className="text-green-700 font-medium mt-1">
                          {price.toLocaleString()} EGP
                        </p>

                        <div className="mt-3 flex gap-3 items-center">
                          <button
                            onClick={() => handleDecrease(item)}
                            className="w-8 h-8 rounded-full border flex items-center justify-center"
                          >
                            -
                          </button>
                          <span className="min-w-[40px] text-center">
                            {qty}
                          </span>
                          <button
                            onClick={() => handleAdd(item)}
                            className="w-8 h-8 rounded-full border flex items-center justify-center"
                          >
                            +
                          </button>
                        </div>

                        <p className="text-sm text-gray-500 mt-2">
                          Stock remaining: {stockRem}
                        </p>
                      </div>

                      <button
                        onClick={() => dispatch(removeFromCart(item.id))}
                        className="bg-red-500 text-white px-4 py-2 rounded"
                      >
                        <FiTrash2 />
                      </button>
                    </li>
                  );
                })}
              </ul>

              <CartFooter
                title="Checkout"
                total={total}
                totaltext="Total"
                onCheckout={handleGoToCheckout}
                itemCount={items.length}
                textitem="items"
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
