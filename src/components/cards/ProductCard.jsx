// =========================================
// Ultra Premium 3D Glass Product Card v6
// Polished UI for Light + Dark Mode
// =========================================

import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toggleFavourite } from "../../features/favorites/favoritesSlice";
import { addToCart } from "../../features/cart/cartSlice";
import { motion as Motion } from "framer-motion";
import { Heart, Eye, Sparkles } from "lucide-react";
import Button from "../ui/Button";
import { UseTheme } from "../../theme/ThemeProvider";
import { useTranslation } from "react-i18next";
import { getLocalizedProductTitle, ensureProductLocalization } from "../../utils/productLocalization";

export default function ProductCard({ product, index = 0 }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { theme } = UseTheme();
  const isDark = theme === "dark";
  const { t, i18n } = useTranslation();

  const [quickView, setQuickView] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const favorites = useSelector((s) => s.favorites.items ?? []);
  const isFav = favorites.some((f) => String(f.id) === String(product.id));

  const inCart = useSelector((s) =>
    s.cart.items.some((c) => c.id === product.id)
  );

  const imageUrl = product?.thumbnailUrl || product?.img || "/placeholder.png";
  const stock = Number(product?.stock ?? product?.quantity ?? 0);
  const isAvailable = product?.isAvailable !== false && stock > 0;

  const displayTitle = getLocalizedProductTitle(product, i18n.language || "en");

  const badge =
    product.badge ||
    (product.isNew && "New") ||
    (product.isTrending && "Hot") ||
    (product.onSale && "Sale");
  const unavailableLabel = t("products.details.outOfStock", "Out of Stock");

  const fadeIn = {
    hidden: { opacity: 0, y: 45, scale: 0.9 },
    show: (delay = 0) => ({
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { duration: 0.55, delay, ease: "easeOut" },
    }),
  };

  return (
    <>
      <Motion.div
        onMouseMove={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          setMousePos({
            x: e.clientX - rect.left,
            y: e.clientY - rect.top,
          });
        }}
        initial="hidden"
        animate="show"
        variants={fadeIn}
        custom={index * 0.1}
        whileHover={{
          y: -8,
          scale: 1.04,
          rotateX: 3,
          rotateY: -3,
          transition: { duration: 0.35, ease: "easeOut" },
        }}
        className={`
          relative group p-4 rounded-2xl cursor-pointer select-none 
          transition-all duration-500 overflow-hidden

          ${isDark
            ? "bg-[#0f1a1a]/70 border border-emerald-900/50 shadow-[0_20px_40px_rgba(16,185,129,0.28)]"
            : "bg-white border border-slate-200 shadow-[0_10px_28px_rgba(0,0,0,0.06)]"}
        `}
        onClick={() => navigate(`/product/${product.id}`)}
      >
        {!isAvailable && (
          <div className="pointer-events-none absolute inset-0 z-20 grid place-items-center bg-black/40">
            <span className="rounded-full bg-amber-200 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-amber-800 shadow">
              {unavailableLabel}
            </span>
          </div>
        )}
        {/* Glass Hover Effect */}
        <div
          className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition duration-300"
          style={{
            background: `radial-gradient(
              350px circle at ${mousePos.x}px ${mousePos.y}px,
              rgba(255,255,255,0.35),
              transparent 65%
            )`,
          }}
        />

        {/* Shine Sweep */}
        <div
          className="
            pointer-events-none absolute inset-0 rounded-2xl
            bg-gradient-to-r from-transparent via-white/20 to-transparent
            dark:via-emerald-200/10
            opacity-0 group-hover:opacity-100
            translate-x-[-180%] group-hover:translate-x-[180%]
            transition-all duration-[1200ms] ease-out
          "
        />

        {/* BADGE */}
        {badge && (
          <div
            className="
              absolute top-3 left-3 z-20 flex items-center gap-1 px-3 py-1
              rounded-full text-[11px] font-bold uppercase tracking-wide
              bg-emerald-600 text-white shadow
              dark:bg-emerald-300 dark:text-slate-900
            "
          >
            <Sparkles size={14} />
            {badge}
          </div>
        )}

        {/* ACTION BUTTONS */}
        <div
          className="
            absolute top-3 right-3 flex flex-col gap-2 z-30
            opacity-0 group-hover:opacity-100 transition-all duration-300
          "
        >
          {/* Favorite */}
          <Motion.button
            whileTap={{ scale: 0.85 }}
            onClick={(e) => {
              e.stopPropagation();
              dispatch(
                toggleFavourite(ensureProductLocalization(product))
              );
            }}
            className={`
              p-2 rounded-full backdrop-blur-md shadow-lg border
              ${isDark ? "bg-black/40 border-emerald-900" : "bg-white/90 border-slate-200"}
            `}
          >
            <Heart
              size={18}
              className={
                isFav
                  ? "text-red-600"
                  : isDark
                  ? "text-emerald-200"
                  : "text-slate-600"
              }
            />
          </Motion.button>

          {/* Quick View */}
          <Motion.button
            whileTap={{ scale: 0.85 }}
            onClick={(e) => {
              e.stopPropagation();
              setQuickView(true);
            }}
            className={`
              p-2 rounded-full backdrop-blur-md shadow-lg border
              ${isDark ? "bg-black/40 border-emerald-900" : "bg-white/90 border-slate-200"}
            `}
          >
            <Eye
              size={18}
              className={isDark ? "text-emerald-200" : "text-blue-600"}
            />
          </Motion.button>
        </div>

        {/* IMAGE */}
        <Motion.div
          whileHover={{ scale: 1.1 }}
          transition={{ duration: 0.45 }}
          className="
            w-full aspect-square rounded-xl overflow-hidden shadow-inner
            bg-center bg-cover relative
          "
          style={{ backgroundImage: `url('${imageUrl}')` }}
        />

        {/* PRODUCT NAME */}
        <h3
          className={`
            text-center text-[16px] font-bold mt-3 line-clamp-2
            ${isDark ? "text-emerald-100" : "text-slate-800"}
          `}
        >
            {displayTitle}
          </h3>

        {/* PRICE */}
        <p
          className={`
            text-center text-[20px] font-extrabold mt-1
            ${isDark ? "text-emerald-300" : "text-emerald-700"}
          `}
        >
          {Number(product.price).toLocaleString()} EGP
        </p>

        {!isAvailable && (
          <p className="text-center text-xs font-semibold text-amber-600 dark:text-amber-300 mt-1">
            {unavailableLabel}
          </p>
        )}

        {/* ADD TO CART */}
        <Button
          text={
            !isAvailable
              ? unavailableLabel
              : inCart
              ? t("products.inCart")
              : t("products.addToCart")
          }
          full
          disabled={inCart || !isAvailable}
            onClick={(e) => {
              e.stopPropagation();
              if (inCart || !isAvailable) return;
              dispatch(addToCart(ensureProductLocalization(product)));
            }}
          className={`mt-3 rounded-xl font-semibold ${
            inCart || !isAvailable ? "opacity-50 cursor-not-allowed" : ""
          }`}
        />

        {/* QUICK VIEW LINK */}
        <button
          className={`
            text-[12px] font-medium mt-2 mx-auto block
            ${isDark ? "text-emerald-200 hover:text-emerald-100" : "text-emerald-700 hover:text-emerald-900"}
          `}
          onClick={(e) => {
            e.stopPropagation();
            setQuickView(true);
          }}
        >
          Quick View
        </button>
      </Motion.div>

      {/* QUICK VIEW MODAL */}
      {quickView && (
        <Motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center"
          onClick={() => setQuickView(false)}
        >
          <Motion.div
            initial={{ scale: 0.85, y: 30 }}
            animate={{ scale: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="
              w-[90%] max-w-lg bg-white dark:bg-slate-900 
              rounded-2xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800
            "
            onClick={(e) => e.stopPropagation()}
          >
            <img src={imageUrl} className="rounded-xl w-full" />

            <h3 className="mt-4 text-xl font-bold dark:text-white">
              {displayTitle}
            </h3>

            <p className="text-emerald-600 dark:text-emerald-300 text-2xl font-bold mt-2">
              {Number(product.price).toLocaleString()} EGP
            </p>

            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300 line-clamp-3">
              {product.description}
            </p>

            <div className="mt-4">
              <Button
                text={
                  !isAvailable
                    ? unavailableLabel
                    : inCart
                    ? t("products.details.inCart", "Already in cart")
                    : t("products.details.addToCart", "Add to Cart")
                }
                full
                disabled={inCart || !isAvailable}
                onClick={() => {
                  if (inCart || !isAvailable) return;
                  dispatch(addToCart(ensureProductLocalization(product)));
                }}
              />
            </div>

            <button
              onClick={() => setQuickView(false)}
              className="mt-4 w-full text-sm text-slate-600 dark:text-slate-300"
            >
              Close
            </button>
          </Motion.div>
        </Motion.div>
      )}
    </>
  );
}
