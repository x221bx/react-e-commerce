import { collection, getDocs } from "firebase/firestore";
import { db } from "../services/firebase";


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



export async function aiSearchProducts({
                                           keyword = "",
                                           filters = {},
                                       } = {}) {
    const snap = await getDocs(collection(db, "products"));

    let all = snap.docs.map((d) => ({
        id: d.id,
        ...d.data(),
    }));

    const { minPrice, maxPrice } = filters || {};

    all = all.map((p) => ({
        ...p,
        _price: typeof p.price === "number" ? p.price : Number(p.price) || 0,
    }));

    if (typeof minPrice === "number") {
        all = all.filter((p) => p._price >= minPrice);
    }
    if (typeof maxPrice === "number") {
        all = all.filter((p) => p._price <= maxPrice);
    }

    if (!all.length) return [];

    let kw = normalizeArabic(keyword || "");
    const hasKeyword = !!kw;

    if (!hasKeyword) {
        return all.sort((a, b) => a._price - b._price);
    }

    const kwWords = kw.split(" ").filter((w) => w.length > 1);

    const scored = all
        .map((p) => {
            const title = normalizeArabic(
                p.title || p.name_lc || p.name || ""
            );
            const desc = normalizeArabic(p.description || "");
            const category = normalizeArabic(
                p.categoryName || p.category || p.categoryId || ""
            );

            const combined = `${title} ${desc} ${category}`.trim();
            if (!combined) return null;

            let score = 0;

            for (const w of kwWords) {
                if (!w) continue;
                if (combined.includes(w)) score += 3;
                else if (fuzzyMatch(w, combined)) score += 1.5;

                if (title.includes(w)) score += 2;
            }

            if (score <= 0) return null;

            return { product: p, score };
        })
        .filter(Boolean);

    if (!scored.length) return [];

    scored.sort((a, b) => b.score - a.score);

    return scored.map((s) => s.product);
}