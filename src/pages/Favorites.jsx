// src/pages/Favorites.jsx
import React from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  toggleFavourite,
  clearFavourites,
} from "../features/favorites/favoritesSlice";
import { addToCart } from "../features/cart/cartSlice";
import { Link, useNavigate } from "react-router-dom";
import { FiTrash2, FiArrowLeft, FiShoppingCart, FiHeart } from "react-icons/fi";
import Footer from "../Authcomponents/Footer";

export default function Favorites() {
  const favorites = useSelector((state) => state.favorites.items ?? []);
  const cart = useSelector((state) => state.cart.items);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleBuyNow = (item) => {
    const exists = cart.find((i) => i.id === item.id);
    if (!exists) {
      dispatch(addToCart(item));
    }
    navigate("/checkout");
  };

  return (
    <div className="min-h-screen bg-[var(--bg-main)] text-[var(--text-main)]">
      <div className="mx-auto max-w-6xl px-4 py-10">
        <header className="mb-8 flex items-center justify-between">
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <FiHeart className="text-secondary" /> My Favorites
          </h1>

          {favorites.length > 0 && (
            <button
              onClick={() => dispatch(clearFavourites())}
              className="rounded-xl bg-red-500 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-red-600 transition"
            >
              Clear All
            </button>
          )}
        </header>

        {favorites.length === 0 ? (
          <div className="rounded-xl border border-gray-200 bg-white p-10 text-center shadow-md">
            <p className="mb-4 text-gray-500 text-lg">No favorites yet.</p>
            <Link
              to="/products"
              className="inline-flex items-center gap-2 rounded-xl bg-secondary px-4 py-2 text-sm font-semibold text-white shadow hover:bg-primary-dark transition"
            >
              <FiArrowLeft /> Browse Products
            </Link>
          </div>
        ) : (
          <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {favorites.map((item) => (
              <li
                key={item.id}
                className="rounded-2xl border border-gray-200 bg-white p-5 shadow-md flex flex-col hover:scale-[1.02] transition-all"
              >
                <img
                  src={item.thumbnailUrl || item.img}
                  alt={item.name || item.title}
                  className="h-52 w-full rounded-lg object-cover border border-gray-200"
                />

                <div className="mt-4 flex flex-col flex-1 justify-between">
                  <h2 className="text-lg font-semibold">
                    {item.name || item.title}
                  </h2>

                  <div className="mt-3 flex items-center justify-between">
                    <span className="text-sm font-medium text-price-green">
                      {Number(item.price).toLocaleString()} EGP
                    </span>

                    <div className="flex items-center gap-3">
                      {/* ❤️ toggle favourite (add/remove) */}
                      <button
                        onClick={() => dispatch(toggleFavourite(item))}
                        className="text-red-500 hover:text-red-700"
                        title="Remove from Favorites"
                      >
                        <FiTrash2 size={18} />
                      </button>

                      <button
                        onClick={() => handleBuyNow(item)}
                        className="flex items-center gap-1 rounded-xl bg-secondary px-3 py-1 text-sm font-semibold text-white hover:bg-primary-dark transition"
                        title="Buy Now"
                      >
                        <FiShoppingCart size={16} /> Buy
                      </button>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <Footer />
    </div>
  );
}
