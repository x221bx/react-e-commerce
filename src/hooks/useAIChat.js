// useAIChat.js
import { useState } from "react";
import { aiSearchProducts } from "./useAIProductSearch";

export function useAIChat() {
  const [messages, setMessages] = useState([]);
  const API_KEY = import.meta.env.VITE_OPENAI_KEY;

  // ============================
  // 🧠 Helpers لذكاء أعلى
  // ============================

  function normalizeArabic(text = "") {
    return text
      .toLowerCase()
      .replace(/[أإآا]/g, "ا")
      .replace(/ى/g, "ي")
      .replace(/ة/g, "ه")
      .replace(/[^\u0600-\u06FF0-9\s]/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  function levenshtein(a = "", b = "") {
    const matrix = [];
    for (let i = 0; i <= b.length; i++) matrix[i] = [i];
    for (let j = 0; j <= a.length; j++) matrix[0][j] = j;

    for (let i = 1; i <= b.length; i++) {
      for (let j = 1; j <= a.length; j++) {
        matrix[i][j] = Math.min(
          matrix[i - 1][j] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j - 1] + (b[i - 1] === a[j - 1] ? 0 : 1)
        );
      }
    }
    return matrix[b.length][a.length];
  }
// eslint-disable-next-line
  function fuzzyMatch(word, target) {
    if (!word || !target) return false;
    if (target.includes(word)) return true;
    if (word.length <= 3) return false;
    return levenshtein(word, target) <= 2;
  }

  const AGRI_SYNONYMS = {
    "قمح": ["القمح", "سماد قمح", "محصول حبوب", "حبوب"],
    "ذره": ["الذره", "محصول حبوب", "حبوب"],
    "بطاطس": ["بطاطا", "درنات", "محصول جذري"],
    "فلفل": ["فلفل رومي", "فلفل حار"],
    "نخيل": ["نخيل بلح", "نخيل تمر"],

    "اصفرار": ["كلوروز", "نقص نيتروجين", "نقص عناصر"],
    "حشائش": ["اعشاب ضاره", "مبيد حشائش"],
    "حشرات": ["مبيد حشري", "حشرات ماصه"],
    "فطريات": ["مبيد فطري", "امراض فطريه"],

    "سماد": ["اسمده", "مغذي"],
    "رش": ["سماد ورقي", "مغذي ورقي"],
  };

  function expandKeywords({ intent, userMessage }) {
    const set = new Set();

    const push = (v) => {
      if (!v) return;
      set.add(normalizeArabic(v));
    };

    push(intent.crop);
    push(intent.problem);
    push(intent.goal);
    (intent.keywords || []).forEach(push);

    const msgNorm = normalizeArabic(userMessage);
    msgNorm.split(" ").forEach(push);

    [...set].forEach((w) => {
      if (AGRI_SYNONYMS[w]) AGRI_SYNONYMS[w].forEach((s) => set.add(s));
    });

    return [...set];
  }

  // ==================================================
  // 🚀 MAIN SEND MESSAGE
  // ==================================================
  async function sendMessage(userMessage) {
    if (!userMessage?.trim()) return;

    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);

    // ---------------- AI Intent Extraction ----------------
    const intentPrompt = `
أنت مساعد لمحل أسمدة ومنتجات زراعية.
أخرج JSON STRICT فقط:

{
 "crop": "",
 "problem": "",
 "goal": "",
 "keywords": []
}

الرسالة:
"${userMessage}"
`;

    let intent = {
      crop: "",
      problem: "",
      goal: "",
      keywords: [],
    };

    try {
      if (API_KEY) {
        const req = await fetch("https://api.openai.com/v1/responses", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${API_KEY}`,
          },
          body: JSON.stringify({
            model: "gpt-4o",
            input: intentPrompt,
          }),
        });

        const data = await req.json();

        try {
          if (data.output_text) {
            intent = JSON.parse(data.output_text);
          } else if (data.output?.[0]?.content?.[0]?.text?.value) {
            intent = JSON.parse(data.output[0].content[0].text.value);
          }
        } catch {
          intent = { crop: "", problem: "", goal: "", keywords: [userMessage] };
        }
      }
    } catch {
      intent = { crop: "", problem: "", goal: "", keywords: [userMessage] };
    }

    // ---------------- SEARCH ----------------
    let searchKeywords = expandKeywords({ intent, userMessage });
    if (!searchKeywords.length)
      searchKeywords = normalizeArabic(userMessage)
        .split(" ")
        .filter((x) => x.length > 1);

    let foundProducts = [];

    for (const kw of searchKeywords) {
      const r = await aiSearchProducts({ keyword: kw });
      if (r.length) {
        foundProducts = r;
        break;
      }
    }

    // ---------------- REPLY ----------------
    let reply = "";

    if (!foundProducts.length) {
      reply += `للأسف مش لاقي منتجات مناسبة دلوقتي.\n`;
      reply += `جرب توضّح المشكلة أكتر.`;
    } else {
      reply += `🔎 ترشيحات مناسبة:\n\n`;

      foundProducts.slice(0, 3).forEach((p) => {
        reply += `🟢 ${p.name || p.title}\n`;
        reply += `💰 السعر: ${p.price} EGP\n`;
        reply += `📦 المنتج:\n`;
        reply += `<productCard id="${p.id}"></productCard>\n\n`;
      });
    }

    setMessages((prev) => [...prev, { role: "assistant", content: reply }]);
  }

  return { messages, sendMessage };
}
