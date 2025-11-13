// src/pages/ProductDetails.jsx
import { useParams, Link } from "react-router-dom";
import { useProduct } from "../hooks/useProduct"; // بديل useCourse
import { useDispatch, useSelector } from "react-redux";
import {
  pushFavourites,
  removeFavourite,
} from "../features/favorites/favoritesSlice";
import { addToCart } from "../features/cart/cartSlice";
import { FiHeart, FiShoppingCart, FiArrowLeft } from "react-icons/fi";
import React from "react";

export default function ProductDetails() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const favorites = useSelector((state) => state.favorites);
  const cart = useSelector((state) => state.cart.items);

  // Hook لجلب بيانات المنتج الزراعي
  const { data: product, isLoading, isError, error } = useProduct(id);

  const isFavorite = favorites.some((f) => f.id === id);
  const inCart = cart.some((c) => c.id === id);

  const handleToggleFavorite = () => {
    if (!product) return;
    if (isFavorite) dispatch(removeFavourite(id));
    else dispatch(pushFavourites(product));
  };

  const handleAddToCart = () => {
    if (!product || inCart) return;
    dispatch(addToCart(product));
  };

  if (isLoading) return <LoadingPlaceholder />;
  if (isError) return <ErrorPlaceholder message={error?.message} />;
  if (!product) return <ErrorPlaceholder message="Product not found." />;

  return (
    <div className="relative min-h-screen text-white px-4 py-12 sm:px-6 lg:px-8">
      {/* Background */}

      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      {/* Breadcrumb / Back */}
      <div className="mb-6">
        <Link
          to="/products"
          className="inline-flex items-center gap-1 text-sm text-[#49BBBD] hover:underline"
        >
          <FiArrowLeft /> Back to Products
        </Link>
      </div>

      {/* Product Card */}
      <div className="mx-auto max-w-5xl rounded-2xl bg-white/5 backdrop-blur-md border border-white/20 shadow-xl overflow-hidden">
        {/* Thumbnail */}
        <div className="relative">
          {product.thumbnailUrl ? (
            <img
              src={product.thumbnailUrl}
              alt={product.title}
              className="h-90 w-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="grid h-60 w-full place-items-center bg-white/5 text-xs text-white/50">
              No Image
            </div>
          )}
          {/* CTA Buttons */}
          <div className="absolute bottom-4 right-4 flex flex-wrap gap-2">
            <button
              onClick={handleToggleFavorite}
              className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold backdrop-blur-md border border-white/20 transition ${
                isFavorite
                  ? "bg-red-500 border-red-500 hover:bg-red-600"
                  : "bg-white/10 hover:bg-white/20"
              }`}
            >
              <FiHeart /> {isFavorite ? "Favorited" : "Add to Fav"}
            </button>

            <button
              onClick={handleAddToCart}
              disabled={inCart}
              className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold backdrop-blur-md border border-white/20 transition ${
                inCart
                  ? "bg-gray-500 border-gray-500 cursor-not-allowed"
                  : "bg-white/10 hover:bg-[#49BBBD]/20"
              }`}
            >
              <FiShoppingCart /> {inCart ? "In Cart" : "Add to Cart"}
            </button>
          </div>
        </div>

        {/* Product Info */}
        <div className="p-8 space-y-6">
          <h1 className="text-3xl font-bold text-white">{product.name}</h1>
          <p className="text-white/80">{product.description}</p>

          <div className="flex flex-wrap items-center gap-4 text-sm">
            <span className="rounded-full bg-[#49BBBD]/20 px-4 py-1 font-medium text-[#49BBBD]">
              Price: {Number(product.price || 0).toLocaleString()}{" "}
              {product.currency || "USD"}
            </span>

            {product.category && (
              <span className="rounded-full bg-white/10 px-4 py-1 text-white/80">
                Category: {product.category}
              </span>
            )}

            {product.createdAt && (
              <span className="text-white/60">
                Added: {new Date(product.createdAt).toLocaleDateString()}
              </span>
            )}
          </div>

          {product.supplier && (
            <div className="mt-4 border-t border-white/20 pt-4 text-sm text-white/80">
              <p>
                <strong>Supplier:</strong> {product.supplier}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Loading Skeleton
function LoadingPlaceholder() {
  return (
    <div className="mx-auto max-w-3xl p-6 text-center text-white/70">
      Loading product...
    </div>
  );
}

// Error Placeholder
function ErrorPlaceholder({ message }) {
  return (
    <div className="mx-auto max-w-3xl p-6 text-center text-red-500">
      {message}
    </div>
  );
}
