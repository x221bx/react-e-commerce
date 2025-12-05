// src/components/cards/ProductCard.jsx
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toggleFavourite } from "../../features/favorites/favoritesSlice";
import { addToCart } from "../../features/cart/cartSlice";
import { motion as Motion } from "framer-motion";
import { Heart } from "lucide-react";
import Button from "../ui/Button";
import { UseTheme } from "../../theme/ThemeProvider";
import { useTranslation } from "react-i18next";

export default function ProductCard({ product, index = 0 }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { theme } = UseTheme();
  const { t } = useTranslation();

  // صورة fallback لو المنتج مالوش صورة
  const imageUrl =
    product?.img ||
    product?.thumbnailUrl ||
    "/placeholder.png"; // ← ضيف الصورة دي في public

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

  // Simple check: is product id in favorites?
  const isFav = Array.isArray(favorites)
    ? favorites.some((f) => String(f?.id) === String(product?.id))
    : false;

  const inCart = useSelector((state) =>
    state.cart.items.some((c) => c.id === product.id)
  );

  const fadeUp = {
    hidden: { opacity: 0, y: 40 },
    show: (delay = 0) => ({
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, delay, ease: "easeOut" },
    }),
  };

  return (
    <Motion.div
      initial="hidden"
      animate="show"
      viewport={{ once: true, amount: 0.3 }}
      variants={fadeUp}
      custom={index * 0.1}
      whileHover={{ y: -4, scale: 1.02 }}
      transition={{ type: "spring", stiffness: 200, damping: 15 }}
      className={`relative flex flex-col gap-3 p-4 rounded-xl transition-all duration-500 overflow-hidden
        ${
          theme === "dark"
            ? "bg-[var(--bg-input)]/95 text-[#B8E4E6] shadow-[0_4px_20px_rgba(184,228,230,0.08)] hover:shadow-[0_6px_25px_rgba(184,228,230,0.15)]"
            : "bg-[var(--bg-card)] text-[#1a1a1a] shadow-[0_3px_15px_rgba(0,0,0,0.1)] hover:shadow-[0_5px_20px_rgba(0,0,0,0.15)]"
        }`}
    >
      {/* زر الفافوريت */}
      <Motion.button
        whileTap={{ scale: 0.9 }}
        onClick={() => {
          // Pass a fresh clone of product - never modify the original
          dispatch(toggleFavourite({ ...product }));
        }}
        aria-label="favorite"
        className="absolute top-3 rtl:left-3 ltr:right-3 z-20 p-2 rounded-full shadow-md border backdrop-blur-md bg-white/70 border-gray-200 hover:bg-gray-100 transition"
      >
        <Heart size={20} className={isFav ? "text-red-600" : "icon-muted"} />
      </Motion.button>

      <Motion.div
        whileHover={{ scale: 1.05 }}
        transition={{ duration: 0.4 }}
        className="relative z-10 w-full aspect-square bg-center bg-cover rounded-lg shadow-inner cursor-pointer"
        style={{
          backgroundImage: `url('${imageUrl}')`,
        }}
        onClick={() => navigate(`/product/${product.id}`)}
      />

      <div className="flex flex-col gap-2 text-center relative z-10">
        <Motion.p variants={fadeUp} custom={0.2} className="text-base font-semibold">
          {product.name || product.title}
        </Motion.p>

        <Motion.p variants={fadeUp} custom={0.3} className="text-lg font-bold text-accent-teal">
          {Number(product.price).toLocaleString()} EGP
        </Motion.p>

        <Motion.div variants={fadeUp} custom={0.4}>
          <Button
            text={
              inCart
                ? t("products.inCart", "In Cart")
                : t("products.addToCart", "Add to Cart")
            }
            full
            disabled={inCart}
            onClick={() =>
              !inCart && dispatch(addToCart(safeProduct(product)))
            }
            className={`mt-1 ${inCart ? "opacity-60 cursor-not-allowed" : ""}`}
          />
        </Motion.div>
      </div>
    </Motion.div>
  );
}
