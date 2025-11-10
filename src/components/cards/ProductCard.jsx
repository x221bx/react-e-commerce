import { useEffect, useState } from "react";
import { motion as Motion } from "framer-motion";
import { Heart } from "lucide-react";
import { UseTheme } from "../../theme/ThemeProvider";
import Button from "../ui/Button";

export default function ProductCard({
  product,
  onAdd = (p) => alert(`Added ${p.name}`),
  index = 0,
}) {
  const [favorites, setFavorites] = useState([]);
  const { theme } = UseTheme();

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("favorites") || "[]");
    setFavorites(saved);
  }, []);

  useEffect(() => {
    localStorage.setItem("favorites", JSON.stringify(favorites));
  }, [favorites]);

  const isFav = favorites.includes(product.name);
  const toggleFav = () =>
    setFavorites((prev) =>
      isFav ? prev.filter((n) => n !== product.name) : [...prev, product.name]
    );

  // ✨ أنيميشن الظهور الناعم من تحت
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
      {/* ❤️ Favorite Button */}
      <Motion.button
        whileTap={{ scale: 0.9 }}
        onClick={toggleFav}
        aria-label="favorite"
        className={`absolute top-3 right-3 z-20 p-2 rounded-full shadow-md border backdrop-blur-md transition-all duration-300
          ${
            isFav
              ? "bg-[#B8E4E6]/80 border-[#B8E4E6]/50"
              : theme === "dark"
              ? "bg-[#2F7E80]/20 border-[#B8E4E6]/30 hover:bg-[#B8E4E6]/15"
              : "bg-white/80 border-[#2F7E80]/20 hover:bg-[#B8E4E6]/40"
          }`}
      >
        <Heart
          size={20}
          className={`transition-colors duration-300 ${
            isFav
              ? "fill-[#2F7E80] text-[#2F7E80]"
              : theme === "dark"
              ? "text-[#B8E4E6]/80 hover:text-[#B8E4E6]"
              : "text-[#2F7E80]/80 hover:text-[#2F7E80]"
          }`}
        />
      </Motion.button>

      {/* 🖼️ Product Image */}
      <Motion.div
        whileHover={{ scale: 1.05 }}
        transition={{ duration: 0.4 }}
        className="relative z-10 w-full aspect-square bg-center bg-cover rounded-lg shadow-inner"
        style={{ backgroundImage: `url('${product.img}')` }}
      />

      {/* 📝 Product Info */}
      <div className="flex flex-col gap-2 text-center relative z-10">
        <Motion.p
          variants={fadeUp}
          custom={0.2}
          className={`text-base font-semibold ${
            theme === "dark" ? "text-[#B8E4E6]" : "text-[#1a1a1a]"
          }`}
        >
          {product.name}
        </Motion.p>

        <Motion.p
          variants={fadeUp}
          custom={0.3}
          className={`text-lg font-bold ${
            theme === "dark" ? "text-[#B8E4E6]" : "text-[#2F7E80]"
          }`}
        >
          ${product.price}
        </Motion.p>

        {/* 🛒 Add Button */}
        <Motion.div variants={fadeUp} custom={0.4}>
          <Button
            text="Add to Cart"
            full
            onClick={() => onAdd(product)}
            className="mt-1"
          />
        </Motion.div>
      </div>
    </Motion.div>
  );
}
