const AI_ERROR = { error: true, message: "AI unavailable" };

const stripHeadingHashes = (value = "") =>
  value.replace(/^#{1,6}\s*/gm, "").replace(/#{1,6}/g, "");

const normalizeParagraphs = (value = "") =>
  stripHeadingHashes(value).replace(/\n{3,}/g, "\n\n").trim();

const getApiKey = () => {
  const key = import.meta.env.VITE_OR_KEY || "";
  if (!key) throw new Error("Missing OpenRouter API key");
  return key;
};

const buildHeaders = () => {
  const apiKey = getApiKey();
  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${apiKey}`,
    "X-Title": "Farm-Vet AI",
  };
  if (typeof window !== "undefined" && window.location?.origin) {
    headers["HTTP-Referer"] = window.location.origin;
  }
  return headers;
};

export const callOpenRouter = async ({
  messages,
  model = "openai/gpt-4o-mini",
  temperature = 0.35,
  maxTokens = 800,
}) => {
  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: buildHeaders(),
    body: JSON.stringify({
      model,
      messages,
      temperature,
      max_tokens: maxTokens,
    }),
  });

  if (!response.ok) throw new Error(`OpenRouter request failed (${response.status})`);

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content;
  if (Array.isArray(content)) {
    return content.map((part) => part?.text || part).join(" ");
  }
  return content || "";
};

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

// Smarter translation that prefers OpenRouter if an API key is available, with Google fallback.
export const translateSmart = async ({ text, targetLang = "ar", sourceLang = "auto" }) => {
  const cleanText = text?.toString().trim();
  if (!cleanText) return "";

  const hasAiKey = Boolean(import.meta.env.VITE_OR_KEY);

  // Try OpenRouter first if key exists
  if (hasAiKey) {
    try {
      const completion = await callOpenRouter({
        model: "openai/gpt-4o-mini",
        temperature: 0.2,
        maxTokens: 400,
        messages: [
          {
            role: "system",
            content: `Translate the user text from ${sourceLang} to ${targetLang}. Return plain text only.`,
          },
          { role: "user", content: cleanText },
        ],
      });
      if (completion) return normalizeParagraphs(completion);
    } catch (err) {
      console.error("translateSmart (OpenRouter) failed:", err);
    }
  }

  // Fallback to Google
  try {
    return await translateText({ text: cleanText, targetLang, sourceLang });
  } catch (err) {
    console.error("translateSmart fallback failed:", err);
    return cleanText; // last resort: return original text
  }
};

const sanitize = (value = "", max = 600) =>
  (value || "")
    .toString()
    .replace(/\s+/g, " ")
    .replace(/[#*`>]/g, "")
    .slice(0, max)
    .trim();

export const buildArticleRagContext = (articles = [], limit = 8) => {
  if (!Array.isArray(articles) || articles.length === 0) return "";
  const scored = [...articles]
    .map((a) => ({
      ...a,
      _score:
        (a.likes || 0) * 3 +
        (a.views || 0) * 0.5 +
        (Array.isArray(a.comments) ? a.comments.length : 0) * 2,
    }))
    .sort((a, b) => (b._score || 0) - (a._score || 0))
    .slice(0, limit);

  return scored
    .map(
      (a, idx) =>
        `[${idx + 1}] Title: ${sanitize(a.title, 160)} | Tag: ${
          a.tag || "General"
        } | Likes: ${a.likes || 0} | Views: ${a.views || 0} | Summary: ${sanitize(
          a.summary,
          260
        )} | Content: ${sanitize(a.content, 700)}`
    )
    .join("\n");
};

const parseJsonSafe = (text, fallback = {}) => {
  try {
    return JSON.parse(text);
  } catch {
    return fallback;
  }
};

const extractJsonObject = (rawText, fallback = {}) => {
  if (!rawText) return fallback;
  const direct = parseJsonSafe(rawText, null);
  if (direct && typeof direct === "object") return direct;
  const first = rawText.indexOf("{");
  const last = rawText.lastIndexOf("}");
  if (first !== -1 && last !== -1 && last > first) {
    const candidate = rawText.slice(first, last + 1);
    const parsed = parseJsonSafe(candidate, null);
    if (parsed && typeof parsed === "object") return parsed;
  }
  return fallback;
};

