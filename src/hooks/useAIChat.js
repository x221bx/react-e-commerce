// src/hooks/useAIChat.js
// Product-focused assistant (OpenRouter + product RAG)

import { useState } from "react";
import { aiSearchProducts } from "./useAIProductSearch";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../services/firebase";

// Normalize text for intent detection (Arabic + English)
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

const detectUserLang = (text) => (/[\u0600-\u06FF]/.test(text) ? "ar" : "en");

function extractPriceRange(text) {
  const t = normalize(text);
  const nums = t.match(/\d+/g);
  if (!nums) return null;
  if (nums.length === 1) {
    if (t.includes("اقل") || t.includes("تحت")) return { min: 0, max: Number(nums[0]) };
    if (t.includes("اكبر") || t.includes("اعلى") || t.includes("اعلي")) return { min: Number(nums[0]), max: Infinity };
  }
  if (nums.length >= 2) {
    const a = Number(nums[0]);
    const b = Number(nums[1]);
    return { min: Math.min(a, b), max: Math.max(a, b) };
  }
  return null;
}

function detectIntent(msg) {
  const t = normalize(msg);
  const greet = ["ازيك", "عامل", "اخبارك", "سلام", "hello", "hi", "hey"];
  if (greet.some((x) => t.includes(x))) return { type: "chat" };

  if (t.includes("سعر") || ((t.includes("من") || t.includes("بين")) && t.includes("ل"))) return { type: "priceRange" };

  const rec = ["رشح", "اقترح", "حاجه كويسه", "منتج كويس", "عندك ايه", "recommend", "suggest", "بذور"];
  if (rec.some((w) => t.includes(w))) return { type: "recommend" };

  const items = [
    "سماد",
    "مبيد",
    "دواء",
    "علاج",
    "مخصب",
    "fertilizer",
    "pesticide",
    "seed",
    "seeds",
    "بذور",
    "شتلات",
    "product",
    "item",
    "علف",
    "لقاح",
  ];
  if (items.some((w) => t.includes(w))) return { type: "search" };

  return { type: "chat" };
}

async function loadAllProducts() {
  const snap = await getDocs(collection(db, "products"));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

const fmtContextLine = (p) =>
  `- id:${p.id} | title:${p.title || ""} | tag:${p.tag || ""} | price:${p.price ?? ""} | desc:${(p.description || p.descriptionAr || "").slice(0, 180)}`;

export function useAIChat() {
  const [messages, setMessages] = useState([]);
  const API_KEY = import.meta.env.VITE_OR_KEY;

  const update = (id, content) => {
    setMessages((p) => p.map((m) => (m.id === id ? { ...m, content } : m)));
  };

  async function aiCall({ userLang, msg, productContext }) {
    const contextBlock = productContext?.length
      ? `Product context (use only these):\n${productContext.map(fmtContextLine).join("\n")}`
      : "";

    const system = `You are a helpful shopping assistant for Farm Vet Shop. Reply in ${
      userLang === "ar" ? "Arabic" : "English"
    }. Be concise (<80 words), truthful, and avoid fake scores. If suggesting products, rely ONLY on provided context and include <productCard id="..."></productCard> tags for matches. If there is no product context, clearly say you have no matching products and do not invent any.`;

    const body = {
      model: "openai/gpt-4o-mini",
      messages: [
        { role: "system", content: system },
        ...(contextBlock ? [{ role: "system", content: contextBlock }] : []),
        { role: "user", content: msg },
      ],
    };

    if (!API_KEY) {
      return userLang === "ar" ? "مفتاح OpenRouter غير موجود." : "Missing OpenRouter key.";
    }

    try {
      const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${API_KEY}`,
          "X-Title": "Farm-Vet AI Chat",
          ...(typeof window !== "undefined" && window.location?.origin
            ? { "HTTP-Referer": window.location.origin }
            : {}),
        },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      return (
        data.choices?.[0]?.message?.content ||
        (userLang === "ar" ? "الخدمة غير متاحة حالياً." : "AI is unavailable now.")
      );
    } catch {
      return userLang === "ar" ? "الخدمة غير متاحة حالياً." : "AI is unavailable now.";
    }
  }

  async function searchByKeywords(raw) {
    const words = normalize(raw).split(" ").filter((w) => w.length > 2);
    const all = [];
    for (const w of words) {
      const r = await aiSearchProducts({ keyword: w });
      r.forEach((p) => {
        if (!all.find((x) => x.id === p.id)) all.push(p);
      });
    }
    return all;
  }

  async function searchByPrice(min, max) {
    const all = await loadAllProducts();
    return all.filter((p) => p.price >= min && p.price <= max);
  }

  async function sendMessage(text) {
    const msg = text.trim();
    if (!msg) return;
    setMessages((p) => [...p, { role: "user", content: msg }]);

    const id = Date.now();
    setMessages((p) => [...p, { id, role: "assistant", content: "..." }]);

    const intent = detectIntent(msg);
    const userLang = detectUserLang(msg);

    // generic chat
    if (intent.type === "chat") {
      update(id, await aiCall({ userLang, msg }));
      return;
    }

    // price range
    if (intent.type === "priceRange") {
      const range = extractPriceRange(msg) || { min: 0, max: Infinity };
      const results = await searchByPrice(range.min, range.max);
      const top = results.slice(0, 3);
      if (!top.length) {
        update(id, userLang === "ar" ? "لم أجد منتجات في هذا النطاق السعري." : "No products found in that price range.");
        return;
      }
      const reply = await aiCall({ userLang, msg, productContext: top });
      const cards = top.map((p) => `<productCard id="${p.id}"></productCard>`).join("\n");
      update(id, `${reply}\n\n${cards}`);
      return;
    }

    // recommendation
    if (intent.type === "recommend") {
      const results = await searchByKeywords(msg);
      const top = results.slice(0, 3);
      if (!top.length) {
        update(id, userLang === "ar" ? "لم أجد منتجات مرتبطة بما طلبت." : "No products found for that request.");
        return;
      }
      const reply = await aiCall({ userLang, msg, productContext: top });
      const cards = top.map((p) => `<productCard id="${p.id}"></productCard>`).join("\n");
      update(id, `${reply}\n\n${cards}`);
      return;
    }

    // search
    if (intent.type === "search") {
      const results = await searchByKeywords(msg);
      if (!results.length) {
        update(id, userLang === "ar" ? "لم أجد منتجاً مطابقاً." : "No matching product found.");
        return;
      }
      const top = results.slice(0, 3);
      const reply = await aiCall({ userLang, msg, productContext: top });
      const cards = top.map((p) => `<productCard id="${p.id}"></productCard>`).join("\n");
      update(id, `${reply}\n\n${cards}`);
      return;
    }
  }

  return { messages, sendMessage, setMessages };
}
