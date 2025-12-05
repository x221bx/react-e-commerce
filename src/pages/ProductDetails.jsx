import React, { useMemo, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { useTranslation } from "react-i18next";
import { toggleFavourite } from "../features/favorites/favoritesSlice";
import { addToCart } from "../features/cart/cartSlice";
import { BsHeart, BsHeartFill, BsArrowLeft } from "react-icons/bs";
import { FiCheckCircle, FiAlertTriangle, FiTag, FiBox } from "react-icons/fi";
import { useProduct } from "../hooks/useProduct";
import Footer from "../Authcomponents/Footer";

const cleanDescription = (raw = "") => {
  let text = raw || "";
  text = text.replace(/!\[[^\]]*]\([^)]+\)/g, " ");
  text = text.replace(/https?:\/\/\S+\.(?:png|jpe?g|gif|webp|svg)\S*/gi, " ");
  text = text.replace(/https?:\/\/\S+/gi, " ");
  text = text.replace(/\s+/g, " ").trim();
  return text;
};

const pickLocalized = (product = {}, key, isAr) => {
  const ar = product?.[`${key}Ar`];
  const base = product?.[key];
  if (isAr) return ar || base || "";
  return base || ar || "";
};

export default function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { t, i18n } = useTranslation();
  const isAr = (i18n.language || "en").startsWith("ar");

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

  const handleAskAi = () => {
    if (!product) return;
    const title = pickLocalized(product, "title", isAr) || product.name || "";
    const prompt = isAr
      ? `أريد نصيحة حول المنتج: ${title}، مناسبته واستخدامه الآمن؟`
      : `Advice about the product: ${title}, suitability and safe usage?`;
    window.dispatchEvent(
      new CustomEvent("chatbot:open", {
        detail: { message: prompt },
      })
    );
  };

  const imageSrc = product?.thumbnailUrl || product?.img || product?.image;
  const displayTitle =
    pickLocalized(product, "title", isAr) || product?.name || "";
  const displayDescription = cleanDescription(
    pickLocalized(product, "description", isAr) || product?.summary || ""
  );
  const skuValue =
    product?.sku && product?.sku !== product?.id ? product.sku : null;
  const displayCategory =
    pickLocalized(product, "category", isAr) ||
    product?.category ||
    product?.categoryName;
  const specs = [];

  /* Loading */
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg-card)] dark:bg-[var(--bg-card)]">
        <p className="text-gray-500 dark:text-gray-200 text-base">
          {t("products.details.loading", "Loading product...")}
        </p>
      </div>
    );
  }

  /* Error */
  if (isError || !product) {
    return (
      <div className="min-h-screen bg-[var(--bg-card)] dark:bg-[var(--bg-card)] flex items-center justify-center p-8">
        <div className="text-center">
          <div className="text-7xl mb-4 text-emerald-500">😕</div>
          <h1 className="text-2xl font-semibold text-gray-800 dark:text-gray-100">
            {t("products.details.errorTitle", "Product not found")}
          </h1>
          <p className="text-gray-500 dark:text-gray-300 text-sm mb-4">
            {t(
              "products.details.errorMessage",
              "We couldn't find this product. Try browsing the catalog."
            )}
          </p>
          <button
            onClick={() => navigate("/products")}
            className="px-8 py-2 text-sm bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition"
          >
            {t("products.details.backToProducts", "Back to products")}
          </button>
        </div>
      </div>
    );
  }

  const inStock = Number(product?.stock ?? product?.quantity ?? 0) > 0;
  const price =
    product?.price != null
      ? `${Number(product.price).toLocaleString()} ${t(
          "products.details.currency",
          "EGP"
        )}`
      : t("products.details.contactForPrice", "Contact for price");
  const hasDescription = Boolean(displayDescription);
  const hasSpecs = false;
  const showTabs = hasDescription;

  return (
    <div className="min-h-screen bg-[var(--bg-main)] dark:bg-[var(--bg-main)] pt-20 pb-14">
      <div className="max-w-6xl mx-auto px-4">
        {/* Product Card */}
        <div className="bg-[var(--bg-card)] dark:bg-[var(--bg-card)] rounded-2xl shadow-sm border border-gray-200 dark:border-gray-200 overflow-hidden">
          <div className="grid lg:grid-cols-2">
            {/* Image */}
            <div className="flex items-center justify-center bg-[var(--bg-main)] dark:bg-[var(--bg-main)] p-8">
              {imageSrc ? (
                <img
                  src={imageSrc}
                  alt={displayTitle}
                  className="max-h-[460px] w-full object-contain rounded-xl shadow-sm"
                />
              ) : (
                <div className="h-[320px] w-full grid place-items-center text-gray-400">
                  {t("products.details.noImage", "No image available")}
                </div>
              )}
            </div>

            {/* Info */}
            <div className="p-8 space-y-4 text-sm bg-[var(--bg-main)] dark:bg-[var(--bg-main)]">
              {/* Title */}
              <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
                {displayTitle}
              </h1>

              {/* Availability */}
              <div className="flex items-center gap-2">
                {inStock ? (
                  <span className="inline-flex items-center gap-2 text-xs font-medium bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full">
                    <FiCheckCircle /> {t("products.details.inStock", "In Stock")}
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-2 text-xs font-medium bg-amber-100 text-amber-700 px-3 py-1 rounded-full">
                    <FiAlertTriangle />{" "}
                    {t("products.details.outOfStock", "Out of Stock")}
                  </span>
                )}
              </div>

              {/* Price */}
              <div className="pt-1">
                <p className="text-gray-500 dark:text-gray-300 text-sm">
                  {t("products.details.price", "Price")}
                </p>
                <p className="text-3xl font-bold text-emerald-600">{price}</p>
              </div>

              {/* Specs quick view */}
              {/* Buttons */}
              <div className="flex flex-wrap gap-3 pt-2">
                <button
                  onClick={handleAddToCart}
                  disabled={inCart}
                  className={`flex-1 min-w-[180px] py-3 rounded-xl text-white text-sm font-semibold transition ${
                    inCart
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-emerald-600 hover:bg-emerald-700"
                  }`}
                >
                  {inCart
                    ? t("products.details.inCart", "Already in cart")
                    : t("products.details.addToCart", "Add to Cart")}
                </button>

                <button
                  onClick={handleToggleFavorite}
                  className={`flex items-center justify-center gap-2 px-5 py-3 rounded-xl border text-sm font-semibold transition ${
                    isFavorite
                      ? "bg-red-500 text-white border-red-500"
                      : "border-emerald-600 text-emerald-700 hover:bg-emerald-50"
                  }`}
                >
                  {isFavorite ? <BsHeartFill /> : <BsHeart />}
                  {isFavorite
                    ? t("products.details.removeFav", "Remove Favorite")
                    : t("products.details.addFav", "Add to Favorites")}
                </button>
              </div>

              {/* AI CTA */}
              <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800 text-sm text-emerald-800 dark:text-emerald-100 px-4 py-3 rounded-xl flex items-center justify-between gap-3 mt-2">
                <div className="flex-1">
                  {t(
                    "products.details.askAiCta",
                    "Have a question about this product? Ask AI now"
                  )}
                </div>
                <button
                  onClick={handleAskAi}
                  className="px-4 py-2 rounded-lg bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700 transition"
                >
                  {t("products.details.askAiButton", "Ask AI")}
                </button>
              </div>
            </div>
          </div>
        </div>

        {showTabs && (
          <div className="mt-6 bg-[var(--bg-card)] dark:bg-[var(--bg-card)] border border-gray-200 dark:border-gray-200 rounded-2xl shadow-sm p-4 text-sm">
            <div className="flex flex-wrap gap-4 border-b border-gray-200 dark:border-gray-200 pb-3 text-black-600 dark:text-gray-600">
              {[hasDescription && { key: "description", label: t("products.details.tabDescription", "Description") },
                hasSpecs && { key: "specs", label: t("products.details.tabSpecs", "Specifications") }].filter(Boolean).map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`pb-2 ${
                    activeTab === tab.key
                      ? "text-emerald-600 font-semibold border-b-2 border-emerald-600"
                      : ""
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="pt-4 text-gray-800 leading-relaxed min-h-[140px]">
              {activeTab === "description" && hasDescription && (
                <p>
                  {displayDescription ||
                    t(
                      "products.details.noDescription",
                      "No description available."
                    )}
                </p>
              )}

              {activeTab === "specs" && hasSpecs && (
                <div className="grid sm:grid-cols-2 gap-3">
                  {specs.length > 0 ? (
                    specs.map((item) => (
                      <div
                        key={item.label}
                        className="rounded-xl border border-gray-200 dark:border-white/10 px-3 py-2"
                      >
                        <p className="text-xs text-gray-500 dark:text-gray-300">
                          {item.label}
                        </p>
                        <p className="font-semibold">{item.value}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {t(
                        "products.details.noSpecs",
                        "No specifications provided."
                      )}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
