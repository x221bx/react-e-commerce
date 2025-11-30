// src/pages/ProductDetails.jsx
import React, { useMemo, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { toggleFavourite } from "../features/favorites/favoritesSlice";
import { addToCart } from "../features/cart/cartSlice";
import { BsHeart, BsHeartFill, BsArrowLeft, BsStarFill } from "react-icons/bs";
import { useProduct } from "../hooks/useProduct";
import Footer from "../components/layout/Footer";

export default function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [activeTab, setActiveTab] = useState("description");

  const favorites = useSelector((state) => state.favorites?.items ?? []);
  const cart = useSelector((state) => state.cart?.items ?? []);

  const { data: product, isLoading, isError } = useProduct(id);

  const isFavorite = useMemo(
    () => favorites.some((f) => String(f.id) === String(id)),
    [favorites, id]
  );
  const inCart = useMemo(
    () => cart.some((c) => String(c.id) === String(id)),
    [cart, id]
  );

  const handleToggleFavorite = () =>
    product && dispatch(toggleFavourite(product));
  const handleAddToCart = () =>
    product && !inCart && dispatch(addToCart({ ...product, quantity: 1 }));

  /* Loading */
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F5F7FA]">
        <p className="text-gray-500 text-base">جاري تحميل المنتج...</p>
      </div>
    );
  }

  /* Error */
  if (isError || !product) {
    return (
      <div className="min-h-screen bg-[#F5F7FA] flex items-center justify-center p-8">
        <div className="text-center">
          <div className="text-7xl mb-4">🔍</div>
          <h1 className="text-2xl font-semibold text-gray-800">
            المنتج غير موجود
          </h1>
          <p className="text-gray-500 text-sm mb-4">
            تحقق من الرابط أو حاول لاحقًا.
          </p>
          <button
            onClick={() => navigate("/products")}
            className="px-8 py-2 text-sm bg-[#2E7D32] text-white rounded-lg hover:bg-green-700 transition"
          >
            العودة للمنتجات
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F7FA] pt-24 pb-14">
      <div className="max-w-6xl mx-auto px-4">
        {/* Breadcrumb */}
        <Link
          to="/products"
          className="inline-flex items-center gap-2 text-[#0288D1] text-sm font-medium mb-6 hover:underline"
        >
          <BsArrowLeft /> العودة للمنتجات
        </Link>

        {/* Product Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="grid lg:grid-cols-2">
            {/* Image */}
            <div className="flex items-center justify-center bg-gray-100 p-6">
              <img
                src={product.thumbnailUrl}
                className="max-h-[420px] object-contain"
              />
            </div>

            {/* Info */}
            <div className="p-6 space-y-4 text-sm">
              {/* Title */}
              <h1 className="text-xl font-semibold text-gray-800">
                {product.title || product.name}
              </h1>

              {/* Medical Verified */}
              <div className="flex items-center gap-2 text-[#2E7D32] mt-1">
                <span className="text-xs font-medium bg-green-100 text-green-700 px-2 py-1 rounded-md">
                  ✔ منتج طبي موثوق
                </span>
              </div>

              {/* Price */}
              <div className="pt-2">
                <span className="text-gray-500">السعر:</span>
                <span className="text-xl font-bold text-[#2E7D32] ml-1">
                  {Number(product.price).toLocaleString()} ج.م
                </span>
              </div>

              {/* Rating */}
              <div className="flex items-center gap-1 text-yellow-500">
                {[1, 2, 3, 4, 5].map((i) => (
                  <BsStarFill key={i} className="w-4 h-4" />
                ))}
                <span className="text-gray-500 text-xs">(124 تقييم)</span>
              </div>

              {/* Supplier & Info */}
              <div className="grid grid-cols-2 gap-3 text-xs mt-2">
                <div>
                  <p className="text-gray-500">المورد:</p>
                  <p className="font-medium">{product.supplier}</p>
                </div>
                <div>
                  <p className="text-gray-500">الفئة:</p>
                  <p className="font-medium">{product.category}</p>
                </div>
              </div>

              {/* Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleAddToCart}
                  disabled={inCart}
                  className={`flex-1 py-2 rounded-lg text-white text-sm font-medium ${
                    inCart ? "bg-gray-400" : "bg-[#2E7D32] hover:bg-green-700"
                  }`}
                >
                  {inCart ? "موجود في السلة" : "أضف للسلة"}
                </button>

                <button
                  onClick={handleToggleFavorite}
                  className={`px-5 py-2 rounded-lg border text-sm font-medium ${
                    isFavorite
                      ? "bg-red-500 text-white border-red-500"
                      : "border-[#0288D1] text-[#0288D1]"
                  }`}
                >
                  {isFavorite ? "في المفضلة" : "أضف للمفضلة"}
                </button>
              </div>

              {/* Free Shipping */}
              <div className="bg-blue-50 text-[#0288D1] text-xs px-3 py-2 rounded-md mt-3">
                🚚 شحن مجاني للطلبات فوق 500 ج.م
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mt-6 bg-white border rounded-xl shadow-sm p-4 text-sm">
          <div className="flex gap-4 border-b pb-2 text-gray-600">
            {["description", "usage", "warnings", "ingredients"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-2 ${
                  activeTab === tab
                    ? "text-[#0288D1] font-semibold border-b-2 border-[#0288D1]"
                    : ""
                }`}
              >
                {tab === "description" && "الوصف"}
                {tab === "usage" && "طريقة الاستخدام"}
                {tab === "warnings" && "التحذيرات"}
                {tab === "ingredients" && "المكونات"}
              </button>
            ))}
          </div>

          <div className="pt-4 text-gray-700 leading-relaxed">
            {activeTab === "description" &&
              (product.description || "لا يوجد وصف.")}
            {activeTab === "usage" && "يستخدم حسب إرشادات المختص."}
            {activeTab === "warnings" &&
              "تجنب الاستخدام المفرط. يحفظ بعيدًا عن متناول الأطفال."}
            {activeTab === "ingredients" && "مكونات المنتج غير متاحة."}
          </div>
        </div>

        {/* Ask Pharmacist */}
        <div className="mt-4 bg-green-50 border border-green-200 p-4 rounded-xl text-sm text-green-800">
          💬 هل لديك سؤال حول المنتج؟
          <button className="ml-2 underline font-medium text-[#2E7D32]">
            اسأل ال AI الآن
          </button>
        </div>
      </div>

      <Footer />
    </div>
  );
}
