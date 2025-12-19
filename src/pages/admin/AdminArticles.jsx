import React, { useMemo, useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import useArticles from "../../hooks/useArticles";
import { generateSlug } from "../../data/articles";
import { computeReadTime, buildTranslationsFromForm } from "../../utils/articleUtils";
import {
  createArticle,
  deleteArticle,
  updateArticle,
} from "../../services/articlesService";
import {
  generateAiDraft,
  reviewArticleWithAI,
  generateSEOWithAI,
  buildArticleRagContext,
  askArticlesRag,
  translateSmart,
} from "../../utils/aiHelpers";
import { ArticleForm, ArticleList, PublishOverlay, PreviewModal } from "./components";
import Section from "../../components/ui/Section";
import Badge from "../../components/ui/Badge";
import EmptyState from "../../components/ui/EmptyState";

const defaultForm = {
  title: "",
  summary: "",
  tag: "Product Usage",
  readTime: "",
  author: "",
  heroImage: "",
  content: "",
  featureHome: false,
  featureAccount: true,
  titleAr: "",
  summaryAr: "",
  contentAr: "",
  // New fields
  status: "draft", // draft, published, published
  articleType: "blog", // blog, guide, news
  difficulty: "beginner", // beginner, intermediate, advanced
  seoDescription: "",
  keywords: "",
  relatedProducts: [],
  publishDate: "",
};

const aiTopics = [
  {
    value: "usage",
    label: "Product usage guide",
    tag: "Product Usage",
    prompt: "Explain how to use the selected product step by step.",
    sampleHero:
      "https://images.unsplash.com/photo-1501004318641-b39e6451bec6?auto=format&fit=crop&w=900&q=80",
  },
  {
    value: "combo",
    label: "Combine two products",
    tag: "Product Combo",
    prompt: "Show how to combine two products safely with a clear sequence.",
    sampleHero:
      "https://images.unsplash.com/photo-1501004318641-b39e6451bec6?auto=format&fit=crop&w=900&q=80",
  },
  {
    value: "troubleshoot",
    label: "Fix a recurring issue",
    tag: "Troubleshooting",
    prompt: "Describe how this product fixes a common farm issue.",
    sampleHero:
      "https://images.unsplash.com/photo-1523475472560-d2df97ec485c?auto=format&fit=crop&w=900&q=80",
  },
];

const formatPublishDateForInput = (raw) => {
  if (!raw) return "";
  try {
    if (typeof raw === "string") {
      if (raw.endsWith("Z")) {
        const date = new Date(raw);
        return Number.isNaN(date.getTime()) ? "" : date.toISOString().slice(0, 16);
      }
      if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(raw)) {
        return raw.slice(0, 16);
      }
      const parsed = new Date(raw);
      return Number.isNaN(parsed.getTime()) ? "" : parsed.toISOString().slice(0, 16);
    }
    if (raw?.seconds) {
      return new Date(raw.seconds * 1000).toISOString().slice(0, 16);
    }
    if (typeof raw.toDate === "function") {
      return raw.toDate().toISOString().slice(0, 16);
    }
    if (raw instanceof Date) {
      return Number.isNaN(raw.getTime()) ? "" : raw.toISOString().slice(0, 16);
    }
  } catch (error) {

  }
  return "";
};

const serializePublishDate = (value) => {
  if (!value) return "";
  try {
    const date = value instanceof Date ? value : new Date(value);
    if (Number.isNaN(date.getTime())) return "";
    return date.toISOString();
  } catch (error) {
    return "";
  }
};

