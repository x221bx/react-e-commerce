const stripHeadingHashes = (value = "") =>
  value.replace(/^#{1,6}\s*/gm, "").replace(/#{1,6}/g, "");

const normalizeParagraphs = (value = "") =>
  stripHeadingHashes(value).replace(/\n{3,}/g, "\n\n").trim();

export const translateText = async ({
  text,
  targetLang = "ar",
  sourceLang = "auto",
}) => {
  const cleanText = text?.toString().trim();
  if (!cleanText) return "";
  try {
    const query = encodeURIComponent(cleanText);
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${sourceLang}&tl=${targetLang}&dt=t&q=${query}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error("Translation failed");
    const payload = await response.json();
    const translated = Array.isArray(payload?.[0])
      ? payload[0].map((chunk) => chunk?.[0] || "").join("")
      : "";
    return normalizeParagraphs(translated || cleanText);
  } catch (error) {
    console.error("translateText error:", error);
    return normalizeParagraphs(cleanText);
  }
};

// AI Text Generation Function
export const generateAiDraft = ({ topicKey, productContext, lineCount, content, style, type, text, direction }) => {
  // Handle rewriting content
  if (style && content) {
    // Mock rewriting - in real app, this would call AI API
    const words = content.split(/\s+/);
    if (style === 'shorter') {
      return words.slice(0, Math.max(10, words.length * 0.7)).join(' ') + '...';
    } else if (style === 'longer') {
      return content + '\n\nAdditional information: This expanded version includes more context and examples to help readers better understand the topic.';
    } else if (style === 'simpler') {
      return content.replace(/technical/gi, 'simple').replace(/complex/gi, 'easy');
    } else if (style === 'professional') {
      return content.replace(/you should/gi, 'it is recommended to').replace(/don't/gi, 'do not');
    }
    return content;
  }

  // Handle title generation
  if (type === 'title' && content) {
    return {
      title: `Guide: ${content.split(' ').slice(0, 5).join(' ')}...`,
      titleAr: `دليل: ${content.split(' ').slice(0, 5).join(' ')}...`
    };
  }

  // Handle summary generation
  if (type === 'summary' && content) {
    const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 10);
    return {
      summary: sentences.slice(0, 2).join('. ').trim() + '.',
      summaryAr: sentences.slice(0, 2).join('. ').trim() + '.'
    };
  }

  // Translation flag retained for backwards compatibility.
  // Use translateText helper for actual translations.

  const aiTopics = [
    {
      value: "usage",
      label: "Product usage guide",
      tag: "Product Usage",
      prompt: "Explain how to use the selected product step by step.",
      sampleHero: "https://images.unsplash.com/photo-1501004318641-b39e6451bec6?auto=format&fit=crop&w=900&q=80",
    },
    {
      value: "combo",
      label: "Combine two products",
      tag: "Product Combo",
      prompt: "Show how to combine two products safely with a clear sequence.",
      sampleHero: "https://images.unsplash.com/photo-1501004318641-b39e6451bec6?auto=format&fit=crop&w=900&q=80",
    },
    {
      value: "troubleshoot",
      label: "Fix a recurring issue",
      tag: "Troubleshooting",
      prompt: "Describe how this product fixes a common farm issue.",
      sampleHero: "https://images.unsplash.com/photo-1523475472560-d2df97ec485c?auto=format&fit=crop&w=900&q=80",
    },
  ];

  const topic = aiTopics.find((t) => t.value === topicKey) || aiTopics[0];
  const productName = productContext?.trim() || "the product";
  const maxLines = Math.max(3, Math.min(lineCount || 5, 12));

  // English content
  const summaryLinesEn = [
    `How to use ${productName} step by step.`,
    "What the product does and how it saves time or money.",
    "Prep checklist before you start.",
    "Correct application to avoid waste or errors.",
    "Track results and measure improvement.",
    "Safety and storage tips after use.",
  ].slice(0, maxLines);

  const contentEn = [
    `## Why ${productName}?`,
    `${topic.prompt} with a focus on ${productName}.`,
    "",
    "## Steps",
    "- Prepare the area and tools first.",
    "- Apply only the recommended amount.",
    "- Monitor results and log notes.",
    "",
    "## Combine with other products",
    "Pair it safely with compatible inputs for better results.",
    "",
    "## Quick tips",
    "- Wear safety gear.",
    "- Store in a cool dry place.",
    "- Re-check the label before each use.",
  ].join("\n");

  // Arabic content (basic translation - in real app, use proper translation service)
  const summaryLinesAr = [
    `كيفية استخدام ${productName} خطوة بخطوة.`,
    "ما يفعله المنتج وكيف يوفر الوقت والمال.",
    "قائمة التحضير قبل البدء.",
    "التطبيق الصحيح لتجنب الهدر والأخطاء.",
    "تتبع النتائج وقياس التحسن.",
    "نصائح السلامة والتخزين بعد الاستخدام.",
  ].slice(0, maxLines);

  const contentAr = [
    `## لماذا ${productName}؟`,
    `${topic.prompt} مع التركيز على ${productName}.`,
    "",
    "## الخطوات",
    "- تحضير المنطقة والأدوات أولاً.",
    "- استخدم الكمية الموصى بها فقط.",
    "- راقب النتائج وسجل الملاحظات.",
    "",
    "## الجمع مع منتجات أخرى",
    "اقرنها بأمان مع المدخلات المتوافقة للحصول على نتائج أفضل.",
    "",
    "## نصائح سريعة",
    "- ارتدِ معدات السلامة.",
    "- خزن في مكان بارد وجاف.",
    "- أعد التحقق من الملصق قبل كل استخدام.",
  ].join("\n");

  return {
    title: `${topic.tag}: Using ${productName}`,
    titleAr: `${topic.tag}: استخدام ${productName}`,
    summary: summaryLinesEn.join(" "),
    summaryAr: summaryLinesAr.join(" "),
    content: normalizeParagraphs(contentEn),
    contentAr: normalizeParagraphs(contentAr),
    tag: topic.tag,
    heroImage: topic.sampleHero,
    readTime: `${Math.max(3, Math.ceil(contentEn.length / 400))} min`,
  };
};

// AI Text Review Function
export const reviewArticleWithAI = async (articleData) => {
  try {
    const API_KEY = import.meta.env.VITE_OPENAI_KEY;
    if (!API_KEY) {
      return {
        score: 75,
        suggestions: ["OpenAI API key not configured"],
        issues: [],
        improvements: ["Add API key for AI review"]
      };
    }

    const prompt = `
Review this agricultural article for quality, accuracy, and engagement:

Title: ${articleData.title}
Summary: ${articleData.summary}
Content: ${articleData.content?.substring(0, 1000)}...

Provide a JSON response with:
- score: number 0-100
- suggestions: array of improvement suggestions
- issues: array of problems found
- improvements: array of specific recommendations
- seo_score: SEO optimization score 0-100
    `;

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 800,
      }),
    });

    if (!response.ok) throw new Error("AI review failed");

    const data = await response.json();
    const reviewText = data.choices[0]?.message?.content || "{}";

    try {
      const parsed = JSON.parse(reviewText);
      // Ensure suggestions array exists and has content
      return {
        score: parsed.score || 70,
        suggestions: Array.isArray(parsed.suggestions) && parsed.suggestions.length > 0
          ? parsed.suggestions
          : ["Consider adding more specific details about the topic"],
        issues: Array.isArray(parsed.issues) ? parsed.issues : [],
        improvements: Array.isArray(parsed.improvements) ? parsed.improvements : ["AI review completed with basic analysis"],
        seo_score: parsed.seo_score || 65
      };
    } catch {
      return {
        score: 70,
        suggestions: ["Consider adding more specific details about the topic"],
        issues: [],
        improvements: ["AI review completed with basic analysis"],
        seo_score: 65
      };
    }
  } catch (error) {
    console.error("AI review error:", error);
    return {
      score: 60,
      suggestions: ["Manual review recommended"],
      issues: ["AI review service unavailable"],
      improvements: ["Check internet connection"],
      seo_score: 50
    };
  }
};

