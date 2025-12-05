// src/pages/homeCom/AiAssistant.jsx
import { useState } from "react";
import { motion as Motion } from "framer-motion";
import { UseTheme } from "../../theme/ThemeProvider";

export default function AiAssistant() {
  const [query, setQuery] = useState("");
  const { theme } = UseTheme();

  const presets = [
    "What's the best fertilizer for corn?",
    "How to identify common garden pests?",
  ];

  const send = (q) => alert(`AI assistant: ${q}`);

  // ✨ Animation
  const fadeUp = {
    hidden: { opacity: 0, y: 40 },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" },
    },
  };

  return (
    <Motion.aside
      variants={fadeUp}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.3 }}
      className="flex-1 lg:max-w-md transition-all duration-500"
    >
      <div
        className={`p-6 rounded-2xl h-full flex flex-col shadow-lg transition-colors duration-500 ${
          theme === "dark"
            ? "bg-[#142121]/95 text-[#B8E4E6] shadow-[0_3px_20px_rgba(184,228,230,0.1)]"
            : "bg-[#e7f3e7] text-[#1a1a1a] shadow-[0_3px_12px_rgba(0,0,0,0.08)]"
        }`}
      >
        {/* العنوان والوصف */}
        <h2
          className={`text-[22px] font-bold tracking-[-0.015em] ${
            theme === "dark" ? "text-[#B8E4E6]" : "text-[#2F7E80]"
          }`}
        >
          Need Expert Advice? 🤖
        </h2>

        <p
          className={`mt-2 text-sm ${
            theme === "dark" ? "text-[#B8E4E6]/80" : "text-gray-700"
          }`}
        >
          Our AI farming assistant is here to help. Get instant answers to your
          toughest questions.
        </p>

        {/* الصندوق الرئيسي */}
        <div
          className={`mt-4 flex-grow flex flex-col justify-between rounded-xl p-4 shadow-inner transition-colors duration-500 ${
            theme === "dark"
              ? "bg-[#1d2e2e] text-[#B8E4E6]"
              : "bg-[#f8fff8] text-gray-800"
          }`}
        >
          {/* ال prompts الجاهزة */}
          <div className="flex-grow space-y-2">
            <p
              className={`text-xs ${
                theme === "dark" ? "text-[#B8E4E6]/70" : "text-gray-500"
              }`}
            >
              Try a prompt:
            </p>

            {presets.map((t, i) => (
              <Motion.button
                key={i}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => send(t)}
                className={`w-full text-left text-sm rounded-md p-2 transition-colors duration-300 ${
                  theme === "dark"
                    ? "bg-[#2F7E80]/10 text-[#B8E4E6] hover:bg-[#2F7E80]/20"
                    : "bg-[#2F7E80]/10 text-[#2F7E80] hover:bg-[#2F7E80]/20"
                }`}
              >
                “{t}”
              </Motion.button>
            ))}
          </div>

          {/* الفورم */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (query.trim()) send(query);
            }}
            className={`mt-4 flex items-center gap-2 rounded-lg p-2 border transition-colors duration-500 ${
              theme === "dark"
                ? "border-[#B8E4E6]/30 bg-[#142121]/60 focus-within:ring-2 focus-within:ring-[#B8E4E6]/60"
                : "border-gray-300 bg-[#f2faf2] focus-within:ring-2 focus-within:ring-[#2F7E80]/40"
            }`}
          >
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ask our AI assistant..."
              className={`w-full bg-transparent border-none focus:ring-0 text-sm outline-none transition-colors ${
                theme === "dark"
                  ? "text-[#B8E4E6] placeholder:text-[#B8E4E6]/50"
                  : "text-gray-800 placeholder:text-gray-500"
              }`}
            />

            <Motion.button
              type="submit"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`rounded-md p-2 transition-colors duration-300 ${
                theme === "dark"
                  ? "bg-[#B8E4E6] text-[#0e1b1b] hover:bg-[#a7d8da]"
                  : "bg-[#2F7E80] text-white hover:bg-[#256b6d]"
              }`}
            >
              <span className="material-symbols-outlined text-base">send</span>
            </Motion.button>
          </form>
        </div>
      </div>
    </Motion.aside>
  );
}
