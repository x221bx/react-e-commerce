// src/hooks/useAIProductSearch.js
import { collection, getDocs } from "firebase/firestore";
import { db } from "../services/firebase";

/**
 * ========================= Helpers =========================
 */

function normalizeArabic(text = "") {
  return text
    .toLowerCase()
    .replace(/[أإآا]/g, "ا")
    .replace(/ى/g, "ي")
    .replace(/ة/g, "ه")
    .replace(/[\u0610-\u061A\u064B-\u065F\u06D6-\u06ED]/g, "") // تشكيل
    .replace(/[^\u0600-\u06FF0-9a-z\s]/g, " ")
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

function fuzzyMatch(word, target) {
  if (!word || !target) return false;
  if (target.includes(word)) return true;
  if (word.length <= 3) return false;
  return levenshtein(word, target) <= 2;
}

/**
 * ========================= Main Search =========================
 *
 * تعتمد على: العنوان + الاسم + الوصف + الكاتيجوري
 * تضيف Scoring ذكي يخلي الترشيحات تختلف حسب السؤال
 */

export async function aiSearchProducts({ keyword, intent = {} }) {
  const snap = await getDocs(collection(db, "products"));

  const all = snap.docs.map((d) => ({
    id: d.id,
    ...d.data(),
  }));

  let kw = normalizeArabic(keyword || "");
  if (!kw) return [];

  const kwWords = kw.split(" ").filter((w) => w.length > 1);

  // كلمات مستنتجة من intent
  const extraWords = [];
  if (intent.crop) extraWords.push(normalizeArabic(intent.crop));
  if (intent.product_type) extraWords.push(normalizeArabic(intent.product_type));
  if (intent.problem) extraWords.push(normalizeArabic(intent.problem));
  if (intent.goal) extraWords.push(normalizeArabic(intent.goal));

  const intentWords = extraWords
    .join(" ")
    .split(" ")
    .filter((w) => w.length > 1);

  const allWords = [...kwWords, ...intentWords];
  if (!allWords.length) return [];

  /**
   * ========== Scoring الجديد ==========
   *
   * score =
   *  +3 لو الكلمة في combined
   *  +1.5 لو fuzzy
   *  +2 لو الكلمة في title
   *  +2 لو intent.product_type شبه اسم المنتج
   */

  const scored = all
    .map((p) => {
      const title = normalizeArabic(p.title || p.name_lc || p.name || "");
      const desc = normalizeArabic(p.description || "");
      const category = normalizeArabic(p.categoryName || p.categoryId || "");

      const combined = `${title} ${desc} ${category}`.trim();
      if (!combined) return null;

      let score = 0;

      for (const w of allWords) {
        if (!w) continue;
        if (combined.includes(w)) score += 3;
        else if (fuzzyMatch(w, combined)) score += 1.5;
      }

      for (const w of kwWords) {
        if (title.includes(w)) score += 2;
      }

      // بوست ذكي بناءً على نوع المنتج inferred from name only
      if (intent?.product_type && title.includes(normalizeArabic(intent.product_type))) {
        score += 2;
      }

      if (score <= 0) return null;

      return { product: p, score };
    })
    .filter(Boolean);

  // الترتيب تنازلي
  scored.sort((a, b) => b.score - a.score);

  return scored.map((s) => s.product);
}
