// Safely read nested paths like "translations.en.title"
const getValue = (obj, path) => {
  if (!obj) return undefined;
  const segments = path.split(".");
  let current = obj;
  for (const segment of segments) {
    if (current && Object.prototype.hasOwnProperty.call(current, segment)) {
      current = current[segment];
    } else {
      return undefined;
    }
  }
  return current;
};

// Extract language-aware values from objects like { en: "...", ar: "..." }
const extractLangObject = (value) => {
  if (!value || typeof value !== "object") return { en: "", ar: "" };
  return {
    en:
      value.en ||
      value["en-US"] ||
      value.enUS ||
      value.en_us ||
      value.english ||
      "",
    ar:
      value.ar ||
      value["ar-EG"] ||
      value.arEG ||
      value.ar_eg ||
      value.arabic ||
      "",
  };
};

const pickFirst = (product, keys = []) => {
  for (const key of keys) {
    const val = key.includes(".") ? getValue(product, key) : product?.[key];
    if (val === undefined || val === null) continue;
    if (typeof val === "string" && val.trim()) return val.trim();
    if (typeof val === "number") return String(val);
  }
  return "";
};

export function ensureProductLocalization(product = {}) {
  const titleObj = extractLangObject(product.title);
  const nameObj = extractLangObject(product.name);
  const translationsObj = extractLangObject(product.translations);

  const english =
    pickFirst(product, [
      "titleEn",
      "title_en",
      "enTitle",
      "titleEnglish",
      "englishTitle",
      "en_title",
      "nameEn",
      "name_en",
      "productNameEn",
      "translations.en.title",
      "translations.en.name",
      "translation.en.title",
      "title.en",
      "name.en",
    ]) ||
    titleObj.en ||
    nameObj.en ||
    translationsObj.en;

  const arabic =
    pickFirst(product, [
      "titleAr",
      "title_ar",
      "arTitle",
      "titleArabic",
      "arabicTitle",
      "nameAr",
      "name_ar",
      "productNameAr",
      "translations.ar.title",
      "translations.ar.name",
      "translation.ar.title",
      "title.ar",
      "name.ar",
    ]) ||
    titleObj.ar ||
    nameObj.ar ||
    translationsObj.ar;

  const fallback =
    pickFirst(product, ["title", "name", "productName", "label"]) ||
    titleObj.en ||
    titleObj.ar ||
    nameObj.en ||
    nameObj.ar;

  const normalizedEn = english || fallback;
  const normalizedAr = arabic || fallback;

  return {
    ...product,
    titleEn: normalizedEn || normalizedAr || "",
    titleAr: normalizedAr || normalizedEn || "",
    nameEn:
      pickFirst(product, ["nameEn", "name_en"]) ||
      normalizedEn ||
      normalizedAr ||
      "",
    nameAr:
      pickFirst(product, ["nameAr", "name_ar"]) ||
      normalizedAr ||
      normalizedEn ||
      "",
  };
}

export function getLocalizedProductTitle(product = {}, language = "en") {
  const normalized = ensureProductLocalization(product);
  const isAr = (language || "en").toLowerCase().startsWith("ar");
  const titleEn =
    normalized.titleEn ||
    normalized.nameEn ||
    normalized.title ||
    normalized.name ||
    normalized.productName;
  const titleAr =
    normalized.titleAr ||
    normalized.nameAr ||
    normalized.title ||
    normalized.name ||
    normalized.productName;

  return isAr ? titleAr || titleEn || "" : titleEn || titleAr || "";
}
