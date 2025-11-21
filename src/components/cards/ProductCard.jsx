import { useDispatch, useSelector } from "react-redux";
import { toggleFavourite } from "../../features/favorites/favoritesSlice";
import { addToCart } from "../../features/cart/cartSlice";
import { motion as Motion } from "framer-motion";
import { Heart } from "lucide-react";
import Button from "../ui/Button";
import { UseTheme } from "../../theme/ThemeProvider";

export default function ProductCard({ product, index = 0 }) {
  const dispatch = useDispatch();
  const { theme } = UseTheme();

  // 🧼 Helper لتنضيف المنتج قبل دخوله Redux
  const safeProduct = (p) => {
    const clean = { ...p };

    // إزالة أو تحويل أي Firestore Timestamp
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
    ? favorites.some((f) => f?.id === product.id)
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
      whileInView="show"
      viewport={{ once: true, amount: 0.3 }}
      variants={fadeUp}
      custom={index * 0.1}
      whileHover={{ y: -4, scale: 1.02 }}
      transition={{ type: "spring", stiffness: 200, damping: 15 }}
      className={`relative flex flex-col gap-3 p-4 rounded-xl transition-all duration-500 overflow-hidden
        ${
          theme === "dark"
            ? "bg-[#0e1b1b]/95 text-[#B8E4E6] shadow-[0_4px_20px_rgba(184,228,230,0.08)] hover:shadow-[0_6px_25px_rgba(184,228,230,0.15)]"
            : "bg-white text-[#1a1a1a] shadow-[0_3px_15px_rgba(0,0,0,0.1)] hover:shadow-[0_5px_20px_rgba(0,0,0,0.15)]"
        }`}
    >
      {/* ❤️ Favourite toggle */}
      <Motion.button
        whileTap={{ scale: 0.9 }}
        onClick={() => dispatch(toggleFavourite(safeProduct(product)))}
        aria-label="favorite"
        className="absolute top-3 right-3 z-20 p-2 rounded-full shadow-md border backdrop-blur-md bg-white/70 border-gray-200 hover:bg-gray-100 transition"
      >
        <Heart size={20} className={isFav ? "text-red-600" : "text-gray-400"} />
      </Motion.button>

      {/* 🖼️ Image */}
      <Motion.div
        whileHover={{ scale: 1.05 }}
        transition={{ duration: 0.4 }}
        className="relative z-10 w-full aspect-square bg-center bg-cover rounded-lg shadow-inner"
        style={{
          backgroundImage: `url('${product.img || product.thumbnailUrl}')`,
        }}
      />

      {/* 📄 Info */}
      <div className="flex flex-col gap-2 text-center relative z-10">
        <Motion.p variants={fadeUp} custom={0.2} className="text-base font-semibold">
          {product.name || product.title}
        </Motion.p>

        <Motion.p variants={fadeUp} custom={0.3} className="text-lg font-bold text-[#2F7E80]">
          {Number(product.price).toLocaleString()} EGP
        </Motion.p>

        {/* 🛒 ADD TO CART */}
        <Motion.div variants={fadeUp} custom={0.4}>
          <Button
            text={inCart ? "In Cart" : "Add to Cart"}
            full
            disabled={inCart}
            onClick={() => !inCart && dispatch(addToCart(safeProduct(product)))}
            className={`mt-1 ${inCart ? "opacity-60 cursor-not-allowed" : ""}`}
          />
        </Motion.div>
      </div>
    </Motion.div>
  );
}
