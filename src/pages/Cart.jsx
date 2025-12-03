import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  addToCart,
  decreaseQuantity,
  removeFromCart,
  updateCartStock,
} from "../features/cart/cartSlice";
import { FiTrash2, FiShoppingCart, FiPlus, FiMinus } from "react-icons/fi";
import { db } from "../services/firebase";
import { getDocs, collection } from "firebase/firestore";
import CartFooter from "../components/CartFooter";
import Footer from "../Authcomponents/Footer";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

export default function Cart() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { items = [] } = useSelector((state) => state.cart || {});
  const [toast, setToast] = useState("");

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  };

  // Fetch latest stock from Firestore
  const fetchLatestStock = async () => {
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
  };

  useEffect(() => {
    fetchLatestStock();
  }, []);

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
      showToast(t("checkout.messages.emptyCart", "Your cart is empty."));
      return;
    }

    const invalid = items.some(
      (i) => Number(i.quantity || 0) > Number(i.stock || 0)
    );
    if (invalid) {
      showToast(t("checkout.messages.stockIssue", "Some items exceed stock. Please update quantities."));
      return;
    }

    navigate("/checkout");
  };

  return (
    <div className="min-h-screen bg-[var(--bg-main)] font-inter">
      <div className="mx-auto max-w-6xl p-6">
        {toast && (
          <div className="fixed top-4 rtl:left-4 ltr:right-4 bg-yellow-100 p-3 rounded shadow z-50">
            {toast}
          </div>
        )}

        <div className="bg-white p-6 md:p-8 rounded-2xl shadow-lg">
          <h1 className="text-3xl font-bold flex items-center gap-2 mb-6 text-text-dark">
            <FiShoppingCart className="text-secondary" /> {t("nav.cart", "Cart")}
          </h1>

          {!items.length ? (
            <p className="text-gray-500 text-center text-lg">
              {t("checkout.empty.title", "Your cart is empty")}
            </p>
          ) : (
            <>
              <ul className="divide-y divide-gray-200">
                {items.map((item) => {
                  const price = Number(item.price || 0);
                  const qty = Number(item.quantity || 0);
                  const stock = Number(item.stock || 0);
                  const stockRem = Math.max(0, stock - qty);

                  return (
                    <li
                      key={item.id}
                      className="py-4 flex flex-col sm:flex-row gap-4 items-start sm:items-center"
                    >
                      <div className="w-full sm:w-32 h-32 flex-shrink-0 overflow-hidden rounded-lg border border-gray-200">
                        {item.thumbnailUrl || item.img ? (
                          <img
                            src={item.thumbnailUrl || item.img}
                            alt={item.title || item.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400">
                            No Image
                          </div>
                        )}
                      </div>

                      <div className="flex-1 flex flex-col justify-between">
                        <div>
                          <h3 className="text-lg font-semibold text-text-dark">
                            {item.name || item.title}
                          </h3>
                          <p className="text-green-700 font-medium mt-1">
                            {price.toLocaleString()} EGP
                          </p>
                        </div>

                        <div className="mt-3 flex items-center gap-3">
                          <button
                            onClick={() => handleDecrease(item)}
                            className="w-8 h-8 rounded-full border flex items-center justify-center text-gray-700 hover:bg-gray-100"
                          >
                            <FiMinus />
                          </button>
                          <span className="min-w-[40px] text-center">
                            {qty}
                          </span>
                          <button
                            onClick={() => handleAdd(item)}
                            className="w-8 h-8 rounded-full border flex items-center justify-center text-gray-700 hover:bg-gray-100"
                          >
                            <FiPlus />
                          </button>
                        </div>

                                              </div>

                      <button
                        onClick={() => dispatch(removeFromCart(item.id))}
                        className="mt-3 sm:mt-0 bg-red-500 text-white px-4 py-2 rounded flex items-center justify-center hover:bg-red-600"
                      >
                        <FiTrash2 size={20} />
                      </button>
                    </li>
                  );
                })}
              </ul>

              <CartFooter
                title={t("checkout.header.eyebrow", "Checkout")}
                total={total}
                totaltext={t("checkout.summary.total", "Total")}
                onCheckout={handleGoToCheckout}
                itemCount={items.length}
                textitem={t("checkout.summary.quantity_plural", "items")}
              />
            </>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}
