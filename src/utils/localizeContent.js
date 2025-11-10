// src/utils/localizeContent.js

import i18n from "../i18n";

/**
 * ترجع اسم الفئة مترجمًا بناءً على المفتاح أو الاسم
 */
export function localizeCategory(category, t = i18n?.t?.bind(i18n)) {
  if (!category) return "—";
  const key = category.key;
  if (key && typeof t === "function") {
    return t(`tokens.cat.${key}`, { defaultValue: category.name || "—" });
  }
  return category.name || "—";
}

/**
 * ترجع بيانات الكورس مترجمة (العنوان والوصف)
 */
export function localizeProduct(product, t = i18n?.t?.bind(i18n)) {
  if (!product) return { title: "—", description: "—" };
  const m = product.meta;

  // في حال ما فيش meta أو ترجمة
  if (!m || typeof t !== "function") {
    return {
      title: product.title || "",
      description: product.description || "",
    };
  }

  // تركيب العنوان والوصف من أجزاء مترجمة
  const title = [
    t(`tokens.adj.${m.adj}`, { defaultValue: "" }),
    t(`tokens.subj.${m.subj}`, { defaultValue: "" }),
    t(`tokens.vari.${m.vari}`, { defaultValue: "" }),
  ]
    .filter(Boolean)
    .join(" ");

  const blurb1 = t(`tokens.blurb.${m.blurb1}`, { defaultValue: "" });
  const blurb2 = t(`tokens.blurb.${m.blurb2}`, { defaultValue: "" });

  const description = [title, blurb1, blurb2].filter(Boolean).join(". ");

  return { title, description };
}
