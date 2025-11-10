import { motion as Motion } from "framer-motion";
import { UseTheme } from "../../theme/ThemeProvider";

export default function CategoryCard({ title, note, img, onClick = () => {} }) {
  const { theme } = UseTheme();

  // ✨ أنيميشن الفايد الناعم من تحت
  const fadeUp = {
    hidden: { opacity: 0, y: 40 },
    show: (delay = 0) => ({
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, delay, ease: "easeOut" },
    }),
  };

  return (
    <Motion.button
      onClick={onClick}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.3 }}
      variants={fadeUp}
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      className={`text-left w-full rounded-xl overflow-hidden shadow-lg transition-all duration-500
        ${
          theme === "dark"
            ? "bg-[#0e1b1b] text-[#B8E4E6] shadow-[0_4px_20px_rgba(184,228,230,0.08)] hover:shadow-[0_6px_25px_rgba(184,228,230,0.15)]"
            : "bg-white text-[#1a1a1a] shadow-[0_3px_15px_rgba(0,0,0,0.1)] hover:shadow-[0_5px_20px_rgba(0,0,0,0.15)]"
        }`}
    >
      {/* 🖼️ صورة الكاتيجوري */}
      <Motion.div
        whileHover={{ scale: 1.05 }}
        transition={{ duration: 0.4 }}
        className="w-full aspect-square bg-center bg-cover rounded-t-xl"
        style={{ backgroundImage: `url('${img}')` }}
      />

      {/* 📝 النصوص */}
      <div className="p-4">
        <Motion.p
          variants={fadeUp}
          custom={0.2}
          className={`text-lg font-semibold mb-1 ${
            theme === "dark" ? "text-[#B8E4E6]" : "text-[#2F7E80]"
          }`}
        >
          {title}
        </Motion.p>
        <Motion.p
          variants={fadeUp}
          custom={0.3}
          className={`text-sm ${
            theme === "dark"
              ? "text-[#B8E4E6]/80"
              : "text-[#142727]/80"
          }`}
        >
          {note}
        </Motion.p>
      </div>
    </Motion.button>
  );
}
