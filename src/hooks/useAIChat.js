// ------------------------------------------------------
//  useAIChat.js — FINAL FIXED PROFESSIONAL VERSION
// ------------------------------------------------------

import { useState } from "react";
import { aiSearchProducts } from "./useAIProductSearch";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../services/firebase";

/* Normalization */
function normalize(t = "") {
  return t
    .toLowerCase()
    .replace(/[أإآا]/g, "ا")
    .replace(/ة/g, "ه")
    .replace(/ى/g, "ي")
    .replace(/[^a-z0-9\u0600-\u06FF\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/* Detect price range */
function extractPriceRange(text) {
  const t = normalize(text);
  const nums = t.match(/\d+/g);

  if (!nums) return null;

  if (nums.length === 1) {
    if (t.includes("اقل") || t.includes("تحت"))
      return { min: 0, max: Number(nums[0]) };

    if (t.includes("اكبر") || t.includes("اعلي"))
      return { min: Number(nums[0]), max: Infinity };
  }

  if (nums.length >= 2) {
    const a = Number(nums[0]);
    const b = Number(nums[1]);
    return { min: Math.min(a, b), max: Math.max(a, b) };
  }

  return null;
}

/* Detect intent */
function detectIntent(msg) {
  const t = normalize(msg);

  const greet = ["عامل", "ازيك", "اخبارك", "سلام", "hello", "hi", "هاي"];
  if (greet.some((x) => t.includes(x))) return { type: "chat" };

  if (t.includes("سعر") || (t.includes("من") && t.includes("ل")))
    return { type: "priceRange" };

  const rec = ["رشح", "اقترح", "حاجه كويسه", "منتج كويس", "عندك ايه"];
  if (rec.some((w) => t.includes(w))) return { type: "recommend" };

  const items = ["سماد", "مبيد", "دواء", "علاج", "مخصب", "nutrient"];
  if (items.some((w) => t.includes(w))) return { type: "search" };

  return { type: "chat" };
}

/* Load ALL products once */
async function loadAllProducts() {
  const snap = await getDocs(collection(db, "products"));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export function useAIChat() {
  const [messages, setMessages] = useState([]);
  const API_KEY = import.meta.env.VITE_OPENAI_KEY;

  /* Replace assistant msg */
  function update(id, content) {
    setMessages((p) => p.map((m) => (m.id === id ? { ...m, content } : m)));
  }

  /* Core sendMessage */
  async function sendMessage(text) {
    const msg = text.trim();
    if (!msg) return;

    setMessages((p) => [...p, { role: "user", content: msg }]);

    const id = Date.now();
    setMessages((p) => [...p, { id, role: "assistant", content: "..." }]);

    const intent = detectIntent(msg);

    /* AI reply */
    async function aiReply() {
      try {
        const r = await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${API_KEY}`,
          },
          body: JSON.stringify({
            model: "gpt-4o-mini",
            messages: [
              {
                role: "system",
                content: `
انت مساعد ذكي باللهجة المصرية.
لو السؤال معلومه → رد عادي بدون منتجات.
ممنوع تذكر اسم منتج في النص. 
لو هتعرض منتجات استخدم productCard فقط.`,
              },
              { role: "user", content: msg },
            ],
          }),
        });

        const data = await r.json();
        return data.choices?.[0]?.message?.content || "تمام تحت أمرك 🌿";
      } catch {
        return "حصل خطأ، حاول تاني.";
      }
    }

    /* Search products by keywords */
    async function searchByKeywords(msg) {
      const words = normalize(msg).split(" ").filter((w) => w.length > 2);
      const all = [];

      for (const w of words) {
        const r = await aiSearchProducts({ keyword: w });
        r.forEach((p) => {
          if (!all.find((x) => x.id === p.id)) all.push(p);
        });
      }
      return all;
    }

    /* Search by PRICE ONLY */
    async function searchByPrice(min, max) {
      const all = await loadAllProducts();
      return all.filter((p) => p.price >= min && p.price <= max);
    }

    /* CASE 1 — chat only */
    if (intent.type === "chat") {
      update(id, await aiReply());
      return;
    }

    /* CASE 2 — PRICE RANGE */
    if (intent.type === "priceRange") {
      const reply = await aiReply();
      const range = extractPriceRange(msg);
      const results = await searchByPrice(range.min, range.max);

      const top3 = results.slice(0, 3);

      const cards = top3
        .map((p) => `<productCard id="${p.id}"></productCard>`)
        .join("\n");

      update(id, reply + "\n\n" + cards);
      return;
    }

    /* CASE 3 — recommendation → ALWAYS 3 */
    if (intent.type === "recommend") {
      const reply = await aiReply();
      const results = await searchByKeywords(msg);

      const top3 = results.slice(0, 3);
      const cards = top3
        .map((p) => `<productCard id="${p.id}"></productCard>`)
        .join("\n");

      update(id, reply + "\n\n" + cards);
      return;
    }

    /* CASE 4 — specific product → ONLY ONE */
    if (intent.type === "search") {
      const reply = await aiReply();
      const results = await searchByKeywords(msg);

      if (results.length > 0) {
        update(id, reply + `\n\n<productCard id="${results[0].id}"></productCard>`);
      } else {
        update(id, reply);
      }
      return;
    }
  }

  return { messages, sendMessage, setMessages };
}
