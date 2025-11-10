import { motion as Motion } from "framer-motion";
import { fadeInUp, scaleIn } from "../../utils/animations";
import { useNavigate } from "react-router-dom";

export default function Hero({ title, subtitle, bg }) {
  const navigate = useNavigate();

  // 🔗 التوجيه باستخدام React Router
  const handleCTA = () => {
    navigate("/shop");
  };

  return (
    <section className="@container">
      <div className="@[480px]:p-4">
        <div className="container mx-auto">
          <Motion.div
            variants={scaleIn}
            initial="hidden"
            animate="show"
            className="min-h-[480px] lg:min-h-[560px] rounded-xl bg-cover bg-center bg-no-repeat flex flex-col items-start justify-end px-4 pb-10 @[480px]:px-10 transition-all duration-300"
            style={{
              backgroundImage: `linear-gradient(
                to bottom,
                rgba(0,0,0,0.35),
                rgba(0,0,0,0.6)
              ), url('${bg}')`,
            }}
          >
            {/* النصوص */}
            <Motion.div
              variants={fadeInUp}
              initial="hidden"
              animate="show"
              className="max-w-2xl"
            >
              <h1
                className="text-3xl @[480px]:text-5xl font-black leading-tight tracking-[-0.033em]
                           text-white dark:text-[#B8E4E6]"
              >
                {title}
              </h1>
              <p
                className="mt-2 text-sm @[480px]:text-base 
                           text-white/90 dark:text-[#B8E4E6]/80"
              >
                {subtitle}
              </p>
            </Motion.div>

            {/* زرار CTA مع أنيميشن دخوله */}
            <Motion.button
              variants={fadeInUp}
              initial="hidden"
              animate="show"
              transition={{ delay: 0.3, duration: 0.5, ease: "easeOut" }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.97 }}
              onClick={handleCTA}
              className="mt-4 h-12 px-6 rounded-lg font-bold transition-all duration-300
                         bg-[#2F7E80] text-white hover:bg-[#256b6d]
                         dark:bg-[#B8E4E6] dark:text-[#0e1b1b] dark:hover:bg-[#a7d8da]"
            >
              Shop All Products
            </Motion.button>
          </Motion.div>
        </div>
      </div>
    </section>
  );
}