// AI Text Generation Function (RAG-powered)
export const generateAiDraft = async ({
  topicKey,
  productContext,
  lineCount,
  content,
  style,
  type,
  ragContext = "",
}) => {
  const apiKey = getApiKey();

  // Fallback: deterministic transformations if no key
  if (!apiKey) {
    if (style && content) {
      const words = content.split(/\s+/);
      if (style === "shorter") {
        return words.slice(0, Math.max(10, Math.floor(words.length * 0.7))).join(" ") + "...";
      } else if (style === "longer") {
        return (
          content +
          "\n\nAdditional information: This expanded version includes more context and examples to help readers better understand the topic."
        );
      } else if (style === "simpler") {
        return content.replace(/technical/gi, "simple").replace(/complex/gi, "easy");
      } else if (style === "professional") {
        return content.replace(/you should/gi, "it is recommended to").replace(/don't/gi, "do not");
      }
      return content;
    }

    if (type === "title" && content) {
      return {
        title: `Guide: ${content.split(" ").slice(0, 5).join(" ")}...`,
        titleAr: `O_U,USU,: ${content.split(" ").slice(0, 5).join(" ")}...`,
      };
    }

    if (type === "summary" && content) {
      const sentences = content.split(/[.!?]+/).filter((s) => s.trim().length > 10);
      return {
        summary: sentences.slice(0, 2).join(". ").trim() + ".",
        summaryAr: sentences.slice(0, 2).join(". ").trim() + ".",
      };
    }
  }

  const topicLookup = {
    usage: "Product Usage",
    combo: "Product Combo",
    troubleshoot: "Troubleshooting",
  };
  const tag = topicLookup[topicKey] || "Knowledge";
  const userPrompt = (() => {
    if (style && content) {
      return `Rewrite the article below in a ${style} style. Preserve accuracy and avoid hallucinations.\n\nArticle:\n${content}`;
    }
    if (type === "title" && content) {
      return `Generate an engaging, concise title for this article. Return JSON with { "title": string } only.\n\nArticle:\n${content}`;
    }
    if (type === "summary" && content) {
      return `Generate a crisp summary (2-3 sentences) for the article. Return JSON with { "summary": string } only.\n\nArticle:\n${content}`;
    }
    return `Create an agriculture article draft grounded in the provided knowledge base.\nTopic: ${topicKey || "general"}\nProduct/context: ${
      productContext || "N/A"
    }\nLine budget: ${lineCount || 5}\nReturn JSON with: title, summary, content (markdown), tag, heroImage (placeholder ok), readTime (e.g., "5 min").`;
  })();

  const messages = [
    {
      role: "system",
      content: `You are an agriculture content strategist. Be factual, concise, and base your answers on the knowledge base when relevant. If you use the knowledge base, cite article titles inline. Knowledge base:\n${ragContext || "No prior articles available."}`,
    },
    { role: "user", content: userPrompt },
  ];

  try {
    const completion = await callOpenRouter({
      messages,
      maxTokens: 900,
      temperature: 0.4,
    });

    const parsed = parseJsonSafe(completion, {});
    if (parsed.title || parsed.summary || parsed.content) {
      return {
        title: parsed.title || "",
        summary: parsed.summary || "",
        content: parsed.content ? normalizeParagraphs(parsed.content) : "",
        tag: parsed.tag || tag,
        heroImage: parsed.heroImage || "",
        readTime: parsed.readTime || "",
      };
    }

    return {
      title: `Draft: ${sanitize(completion, 60)}`,
      summary: sanitize(completion, 220),
      content: normalizeParagraphs(completion),
      tag,
      heroImage: "",
      readTime: "",
    };
  } catch (error) {
    console.error("generateAiDraft error:", error);
    return {
      title: `Draft: ${productContext || "Article"}`,
      summary: "AI unavailable. Please refine manually.",
      content: content || "",
      tag,
      heroImage: "",
      readTime: "",
    };
  }
};

// AI Text Review Function
export const reviewArticleWithAI = async (articleData, ragContext = "") => {
  try {
    const API_KEY = getApiKey();
    if (!API_KEY) return { error: true, message: "Missing OpenRouter API key" };

    const prompt = `
Review this agricultural article for quality, accuracy, and engagement:

Title: ${articleData.title}
Summary: ${articleData.summary}
Content: ${articleData.content?.substring(0, 1200)}...

Provide a JSON response with:
- score: number 0-100
- suggestions: array of improvement suggestions
- issues: array of problems found
- improvements: array of specific recommendations
- seo_score: SEO optimization score 0-100
    `;

    const reviewText = await callOpenRouter({
      messages: [
        {
          role: "system",
          content: `You are a meticulous agriculture content editor. Reference the knowledge base when relevant and avoid hallucinations.\nKnowledge base:\n${ragContext ||
            "No KB available."}`,
        },
        { role: "user", content: prompt },
      ],
      maxTokens: 900,
      temperature: 0.3,
    });

    if (!reviewText || typeof reviewText !== "string") {
      return { error: true, message: "Empty AI review response" };
    }

    try {
      const parsed = extractJsonObject(reviewText, {});
      if (
        typeof parsed.score !== "number" ||
        typeof parsed.seo_score !== "number" ||
        !Array.isArray(parsed.suggestions || [])
      ) {
        return { error: true, message: "Invalid AI review response" };
      }
      return {
        score: parsed.score,
        suggestions: Array.isArray(parsed.suggestions) ? parsed.suggestions : [],
        issues: Array.isArray(parsed.issues) ? parsed.issues : [],
        improvements: Array.isArray(parsed.improvements)
          ? parsed.improvements
          : [],
        seo_score: parsed.seo_score,
        content_score: parsed.content_score,
      };
    } catch {
      return { error: true, message: "Invalid AI review response" };
    }
  } catch (error) {
    console.error("AI review error:", error);
    return { error: true, message: error?.message || "AI review failed" };
  }
};

// AI SEO Suggestions Function
export const generateSEOWithAI = async (articleData, ragContext = "") => {
  try {
    const API_KEY = getApiKey();
    if (!API_KEY) {
      return {
        metaDescription: "Default meta description for agricultural content.",
        keywords: "agriculture, farming, livestock, crops",
        suggestions: ["Configure OpenRouter API for better SEO suggestions"],
      };
    }

    const prompt = `
Generate SEO optimization suggestions for this agricultural article:

Title: ${articleData.title}
Summary: ${articleData.summary}
Content: ${articleData.content?.substring(0, 700)}...
Tag: ${articleData.tag}

Provide a JSON response with:
- metaDescription: SEO meta description (150-160 characters)
- keywords: comma-separated keywords (5-8 keywords)
- suggestions: array of SEO improvement tips
- titleSuggestions: array of alternative title suggestions
    `;

    const messages = [
      {
        role: "system",
        content: `You are an SEO expert for agriculture content. Use the knowledge base to ground keyword choices.\nKnowledge base:\n${ragContext ||
          "No KB available."}`,
      },
      { role: "user", content: prompt },
    ];

    const seoText = await callOpenRouter({
      messages,
      maxTokens: 700,
      temperature: 0.35,
    });

    try {
      return JSON.parse(seoText);
    } catch {
      return {
        metaDescription: `Learn about ${articleData.title?.toLowerCase?.() || "this topic"} in this comprehensive agricultural guide.`,
        keywords: `${articleData.tag || "agriculture"}, farming, guide`,
        suggestions: ["Add location-specific keywords", "Include target audience in title"],
        titleSuggestions: [
          `${articleData.title} - Complete Guide`,
          `${articleData.title} Tips & Techniques`,
        ],
      };
    }
  } catch (error) {
    console.error("AI SEO error:", error);
    return {
      metaDescription: `Comprehensive guide about ${articleData.title?.toLowerCase?.() || "this topic"}.`,
      keywords: "agriculture, farming, livestock, crops",
      suggestions: ["Manual SEO optimization recommended"],
      titleSuggestions: [`${articleData.title} Guide`, `${articleData.title} Tips`],
    };
  }
};

export const askArticlesRag = async ({ question, ragContext = "" }) => {
  if (!question?.trim()) return "";
  try {
    const apiKey = getApiKey();
    if (!apiKey) {
      return "AI unavailable. Please configure VITE_OR_KEY.";
    }

    const isArabic = /[\u0600-\u06FF]/.test(question);
    const messages = [
      {
        role: "system",
        content: `You are an assistant that answers using the provided article knowledge base. Always respond in ${
          isArabic ? "Arabic" : "the user's language"
        }, quote article titles when relevant, and avoid inventing data.\nKnowledge base:\n${ragContext ||
          "No knowledge base available."}`,
      },
      { role: "user", content: question },
    ];
    return await callOpenRouter({ messages, maxTokens: 700, temperature: 0.35 });
  } catch (error) {
    console.error("askArticlesRag error:", error);
    return /[\u0600-\u06FF]/.test(question)
      ? "لم أتمكن من الحصول على إجابة الآن. تأكد من الاتصال بالمفتاح VITE_OR_KEY وحاول مرة أخرى."
      : "AI unavailable right now. Check your VITE_OR_KEY and network.";
  }
};
