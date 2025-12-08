// src/components/cards/ProductCard.jsx
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toggleFavourite } from "../../features/favorites/favoritesSlice";
import { addToCart } from "../../features/cart/cartSlice";
import { motion as Motion } from "framer-motion";
import { Heart, Star, Eye, Scale, Sparkles } from "lucide-react";
import Button from "../ui/Button";
import { UseTheme } from "../../theme/ThemeProvider";
import { useTranslation } from "react-i18next";

// 🔹 كارت المنتج الرئيسي
export default function ProductCard({ product, index = 0, onCompare }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { theme } = UseTheme();
  const { t } = useTranslation();
  const [showQuickView, setShowQuickView] = useState(false);

  // صورة fallback
  const imageUrl =
    product?.img ||
    product?.thumbnailUrl ||
    "/placeholder.png";

  const safeProduct = (p) => {
    const clean = { ...p };
    if (clean.createdAt?.seconds) {
      clean.createdAt = clean.createdAt.seconds * 1000;
    }
    if (clean.updatedAt?.seconds) {
      clean.updatedAt = clean.updatedAt.seconds * 1000;
    }
    return clean;
  };

  const favorites = useSelector(
    (state) => state.favorites?.items ?? state.favorites ?? []
  );

  const isFav = Array.isArray(favorites)
    ? favorites.some((f) => String(f?.id) === String(product?.id))
    : false;

  const inCart = useSelector((state) =>
    state.cart.items.some((c) => c.id === product.id)
  );

  // ⭐ Badge logic (ممكن تزود في الفايرستور)
  const badge =
    product.badge ||
    (product.onSale && "Sale") ||
    (product.isTrending && "Trending") ||
    (product.isNew && "New");

  // ⭐ Rating logic
  const rating = Number(product.rating || product.stars || 4.5);
  const maxStars = 5;

  const fadeUp = {
    hidden: { opacity: 0, y: 40, scale: 0.95 },
    show: (delay = 0) => ({
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { duration: 0.6, delay, ease: "easeOut" },
    }),
  };

  return (
    <>
      <Motion.div
        initial="hidden"
        animate="show"
        variants={fadeUp}
        custom={index * 0.12}
        whileHover={{
          y: -6,
          scale: 1.03,
          rotateX: 4,
          rotateY: -4,
          transition: { duration: 0.4 },
        }}
        className={`
          group relative flex flex-col gap-3 p-4 rounded-2xl overflow-hidden
          cursor-pointer transition-all duration-500
          
          /* Light mode */
          bg-white/80 text-slate-900
          shadow-[0_10px_30px_rgba(15,23,42,0.16)]
          border border-slate-200

          /* Dark mode */
          dark:bg-[#0f1a1a]/60 dark:text-emerald-100
          dark:shadow-[0_16px_40px_rgba(16,185,129,0.25)]
          dark:border-emerald-900/60
        `}
        onClick={() => navigate(`/product/${product.id}`)}
      >
        {/* ✨ Glass reflection أعلى الكارت */}
        <div
          className="
            pointer-events-none absolute -top-16 -left-16
            h-40 w-40 rounded-full
            bg-white/15 dark:bg-emerald-300/10
            blur-3xl
          "
        />

        {/* ✨ Gradient edge glow عند الـ hover */}
        <div
          className="
            pointer-events-none absolute inset-0 rounded-2xl
            border border-transparent
            group-hover:border-emerald-400/60 dark:group-hover:border-emerald-300/60
            transition-all duration-500
          "
        />

        {/* ✨ Shine sweep */}
        <div
          className="
            pointer-events-none absolute inset-0 rounded-2xl
            bg-gradient-to-r from-transparent via-white/25 to-transparent
            dark:via-emerald-200/20
            opacity-0 group-hover:opacity-100
            translate-x-[-200%] group-hover:translate-x-[200%]
            transition-transform duration-[1200ms] ease-out
          "
        />

        {/* 🔼 Badge أعلى اليسار */}
        {badge && (
          <div
            className="
              absolute top-3 left-3 z-20
              inline-flex items-center gap-1 rounded-full px-3 py-1
              text-[11px] font-semibold uppercase tracking-wide
              bg-emerald-500/90 text-white shadow-lg
              dark:bg-emerald-300 dark:text-slate-900
            "
          >
            <Sparkles size={14} />
            <span>{badge}</span>
          </div>
        )}

        {/* ❤️ Favorite button */}
        <Motion.button
          whileTap={{ scale: 0.9 }}
          onClick={(e) => {
            e.stopPropagation();
            dispatch(toggleFavourite({ ...product }));
          }}
          aria-label="favorite"
          className="
            absolute top-3 rtl:left-3 ltr:right-3 z-20 
            p-2 rounded-full shadow-md border
            backdrop-blur-md bg-white/80 dark:bg-black/60 
            border-gray-200/70 dark:border-emerald-800
            hover:bg-white dark:hover:bg-black
            transition
          "
        >
          <Heart
            size={20}
            className={isFav ? "text-red-600" : "text-gray-400 dark:text-gray-200"}
          />
        </Motion.button>

        {/* 🧪 زرار المقارنة */}
        <Motion.button
          whileTap={{ scale: 0.9 }}
          onClick={(e) => {
            e.stopPropagation();
            onCompare && onCompare(product);
          }}
          className="
            absolute bottom-3 rtl:left-3 ltr:right-3 z-20
            px-2 py-1 rounded-full text-[11px] font-medium
            flex items-center gap-1
            bg-slate-900/80 text-slate-100
            dark:bg-emerald-500/90 dark:text-slate-900
            backdrop-blur-md shadow
            hover:bg-slate-800 dark:hover:bg-emerald-400
            transition
          "
        >
          <Scale size={14} />
          <span>{t("products.compare", "Compare")}</span>
        </Motion.button>

        {/* 🖼 صورة المنتج – Parallax hover */}
        <Motion.div
          whileHover={{ scale: 1.08 }}
          transition={{ duration: 0.45 }}
          className="
            relative z-10 w-full aspect-square bg-center bg-cover rounded-xl 
            shadow-inner overflow-hidden
          "
          style={{ backgroundImage: `url('${imageUrl}')` }}
        >
          {/* Overlay طفيف لتحسين الكونتراست */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/15 via-transparent to-transparent dark:from-black/40" />
        </Motion.div>

        {/* ⭐ Rating stars */}
        <div className="relative z-10 flex items-center justify-center gap-1 mt-1">
          {Array.from({ length: maxStars }).map((_, i) => {
            const filled = i + 1 <= Math.round(rating);
            return (
              <Star
                key={i}
                size={16}
                className={
                  filled
                    ? "text-amber-400 fill-amber-400"
                    : "text-slate-300 dark:text-slate-600"
                }
              />
            );
          })}
          <span className="ml-1 text-xs text-slate-500 dark:text-emerald-200/80">
            {rating.toFixed(1)}
          </span>
        </div>

        {/* 📝 اسم + سعر + زرار */}
        <div className="flex flex-col gap-2 text-center relative z-10 mt-1">
          <Motion.p
            variants={fadeUp}
            custom={0.2}
            className="text-sm md:text-base font-semibold tracking-tight line-clamp-2"
          >
            {product.name || product.title}
          </Motion.p>

          <Motion.p
            variants={fadeUp}
            custom={0.3}
            className="
              text-lg md:text-xl font-bold
              text-emerald-600 dark:text-emerald-300
            "
          >
            {Number(product.price).toLocaleString()} EGP
          </Motion.p>

          <Motion.div variants={fadeUp} custom={0.4} className="flex flex-col gap-2">
            <Button
              text={
                inCart
                  ? t("products.inCart", "In Cart")
                  : t("products.addToCart", "Add to Cart")
              }
              full
              disabled={inCart}
              onClick={(e) => {
                e.stopPropagation();
                !inCart && dispatch(addToCart(safeProduct(product)));
              }}
              className={`mt-1 rounded-xl ${
                inCart ? "opacity-60 cursor-not-allowed" : ""
              }`}
            />

            {/* 👁 Quick view / Quick add popup trigger */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setShowQuickView(true);
              }}
              className="
                mx-auto inline-flex items-center gap-1 text-[12px] font-medium
                text-emerald-700 hover:text-emerald-900
                dark:text-emerald-200 dark:hover:text-emerald-100
                transition
              "
            >
              <Eye size={14} />
              <span>{t("products.quickView", "Quick view")}</span>
            </button>
          </Motion.div>
        </div>
      </Motion.div>

      {/* 🪟 Quick View Popup / Modal صغير جوة الكارت */}
      {showQuickView && (
        <Motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="
            fixed inset-0 z-50 flex items-center justify-center
            bg-black/40 backdrop-blur-sm
          "
          onClick={() => setShowQuickView(false)}
        >
          <div
            className="
              relative w-[90%] max-w-md rounded-2xl p-5
              bg-white text-slate-900
              dark:bg-slate-900 dark:text-slate-50
              shadow-2xl border border-slate-200 dark:border-emerald-800
            "
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close */}
            <button
              className="absolute top-3 right-3 text-sm text-slate-500 hover:text-slate-800 dark:hover:text-white"
              onClick={() => setShowQuickView(false)}
            >
              ✕
            </button>

            {/* محتوى الكويك فيو */}
            <div className="flex flex-col gap-4">
              <div
                className="w-full aspect-video rounded-xl bg-center bg-cover"
                style={{ backgroundImage: `url('${imageUrl}')` }}
              />
              <div className="space-y-2 text-center">
                <h3 className="text-lg font-semibold">
                  {product.name || product.title}
                </h3>
                <p className="text-emerald-600 dark:text-emerald-300 font-bold text-xl">
                  {Number(product.price).toLocaleString()} EGP
                </p>
                {product?.description && (
                  <p className="text-xs text-slate-500 dark:text-slate-300 line-clamp-3">
                    {product.description}
                  </p>
                )}
              </div>

              <div className="flex flex-col gap-2">
                <Button
                  text={
                    inCart
                      ? t("products.inCart", "In Cart")
                      : t("products.addToCart", "Add to Cart")
                  }
                  full
                  disabled={inCart}
                  onClick={() => {
                    if (!inCart) {
                      dispatch(addToCart(safeProduct(product)));
                    }
                    setShowQuickView(false);
                  }}
                />
              </div>
            </div>
          </div>
        </Motion.div>
      )}
    </>
  );
}

/* 🩻 Skeleton loader بنفس شكل الكارت */

export function ProductCardSkeleton() {
  return (
    <div
      className="
        relative flex flex-col gap-3 p-4 rounded-2xl overflow-hidden
        bg-slate-100 dark:bg-slate-900/70
        border border-slate-200/70 dark:border-slate-700
        animate-pulse
      "
    >
      <div className="w-full aspect-square rounded-xl bg-slate-200 dark:bg-slate-800" />
      <div className="h-4 rounded bg-slate-200 dark:bg-slate-800" />
      <div className="h-4 w-1/2 rounded bg-slate-200 dark:bg-slate-800" />
      <div className="h-10 rounded-lg bg-slate-200 dark:bg-slate-800" />
    </div>
  );
}