const sanitizeBlock = (value = "") =>
  value
    ?.toString()
    .replace(/^#{1,6}\s*/gm, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

const summarizeFallback = (text = "") => {
  const sentences = text.split(/(?<=[.!؟\n])/).filter((s) => s.trim());
  return sentences.slice(0, 2).join(" ").trim() || text.slice(0, 400);
};

const AdminArticles = () => {
  const { t } = useTranslation();
  const { articles } = useArticles();
  const hasAiKey = Boolean(import.meta.env.VITE_OR_KEY);

  const savedDraft = localStorage.getItem('articleDraft');
  const parsedDraft = savedDraft ? JSON.parse(savedDraft) : null;
  const [form, setForm] = useState(() => ({
    ...defaultForm,
    ...(parsedDraft || {}),
    publishDate: formatPublishDateForInput(
      parsedDraft?.publishDate || defaultForm.publishDate
    ),
  }));
  const [editingId, setEditingId] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [aiTopic, setAiTopic] = useState("");
  const [aiLines, setAiLines] = useState(5);
  const [productContext, setProductContext] = useState("");
  const [aiDrafting, setAiDrafting] = useState(false);
  const [ragQuestion, setRagQuestion] = useState("");
  const [ragAnswer, setRagAnswer] = useState("");
  const [ragLoading, setRagLoading] = useState(false);

  // New state for enhanced features
  const [showPreview, setShowPreview] = useState(false);
  const [aiReview, setAiReview] = useState(null);
  const [reviewing, setReviewing] = useState(false);
  const [activeTab, setActiveTab] = useState("content"); // content, seo, review
  const [showPublishOverlay, setShowPublishOverlay] = useState(false);
  const [seoSuggestions, setSeoSuggestions] = useState(null);
  const [generatingSEO, setGeneratingSEO] = useState(false);

  const ragContext = useMemo(
    () => buildArticleRagContext(articles, 8),
    [articles]
  );

  const topArticles = useMemo(() => {
    if (!Array.isArray(articles)) return [];
    return [...articles]
      .map((a) => ({
        ...a,
        _score:
          (a.likes || 0) * 3 +
          (a.views || 0) * 0.5 +
          (Array.isArray(a.comments) ? a.comments.length : 0) * 2,
      }))
      .sort((a, b) => (b._score || 0) - (a._score || 0))
      .slice(0, 3);
  }, [articles]);

  const validateFormFields = () => {
    const title = (form.title || "").trim();
    const summary = (form.summary || "").trim();
    const content = (form.content || "").trim();
    const author = (form.author || "").trim();

    if (!title) {
      toast.error("Title is required");
      return false;
    }
    if (!summary) {
      toast.error("Summary is required");
      return false;
    }
    if (!content) {
      toast.error("Content is required");
      return false;
    }
    if (!author) {
      toast.error("Author is required");
      return false;
    }
    return true;
  };

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    setForm((prev) => {
      const next = {
        ...prev,
        [name]: type === "checkbox" ? checked : value,
      };

      // Auto-mirror between EN/AR fields to reduce double typing
      if (["title", "summary", "content"].includes(name)) {
        const arabicSide = `${name}Ar`;

        // If user typed Arabic and Arabic field is empty, mirror there; otherwise if user typed Latin and Arabic field exists but empty, mirror too.
        if (!prev[arabicSide]) {
          next[arabicSide] = value;
        }

        // If user typed Arabic and English field was empty, keep English as-is (same text) so it can be translated manually later.
      }

      if (["titleAr", "summaryAr", "contentAr"].includes(name)) {
        const base = name.replace("Ar", "");
        if (!prev[base]) {
          next[base] = value;
        }
      }

      if (name === "content") {
        next.readTime = computeReadTime(value, prev.readTime);
      }

      return next;
    });
  };

  const handleGenerate = async () => {
    if (!hasAiKey) {
      toast.error("AI key missing. Add VITE_OR_KEY to use generation.");
      return;
    }
    if (!aiTopic) {
      toast.error("Select a topic focus before generating.");
      return;
    }
    if (!productContext.trim()) {
      toast.error("Describe the product or context for the article.");
      return;
    }
    setAiDrafting(true);
    try {
      const draft = await generateAiDraft({
        topicKey: aiTopic,
        productContext,
        lineCount: aiLines,
        ragContext,
      });
      setForm((prev) => ({
        ...prev,
        title: prev.title || draft.title,
        summary: draft.summary || prev.summary,
        content: draft.content || prev.content,
        tag: draft.tag || prev.tag,
        heroImage: prev.heroImage || draft.heroImage,
        readTime: computeReadTime(draft.content || prev.content, draft.readTime),
        author: prev.author || draft.author || "Product Specialist",
      }));
      toast.success("AI draft generated with RAG context!");
    } catch (error) {
      toast.error("Failed to generate draft");
    } finally {
      setAiDrafting(false);
    }
  };

  const handleGenerateTitle = async () => {
    if (!hasAiKey) {
      toast.error("AI key missing. Add VITE_OR_KEY to use generation.");
      return;
    }
    if (!form.content && !form.summary) {
      toast.error("Add content or summary first");
      return;
    }
    setAiDrafting(true);
    try {
      // Assume aiHelpers has generateTitle function
      const generatedTitle = await generateAiDraft({
        content: form.content || form.summary,
        type: "title",
        ragContext,
      });
      setForm(prev => ({ ...prev, title: generatedTitle.title }));
      toast.success("Title generated!");
    } catch (error) {
      toast.error("Failed to generate title");
    } finally {
      setAiDrafting(false);
    }
  };

  const handleGenerateSummary = async (sourceOverride = "") => {
    const englishSource = (form.content || form.summary || "").trim();
    const arabicSource = (form.contentAr || form.summaryAr || "").trim();
    let sourceText = sourceOverride?.trim() || englishSource || arabicSource;
    if (!sourceText) {
      toast.error("Add content first");
      return null;
    }

    const applySummary = async (summaryEn, summaryArSource) => {
      let summaryArFinal = summaryArSource || form.summaryAr || "";
      if (!summaryArFinal && summaryEn) {
        try {
          summaryArFinal = await translateSmart({
            text: summaryEn,
            targetLang: "ar",
            sourceLang: "en",
          });
        } catch {
          summaryArFinal = "";
        }
      }
      setForm((prev) => ({
        ...prev,
        ...(summaryEn ? { summary: sanitizeBlock(summaryEn) } : {}),
        ...(summaryArFinal ? { summaryAr: sanitizeBlock(summaryArFinal) } : {}),
      }));
      return summaryEn;
    };

    // If no AI key, fallback to simple summary
    if (!hasAiKey) {
      const summaryEn = englishSource
        ? summarizeFallback(englishSource)
        : summarizeFallback(sourceText);
      const summaryAr = arabicSource ? summarizeFallback(arabicSource) : "";
      const result = await applySummary(summaryEn, summaryAr);
      toast.success("Summary generated (fallback).");
      return result;
    }

    setAiDrafting(true);
    try {
      if (!englishSource && arabicSource) {
        sourceText = await translateSmart({
          text: arabicSource,
          targetLang: "en",
          sourceLang: "ar",
        });
      }
      const generatedSummary = await generateAiDraft({
        content: sourceText,
        type: "summary",
        ragContext,
      });
      const summaryEn = sanitizeBlock(generatedSummary.summary || sourceText);
      const result = await applySummary(summaryEn, null);
      toast.success("Summary generated!");
      return result;
    } catch (error) {
      // Fallback to simple summary if AI call fails
      const summaryEn = summarizeFallback(sourceText);
      const summaryAr = arabicSource ? summarizeFallback(arabicSource) : "";
      const result = await applySummary(summaryEn, summaryAr);
      toast.error("AI summary failed, used fallback.");
      return result;
    } finally {
      setAiDrafting(false);
    }
  };


  const handleRewrite = async (style) => {
    if (!hasAiKey) {
      toast.error("AI key missing. Add VITE_OR_KEY to use rewrite.");
      return;
    }
    if (!form.content) {
      toast.error("Add content first");
      return;
    }
    setAiDrafting(true);
    try {
      const rewritten = await generateAiDraft({
        content: form.content,
        style,
        ragContext,
      });
      const newContent = typeof rewritten === "string" ? rewritten : rewritten?.content;
      if (newContent) {
        setForm((prev) => ({ ...prev, content: newContent }));
      }
      toast.success("Content rewritten!");
    } catch (error) {
      toast.error("Failed to rewrite content");
    } finally {
      setAiDrafting(false);
    }
  };

  const handleImageDrop = (e) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files).filter(file => file.type.startsWith('image/'));
    if (files.length === 0) return;

    const textarea = e.target;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const currentValue = form.content;

    files.forEach((file, index) => {
      const reader = new FileReader();
      reader.onload = () => {
        const dataUrl = reader.result;
        const imageMarkdown = `![${file.name}](${dataUrl})\n`;
        const newValue = currentValue.slice(0, start + index * imageMarkdown.length) + imageMarkdown + currentValue.slice(end + index * imageMarkdown.length);
        setForm(prev => ({ ...prev, content: newValue }));
      };
      reader.readAsDataURL(file);
    });

    toast.success(`${files.length} image(s) inserted!`);
  };

  const handleAiReview = async () => {
    if (!hasAiKey) {
      toast.error("AI key missing. Add VITE_OR_KEY to use AI review.");
      return;
    }
    setReviewing(true);
    try {
      const review = await reviewArticleWithAI(form, ragContext);
      if (!review || review.error) {
        setAiReview(
          review || { error: true, message: "AI review unavailable (check OpenRouter key or network)." }
        );
        setActiveTab("review");
        toast.error(review?.message || "AI review unavailable (check OpenRouter key or network).");
      } else {
        setAiReview(review);
        setActiveTab("review");
        toast.success("AI review completed!");
      }
    } catch {
      toast.error("AI review failed");
    } finally {
      setReviewing(false);
    }
  };

  const handleGenerateSEO = async () => {
    if (!hasAiKey) {
      toast.error("AI key missing. Add VITE_OR_KEY to use AI SEO.");
      return false;
    }
    setGeneratingSEO(true);
    try {
      const seoData = await generateSEOWithAI(form, ragContext);
      setSeoSuggestions(seoData);
      setForm(prev => ({
        ...prev,
        seoDescription: prev.seoDescription || seoData.metaDescription,
        keywords: prev.keywords || seoData.keywords,
      }));
      toast.success("SEO suggestions generated!");
      return true;
    } catch {
      toast.error("SEO generation failed");
      return false;
    } finally {
      setGeneratingSEO(false);
    }
  };

  const handleRagAsk = async () => {
    if (!ragQuestion.trim()) {
      toast.error("Add a question first");
      return;
    }
    setRagLoading(true);
    try {
      const answer = await askArticlesRag({
        question: ragQuestion,
        ragContext,
      });
      setRagAnswer(answer);
      toast.success("AI answer ready");
    } catch (error) {
      toast.error("RAG answer failed");
    } finally {
      setRagLoading(false);
    }
  };


  // Autosave draft every 10 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      localStorage.setItem('articleDraft', JSON.stringify(form));
    }, 10000);
    return () => clearInterval(interval);
  }, [form]);

  // Check for scheduled articles to auto-publish every 30 seconds
  useEffect(() => {
    const checkScheduledArticles = async () => {
      if (!articles.length) return;

      const now = new Date();
      const scheduledArticles = articles.filter(
        (article) =>
          article.status === "scheduled" &&
          article.publishDate &&
          new Date(article.publishDate) <= now
      );

      if (scheduledArticles.length > 0) {
        for (const article of scheduledArticles) {
          try {
            await updateArticle(article.id, { status: "published" });
            toast.success(`Article "${article.title}" has been auto-published!`);
          } catch (error) {
            toast.error(`Failed to auto-publish article "${article.title}"`);
          }
        }
      }
    };

    // Check immediately and then every 30 seconds
    checkScheduledArticles();
    const interval = setInterval(checkScheduledArticles, 30000);
    return () => clearInterval(interval);
  }, [articles]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!validateFormFields()) return;

    // Only show overlay for content tab (publishing/updating articles)
    if (activeTab === "content") {
      // Show publishing overlay
      setShowPublishOverlay(true);
    } else {
      // For other tabs, just save without overlay
      await handleConfirmPublish();
    }
  };

  const handleConfirmPublish = async () => {
    if (!validateFormFields()) {
      setShowPublishOverlay(false);
      return;
    }
    setSubmitting(true);
    try {
      const { titleAr, summaryAr, contentAr, publishDate, ...rest } = form;
      const translations = buildTranslationsFromForm({ titleAr, summaryAr, contentAr });
      const slug = generateSlug(form.title);
      const ensuredReadTime = computeReadTime(form.content || form.summary, rest.readTime);
      const ensuredAuthor = (rest.author || "").trim() || "Vet Clinic Admin";
      const publishDateISO = serializePublishDate(publishDate);
      const publishDateDate = publishDateISO ? new Date(publishDateISO) : null;
      let status = rest.status || "draft";
      const now = new Date();
      if (status === "scheduled") {
        if (!publishDateDate) {
          toast.error("Select a publish date and time for scheduled articles.");
          setShowPublishOverlay(false);
          setSubmitting(false);
          return;
        }
        if (publishDateDate <= now) {
          toast.error("Publish date must be in the future.");
          setShowPublishOverlay(false);
          setSubmitting(false);
          return;
        }
      } else if (publishDateDate && publishDateDate > now) {
        status = "scheduled";
      }
      const payload = {
        ...rest,
        status,
        publishDate: publishDateISO,
        readTime: ensuredReadTime,
        author: ensuredAuthor,
        slug,
        ...(Object.keys(translations).length ? { translations } : {}),
      };

      if (editingId) {
        await updateArticle(editingId, payload);
        toast.success("Article updated");
      } else {
        await createArticle(payload);
        toast.success("Article created");
      }
      setForm(defaultForm);
      setEditingId(null);
      setAiReview(null);
      localStorage.removeItem('articleDraft');
    } catch (error) {
      toast.error("Unable to save article");
    } finally {
      setShowPublishOverlay(false);
      setSubmitting(false);
    }
  };

  const handleEdit = (article) => {
    setEditingId(article.id);
    const arabic = article.translations?.ar || {};
    setForm({
      title: article.title,
      summary: article.summary,
      tag: article.tag,
      readTime: article.readTime || computeReadTime(article.content || article.summary, ""),
      heroImage: article.heroImage || "",
      content: article.content || "",
      featureHome: !!article.featureHome,
      featureAccount: article.featureAccount !== false,
      titleAr: arabic.title || "",
      summaryAr: arabic.summary || "",
      contentAr: arabic.content || "",
      // New fields
      status: article.status || "draft",
      articleType: article.articleType || "blog",
      difficulty: article.difficulty || "beginner",
      author: article.author || "",
      seoDescription: article.seoDescription || "",
      keywords: article.keywords || "",
      publishDate: formatPublishDateForInput(article.publishDate),
      relatedProducts: Array.isArray(article.relatedProducts) ? article.relatedProducts : [],
    });

    // Ensure slug exists for URL routing
    if (!article.slug && article.title) {
      // Update the article with a slug if missing
      updateArticle(article.id, { slug: generateSlug(article.title) }).catch(() => {});
    }


    // Reset AI states
    setAiReview(null);
    setSeoSuggestions(null);
  };

  const handleDuplicate = (article) => {
    const arabic = article.translations?.ar || {};
    setForm({
      title: article.title + " (Copy)",
      summary: article.summary,
      tag: article.tag,
      readTime: article.readTime || computeReadTime(article.content || article.summary, ""),
      heroImage: article.heroImage || "",
      content: article.content || "",
      featureHome: !!article.featureHome,
      featureAccount: article.featureAccount !== false,
      titleAr: arabic.title || "",
      summaryAr: arabic.summary || "",
      contentAr: arabic.content || "",
      // New fields
      status: "draft",
      articleType: article.articleType || "blog",
      difficulty: article.difficulty || "beginner",
      author: article.author || "",
      seoDescription: article.seoDescription || "",
      keywords: article.keywords || "",
      publishDate: "",
      relatedProducts: Array.isArray(article.relatedProducts) ? [...article.relatedProducts] : [],
    });


    // Reset AI states
    setAiReview(null);
    setSeoSuggestions(null);
    setEditingId(null);
  };

  const handleDelete = async (article) => {
    try {
      await deleteArticle(article.id);
      toast.success("Article deleted");
      if (editingId === article.id) {
        setEditingId(null);
        setForm(defaultForm);
        setAiReview(null);
      }
    } catch (error) {
      toast.error("Failed to delete article");
    }
  };

  const sortedArticles = useMemo(
    () =>
      [...articles].sort(
        (a, b) => (b.updatedAt?.seconds || 0) - (a.updatedAt?.seconds || 0)
      ),
    [articles]
  );

  return (
    <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)]">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">
        <Section
          title={t("articles.admin.title", "Manage Articles")}
          subtitle={t("articles.admin.subtitle", "Create, edit, and publish articles with AI assistance and product integration.")}
          actions={
            hasAiKey ? (
              <Badge tone="success">{t("articles.admin.enabled", "AI enabled")}</Badge>
            ) : (
              <Badge tone="warning">{t("articles.admin.missing", "Add VITE_OR_KEY to enable AI")}</Badge>
            )
          }
        />

        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-4 shadow-[var(--shadow-sm)]">
            <p className="text-xs font-semibold uppercase text-[var(--color-text-muted)]">{t("articles.admin.count", "Total articles")}</p>
            <p className="mt-1 text-2xl font-semibold">{articles.length}</p>
          </div>
          <div className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-4 shadow-[var(--shadow-sm)]">
            <p className="text-xs font-semibold uppercase text-[var(--color-text-muted)]">{t("articles.admin.published", "Published")}</p>
            <p className="mt-1 text-2xl font-semibold text-[var(--color-accent)]">{articles.filter((a) => a.status === "published").length}</p>
          </div>
          <div className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-4 shadow-[var(--shadow-sm)]">
            <p className="text-xs font-semibold uppercase text-[var(--color-text-muted)]">{t("articles.admin.drafts", "Drafts")}</p>
            <p className="mt-1 text-2xl font-semibold">{articles.filter((a) => a.status !== "published").length}</p>
          </div>
        </div>

        <div className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-[var(--shadow-sm)] max-w-xl">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-3">
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-[var(--radius-md)] bg-[var(--color-accent)]/10 text-[var(--color-accent)] font-semibold">AI</span>
              <div>
                <p className="text-sm font-semibold">{t("articles.admin.ai_support", "AI Support")}</p>
                <p className="text-xs text-[var(--color-text-muted)]">{t("articles.admin.ai_support_hint", "Drafts, translation, SEO, review")}</p>
              </div>
            </div>
            {hasAiKey ? (
              <Badge tone="success">{t("articles.admin.enabled", "Enabled")}</Badge>
            ) : (
              <Badge tone="warning">{t("articles.admin.missing", "Missing key")}</Badge>
            )}
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2 text-xs text-[var(--color-text-muted)]">
            <span>Generate</span>
            <span className="text-[var(--color-text)] font-semibold">✓</span>
            <span>Translate</span>
            <span className="text-[var(--color-text)] font-semibold">{hasAiKey ? "✓" : "–"}</span>
            <span>SEO</span>
            <span className="text-[var(--color-text)] font-semibold">{hasAiKey ? "✓" : "–"}</span>
            <span>Review</span>
            <span className="text-[var(--color-text)] font-semibold">{hasAiKey ? "✓" : "–"}</span>
          </div>
          {!hasAiKey && (
            <p className="mt-3 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-[var(--radius-sm)] p-2">
              {t("articles.admin.ai_missing_hint", "Set VITE_OR_KEY in your .env to enable AI helpers.")}
            </p>
          )}
        </div>
        <div className="mt-6 grid gap-4 lg:grid-cols-3">
          <div className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-4 shadow-[var(--shadow-sm)]">
            <p className="text-xs font-semibold uppercase text-[var(--color-text-muted)] mb-2">
              AI RAG Workbench
            </p>
            <p className="text-sm text-[var(--color-text-muted)] mb-3">
              Ask about trends or gaps using the existing article knowledge base.
            </p>
            <textarea
              value={ragQuestion}
              onChange={(e) => setRagQuestion(e.target.value)}
              rows={3}
              placeholder="Example: What topics are missing for irrigation safety?"
              className="w-full rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
            />
            <div className="mt-3 flex items-center gap-2">
              <button
                type="button"
                onClick={handleRagAsk}
                disabled={ragLoading || !ragContext}
                className="inline-flex items-center gap-2 rounded-[var(--radius-md)] bg-[var(--color-accent)] px-4 py-2 text-sm font-semibold text-white shadow-[var(--shadow-sm)] transition hover:brightness-95 disabled:opacity-60"
              >
                {ragLoading ? "Thinking..." : "Ask AI"}
              </button>
              {!ragContext && (
                <span className="text-xs text-amber-600">
                  Add articles to feed the RAG context.
                </span>
              )}
            </div>
            {ragAnswer && (
              <div className="mt-3 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface-muted)] p-3 text-sm text-[var(--color-text)]">
                {ragAnswer}
              </div>
            )}
          </div>

          <div className="lg:col-span-2 rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-4 shadow-[var(--shadow-sm)]">
            <div className="flex items-center justify-between gap-2 mb-3">
              <p className="text-xs font-semibold uppercase text-[var(--color-text-muted)]">
                Top articles (likes + views)
              </p>
              <span className="text-[11px] text-[var(--color-text-muted)]">
                Auto-ranked by engagement
              </span>
            </div>
            <div className="grid gap-3 md:grid-cols-3">
              {topArticles.map((article) => (
                <div
                  key={article.id}
                  className="rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface-muted)] p-3 shadow-[var(--shadow-sm)] flex flex-col gap-2"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-[var(--color-text)] line-clamp-2">
                        {article.title}
                      </p>
                      <p className="text-[11px] text-[var(--color-text-muted)]">
                        {article.tag || "General"}
                      </p>
                    </div>
                    <div className="text-right text-xs text-[var(--color-text-muted)]">
                      <div>👍 {article.likes || 0}</div>
                      <div>👁️ {article.views || 0}</div>
                    </div>
                  </div>
                  <p className="text-xs text-[var(--color-text-muted)] line-clamp-3">
                    {article.summary || "No summary provided."}
                  </p>
                </div>
              ))}
              {topArticles.length === 0 && (
                <div className="col-span-3 rounded-[var(--radius-md)] border border-dashed border-[var(--color-border)] bg-surface p-4 text-sm text-[var(--color-text-muted)]">
                  No published articles yet. Add content to power the leaderboard.
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-3">
          <ArticleForm
            form={form}
            editingId={editingId}
            activeTab={activeTab}
            setShowPreview={setShowPreview}
            handleChange={handleChange}
            handleGenerateTitle={handleGenerateTitle}
            handleGenerateSummary={handleGenerateSummary}
            handleRewrite={handleRewrite}
            handleImageDrop={handleImageDrop}
            handleSubmit={handleSubmit}
            submitting={submitting}
            aiTopics={aiTopics}
            aiTopic={aiTopic}
            setAiTopic={setAiTopic}
            aiLines={aiLines}
            setAiLines={setAiLines}
            productContext={productContext}
            setProductContext={setProductContext}
            handleGenerate={handleGenerate}
            seoSuggestions={seoSuggestions}
            handleGenerateSEO={handleGenerateSEO}
            generatingSEO={generatingSEO}
            aiDrafting={aiDrafting}
            aiReview={aiReview}
            handleAiReview={handleAiReview}
            reviewing={reviewing}
            setActiveTab={setActiveTab}
            setEditingId={setEditingId}
            setForm={setForm}
            defaultForm={defaultForm}
            setAiReview={setAiReview}
            setSeoSuggestions={setSeoSuggestions}
          />

          <ArticleList
            sortedArticles={sortedArticles}
            handleEdit={handleEdit}
            handleDuplicate={handleDuplicate}
            handleDelete={handleDelete}
          />
        </div>

        <PublishOverlay
          showPublishOverlay={showPublishOverlay}
          setShowPublishOverlay={setShowPublishOverlay}
          handleConfirmPublish={handleConfirmPublish}
          submitting={submitting}
          editingId={editingId}
        />

        <PreviewModal
          showPreview={showPreview}
          setShowPreview={setShowPreview}
          form={form}
        />
      </div>
    </div>
  );
};

export default AdminArticles;