// AI SEO Suggestions Function
export const generateSEOWithAI = async (articleData) => {
  try {
    const API_KEY = import.meta.env.VITE_OPENAI_KEY;
    if (!API_KEY) {
      return {
        metaDescription: "Default meta description for agricultural content.",
        keywords: "agriculture, farming, livestock, crops",
        suggestions: ["Configure OpenAI API for better SEO suggestions"]
      };
    }

    const prompt = `
Generate SEO optimization suggestions for this agricultural article:

Title: ${articleData.title}
Summary: ${articleData.summary}
Content: ${articleData.content?.substring(0, 500)}...
Tag: ${articleData.tag}

Provide a JSON response with:
- metaDescription: SEO meta description (150-160 characters)
- keywords: comma-separated keywords (5-8 keywords)
- suggestions: array of SEO improvement tips
- titleSuggestions: array of alternative title suggestions
    `;

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 600,
      }),
    });

    if (!response.ok) throw new Error("AI SEO generation failed");

    const data = await response.json();
    const seoText = data.choices[0]?.message?.content || "{}";

    try {
      return JSON.parse(seoText);
    } catch {
      return {
        metaDescription: `Learn about ${articleData.title.toLowerCase()} in this comprehensive agricultural guide.`,
        keywords: `${articleData.tag}, agriculture, farming, guide`,
        suggestions: ["Add location-specific keywords", "Include target audience in title"],
        titleSuggestions: [`${articleData.title} - Complete Guide`, `${articleData.title} Tips & Techniques`]
      };
    }
  } catch (error) {
    console.error("AI SEO error:", error);
    return {
      metaDescription: `Comprehensive guide about ${articleData.title.toLowerCase()}.`,
      keywords: "agriculture, farming, livestock, crops",
      suggestions: ["Manual SEO optimization recommended"],
      titleSuggestions: [`${articleData.title} Guide`, `${articleData.title} Tips`]
    };
  }
};
