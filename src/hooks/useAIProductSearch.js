// useAIProductSearch.js
import { collection, getDocs } from "firebase/firestore";
import { db } from "../services/firebase";

/**
 * Lightweight search (client-side filter)
 * يعتمد على العنوان + الوصف + التاجز
 * ويتجنب مشاكل الـ index في Firestore.
 * + فيه Normalization عربي + fuzzy match بسيط.
 */

// نفس الـ helpers هنا كمان (ممكن تنقلهم لملف utils لو حبيت)
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

function fuzzyMatch(word, target) {
  if (!word || !target) return false;
  if (target.includes(word)) return true;
  if (word.length <= 3) return false;
  return levenshtein(word, target) <= 2;
}

export async function aiSearchProducts({ keyword }) {
  const snap = await getDocs(collection(db, "products"));

  const all = snap.docs.map((d) => ({
    id: d.id,
    ...d.data(),
  }));

  let kw = normalizeArabic(keyword || "");
  if (!kw) return [];

  const kwWords = kw.split(" ").filter((w) => w.length > 1);

  return all.filter((p) => {
    const title = normalizeArabic(p.title || p.name || "");
    const desc = normalizeArabic(p.description || "");
    const category = normalizeArabic(p.categoryName || p.categoryId || "");
    const tags = Array.isArray(p.tags)
      ? normalizeArabic(p.tags.join(" "))
      : "";

    const combined = `${title} ${desc} ${category} ${tags}`.trim();
    if (!combined) return false;

    // لازم معظم الكلمات تبان في النص (مع fuzzy)
    return kwWords.every((w) => fuzzyMatch(w, combined));
  });
}
// يمكنك استخدام الدالة aiSearchProducts في مكوناتك أو هوكس الخاصة بك للبحث عن المنتجات بناءً على الكلمة المفتاحية المقدمة.