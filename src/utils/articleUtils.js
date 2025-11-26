import { fallbackProducts } from "../data/products";

export function computeReadTime(body = "", fallback = "") {
  const words = (body || "").split(/\s+/).filter(Boolean).length;
  if (!words && fallback) return fallback;
  const minutes = Math.max(1, Math.ceil(words / 180));
  return `${minutes} min`;
}

export function buildTranslationsFromForm({ titleAr, summaryAr, contentAr }) {
  const hasArabic = [titleAr, summaryAr, contentAr].some(
    (value) => value && value.trim().length
  );
  if (!hasArabic) return {};
  return {
    ar: {
      title: titleAr?.trim(),
      summary: summaryAr?.trim(),
      content: contentAr?.trim(),
    },
  };
}

export function suggestRelatedProducts(articleContent = "", articleTag = "") {
  const content = (typeof articleContent === 'string' ? articleContent : String(articleContent || "")).toLowerCase();
  const suggestions = [];

  fallbackProducts.forEach((product) => {
    let relevance = 0;

    product.keywords?.forEach((keyword) => {
      if (content.includes(keyword.toLowerCase())) relevance += 20;
    });

    const categoryMatches = {
      "Soil Care": ["Soil Health", "Regenerative"],
      "Irrigation": ["Water Management"],
      "Livestock": ["Livestock Health"],
      "Analytics": ["Data & Mapping"],
      "Pollination": ["Pollination"],
      "Renewables": ["Renewables"],
      "Implements": ["Crop Planning"],
      "Monitoring": ["Precision Livestock"],
    };

    if (categoryMatches[articleTag]?.some((cat) => product.category.includes(cat))) {
      relevance += 30;
    }

    if (relevance > 30) {
      suggestions.push({
        ...product,
        relevance,
        reason: relevance > 50 ? "High relevance" : "Related topic",
      });
    }
  });

  return suggestions
    .sort((a, b) => b.relevance - a.relevance)
    .slice(0, 5);
}
